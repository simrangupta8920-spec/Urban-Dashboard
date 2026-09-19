import * as XLSX from 'xlsx';
import {
  CleanSalesRecord,
  ColumnMapping,
  FilterState,
  Granularity,
  HeatmapMatrix,
  KpiMetrics,
  MonthlyYearComparisonPoint,
  PlatformMetric,
  CategoryMetric,
  ProductMetric,
  PlatformTimeSeriesPoint,
  SalesTrendHighlights,
  SheetSummary,
  TimeSeriesPoint,
  ValidationReport,
} from '../types';
import { parseCleanNumber } from './formatters';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Standardizes any date input (string, Date, or Excel serial number) to YYYY-MM-DD
 * Preserves the exact intended calendar date without timezone skew (e.g. 1st of month remaining 1st).
 */
export function normalizeDate(val: unknown): { iso: string; year: number; month: number; monthName: string; monthYear: string; timestamp: number } | null {
  if (val === undefined || val === null || val === '') return null;

  let year = -1;
  let month = -1;
  let day = -1;

  // 1. If already a JS Date object (e.g. from XLSX cellDates: true)
  if (val instanceof Date && !isNaN(val.getTime())) {
    // If constructed at local midnight (like XLSX does with new Date(y, m-1, d)):
    if (val.getHours() === 0 && val.getMinutes() === 0 && val.getSeconds() === 0) {
      year = val.getFullYear();
      month = val.getMonth();
      day = val.getDate();
    }
    // If constructed at UTC midnight (like new Date("2026-09-01T00:00:00Z")):
    else if (val.getUTCHours() === 0 && val.getUTCMinutes() === 0 && val.getUTCSeconds() === 0) {
      year = val.getUTCFullYear();
      month = val.getUTCMonth();
      day = val.getUTCDate();
    }
    // General fallback: prefer local calendar components
    else {
      year = val.getFullYear();
      month = val.getMonth();
      day = val.getDate();
    }
  }
  // 2. Excel serial number (e.g., 46266 or 46266.0001)
  else if (typeof val === 'number') {
    const totalDays = Math.round(val);
    const ms = Date.UTC(1899, 11, 30) + totalDays * 86400000;
    const d = new Date(ms);
    year = d.getUTCFullYear();
    month = d.getUTCMonth();
    day = d.getUTCDate();
  }
  // 3. String parsing
  else if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;

    // Pattern A: DD-MMM-YYYY or DD-MMM-YY (e.g. 01-Sep-26, 1-Sep-2026, 01-Sep-2026)
    const dMonYMatch = trimmed.match(/^(\d{1,2})[-/ ]([A-Za-z]{3,9})[-/ ](\d{2,4})$/i);
    if (dMonYMatch) {
      const dNum = parseInt(dMonYMatch[1], 10);
      const monStr = dMonYMatch[2].slice(0, 3).toLowerCase();
      let yr = parseInt(dMonYMatch[3], 10);
      if (yr < 100) yr += 2000;
      const monthIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monStr);
      if (monthIdx !== -1) {
        year = yr;
        month = monthIdx;
        day = dNum;
      }
    }

    // Pattern B: YYYY-MM-DD or YYYY/MM/DD (ISO standard, e.g. 2026-09-01)
    if (year === -1) {
      const isoMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
      if (isoMatch) {
        year = parseInt(isoMatch[1], 10);
        month = parseInt(isoMatch[2], 10) - 1;
        day = parseInt(isoMatch[3], 10);
      }
    }

    // Pattern C: MMM-DD-YYYY or MMM DD, YYYY (e.g. Sep 1, 2026, September 01, 2026)
    if (year === -1) {
      const monDYMatch = trimmed.match(/^([A-Za-z]{3,9})[-/ ](\d{1,2})(?:st|nd|rd|th)?,?[-/ ](\d{2,4})$/i);
      if (monDYMatch) {
        const monStr = monDYMatch[1].slice(0, 3).toLowerCase();
        const monthIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monStr);
        if (monthIdx !== -1) {
          day = parseInt(monDYMatch[2], 10);
          let yr = parseInt(monDYMatch[3], 10);
          if (yr < 100) yr += 2000;
          year = yr;
          month = monthIdx;
        }
      }
    }

    // Pattern D: DD/MM/YYYY or DD-MM-YYYY (e.g. 01/09/2026, 01-09-2026)
    if (year === -1) {
      const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
      if (ddmmyyyyMatch) {
        day = parseInt(ddmmyyyyMatch[1], 10);
        month = parseInt(ddmmyyyyMatch[2], 10) - 1;
        year = parseInt(ddmmyyyyMatch[3], 10);
      }
    }

    // Fallback JS Date parsing for other string formats
    if (year === -1) {
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        if (parsed.getHours() === 0 && parsed.getMinutes() === 0 && parsed.getSeconds() === 0) {
          year = parsed.getFullYear();
          month = parsed.getMonth();
          day = parsed.getDate();
        } else if (parsed.getUTCHours() === 0 && parsed.getUTCMinutes() === 0 && parsed.getUTCSeconds() === 0) {
          year = parsed.getUTCFullYear();
          month = parsed.getUTCMonth();
          day = parsed.getUTCDate();
        } else {
          year = parsed.getFullYear();
          month = parsed.getMonth();
          day = parsed.getDate();
        }
      }
    }
  }

  if (year === -1 || month === -1 || day === -1 || month < 0 || month > 11 || day < 1 || day > 31) {
    return null;
  }

  const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const monthName = MONTH_NAMES[month];
  const monthYear = `${monthName} ${year}`;
  const timestamp = Date.UTC(year, month, day);

  return { iso, year, month, monthName, monthYear, timestamp };
}

/**
 * Superfood Category Auto-Inference
 * When a spreadsheet does not have a dedicated 'Category' column,
 * automatically maps the product name to the relevant Urban Organic category.
 */
