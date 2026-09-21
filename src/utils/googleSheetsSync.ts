import { LiveSyncConfig, LiveSyncIntervalSeconds } from '../types';

export const DEFAULT_SYNC_INTERVAL: LiveSyncIntervalSeconds = 30;

/**
 * Hardcoded Google Sheet link for your company data.
 * Whenever the dashboard opens, it automatically syncs with this Google Sheet URL.
 * You can replace this link with your own Google Sheet URL (e.g., "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit").
 */
export const DEFAULT_HARDCODED_GOOGLE_SHEET_URL: string = 'https://docs.google.com/spreadsheets/d/11oEKaPyR0ykpNM52PYmknnfXvB_kYMNK75NoG6tQsmE/edit?gid=470407322#gid=470407322';

const STORAGE_KEY = 'urban_organic_live_sheet_sync_v1';

export interface ParsedSheetInfo {
  isValid: boolean;
  type: 'google_sheet' | 'google_pub' | 'sample_sheet' | 'direct_csv' | 'invalid';
  sheetId?: string;
  gid?: string;
  displayTitle?: string;
  cleanUrl: string;
  error?: string;
}

/**
 * Validates and extracts details from a user-supplied Google Sheet or CSV URL
 */
export function parseGoogleSheetUrl(rawInput: string): ParsedSheetInfo {
  const trimmed = (rawInput || '').trim().replace(/^[<"']+|[>"']+$/g, '');

  if (!trimmed) {
    return {
      isValid: false,
      type: 'invalid',
      cleanUrl: '',
      error: 'Please enter a Google Sheets URL or CSV link.',
    };
  }

  // Check if raw table / CSV text was pasted directly into the input
  if (
    trimmed.startsWith('S.No') ||
    trimmed.startsWith('"S.No"') ||
    trimmed.startsWith('Date') ||
    trimmed.startsWith('Plaltform') ||
    (trimmed.includes('\n') && trimmed.includes(','))
  ) {
    return {
      isValid: true,
      type: 'direct_csv',
      cleanUrl: trimmed,
      displayTitle: 'Pasted Sheet Data Table',
      sheetId: 'pasted-table',
      gid: '0',
    };
  }

  // Check if sample demo sheet URL
  if (
    trimmed === 'sample' ||
    trimmed.includes('/api/sample-live-sheet') ||
    trimmed.includes('sample-live-sheet') ||
    trimmed.includes('/api/user-sheet') ||
    trimmed.includes('user-sheet')
  ) {
    const cleanUrl = trimmed === 'sample' ? '/api/sample-live-sheet' : (trimmed.startsWith('/') ? trimmed : `/${trimmed}`);
    return {
      isValid: true,
      type: 'sample_sheet',
      cleanUrl,
      displayTitle: 'Urban Organic Live Stream (Multi-Month)',
      sheetId: 'sample-stream',
      gid: '0',
    };
  }

  // Check standard Google Sheet: https://docs.google.com/spreadsheets/d/{ID}/...
  const sheetMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]{10,})/);
  if (sheetMatch) {
    const sheetId = sheetMatch[1];
    const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';

    return {
      isValid: true,
      type: 'google_sheet',
      sheetId,
      gid,
      displayTitle: `Google Sheet (ID: ${sheetId.slice(0, 6)}...${sheetId.slice(-4)})`,
      cleanUrl: trimmed,
    };
  }

  // Check published web link: https://docs.google.com/spreadsheets/d/e/{PUB_ID}/...
  const pubMatch = trimmed.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]{10,})/);
  if (pubMatch) {
    const pubId = pubMatch[1];
    const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';

    return {
      isValid: true,
      type: 'google_pub',
      sheetId: pubId,
      gid,
      displayTitle: 'Published Google Sheet (Web View)',
      cleanUrl: trimmed,
    };
  }

  // Check direct CSV or file URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      isValid: true,
      type: 'direct_csv',
      cleanUrl: trimmed,
      displayTitle: 'Direct Web Spreadsheet Data Stream',
    };
  }

  return {
    isValid: false,
    type: 'invalid',
    cleanUrl: trimmed,
    error: 'Invalid URL format. Please paste a standard Google Sheets sharing link.',
  };
}

/**
 * Fetches raw CSV data from the sheet URL using our server proxy with browser fallback
 */
