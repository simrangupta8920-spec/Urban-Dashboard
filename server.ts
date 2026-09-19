import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import * as XLSX from 'xlsx';

// Helper to resolve Google Sheets URL to direct multi-sheet XLSX or CSV export URL
function resolveSheetUrls(rawUrl: string): {
  xlsxUrl?: string;
  csvUrl: string;
  fallbackGvizUrl?: string;
  pubCsvUrl?: string;
  sheetId?: string;
  gid: string;
} {
  const trimmed = rawUrl.trim().replace(/^[<"']+|[>"']+$/g, '');

  // Pattern 1: Published to web (spreadsheets/d/e/{pubId}/pub...)
  if (trimmed.includes('/spreadsheets/d/e/')) {
    const pubMatch = trimmed.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/);
    const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';
    if (pubMatch) {
      const pubId = pubMatch[1];
      return {
        xlsxUrl: `https://docs.google.com/spreadsheets/d/e/${pubId}/pub?output=xlsx`,
        csvUrl: `https://docs.google.com/spreadsheets/d/e/${pubId}/pub?output=csv&gid=${gid}`,
        fallbackGvizUrl: `https://docs.google.com/spreadsheets/d/e/${pubId}/gviz/tq?tqx=out:csv&gid=${gid}`,
        pubCsvUrl: `https://docs.google.com/spreadsheets/d/e/${pubId}/pub?output=csv&gid=${gid}`,
        sheetId: pubId,
        gid,
      };
    }
  }

  // Pattern 2: Standard Google Sheet (spreadsheets/d/{sheetId}/...)
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    const sheetId = match[1];
    const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';

    return {
      xlsxUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`,
      csvUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
      fallbackGvizUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
      pubCsvUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv&gid=${gid}`,
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
  const USER_EXCEL_SHEET_SEP_ROWS = [
    ['S.No', 'Date', 'Plaltform', 'Product', 'Quantity Sold', 'Total Sales'],
    ['1', '01-Sep-26', 'Blinkit', 'Foxnuts Old Combo', '24', '16776'],
    ['2', '01-Sep-26', 'Amazon', 'Moringa Sattu', '7', '1575'],
    ['3', '02-Sep-26', 'Amazon', 'Masala Sattu', '27', '6075'],
    ['4', '03-Sep-26', 'Amazon', 'Foxnuts Old Combo', '3', '1497'],
    ['5', '04-Sep-26', 'Amazon', 'Himalayan Salt', '2', '398'],
    ['6', '05-Sep-26', 'Amazon', 'Plain Sattu', '1', '179'],
    ['7', '06-Sep-26', 'Amazon', 'Achari Makhana', '3', '597'],
    ['8', '07-Sep-26', 'Offline Order', 'Moringa Sattu', '1', '199.5'],
    ['9', '08-Sep-26', 'Offline Order', 'Masala Sattu', '1', '183.22'],
    ['10', '09-Sep-26', 'Offline Order', 'Peri Peri', '1', '184.5'],
    ['11', '10-Sep-26', 'Offline Order', 'Achari Makhana', '1', '179.5'],
    ['12', '11-Sep-26', 'Offline Order', 'Tangy Tomato', '1', '179.5'],
    ['13', '12-Sep-26', 'Offline Order', 'Blue Pea Tea', '1', '399.5'],
  ];

  const USER_EXCEL_SHEET_AUG_ROWS = [
    ['S.No', 'Date', 'Plaltform', 'Product', 'Quantity Sold', 'Total Sales'],
    ['1', '01-Aug-26', 'Amazon', 'Foxnuts Old Combo', '18', '12582'],
    ['2', '04-Aug-26', 'Blinkit', 'Moringa Sattu', '12', '2700'],
    ['3', '08-Aug-26', 'Amazon', 'Masala Sattu', '20', '4500'],
    ['4', '12-Aug-26', 'Offline Order', 'Peri Peri', '14', '2583'],
    ['5', '16-Aug-26', 'Blinkit', 'Achari Makhana', '15', '2985'],
    ['6', '20-Aug-26', 'Amazon', 'Tangy Tomato', '10', '1795'],
    ['7', '24-Aug-26', 'Blinkit', 'Foxnuts Old Combo', '22', '15378'],
    ['8', '28-Aug-26', 'Offline Order', 'Blue Pea Tea', '8', '3196'],
  ];

  // User Google Sheet live endpoint (supports both multi-sheet XLSX and CSV)
  app.get(['/api/sample-live-sheet', '/api/user-sheet'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    const wantsXlsx =
      req.query.format === 'xlsx' ||
      Boolean(req.headers.accept?.includes('spreadsheetml')) ||
      Boolean(req.headers.accept?.includes('application/octet-stream'));

    if (wantsXlsx) {
      // Build a multi-sheet workbook with September and August tabs
      const wb = XLSX.utils.book_new();
      const wsSep = XLSX.utils.aoa_to_sheet(USER_EXCEL_SHEET_SEP_ROWS);
      const wsAug = XLSX.utils.aoa_to_sheet(USER_EXCEL_SHEET_AUG_ROWS);
      XLSX.utils.book_append_sheet(wb, wsSep, 'Sep 2026');
      XLSX.utils.book_append_sheet(wb, wsAug, 'Aug 2026');

      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="Urban_Organic_MultiMonth_Sales.xlsx"');
      return res.send(buffer);
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');

    // Clone base rows
    const rows = USER_EXCEL_SHEET_SEP_ROWS.map(r => [...r]);

    // Check if live simulation is requested or during recurring polling
    const cycleCount = Math.floor(Date.now() / 30000) % 6;
    const additionalLiveOrders = [
      ['14', '13-Sep-26', 'Blinkit', 'Achari Makhana', '6', '1194'],
      ['15', '14-Sep-26', 'Amazon', 'Foxnuts Old Combo', '12', '8388'],
      ['16', '15-Sep-26', 'Offline Order', 'Moringa Sattu', '4', '798'],
      ['17', '15-Sep-26', 'Amazon', 'Masala Sattu', '15', '3375'],
      ['18', '16-Sep-26', 'Blinkit', 'Peri Peri', '8', '1476'],
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
  // Fetches entire multi-sheet workbook via XLSX export or falls back to CSV
  app.all('/api/sync-sheet', async (req, res) => {
    try {
      const sheetUrl = (req.query.url as string) || (req.body && req.body.url);

      if (!sheetUrl || typeof sheetUrl !== 'string' || !sheetUrl.trim()) {
        return res.status(400).json({ error: 'Missing or invalid "url" parameter for Google Sheet.' });
      }

      const { xlsxUrl, csvUrl, fallbackGvizUrl, pubCsvUrl, sheetId, gid } = resolveSheetUrls(sheetUrl);

      // Disable response caching so live sync polls always get the latest sheet revision
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const commonHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: '*/*',
      };

      // 1. Attempt to fetch the entire multi-sheet workbook (.xlsx) first
      if (xlsxUrl) {
        try {
          const xlsxResponse = await fetch(xlsxUrl, {
            headers: {
              ...commonHeaders,
              Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream, */*',
            },
            redirect: 'follow',
          });

          if (xlsxResponse.ok) {
            const buffer = Buffer.from(await xlsxResponse.arrayBuffer());
            // Double check valid ZIP/XLSX magic bytes (0x50 0x4B 0x03 0x04)
            if (buffer.length > 50 && buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) {
              res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
              res.setHeader('X-Sheet-Id', sheetId || '');
              res.setHeader('X-Sheet-Gid', gid);
              res.setHeader('X-Synced-At', new Date().toISOString());
              return res.status(200).send(buffer);
            }
          }
        } catch (xlsxErr) {
          console.warn('[Sync] Multi-sheet XLSX export attempt error, falling back to CSV:', xlsxErr);
        }
      }

      // Helper to test if a response is a Google login/HTML redirect
      const isLoginOrHtml = (status: number, cType: string, txt: string) => {
        if (status === 401 || status === 403) return true;
        if (txt.includes('accounts.google.com/ServiceLogin') || txt.includes('ServiceLogin?service=wise')) return true;
        if (cType.includes('text/html') && (txt.includes('<!DOCTYPE html') || txt.includes('<html'))) return true;
        return false;
      };

      // 2. Attempt Google Visualization API endpoint (gviz/tq?tqx=out:csv)
      // This is Google's official public data export endpoint and works reliably on shared sheets
      if (fallbackGvizUrl) {
        try {
          const gvizRes = await fetch(fallbackGvizUrl, {
            headers: commonHeaders,
            redirect: 'follow',
          });
          const cType = gvizRes.headers.get('content-type') || '';
          const txt = await gvizRes.text();

          if (gvizRes.ok && !isLoginOrHtml(gvizRes.status, cType, txt) && (txt.includes(',') || txt.includes('\n'))) {
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('X-Sheet-Id', sheetId || '');
            res.setHeader('X-Sheet-Gid', gid);
            res.setHeader('X-Synced-At', new Date().toISOString());
            return res.status(200).send(txt);
          }
        } catch (gvizErr) {
          console.warn('[Sync] GViz export attempt error:', gvizErr);
        }
      }

      // 3. Attempt direct CSV export URL
      if (csvUrl) {
        try {
          const csvRes = await fetch(csvUrl, {
            headers: {
              ...commonHeaders,
              Accept: 'text/csv, text/plain, */*',
            },
            redirect: 'follow',
          });
          const cType = csvRes.headers.get('content-type') || '';
          const txt = await csvRes.text();

          if (csvRes.ok && !isLoginOrHtml(csvRes.status, cType, txt) && (txt.includes(',') || txt.includes('\n'))) {
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('X-Sheet-Id', sheetId || '');
            res.setHeader('X-Sheet-Gid', gid);
            res.setHeader('X-Synced-At', new Date().toISOString());
            return res.status(200).send(txt);
          }
        } catch (csvErr) {
          console.warn('[Sync] CSV export attempt error:', csvErr);
        }
      }

      // 4. Attempt published web CSV URL
      if (pubCsvUrl && pubCsvUrl !== csvUrl) {
        try {
          const pubRes = await fetch(pubCsvUrl, {
            headers: commonHeaders,
            redirect: 'follow',
          });
          const cType = pubRes.headers.get('content-type') || '';
          const txt = await pubRes.text();

          if (pubRes.ok && !isLoginOrHtml(pubRes.status, cType, txt) && (txt.includes(',') || txt.includes('\n'))) {
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('X-Sheet-Id', sheetId || '');
            res.setHeader('X-Sheet-Gid', gid);
            res.setHeader('X-Synced-At', new Date().toISOString());
            return res.status(200).send(txt);
          }
        } catch (pubErr) {
          console.warn('[Sync] Pub CSV attempt error:', pubErr);
        }
      }

      // If all endpoints failed or returned login redirects:
      return res.status(403).json({
        error: 'Unable to access sheet data. If your sheet is already shared with "Anyone with the link can view", organization/work policies may restrict external downloads. To resolve: In Google Sheets, click File > Share > "Publish to web" > choose "Entire Document" (or CSV), click "Publish", and paste the published link here.',
        isPrivate: true,
      });
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