export function inferCategoryFromProduct(productName: string): string {
  const p = (productName || '').toLowerCase().trim();
  if (!p) return 'Organic Superfoods';

  if (
    p.includes('makhana') ||
    p.includes('foxnut') ||
    p.includes('peri peri') ||
    p.includes('achari') ||
    p.includes('tangy tomato') ||
    p.includes('mint') ||
    p.includes('pudina') ||
    p.includes('roasted')
  ) {
    return 'Roasted Makhana';
  }

  if (
    p.includes('sattu') ||
    p.includes('moringa') ||
    p.includes('masala sattu') ||
    p.includes('plain sattu') ||
    p.includes('chana') ||
    p.includes('flour') ||
    p.includes('ragi') ||
    p.includes('millet')
  ) {
    return 'Organic Sattu & Flours';
  }

  if (
    p.includes('tea') ||
    p.includes('blue pea') ||
    p.includes('detox') ||
    p.includes('green tea') ||
    p.includes('herbal') ||
    p.includes('chamomile') ||
    p.includes('kahwa')
  ) {
    return 'Herbal Teas';
  }

  if (
    p.includes('salt') ||
    p.includes('himalayan') ||
    p.includes('rock salt') ||
    p.includes('pink salt') ||
    p.includes('seasoning')
  ) {
    return 'Salts & Seasonings';
  }

  if (p.includes('ghee') || p.includes('vedic') || p.includes('a2') || p.includes('bilona')) {
    return 'A2 Vedic Ghee';
  }

  if (
    p.includes('seed') ||
    p.includes('chia') ||
    p.includes('flax') ||
    p.includes('pumpkin') ||
    p.includes('sunflower')
  ) {
    return 'Seeds & Nutrition';
  }

  if (p.includes('honey') || p.includes('kashmiri') || p.includes('jaggery') || p.includes('sweetener')) {
    return 'Natural Sweeteners';
  }

  if (p.includes('combo') || p.includes('trio') || p.includes('pack') || p.includes('bundle') || p.includes('box')) {
    return 'Superfood Combos';
  }

  return 'Organic Superfoods';
}

/**
 * Automatically inspects headers and guesses the best column matches.
 * Tolerates common typos like 'Plaltform', 'Qunatity', etc.
 */
export function detectColumnMapping(headers: string[]): { mapping: ColumnMapping; missing: string[] } {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  const dateAliases = [
    'date',
    'orderdate',
    'saledate',
    'transactiondate',
    'day',
    'timestamp',
    'invoicedate',
    'bookingdate',
  ];

  const platformAliases = [
    'platform',
    'plaltform', // Common typo in seller spreadsheets
    'platfrom',
    'platforn',
    'plfm',
    'channel',
    'source',
    'marketplace',
    'store',
    'sellingplatform',
    'portal',
    'saleschannel',
  ];

  const productAliases = [
    'productname',
    'product',
    'itemname',
    'item',
    'sku',
    'title',
    'producttitle',
    'description',
    'particulars',
    'goods',
  ];

  const categoryAliases = [
    'category',
    'productcategory',
    'itemcategory',
    'segment',
    'type',
    'group',
    'classification',
  ];

  const quantityAliases = [
    'quantitysold',
    'quantity',
    'qty',
    'unitssold',
    'units',
    'qtysold',
    'volume',
    'count',
    'nos',
    'pieces',
  ];

  const salesAliases = [
    'totalsales',
    'sales',
    'revenue',
    'amount',
    'saleamount',
    'turnover',
    'grosssales',
    'value',
    'totalamount',
    'total',
    'price',
    'netamount',
  ];

  function findMatch(aliases: string[]): string {
    for (const h of headers) {
      const nh = norm(h);
      if (aliases.includes(nh)) return h;
    }
    // Partial substring match
    for (const h of headers) {
      const nh = norm(h);
      for (const a of aliases) {
        if (nh.includes(a) || (a.length > 4 && nh.startsWith(a.slice(0, 4)))) return h;
      }
    }
    return '';
  }

  const mapping: ColumnMapping = {
    date: findMatch(dateAliases),
    platform: findMatch(platformAliases),
    productName: findMatch(productAliases),
    category: findMatch(categoryAliases),
    quantitySold: findMatch(quantityAliases),
    sales: findMatch(salesAliases),
  };

  // Missing validation: Only truly fatal if we cannot find product or sales value
  const missing: string[] = [];
  if (!mapping.sales && !mapping.quantitySold) missing.push('Total Sales');
  if (!mapping.productName) missing.push('Product');

  return { mapping, missing };
}

const MONTH_MAP: Record<string, number> = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sept: 8, sep: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
};

/**
 * Extracts month and year from a worksheet tab name (e.g. 'Sep 2026', 'September', '09-2026', 'Aug-26')
 */
