import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Helper to resolve Google Sheets URL to direct CSV export URL
function resolveSheetCsvUrl(rawUrl: string): {
  csvUrl: string;
  fallbackGvizUrl?: string;
  sheetId?: string;
  gid: string;
} {
  const trimmed = rawUrl.trim();

  // Pattern 1: Published to web (spreadsheets/d/e/{pubId}/pub...)
  if (trimmed.includes('/spreadsheets/d/e/')) {
    const pubMatch = trimmed.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/);
    const gidMatch = trimmed.match(/gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';
    if (pubMatch) {
      const pubId = pubMatch[1];
      return {
        csvUrl: `https://docs.google.com/spreadsheets/d/e/${pubId}/pub?output=csv&gid=${gid}`,
        sheetId: pubId,
        gid,
      };
    }
  }

  // Pattern 2: Standard Google Sheet (spreadsheets/d/{sheetId}/...)
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    const sheetId = match[1];
    const gidMatch = trimmed.match(/gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';

    return {
      csvUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
      fallbackGvizUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
      sheetId,
      gid,
    };
  }

  // Pattern 3: If already a direct CSV / export link
  return {
    csvUrl: trimmed,
    gid: '0',
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Exact Excel / Google Sheet data provided by user with dynamic live sync support
  const USER_EXCEL_SHEET_ROWS = [
    ['S.No', 'Plaltform', 'Product', 'Quantity Sold', 'Total Sales'],
    ['1', 'Blinkit', 'Foxnuts Old Combo', '24', '16776'],
    ['2', 'Amazon', 'Moringa Sattu', '7', '1575'],
    ['3', 'Amazon', 'Masala Sattu', '27', '6075'],
    ['4', 'Amazon', 'Foxnuts Old Combo', '3', '1497'],
    ['5', 'Amazon', 'Himalayan Salt', '2', '398'],
    ['6', 'Amazon', 'Plain Sattu', '1', '179'],
    ['7', 'Amazon', 'Achari Makhana', '3', '597'],
    ['8', 'Offline Order', 'Moringa Sattu', '1', '199.5'],
    ['9', 'Offline Order', 'Masala Sattu', '1', '183.22'],
    ['10', 'Offline Order', 'Peri Peri', '1', '184.5'],
    ['11', 'Offline Order', 'Achari Makhana', '1', '179.5'],
    ['12', 'Offline Order', 'Tangy Tomato', '1', '179.5'],
    ['13', 'Offline Order', 'Blue Pea Tea', '1', '399.5'],
  ];

  // User Google Sheet live endpoint
  app.get(['/api/sample-live-sheet', '/api/user-sheet'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');

    // Clone base rows
    const rows = USER_EXCEL_SHEET_ROWS.map(r => [...r]);

    // Check if live simulation is requested or during recurring polling
    // Every 30s cycle, an extra live marketplace order arrives to demonstrate active streaming
    const cycleCount = Math.floor(Date.now() / 30000) % 6;
    const additionalLiveOrders = [
      ['14', 'Blinkit', 'Achari Makhana', '6', '1194'],
      ['15', 'Amazon', 'Foxnuts Old Combo', '12', '8388'],
      ['16', 'Offline Order', 'Moringa Sattu', '4', '798'],
      ['17', 'Amazon', 'Masala Sattu', '15', '3375'],
      ['18', 'Blinkit', 'Peri Peri', '8', '1476'],
    ];

    for (let i = 0; i < cycleCount && i < additionalLiveOrders.length; i++) {
      rows.push(additionalLiveOrders[i]);
    }

    const csvContent = rows
      .map(r => r.map(cell => {
        const str = String(cell);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(','))
      .join('\n') + '\n';
    res.send(csvContent);
  });

  // Proxy endpoint to fetch live Google Sheets data bypassing CORS
  app.all('/api/sync-sheet', async (req, res) => {
    try {
      const sheetUrl = (req.query.url as string) || (req.body && req.body.url);

      if (!sheetUrl || typeof sheetUrl !== 'string' || !sheetUrl.trim()) {
        return res.status(400).json({ error: 'Missing or invalid "url" parameter for Google Sheet.' });
      }

      const { csvUrl, fallbackGvizUrl, sheetId, gid } = resolveSheetCsvUrl(sheetUrl);

      // Disable response caching so live sync polls always get the latest sheet revision
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      let fetchUrl = csvUrl;
      let response = await fetch(fetchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/csv, text/plain, */*',
        },
        redirect: 'follow',
      });

      // If standard export failed or redirected to login, try the gviz fallback endpoint
      if (!response.ok && fallbackGvizUrl) {
        fetchUrl = fallbackGvizUrl;
        response = await fetch(fetchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/csv, text/plain, */*',
          },
          redirect: 'follow',
        });
      }

      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();

      // Check if Google redirected to a private login page
      if (text.includes('accounts.google.com/ServiceLogin') || text.includes('ServiceLogin?service=wise') || (contentType.includes('text/html') && !text.includes(','))) {
        return res.status(403).json({
          error: 'This Google Sheet is currently private. Please open your Google Sheet, click "Share" in the top right, change General access to "Anyone with the link can view", and try again.',
          isPrivate: true,
        });
      }

      if (!response.ok) {
        return res.status(response.status).json({
          error: `Failed to fetch spreadsheet from Google (HTTP ${response.status}). Ensure the sheet URL is correct and public.`,
        });
      }

      // Check if response looks like CSV
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('X-Sheet-Id', sheetId || '');
      res.setHeader('X-Sheet-Gid', gid);
      res.setHeader('X-Synced-At', new Date().toISOString());

      return res.status(200).send(text);
    } catch (err: any) {
      console.error('[API /api/sync-sheet error]:', err);
      return res.status(500).json({
        error: `Error syncing Google Sheet: ${err?.message || 'Network error'}`,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Urban Organic Superfood server running on http://localhost:${PORT}`);
  });
}

startServer();
