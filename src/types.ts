export interface CleanSalesRecord {
  id: string;
  date: string; // ISO YYYY-MM-DD
  timestamp: number;
  year: number;
  month: number; // 0-11
  monthName: string; // 'Jan', 'Feb', etc.
  monthYear: string; // 'Sep 2026'
  platform: string;
  productName: string;
  category: string;
  quantitySold: number;
  sales: number;
}

export interface ColumnMapping {
  date: string;
  platform: string;
  productName: string;
  category: string;
  quantitySold: string;
  sales: string;
}

export type Granularity = 'daily' | 'weekly' | 'monthly';

export interface FilterState {
  startDate: string; // YYYY-MM-DD or ''
  endDate: string; // YYYY-MM-DD or ''
  platform: string; // 'ALL' or platform name
  category: string; // 'ALL' or category name
  product: string; // 'ALL' or product name
  month: string; // 'ALL' or '0'-'11'
  year: string; // 'ALL' or '2025', '2026'
}

export interface KpiMetrics {
  totalSales: number;
  totalUnits: number;
  salesGrowthPct: number | null;
  prevPeriodSales: number;
  prevPeriodUnits: number;
  prevPeriodLabel: string;
  topPlatform: {
    name: string;
    sales: number;
    sharePct: number;
  } | null;
}

export interface PlatformMetric {
  platform: string;
  sales: number;
  quantity: number;
  sharePct: number;
  growthPct: number | null;
}

export interface CategoryMetric {
  category: string;
  sales: number;
  quantity: number;
  sharePct: number;
}

export interface ProductMetric {
  rank: number;
  productName: string;
  category: string;
  quantitySold: number;
  sales: number;
  growthPct: number | null;
}

export interface TimeSeriesPoint {
  key: string;
  label: string;
  date: string;
  sales: number;
  quantity: number;
}

export interface PlatformTimeSeriesPoint {
  month: string;
  monthLabel: string;
  total: number;
  [platformKey: string]: number | string;
}

export interface MonthlyYearComparisonPoint {
  month: string;
  monthNum: number;
  [yearKey: string]: number | string;
}

export interface HeatmapMatrix {
  categories: string[];
  platforms: string[];
  matrix: Record<string, Record<string, number>>;
  maxVal: number;
}

export interface SalesTrendHighlights {
  highestSalesMonth: { label: string; sales: number } | null;
  lowestSalesMonth: { label: string; sales: number } | null;
  highestGrowthMonth: { label: string; growthPct: number; sales: number } | null;
  bestPlatform: { name: string; sales: number; sharePct: number } | null;
  bestCategory: { name: string; sales: number; sharePct: number } | null;
  bestProduct: { name: string; sales: number; quantity: number } | null;
}

export interface ValidationReport {
  isValid: boolean;
  totalRowsParsed: number;
  validRows: number;
  skippedRows: number;
  errors: string[];
  missingColumns: string[];
  detectedColumns: string[];
  initialMapping: ColumnMapping;
}

export type LiveSyncIntervalSeconds = 15 | 30 | 60 | 120 | 300;

export type LiveSyncStatus = 'idle' | 'syncing' | 'connected' | 'paused' | 'error';

export interface LiveSyncConfig {
  sheetUrl: string;
  intervalSeconds: LiveSyncIntervalSeconds;
  isEnabled: boolean;
  lastSyncedAt: number | null;
  lastError: string | null;
  sheetTitle?: string;
  lastRecordCount?: number;
}