export function parseMonthYearFromSheetName(name: string): { month: number; year: number; monthName: string } | null {
  if (!name) return null;
  const clean = name.trim().replace(/[_./-]/g, ' ').toLowerCase();

  // Match month word tokens safely without partial word false-positives
  const wordMatch = clean.match(/\b(january|february|march|april|may|june|july|august|september|sept|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/i);
  let month = -1;
  if (wordMatch) {
    month = MONTH_MAP[wordMatch[1].toLowerCase()];
  }

  // Also check numeric month formats like '09 2026' or '2026 09'
  if (month === -1) {
    const numMatch = clean.match(/(?:^|\s)(0?[1-9]|1[0-2])\s+(20\d{2}|\d{2})(?:$|\s)/);
    if (numMatch) {
      month = parseInt(numMatch[1], 10) - 1;
      let yr = parseInt(numMatch[2], 10);
      if (yr < 100) yr += 2000;
      return { month, year: yr, monthName: MONTH_NAMES[month] };
    }
  }

  if (month === -1) return null;

  // Extract year if specified in sheet name (e.g. '2026' or '26')
  let year = 2026;
  const yrMatch4 = clean.match(/(20\d{2})/);
  if (yrMatch4) {
    year = parseInt(yrMatch4[1], 10);
  } else {
    const yrMatch2 = clean.match(/\b(\d{2})\b/);
    if (yrMatch2) {
      const parsedYr = parseInt(yrMatch2[1], 10);
      if (parsedYr >= 20 && parsedYr <= 35) {
        year = 2000 + parsedYr;
      }
    }
  }

  return { month, year, monthName: MONTH_NAMES[month] };
}

/**
 * Parses an uploaded ArrayBuffer, string (CSV), or File via XLSX
 * Iterates through ALL sheets/tabs in the workbook to capture multi-month datasets.
 */
export async function parseUploadedFile(
  fileData: ArrayBuffer | string,
  customMapping?: ColumnMapping
): Promise<{ records: CleanSalesRecord[]; report: ValidationReport }> {
  const workbook = typeof fileData === 'string'
    ? XLSX.read(fileData, { type: 'string', cellDates: true })
    : XLSX.read(fileData, { type: 'array', cellDates: true });

  const sheetNames = workbook.SheetNames || [];
  if (sheetNames.length === 0) {
    return {
      records: [],
      report: {
        isValid: false,
        totalRowsParsed: 0,
        validRows: 0,
        skippedRows: 0,
        errors: ['The workbook does not contain any sheets.'],
        missingColumns: ['Product', 'Total Sales'],
        detectedColumns: [],
        initialMapping: { date: '', platform: '', productName: '', category: '', quantitySold: '', sales: '' },
        sheetNames: [],
        sheetsSummary: [],
      },
    };
  }

  const records: CleanSalesRecord[] = [];
  const sheetsSummary: SheetSummary[] = [];
  const allDetectedColsSet = new Set<string>();
  let primaryMapping: ColumnMapping = { date: '', platform: '', productName: '', category: '', quantitySold: '', sales: '' };
  let primaryMissing: string[] = [];
  let totalRowsAcrossAllSheets = 0;
  let skippedRowsAcrossAllSheets = 0;
  let recordCounter = 1;

  for (let sIdx = 0; sIdx < sheetNames.length; sIdx++) {
    const sheetName = sheetNames[sIdx];
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    // Parse to array of objects
    const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    if (rawRows.length === 0) {
      sheetsSummary.push({
        sheetName,
        rowCount: 0,
        validCount: 0,
      });
      continue;
    }

    totalRowsAcrossAllSheets += rawRows.length;
    const sheetCols = Object.keys(rawRows[0] || {});
    sheetCols.forEach(col => allDetectedColsSet.add(col));

    const { mapping: autoMapping, missing } = detectColumnMapping(sheetCols);
    const activeMapping = { ...autoMapping, ...(customMapping || {}) };

    if (!primaryMapping.productName) {
      primaryMapping = activeMapping;
      primaryMissing = missing;
    }

    // Check if this sheet lacks essential sales/product columns (e.g. cover page, notes, summary)
    const hasSalesOrQty = Boolean(activeMapping.sales || activeMapping.quantitySold);
    const hasProduct = Boolean(activeMapping.productName);

    if (!hasSalesOrQty && !hasProduct) {
      // Non-sales metadata sheet, skip gracefully
      sheetsSummary.push({
        sheetName,
        rowCount: rawRows.length,
        validCount: 0,
      });
      continue;
    }

    // Check if tab name designates a specific month and year (e.g. 'Sep 2026', 'October')
    const sheetMonthYear = parseMonthYearFromSheetName(sheetName);
    let validCountForSheet = 0;
    const totalRowCount = Math.max(1, rawRows.length);

    rawRows.forEach((row, rowIdx) => {
      const rawDate = activeMapping.date ? row[activeMapping.date] : null;
      const rawPlatform = activeMapping.platform ? row[activeMapping.platform] : null;
      const rawProduct = activeMapping.productName ? row[activeMapping.productName] : null;
      const rawCategory = activeMapping.category ? row[activeMapping.category] : null;
      const rawQty = activeMapping.quantitySold ? row[activeMapping.quantitySold] : null;
      const rawSales = activeMapping.sales ? row[activeMapping.sales] : null;

      // Check blank row
      if (!rawDate && !rawPlatform && !rawProduct && !rawSales && !rawQty) {
        skippedRowsAcrossAllSheets++;
        return;
      }

      // Determine valid date
      let dateInfo: { iso: string; year: number; month: number; monthName: string; monthYear: string; timestamp: number } | null = null;

      if (rawDate) {
        dateInfo = normalizeDate(rawDate);
      }

      // If rawDate was only a day number (like 1, 2, 3.. 31) and sheetMonthYear is known
      if (!dateInfo && rawDate !== null && rawDate !== undefined && sheetMonthYear) {
        const rawNum = typeof rawDate === 'number' ? rawDate : parseInt(String(rawDate).trim(), 10);
        if (!isNaN(rawNum) && rawNum >= 1 && rawNum <= 31) {
          const iso = `${sheetMonthYear.year}-${String(sheetMonthYear.month + 1).padStart(2, '0')}-${String(rawNum).padStart(2, '0')}`;
          dateInfo = {
            iso,
            year: sheetMonthYear.year,
            month: sheetMonthYear.month,
            monthName: sheetMonthYear.monthName,
            monthYear: `${sheetMonthYear.monthName} ${sheetMonthYear.year}`,
            timestamp: Date.UTC(sheetMonthYear.year, sheetMonthYear.month, rawNum),
          };
        }
      }

      // If no date column or date failed to parse, use sheet month if available
      if (!dateInfo) {
        if (sheetMonthYear) {
          const dayOffset = Math.min(28, Math.max(1, (rowIdx % 28) + 1));
          const iso = `${sheetMonthYear.year}-${String(sheetMonthYear.month + 1).padStart(2, '0')}-${String(dayOffset).padStart(2, '0')}`;
          dateInfo = {
            iso,
            year: sheetMonthYear.year,
            month: sheetMonthYear.month,
            monthName: sheetMonthYear.monthName,
            monthYear: `${sheetMonthYear.monthName} ${sheetMonthYear.year}`,
            timestamp: Date.UTC(sheetMonthYear.year, sheetMonthYear.month, dayOffset),
          };
        } else {
          // Stagger across days 1..18 of default active month (September 2026)
          const dayOffset = Math.min(18, Math.max(1, Math.floor((rowIdx / totalRowCount) * 14) + 1));
          const year = 2026;
          const month = 8; // September (0-indexed)
          const d = new Date(Date.UTC(year, month, dayOffset));
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayOffset).padStart(2, '0')}`;
          dateInfo = {
            iso,
            year,
            month,
            monthName: MONTH_NAMES[month],
            monthYear: `${MONTH_NAMES[month]} ${year}`,
            timestamp: d.getTime(),
          };
        }
      }

      const productName = String(rawProduct || 'Organic Superfood Item').trim() || 'Organic Superfood Item';
      const platform = String(rawPlatform || 'Direct / Offline').trim() || 'Direct / Offline';

      // Auto-infer category if not present in the spreadsheet
      const category = rawCategory && String(rawCategory).trim()
        ? String(rawCategory).trim()
        : inferCategoryFromProduct(productName);

      const quantitySold = rawQty !== null && rawQty !== undefined && String(rawQty).trim() !== ''
        ? Math.max(0, Math.round(parseCleanNumber(rawQty)))
        : 1;

      const sales = rawSales !== null && rawSales !== undefined && String(rawSales).trim() !== ''
        ? Math.max(0, parseCleanNumber(rawSales))
        : quantitySold * 299;

      records.push({
        id: `order-${recordCounter++}`,
        date: dateInfo.iso,
        timestamp: dateInfo.timestamp,
        year: dateInfo.year,
        month: dateInfo.month,
        monthName: dateInfo.monthName,
        monthYear: dateInfo.monthYear,
        platform,
        productName,
        category,
        quantitySold,
        sales,
        sourceSheet: sheetName,
      });

      validCountForSheet++;
    });

    sheetsSummary.push({
      sheetName,
      rowCount: rawRows.length,
      validCount: validCountForSheet,
      detectedMonth: sheetMonthYear?.monthName,
      detectedYear: sheetMonthYear?.year,
    });
  }

  const detectedColumns = Array.from(allDetectedColsSet);

  if (records.length === 0) {
    const errors: string[] = [];
    if (!primaryMapping.sales && !primaryMapping.quantitySold) {
      errors.push('Missing column: Sales / Total Sales');
    }
    if (!primaryMapping.productName) {
      errors.push('Missing column: Product Name');
    }
    if (errors.length === 0) {
      errors.push('No valid sales records could be extracted from the workbook sheets.');
    }

    return {
      records: [],
      report: {
        isValid: false,
        totalRowsParsed: totalRowsAcrossAllSheets,
        validRows: 0,
        skippedRows: skippedRowsAcrossAllSheets,
        errors,
        missingColumns: primaryMissing,
        detectedColumns,
        initialMapping: primaryMapping,
        sheetNames,
        sheetsSummary,
      },
    };
  }

  return {
    records: records.sort((a, b) => a.timestamp - b.timestamp),
    report: {
      isValid: true,
      totalRowsParsed: totalRowsAcrossAllSheets,
      validRows: records.length,
      skippedRows: skippedRowsAcrossAllSheets,
      errors: [],
      missingColumns: primaryMissing,
      detectedColumns,
      initialMapping: primaryMapping,
      sheetNames,
      sheetsSummary,
    },
  };
}

/**
 * Filters the dataset according to user selection
 */
export function filterSalesRecords(records: CleanSalesRecord[], filter: FilterState): CleanSalesRecord[] {
  return records.filter(r => {
    if (filter.startDate && r.date < filter.startDate) return false;
    if (filter.endDate && r.date > filter.endDate) return false;
    if (filter.platform !== 'ALL' && r.platform.toLowerCase() !== filter.platform.toLowerCase()) return false;
    if (filter.category !== 'ALL' && r.category.toLowerCase() !== filter.category.toLowerCase()) return false;
    if (filter.product !== 'ALL' && r.productName.toLowerCase() !== filter.product.toLowerCase()) return false;
    if (filter.month !== 'ALL' && r.month !== parseInt(filter.month, 10)) return false;
    if (filter.year !== 'ALL' && r.year !== parseInt(filter.year, 10)) return false;
    if (filter.sheet && filter.sheet !== 'ALL' && r.sourceSheet !== filter.sheet) return false;
    return true;
  });
}

/**
 * Calculates current period metrics and growth against the preceding equivalent period
 */
export function calculateKpiMetrics(
  allRecords: CleanSalesRecord[],
  filteredRecords: CleanSalesRecord[],
  filter: FilterState
): KpiMetrics {
  const totalSales = filteredRecords.reduce((sum, r) => sum + r.sales, 0);
  const totalUnits = filteredRecords.reduce((sum, r) => sum + r.quantitySold, 0);

  // Determine top platform in filtered records
  const platformSalesMap: Record<string, number> = {};
  filteredRecords.forEach(r => {
    platformSalesMap[r.platform] = (platformSalesMap[r.platform] || 0) + r.sales;
  });

  let topPlatformName = '';
  let topPlatformSales = 0;
  for (const [p, s] of Object.entries(platformSalesMap)) {
    if (s > topPlatformSales) {
      topPlatformSales = s;
      topPlatformName = p;
    }
  }

  const topPlatform = topPlatformName
    ? {
        name: topPlatformName,
        sales: topPlatformSales,
        sharePct: totalSales > 0 ? (topPlatformSales / totalSales) * 100 : 0,
      }
    : null;

  // Determine preceding equivalent period for sales growth calculation
  let prevSales = 0;
  let prevUnits = 0;
  let prevPeriodLabel = 'prior period';

  // Case 1: Specific Month selected
  if (filter.month !== 'ALL' && filter.year !== 'ALL') {
    const curYear = parseInt(filter.year, 10);
    const curMonth = parseInt(filter.month, 10);
    const prevMonth = curMonth === 0 ? 11 : curMonth - 1;
    const prevYear = curMonth === 0 ? curYear - 1 : curYear;
    prevPeriodLabel = `${MONTH_NAMES[prevMonth]} ${prevYear}`;

    const prevRecords = allRecords.filter(r => {
      if (r.year !== prevYear || r.month !== prevMonth) return false;
      if (filter.platform !== 'ALL' && r.platform.toLowerCase() !== filter.platform.toLowerCase()) return false;
      if (filter.category !== 'ALL' && r.category.toLowerCase() !== filter.category.toLowerCase()) return false;
      if (filter.product !== 'ALL' && r.productName.toLowerCase() !== filter.product.toLowerCase()) return false;
      return true;
    });

    prevSales = prevRecords.reduce((acc, r) => acc + r.sales, 0);
    prevUnits = prevRecords.reduce((acc, r) => acc + r.quantitySold, 0);
  }
  // Case 2: Specific Year selected (e.g. 2026 vs 2025)
  else if (filter.year !== 'ALL' && filter.month === 'ALL') {
    const curYear = parseInt(filter.year, 10);
    const prevYear = curYear - 1;
    prevPeriodLabel = `${prevYear}`;

    const prevRecords = allRecords.filter(r => {
      if (r.year !== prevYear) return false;
      if (filter.platform !== 'ALL' && r.platform.toLowerCase() !== filter.platform.toLowerCase()) return false;
      if (filter.category !== 'ALL' && r.category.toLowerCase() !== filter.category.toLowerCase()) return false;
      if (filter.product !== 'ALL' && r.productName.toLowerCase() !== filter.product.toLowerCase()) return false;
      return true;
    });

    prevSales = prevRecords.reduce((acc, r) => acc + r.sales, 0);
    prevUnits = prevRecords.reduce((acc, r) => acc + r.quantitySold, 0);
  }
  // Case 3: Date range selected (Custom or Predefined)
  else if (filter.startDate && filter.endDate) {
    const startMs = new Date(filter.startDate).getTime();
    const endMs = new Date(filter.endDate).getTime();
    const durationMs = Math.max(86400000, endMs - startMs);
    const prevStartMs = startMs - durationMs;
    const prevEndMs = startMs - 1;
    const prevStartIso = new Date(prevStartMs).toISOString().split('T')[0];
    const prevEndIso = new Date(prevEndMs).toISOString().split('T')[0];
    prevPeriodLabel = `${prevStartIso} to ${prevEndIso}`;

    const prevRecords = allRecords.filter(r => {
      if (r.date < prevStartIso || r.date > prevEndIso) return false;
      if (filter.platform !== 'ALL' && r.platform.toLowerCase() !== filter.platform.toLowerCase()) return false;
      if (filter.category !== 'ALL' && r.category.toLowerCase() !== filter.category.toLowerCase()) return false;
      if (filter.product !== 'ALL' && r.productName.toLowerCase() !== filter.product.toLowerCase()) return false;
      return true;
    });

    prevSales = prevRecords.reduce((acc, r) => acc + r.sales, 0);
    prevUnits = prevRecords.reduce((acc, r) => acc + r.quantitySold, 0);
  }
  // Case 4: All time / Default: split sorted timeline in half or compare previous year
  else if (filteredRecords.length > 0) {
    const timestamps = filteredRecords.map(r => r.timestamp);
    const minT = Math.min(...timestamps);
    const maxT = Math.max(...timestamps);
    const midT = minT + (maxT - minT) / 2;
    prevPeriodLabel = 'first half of period';

    const prevHalf = filteredRecords.filter(r => r.timestamp < midT);
    const currHalf = filteredRecords.filter(r => r.timestamp >= midT);
    prevSales = prevHalf.reduce((s, r) => s + r.sales, 0);
    prevUnits = prevHalf.reduce((s, r) => s + r.quantitySold, 0);
    const currHalfSales = currHalf.reduce((s, r) => s + r.sales, 0);

    const growthPct = prevSales > 0 ? ((currHalfSales - prevSales) / prevSales) * 100 : null;
    return {
      totalSales,
      totalUnits,
      salesGrowthPct: growthPct,
      prevPeriodSales: prevSales,
      prevPeriodUnits: prevUnits,
      prevPeriodLabel,
      topPlatform,
    };
  }

  const salesGrowthPct = prevSales > 0 ? ((totalSales - prevSales) / prevSales) * 100 : null;

  return {
    totalSales,
    totalUnits,
    salesGrowthPct,
    prevPeriodSales: prevSales,
    prevPeriodUnits: prevUnits,
    prevPeriodLabel,
    topPlatform,
  };
}

/**
 * Groups sales data into TimeSeriesPoints for Hero Chart (Daily, Weekly, Monthly)
 */
export function buildSalesGrowthTimeSeries(
  filteredRecords: CleanSalesRecord[],
  granularity: Granularity
): TimeSeriesPoint[] {
  if (filteredRecords.length === 0) return [];

  const grouped: Record<string, { label: string; date: string; sales: number; quantity: number; sortKey: number }> = {};

  filteredRecords.forEach(r => {
    let key = '';
    let label = '';
    let sortKey = 0;

    if (granularity === 'daily') {
      key = r.date;
      // Format e.g. "01 Sep"
      const d = new Date(r.timestamp);
      label = `${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]}`;
      sortKey = r.timestamp;
    } else if (granularity === 'weekly') {
      // Find week start date (Sunday or Monday)
      const d = new Date(r.timestamp);
      const day = d.getUTCDay();
      const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setUTCDate(diff));
      const year = monday.getUTCFullYear();
      const month = monday.getUTCMonth();
      const dateNum = monday.getUTCDate();
      key = `${year}-W${Math.ceil(dateNum / 7)}-${month}`;
      label = `Wk of ${dateNum} ${MONTH_NAMES[month]}`;
      sortKey = monday.getTime();
    } else {
      // Monthly
      key = `${r.year}-${String(r.month + 1).padStart(2, '0')}`;
      label = `${MONTH_NAMES[r.month]} ${r.year}`;
      sortKey = Date.UTC(r.year, r.month, 1);
    }

    if (!grouped[key]) {
      grouped[key] = {
        label,
        date: r.date,
        sales: 0,
        quantity: 0,
        sortKey,
      };
    }
    grouped[key].sales += r.sales;
    grouped[key].quantity += r.quantitySold;
  });

  return Object.entries(grouped)
    .sort((a, b) => a[1].sortKey - b[1].sortKey)
    .map(([key, data]) => ({
      key,
      label: data.label,
      date: data.date,
      sales: data.sales,
      quantity: data.quantity,
    }));
}

/**
 * Calculates platform breakdown: sales, quantity, percentage, and growth %
 */
export function buildPlatformMetrics(
  allRecords: CleanSalesRecord[],
  filteredRecords: CleanSalesRecord[],
  filter: FilterState
): PlatformMetric[] {
  const totalSales = filteredRecords.reduce((sum, r) => sum + r.sales, 0);
  const platformMap: Record<string, { sales: number; quantity: number }> = {};

  filteredRecords.forEach(r => {
    if (!platformMap[r.platform]) {
      platformMap[r.platform] = { sales: 0, quantity: 0 };
    }
    platformMap[r.platform].sales += r.sales;
    platformMap[r.platform].quantity += r.quantitySold;
  });

  // Calculate growth per platform by comparing with previous period
  const prevPlatformMap: Record<string, number> = {};

  // If specific month or year selected
  if (filter.month !== 'ALL' && filter.year !== 'ALL') {
    const curYear = parseInt(filter.year, 10);
    const curMonth = parseInt(filter.month, 10);
    const prevMonth = curMonth === 0 ? 11 : curMonth - 1;
    const prevYear = curMonth === 0 ? curYear - 1 : curYear;

    allRecords
      .filter(r => r.year === prevYear && r.month === prevMonth)
      .forEach(r => {
        prevPlatformMap[r.platform] = (prevPlatformMap[r.platform] || 0) + r.sales;
      });
  } else if (filter.year !== 'ALL') {
    const prevYear = parseInt(filter.year, 10) - 1;
    allRecords
      .filter(r => r.year === prevYear)
      .forEach(r => {
        prevPlatformMap[r.platform] = (prevPlatformMap[r.platform] || 0) + r.sales;
      });
  } else {
    // Halves comparison
    const timestamps = filteredRecords.map(r => r.timestamp);
    if (timestamps.length > 0) {
      const minT = Math.min(...timestamps);
      const maxT = Math.max(...timestamps);
      const midT = minT + (maxT - minT) / 2;
      filteredRecords
        .filter(r => r.timestamp < midT)
        .forEach(r => {
          prevPlatformMap[r.platform] = (prevPlatformMap[r.platform] || 0) + r.sales;
        });
    }
  }

  const results: PlatformMetric[] = Object.entries(platformMap).map(([platform, data]) => {
    const sharePct = totalSales > 0 ? (data.sales / totalSales) * 100 : 0;
    const prevS = prevPlatformMap[platform];
    const growthPct = prevS && prevS > 0 ? ((data.sales - prevS) / prevS) * 100 : null;

    return {
      platform,
      sales: data.sales,
      quantity: data.quantity,
      sharePct,
      growthPct,
    };
  });

  return results.sort((a, b) => b.sales - a.sales);
}

/**
 * Builds multi-line chart data for Platform Growth over time
 */
export function buildPlatformGrowthTimeSeries(
  filteredRecords: CleanSalesRecord[],
  platforms: string[]
): PlatformTimeSeriesPoint[] {
  if (filteredRecords.length === 0) return [];

  const monthMap: Record<string, { monthLabel: string; sortKey: number; total: number; [p: string]: number | string }> = {};

  filteredRecords.forEach(r => {
    const key = `${r.year}-${String(r.month + 1).padStart(2, '0')}`;
    if (!monthMap[key]) {
      monthMap[key] = {
        month: key,
        monthLabel: `${MONTH_NAMES[r.month]} '${String(r.year).slice(-2)}`,
        sortKey: Date.UTC(r.year, r.month, 1),
        total: 0,
      };
      platforms.forEach(p => {
        monthMap[key][p] = 0;
      });
    }
    monthMap[key][r.platform] = (Number(monthMap[key][r.platform]) || 0) + r.sales;
    monthMap[key].total += r.sales;
  });

  return Object.values(monthMap)
    .sort((a, b) => (a.sortKey as number) - (b.sortKey as number))
    .map(entry => {
      const pt: PlatformTimeSeriesPoint = {
        month: entry.month as string,
        monthLabel: entry.monthLabel as string,
        total: entry.total,
      };
      platforms.forEach(p => {
        pt[p] = Number(entry[p]) || 0;
      });
      return pt;
    });
}