export async function fetchLiveSheetData(
  sheetUrl: string
): Promise<{ rawText?: string; arrayBuffer?: ArrayBuffer; sheetId?: string; gid?: string }> {
  const parsed = parseGoogleSheetUrl(sheetUrl);

  if (!parsed.isValid) {
    throw new Error(parsed.error || 'Invalid Google Sheets link.');
  }

  const timestamp = Date.now();

  // If raw CSV data was directly pasted
  if (parsed.sheetId === 'pasted-table') {
    return { rawText: parsed.cleanUrl, sheetId: 'pasted-table', gid: '0' };
  }

  // If internal sample stream
  if (parsed.type === 'sample_sheet') {
    const res = await fetch(`/api/sample-live-sheet?_t=${timestamp}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch sample live data (HTTP ${res.status})`);
    }
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('spreadsheetml') || contentType.includes('octet-stream') || contentType.includes('excel')) {
      const arrayBuffer = await res.arrayBuffer();
      return { arrayBuffer, sheetId: 'sample-stream', gid: '0' };
    }
    const rawText = await res.text();
    return { rawText, sheetId: 'sample-stream', gid: '0' };
  }

  // Call server proxy first (fetches whole multi-sheet workbook via XLSX export or falls back to CSV)
  const proxyUrl = `/api/sync-sheet?url=${encodeURIComponent(sheetUrl)}&_t=${timestamp}`;

  try {
    const res = await fetch(proxyUrl);
    const contentType = res.headers.get('content-type') || '';

    if (!res.ok) {
      // Check for JSON error from proxy
      if (contentType.includes('application/json')) {
        const json = await res.json();
        throw new Error(json.error || `Server responded with HTTP ${res.status}`);
      }
      throw new Error(`Failed to fetch sheet (HTTP ${res.status})`);
    }

    const sheetId = res.headers.get('X-Sheet-Id') || parsed.sheetId;
    const gid = res.headers.get('X-Sheet-Gid') || parsed.gid;

    // Check if the server returned a binary multi-sheet workbook (.xlsx)
    if (contentType.includes('spreadsheetml') || contentType.includes('octet-stream') || contentType.includes('excel')) {
      const arrayBuffer = await res.arrayBuffer();
      return { arrayBuffer, sheetId, gid };
    }

    const rawText = await res.text();
    return { rawText, sheetId, gid };
  } catch (proxyError: any) {
    // If the error explicitly reported private permissions, do not fallback to direct fetch (it won't work anyway)
    if (proxyError?.message && proxyError.message.includes('private')) {
      throw proxyError;
    }

    // Direct browser fallback if proxy failed (e.g. for Google Visualization public endpoint)
    if (parsed.sheetId) {
      try {
        const directUrl = `https://docs.google.com/spreadsheets/d/${parsed.sheetId}/gviz/tq?tqx=out:csv&gid=${parsed.gid || '0'}&_t=${timestamp}`;
        const directRes = await fetch(directUrl);
        if (directRes.ok) {
          const rawText = await directRes.text();
          return { rawText, sheetId: parsed.sheetId, gid: parsed.gid };
        }
      } catch {
        // Fallback also failed, rethrow primary error
      }
    }

    throw proxyError;
  }
}

/**
 * Storage helpers
 */
export function getDefaultLiveSyncConfig(): LiveSyncConfig {
  return {
    sheetUrl: DEFAULT_HARDCODED_GOOGLE_SHEET_URL,
    intervalSeconds: 30,
    isEnabled: true,
    lastSyncedAt: null,
    lastError: null,
    sheetTitle: 'Company Google Sheet',
  };
}

export function loadStoredLiveSyncConfig(): LiveSyncConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return getDefaultLiveSyncConfig();
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed.sheetUrl === 'string' && parsed.sheetUrl.trim()) {
      return {
        sheetUrl: parsed.sheetUrl,
        intervalSeconds: [15, 30, 60, 120, 300].includes(parsed.intervalSeconds) ? parsed.intervalSeconds : 30,
        isEnabled: parsed.isEnabled !== undefined ? Boolean(parsed.isEnabled) : true,
        lastSyncedAt: parsed.lastSyncedAt || null,
        lastError: null,
        sheetTitle: parsed.sheetTitle || undefined,
        lastRecordCount: parsed.lastRecordCount || undefined,
      };
    }
  } catch (e) {
    console.warn('Failed to load live sync config from localStorage', e);
  }
  return getDefaultLiveSyncConfig();
}

export function saveStoredLiveSyncConfig(config: LiveSyncConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save live sync config to localStorage', e);
  }
}

export function clearStoredLiveSyncConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear live sync config', e);
  }
}