/**
 * Builds Monthly Sales comparison grouped by year (e.g. 2025 vs 2026)
 */
export function buildMonthlyComparison(records: CleanSalesRecord[]): {
  data: MonthlyYearComparisonPoint[];
  years: string[];
} {
  const yearSet = new Set<string>();
  records.forEach(r => yearSet.add(String(r.year)));
  const years = Array.from(yearSet).sort();

  const monthsData: MonthlyYearComparisonPoint[] = MONTH_NAMES.map((mName, idx) => {
    const point: MonthlyYearComparisonPoint = {
      month: mName,
      monthNum: idx,
    };
    years.forEach(y => {
      point[y] = 0;
    });
    return point;
  });

  records.forEach(r => {
    const point = monthsData[r.month];
    const yStr = String(r.year);
    point[yStr] = (Number(point[yStr]) || 0) + r.sales;
  });

  return { data: monthsData, years };
}

/**
 * Builds Category breakdown sorted descending with sales and percentage contribution
 */
export function buildCategoryMetrics(filteredRecords: CleanSalesRecord[]): CategoryMetric[] {
  const totalSales = filteredRecords.reduce((sum, r) => sum + r.sales, 0);
  const catMap: Record<string, { sales: number; quantity: number }> = {};

  filteredRecords.forEach(r => {
    if (!catMap[r.category]) {
      catMap[r.category] = { sales: 0, quantity: 0 };
    }
    catMap[r.category].sales += r.sales;
    catMap[r.category].quantity += r.quantitySold;
  });

  return Object.entries(catMap)
    .map(([category, data]) => ({
      category,
      sales: data.sales,
      quantity: data.quantity,
      sharePct: totalSales > 0 ? (data.sales / totalSales) * 100 : 0,
    }))
    .sort((a, b) => b.sales - a.sales);
}

/**
 * Builds Top Selling Products table metrics
 */
export function buildProductMetrics(
  allRecords: CleanSalesRecord[],
  filteredRecords: CleanSalesRecord[],
  filter: FilterState
): ProductMetric[] {
  const prodMap: Record<string, { category: string; sales: number; quantity: number }> = {};

  filteredRecords.forEach(r => {
    if (!prodMap[r.productName]) {
      prodMap[r.productName] = { category: r.category, sales: 0, quantity: 0 };
    }
    prodMap[r.productName].sales += r.sales;
    prodMap[r.productName].quantity += r.quantitySold;
  });

  // Previous period product sales for growth %
  const prevProdMap: Record<string, number> = {};
  if (filter.month !== 'ALL' && filter.year !== 'ALL') {
    const curYear = parseInt(filter.year, 10);
    const curMonth = parseInt(filter.month, 10);
    const prevMonth = curMonth === 0 ? 11 : curMonth - 1;
    const prevYear = curMonth === 0 ? curYear - 1 : curYear;

    allRecords
      .filter(r => r.year === prevYear && r.month === prevMonth)
      .forEach(r => {
        prevProdMap[r.productName] = (prevProdMap[r.productName] || 0) + r.sales;
      });
  } else if (filter.year !== 'ALL') {
    const prevYear = parseInt(filter.year, 10) - 1;
    allRecords
      .filter(r => r.year === prevYear)
      .forEach(r => {
        prevProdMap[r.productName] = (prevProdMap[r.productName] || 0) + r.sales;
      });
  }

  const items = Object.entries(prodMap).map(([productName, data]) => {
    const prevSales = prevProdMap[productName];
    const growthPct = prevSales && prevSales > 0 ? ((data.sales - prevSales) / prevSales) * 100 : null;
    return {
      rank: 0,
      productName,
      category: data.category,
      quantitySold: data.quantity,
      sales: data.sales,
      growthPct,
    };
  });

  // Sort by sales descending to assign rank
  items.sort((a, b) => b.sales - a.sales);
  items.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  return items;
}

/**
 * Builds Category x Platform matrix / heatmap
 */
export function buildHeatmapMatrix(filteredRecords: CleanSalesRecord[]): HeatmapMatrix {
  const categorySet = new Set<string>();
  const platformSet = new Set<string>();
  const matrix: Record<string, Record<string, number>> = {};
  let maxVal = 0;

  filteredRecords.forEach(r => {
    categorySet.add(r.category);
    platformSet.add(r.platform);

    if (!matrix[r.category]) {
      matrix[r.category] = {};
    }
    const current = (matrix[r.category][r.platform] || 0) + r.sales;
    matrix[r.category][r.platform] = current;
    if (current > maxVal) {
      maxVal = current;
    }
  });

  const categories = Array.from(categorySet).sort();
  const platforms = Array.from(platformSet).sort();

  return {
    categories,
    platforms,
    matrix,
    maxVal,
  };
}

/**
 * Builds executive trend summary
 */
export function buildTrendSummary(
  filteredRecords: CleanSalesRecord[],
  allRecords: CleanSalesRecord[]
): SalesTrendHighlights {
  if (filteredRecords.length === 0) {
    return {
      highestSalesMonth: null,
      lowestSalesMonth: null,
      highestGrowthMonth: null,
      bestPlatform: null,
      bestCategory: null,
      bestProduct: null,
    };
  }

  const totalSales = filteredRecords.reduce((sum, r) => sum + r.sales, 0);

  // Month aggregations
  const monthMap: Record<string, { label: string; sales: number; sortKey: number }> = {};
  filteredRecords.forEach(r => {
    const key = `${r.year}-${String(r.month + 1).padStart(2, '0')}`;
    if (!monthMap[key]) {
      monthMap[key] = {
        label: `${MONTH_NAMES[r.month]} ${r.year}`,
        sales: 0,
        sortKey: Date.UTC(r.year, r.month, 1),
      };
    }
    monthMap[key].sales += r.sales;
  });

  const monthList = Object.values(monthMap).sort((a, b) => a.sortKey - b.sortKey);
  let highestMonth = monthList[0] || null;
  let lowestMonth = monthList[0] || null;

  monthList.forEach(m => {
    if (!highestMonth || m.sales > highestMonth.sales) highestMonth = m;
    if (!lowestMonth || m.sales < lowestMonth.sales) lowestMonth = m;
  });

  // Calculate highest month-over-month growth
  let highestGrowthMonth: { label: string; growthPct: number; sales: number } | null = null;
  for (let i = 1; i < monthList.length; i++) {
    const prev = monthList[i - 1];
    const curr = monthList[i];
    if (prev.sales > 0) {
      const growth = ((curr.sales - prev.sales) / prev.sales) * 100;
      if (!highestGrowthMonth || growth > highestGrowthMonth.growthPct) {
        highestGrowthMonth = {
          label: curr.label,
          growthPct: growth,
          sales: curr.sales,
        };
      }
    }
  }

  // Best platform
  const platformMap: Record<string, number> = {};
  filteredRecords.forEach(r => {
    platformMap[r.platform] = (platformMap[r.platform] || 0) + r.sales;
  });
  let bestPlatformName = '';
  let bestPlatformSales = 0;
  for (const [p, s] of Object.entries(platformMap)) {
    if (s > bestPlatformSales) {
      bestPlatformSales = s;
      bestPlatformName = p;
    }
  }

  // Best category
  const categoryMap: Record<string, number> = {};
  filteredRecords.forEach(r => {
    categoryMap[r.category] = (categoryMap[r.category] || 0) + r.sales;
  });
  let bestCatName = '';
  let bestCatSales = 0;
  for (const [c, s] of Object.entries(categoryMap)) {
    if (s > bestCatSales) {
      bestCatSales = s;
      bestCatName = c;
    }
  }

  // Best product
  const productMap: Record<string, { sales: number; quantity: number }> = {};
  filteredRecords.forEach(r => {
    if (!productMap[r.productName]) {
      productMap[r.productName] = { sales: 0, quantity: 0 };
    }
    productMap[r.productName].sales += r.sales;
    productMap[r.productName].quantity += r.quantitySold;
  });
  let bestProdName = '';
  let bestProdSales = 0;
  let bestProdQty = 0;
  for (const [p, data] of Object.entries(productMap)) {
    if (data.sales > bestProdSales) {
      bestProdSales = data.sales;
      bestProdName = p;
      bestProdQty = data.quantity;
    }
  }

  return {
    highestSalesMonth: highestMonth ? { label: highestMonth.label, sales: highestMonth.sales } : null,
    lowestSalesMonth: lowestMonth ? { label: lowestMonth.label, sales: lowestMonth.sales } : null,
    highestGrowthMonth,
    bestPlatform: bestPlatformName
      ? {
          name: bestPlatformName,
          sales: bestPlatformSales,
          sharePct: totalSales > 0 ? (bestPlatformSales / totalSales) * 100 : 0,
        }
      : null,
    bestCategory: bestCatName
      ? {
          name: bestCatName,
          sales: bestCatSales,
          sharePct: totalSales > 0 ? (bestCatSales / totalSales) * 100 : 0,
        }
      : null,
    bestProduct: bestProdName
      ? {
          name: bestProdName,
          sales: bestProdSales,
          quantity: bestProdQty,
        }
      : null,
  };
}

/**
 * Downloads a sample Excel file (.xlsx) formatted for Urban Organic Superfood
 */
export function downloadSampleExcelTemplate(): void {
  const sampleData = [
    { Date: '01-Sep-2026', Platform: 'Amazon', 'Product Name': 'Roasted Makhana', Category: 'Makhana', 'Quantity Sold': 25, Sales: 9975 },
    { Date: '01-Sep-2026', Platform: 'Website', 'Product Name': 'Organic Sattu', Category: 'Sattu', 'Quantity Sold': 18, Sales: 5382 },
    { Date: '02-Sep-2026', Platform: 'Flipkart', 'Product Name': 'Vedic A2 Ghee', Category: 'Ghee', 'Quantity Sold': 8, Sales: 7192 },
    { Date: '02-Sep-2026', Platform: 'Amazon', 'Product Name': 'Herbal Tea', Category: 'Tea', 'Quantity Sold': 20, Sales: 4980 },
    { Date: '03-Sep-2026', Platform: 'Website', 'Product Name': 'Kashmiri Honey', Category: 'Honey', 'Quantity Sold': 15, Sales: 7485 },
    { Date: '03-Sep-2026', Platform: 'Amazon', 'Product Name': 'Sprouted Ragi Flour', Category: 'Millets', 'Quantity Sold': 30, Sales: 8970 },
    { Date: '04-Sep-2026', Platform: 'Blinkit', 'Product Name': 'Roasted Makhana', Category: 'Makhana', 'Quantity Sold': 35, Sales: 13965 },
    { Date: '04-Sep-2026', Platform: 'Flipkart', 'Product Name': 'Chia Seeds Trio', Category: 'Protein', 'Quantity Sold': 22, Sales: 8778 },
    { Date: '05-Sep-2026', Platform: 'Amazon', 'Product Name': 'Ashwagandha Gold', Category: 'Wellness', 'Quantity Sold': 16, Sales: 12784 },
    { Date: '05-Sep-2026', Platform: 'Website', 'Product Name': 'Immunity Combo Pack', Category: 'Combos', 'Quantity Sold': 14, Sales: 20986 },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sales Data');
  XLSX.writeFile(wb, 'Urban_Organic_Superfood_Sales_Template.xlsx');
}

/**
 * Exports current filtered dashboard records as CSV
 */
export function exportRecordsToCSV(records: CleanSalesRecord[], filename = 'Urban_Organic_Sales_Export.csv'): void {
  const exportRows = records.map(r => ({
    Date: r.date,
    Platform: r.platform,
    'Product Name': r.productName,
    Category: r.category,
    'Quantity Sold': r.quantitySold,
    Sales: r.sales,
  }));

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
