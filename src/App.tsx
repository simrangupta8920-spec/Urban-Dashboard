/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  CleanSalesRecord,
  ColumnMapping,
  FilterState,
  Granularity,
  LiveSyncConfig,
  LiveSyncIntervalSeconds,
  LiveSyncStatus,
  SheetSummary,
} from './types';
import { generateFullSampleDataset } from './data/sampleData';
import {
  parseUploadedFile,
  filterSalesRecords,
  calculateKpiMetrics,
  buildSalesGrowthTimeSeries,
  buildPlatformMetrics,
  buildPlatformGrowthTimeSeries,
  buildMonthlyComparison,
  buildCategoryMetrics,
  buildProductMetrics,
  buildHeatmapMatrix,
  buildTrendSummary,
} from './utils/dataProcessor';
import { exportDashboardToPDF } from './utils/pdfExport';
import {
  fetchLiveSheetData,
  loadStoredLiveSyncConfig,
  saveStoredLiveSyncConfig,
  clearStoredLiveSyncConfig,
  getDefaultLiveSyncConfig,
  DEFAULT_HARDCODED_GOOGLE_SHEET_URL,
} from './utils/googleSheetsSync';

import { Header } from './components/Header';
import { EmptyState } from './components/EmptyState';
import { FilterBar } from './components/FilterBar';
import { ExecutiveTopControlBar } from './components/ExecutiveTopControlBar';
import { ExecutiveRevenueTrend } from './components/ExecutiveRevenueTrend';
import { ExecutiveStackedKpis } from './components/ExecutiveStackedKpis';
import { ExecutiveRevenueByPlatform } from './components/ExecutiveRevenueByPlatform';
import { ExecutiveTopPlatform } from './components/ExecutiveTopPlatform';
import { MarketplacesGrid } from './components/MarketplacesGrid';
import { KpiCards } from './components/KpiCards';
import { SalesGrowthHeroChart } from './components/SalesGrowthHeroChart';
import { SalesByPlatform } from './components/SalesByPlatform';
import { PlatformGrowthChart } from './components/PlatformGrowthChart';
import { MonthlySalesComparison } from './components/MonthlySalesComparison';
import { CategoryAndProductSection } from './components/CategoryAndProductSection';
import { PlatformCategoryHeatmap } from './components/PlatformCategoryHeatmap';
import { SalesTrendSummary } from './components/SalesTrendSummary';
import { ColumnMapperModal } from './components/ColumnMapperModal';
import { LiveSyncModal } from './components/LiveSyncModal';
import { CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

const INITIAL_FILTER: FilterState = {
  startDate: '',
  endDate: '',
  platform: 'ALL',
  category: 'ALL',
  product: 'ALL',
  month: 'ALL',
  year: 'ALL',
};

export default function App() {
  // Data source mode: 'user' by default - no pre-fitted data
  const [dataSourceMode, setDataSourceMode] = useState<'demo' | 'user'>('user');

  // Pre-seeded demo dataset generated only if user explicitly clicks preview
  const demoDataset = useMemo(() => {
    return dataSourceMode === 'demo' ? generateFullSampleDataset() : [];
  }, [dataSourceMode]);

  // User uploaded dataset - starts strictly empty with 0 records
  const [userDataset, setUserDataset] = useState<CleanSalesRecord[]>([]);
  const [userRawBuffer, setUserRawBuffer] = useState<ArrayBuffer | null>(null);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [activeMapping, setActiveMapping] = useState<ColumnMapping>({
    date: '',
    platform: '',
    productName: '',
    category: '',
    quantitySold: '',
    sales: '',
  });
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isMapperOpen, setIsMapperOpen] = useState<boolean>(false);

  // PDF Export state and container reference
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [pdfToast, setPdfToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState<boolean>(false);

  // Live Sync State - Hardcoded default link automatically loaded on start
  const [liveSyncConfig, setLiveSyncConfig] = useState<LiveSyncConfig>(() => {
    return loadStoredLiveSyncConfig();
  });
  const [liveSyncStatus, setLiveSyncStatus] = useState<LiveSyncStatus>(() => {
    const stored = loadStoredLiveSyncConfig();
    return stored.isEnabled && stored.sheetUrl ? 'connected' : 'idle';
  });
  const [nextSyncCountdown, setNextSyncCountdown] = useState<number>(30);
  const [isLiveSyncModalOpen, setIsLiveSyncModalOpen] = useState<boolean>(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER);
  const [sheetsSummary, setSheetsSummary] = useState<SheetSummary[]>([]);

  // Time granularity for hero chart: 'daily' | 'weekly' | 'monthly'
  const [granularity, setGranularity] = useState<Granularity>('monthly');

  const handleFilterChange = (newFilter: FilterState) => {
    // When a specific month is selected (e.g. August), switch granularity to daily so days 1st through 31st are displayed
    if (newFilter.month !== 'ALL' && newFilter.month !== filters.month && granularity === 'monthly') {
      setGranularity('daily');
    }
    setFilters(newFilter);
  };

  // Determine active full records based on mode
  const currentDataset = dataSourceMode === 'demo' ? demoDataset : userDataset;

  // Extract distinct platforms, categories, products, years, sheets from current active dataset
  const availablePlatforms = useMemo(() => {
    const s = new Set<string>();
    currentDataset.forEach(r => s.add(r.platform));
    return Array.from(s).sort();
  }, [currentDataset]);

  const availableCategories = useMemo(() => {
    const s = new Set<string>();
    currentDataset.forEach(r => s.add(r.category));
    return Array.from(s).sort();
  }, [currentDataset]);

  const availableProducts = useMemo(() => {
    const s = new Set<string>();
    currentDataset.forEach(r => {
      if (filters.category === 'ALL' || r.category.toLowerCase() === filters.category.toLowerCase()) {
        s.add(r.productName);
      }
    });
    return Array.from(s).sort();
  }, [currentDataset, filters.category]);

  const availableYears = useMemo(() => {
    const s = new Set<string>();
    currentDataset.forEach(r => s.add(String(r.year)));
    return Array.from(s).sort();
  }, [currentDataset]);

  const availableSheets = useMemo(() => {
    const s = new Set<string>();
    currentDataset.forEach(r => {
      if (r.sourceSheet) s.add(r.sourceSheet);
    });
    return Array.from(s);
  }, [currentDataset]);

  // Filter records dynamically
  const filteredRecords = useMemo(() => {
    return filterSalesRecords(currentDataset, filters);
  }, [currentDataset, filters]);

  // KPI Metrics (Total Sales, Units Sold, Growth %, Top Platform)
  const kpiMetrics = useMemo(() => {
    return calculateKpiMetrics(currentDataset, filteredRecords, filters);
  }, [currentDataset, filteredRecords, filters]);

  // Hero visual sales growth time-series
  const salesTimeSeries = useMemo(() => {
    return buildSalesGrowthTimeSeries(filteredRecords, granularity);
  }, [filteredRecords, granularity]);

  // Platform metrics
  const platformMetrics = useMemo(() => {
    return buildPlatformMetrics(currentDataset, filteredRecords, filters);
  }, [currentDataset, filteredRecords, filters]);

  // Platform growth multi-line time series
  const platformTimeSeries = useMemo(() => {
    return buildPlatformGrowthTimeSeries(filteredRecords, availablePlatforms);
  }, [filteredRecords, availablePlatforms]);

  // Monthly sales YoY comparison
  const monthlyComparison = useMemo(() => {
    return buildMonthlyComparison(filteredRecords);
  }, [filteredRecords]);

  // Category metrics
  const categoryMetrics = useMemo(() => {
    return buildCategoryMetrics(filteredRecords);
  }, [filteredRecords]);

  // Product metrics
  const productMetrics = useMemo(() => {
    return buildProductMetrics(currentDataset, filteredRecords, filters);
  }, [currentDataset, filteredRecords, filters]);

  // Heatmap: Category x Platform
  const heatmapData = useMemo(() => {
    return buildHeatmapMatrix(filteredRecords);
  }, [filteredRecords]);

  // Trend summary
  const trendSummary = useMemo(() => {
    return buildTrendSummary(filteredRecords, currentDataset);
  }, [filteredRecords, currentDataset]);

  // File Upload Handler
  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    try {
      const buffer = await file.arrayBuffer();
      setUserRawBuffer(buffer);

      const { records, report } = await parseUploadedFile(buffer);
      setDetectedColumns(report.detectedColumns);
      setActiveMapping(report.initialMapping);
      setMissingColumns(report.missingColumns);

      if (!report.isValid) {
        if (report.missingColumns.length > 0) {
          setIsMapperOpen(true);
        } else {
          setUploadError(report.errors.join(' '));
        }
        return;
      }

      setUserDataset(records);
      setSheetsSummary(report.sheetsSummary || []);
      setDataSourceMode('user');
      setFilters(INITIAL_FILTER);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to read spreadsheet file. Please check file format.');
    }
  };

  // Re-map columns handler
  const handleSaveMapping = async (newMapping: ColumnMapping) => {
    if (!userRawBuffer) return;
    try {
      const { records, report } = await parseUploadedFile(userRawBuffer, newMapping);
      setActiveMapping(newMapping);
      if (records.length > 0) {
        setUserDataset(records);
        setSheetsSummary(report.sheetsSummary || []);
        setDataSourceMode('user');
        setUploadError(null);
        setFilters(INITIAL_FILTER);
      } else {
        setUploadError('Unable to extract sales records with the selected mapping.');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Error processing mapped columns.');
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters(INITIAL_FILTER);
  };

  // Click on platform to filter
  const handleSelectPlatform = (platform: string) => {
    setFilters(prev => ({
      ...prev,
      platform,
    }));
  };

  // Click on category to filter
  const handleSelectCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category,
      product: 'ALL', // reset product when category changes
    }));
  };

  // Click on product to filter
  const handleSelectProduct = (product: string) => {
    setFilters(prev => ({
      ...prev,
      product,
    }));
  };

  // Click cell in heatmap
  const handleHeatmapFilter = (platform: string, category: string) => {
    setFilters(prev => ({
      ...prev,
      platform,
      category,
      product: 'ALL',
    }));
  };

  // Clear all loaded data back to 0
  const handleClearData = () => {
    setUserDataset([]);
    setUserRawBuffer(null);
    setDataSourceMode('user');
    setUploadError(null);
    setFilters(INITIAL_FILTER);
    setPdfToast({ message: 'Dashboard cleared. All sales metrics reset to 0.', type: 'info' });
    setTimeout(() => setPdfToast(null), 3500);
  };

  // Handler for Export to PDF
  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    setIsExportingPDF(true);
    setPdfToast({ message: 'Generating executive management PDF report...', type: 'info' });

    try {
      await exportDashboardToPDF({
        containerElement: dashboardRef.current,
        filterState: filters,
        kpiMetrics,
        trendSummary,
        dataSourceMode,
        recordCount: filteredRecords.length,
      });
      setPdfToast({ message: 'Executive report downloaded successfully!', type: 'success' });
      setTimeout(() => setPdfToast(null), 4500);
    } catch (err: any) {
      console.error('PDF export failed:', err);
      setPdfToast({ message: `Export failed: ${err?.message || 'Could not generate report'}`, type: 'error' });
      setTimeout(() => setPdfToast(null), 5000);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Live Sync: Fetch and process Google Sheets data
  const performLiveSync = async (sheetUrl: string, isManual = false, silent = false): Promise<{ success: boolean; error?: string }> => {
    if (!sheetUrl) return { success: false, error: 'Empty sheet URL' };
    setLiveSyncStatus('syncing');

    try {
      const { rawText, arrayBuffer, sheetId } = await fetchLiveSheetData(sheetUrl);
      const dataToParse = arrayBuffer || rawText;

      if (!dataToParse) {
        throw new Error('No spreadsheet data received from Google Sheets. Please verify the URL.');
      }

      // Store raw buffer in state so column mapping editor also functions smoothly
      if (arrayBuffer) {
        setUserRawBuffer(arrayBuffer);
      } else if (typeof rawText === 'string') {
        const enc = new TextEncoder();
        setUserRawBuffer(enc.encode(rawText).buffer);
      }

      const { records, report } = await parseUploadedFile(dataToParse, activeMapping.date ? activeMapping : undefined);

      if (!report.isValid) {
        if (report.missingColumns.length > 0) {
          setDetectedColumns(report.detectedColumns);
          setActiveMapping(report.initialMapping);
          setMissingColumns(report.missingColumns);
          setIsMapperOpen(true);
          setLiveSyncStatus('error');
          const errText = `Missing columns: ${report.missingColumns.join(', ')}`;
          setLiveSyncConfig(prev => ({
            ...prev,
            lastError: errText,
          }));
          return { success: false, error: errText };
        }
        throw new Error(report.errors.join(' '));
      }

      const prevCount = userDataset.length;
      setUserDataset(records);
      setSheetsSummary(report.sheetsSummary || []);
      setDataSourceMode('user');
      setUploadError(null);
      setLiveSyncStatus('connected');

      const title = sheetId && sheetId !== 'sample-stream'
        ? `Google Sheet (${sheetId.slice(0, 6)}...${sheetId.slice(-4)})`
        : 'Urban Organic Multi-Month Live Stream';

      const updatedConfig: LiveSyncConfig = {
        ...liveSyncConfig,
        sheetUrl,
        lastSyncedAt: Date.now(),
        lastRecordCount: records.length,
        lastError: null,
        sheetTitle: title,
      };
      setLiveSyncConfig(updatedConfig);
      saveStoredLiveSyncConfig(updatedConfig);

      if (isManual || prevCount !== records.length) {
        const sheetCount = report.sheetsSummary && report.sheetsSummary.length > 0 ? report.sheetsSummary.length : 1;
        setPdfToast({
          message: `Live Sync: Refreshed ${records.length.toLocaleString()} transactions across ${sheetCount} workbook tab${sheetCount > 1 ? 's' : ''}`,
          type: 'success',
        });
        setTimeout(() => setPdfToast(null), 4000);
      }

      return { success: true };
    } catch (err: any) {
      console.error('Google Sheet sync error:', err);
      setLiveSyncStatus('error');
      const errMsg = err?.message || 'Failed to sync with Google Sheet.';
      setLiveSyncConfig(prev => ({ ...prev, lastError: errMsg }));
      if (!silent) {
        setPdfToast({
          message: errMsg,
          type: 'error',
        });
        setTimeout(() => setPdfToast(null), 6000);
      }
      return { success: false, error: errMsg };
    }
  };

  // Recurring sync interval effect (every 15s, 30s, 60s etc)
  useEffect(() => {
    if (!liveSyncConfig.isEnabled || !liveSyncConfig.sheetUrl || liveSyncStatus === 'paused') {
      return;
    }

    const timer = window.setInterval(() => {
      setNextSyncCountdown(prev => {
        if (prev <= 1) {
          performLiveSync(liveSyncConfig.sheetUrl, false, true);
          return liveSyncConfig.intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [liveSyncConfig.isEnabled, liveSyncConfig.sheetUrl, liveSyncConfig.intervalSeconds, liveSyncStatus, activeMapping]);

  // Initial fetch on mount if live sync was previously enabled
  useEffect(() => {
    if (liveSyncConfig.isEnabled && liveSyncConfig.sheetUrl) {
      performLiveSync(liveSyncConfig.sheetUrl, false, true);
    }
  }, []);

  // Save config and connect
  const handleSaveAndConnectLiveSync = async (url: string, interval: LiveSyncIntervalSeconds): Promise<boolean> => {
    const res = await performLiveSync(url, true, false);
    if (res.success) {
      const newConfig: LiveSyncConfig = {
        ...liveSyncConfig,
        sheetUrl: url,
        intervalSeconds: interval,
        isEnabled: true,
        lastError: null,
      };
      setLiveSyncConfig(newConfig);
      saveStoredLiveSyncConfig(newConfig);
      setNextSyncCountdown(interval);
      setIsLiveSyncModalOpen(false);
      return true;
    }
    throw new Error(res.error || 'Failed to connect to Google Sheet.');
  };

  // Pause / Resume toggle
  const handleToggleLiveSyncPause = () => {
    setLiveSyncStatus(prev => (prev === 'paused' ? 'connected' : 'paused'));
  };

  // Disconnect Google Sheet
  const handleDisconnectLiveSync = () => {
    const cleared: LiveSyncConfig = {
      sheetUrl: '',
      intervalSeconds: 30,
      isEnabled: false,
      lastSyncedAt: null,
      lastError: null,
    };
    setLiveSyncConfig(cleared);
    clearStoredLiveSyncConfig();
    setLiveSyncStatus('idle');
    setIsLiveSyncModalOpen(false);
    setPdfToast({
      message: 'Google Sheet live sync disconnected.',
      type: 'info',
    });
    setTimeout(() => setPdfToast(null), 3500);
  };

  // Check if we should show empty state
  const showEmptyState = dataSourceMode === 'user' && userDataset.length === 0;

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#18261B] flex flex-col font-sans">
      
      {/* 1. Header */}
      <Header
        dataSourceMode={dataSourceMode}
        onToggleDataSource={setDataSourceMode}
        onFileUpload={handleFileUpload}
        filteredRecords={filteredRecords}
        allRecordsCount={currentDataset.length}
        onOpenColumnMapper={() => setIsMapperOpen(true)}
        canMapColumns={detectedColumns.length > 0}
        onExportPDF={handleExportPDF}
        isExportingPDF={isExportingPDF}
        isLiveSyncActive={Boolean(liveSyncConfig.isEnabled && liveSyncConfig.sheetUrl)}
        liveSyncStatus={liveSyncStatus}
        liveSyncInterval={liveSyncConfig.intervalSeconds}
        onOpenLiveSyncModal={() => setIsLiveSyncModalOpen(true)}
        onClearData={handleClearData}
      />

      {/* Main Content Area */}
      <main ref={dashboardRef} id="dashboard-report-content" className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Live Sync Active Status Bar */}
        {liveSyncConfig.isEnabled && liveSyncConfig.sheetUrl && (
          <div className="mb-5 px-4 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#C5DDCB] shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  liveSyncStatus === 'paused' ? 'bg-[#D97706]' : 'bg-[#1B4324]'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  liveSyncStatus === 'paused' ? 'bg-[#D97706]' : 'bg-[#1B4324]'
                }`}></span>
              </span>
              <span className="font-bold text-[#18261B]">
                {liveSyncStatus === 'paused' ? 'Live Sync Paused' : 'Live Syncing with Google Sheets'}
              </span>
              <span className="text-[#A5B8A8] hidden sm:inline">•</span>
              <span className="text-[#556958] truncate max-w-xs md:max-w-md">
                {liveSyncConfig.sheetTitle || liveSyncConfig.sheetUrl}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-[11px] text-[#6C7D6F] flex items-center gap-1.5">
                <span>Frequency: <strong>{liveSyncConfig.intervalSeconds}s</strong></span>
                <span>•</span>
                {liveSyncStatus === 'paused' ? (
                  <span className="text-[#886D12] font-semibold">Paused</span>
                ) : liveSyncStatus === 'syncing' ? (
                  <span className="text-[#1B4324] font-semibold flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin text-[#1B4324]" />
                    Refreshing...
                  </span>
                ) : (
                  <span>Next check: <strong>{nextSyncCountdown}s</strong></span>
                )}
              </div>

              <button
                type="button"
                onClick={() => performLiveSync(liveSyncConfig.sheetUrl, true, false)}
                disabled={liveSyncStatus === 'syncing'}
                className="px-2.5 py-1 rounded-lg bg-[#EAF3EC] hover:bg-[#D9EBDC] border border-[#B5DBC0] text-[11px] font-semibold text-[#1B4324] transition-all cursor-pointer"
              >
                Sync Now
              </button>

              <button
                type="button"
                onClick={() => setIsLiveSyncModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-[#FAF8F3] hover:bg-[#F2EFE8] border border-[#DFD9CE] text-[11px] font-semibold text-[#18261B] transition-all cursor-pointer"
              >
                Manage
              </button>
            </div>
          </div>
        )}

        {/* 1. Ingestion Hero Card when dataset is empty (All Data is 0) */}
        {currentDataset.length === 0 ? (
          <div className="mb-8">
            <EmptyState
              onFileUpload={handleFileUpload}
              onSwitchToDemo={() => setDataSourceMode('demo')}
              onOpenLiveSync={() => setIsLiveSyncModalOpen(true)}
              error={uploadError}
            />
          </div>
        ) : (
          /* Active Dataset Notification Banner */
          <div className="mb-6 px-4 py-3 rounded-2xl bg-white border border-[#C5DDCB] shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#234E33]"></span>
              <span className="font-bold text-[#18261B]">
                {dataSourceMode === 'demo' ? 'Sample Demo Dataset' : 'Active Dataset Loaded'}
              </span>
              <span className="text-[#A5B8A8]">•</span>
              <span className="text-[#556958]">
                {currentDataset.length.toLocaleString()} sales transactions across {availablePlatforms.length} platform{availablePlatforms.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.xlsx, .xls, .csv';
                  input.onchange = (e: any) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  };
                  input.click();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#EAF3EC] hover:bg-[#D9EBDC] border border-[#B5DBC0] text-xs font-semibold text-[#1B4324] transition-all cursor-pointer"
              >
                Upload New File
              </button>
              <button
                type="button"
                onClick={handleClearData}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 transition-all cursor-pointer"
              >
                Reset to 0
              </button>
            </div>
          </div>
        )}

        {/* 2. Executive Top Control Bar matching Image 1 */}
        <ExecutiveTopControlBar
          filter={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          platforms={availablePlatforms}
          totalRecords={currentDataset.length}
          filteredCount={filteredRecords.length}
          isAdvancedOpen={isAdvancedFiltersOpen}
          onToggleAdvanced={() => setIsAdvancedFiltersOpen(prev => !prev)}
        />

        {/* Expandable Advanced Filters (Categories, Products, Custom Date Range) */}
        {isAdvancedFiltersOpen && (
          <div className="mb-6 animate-in fade-in-50 duration-150">
            <FilterBar
              filter={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              platforms={availablePlatforms}
              categories={availableCategories}
              products={availableProducts}
              years={availableYears}
              totalRecords={currentDataset.length}
              filteredCount={filteredRecords.length}
            />
          </div>
        )}

        {/* SECTION 1: TOP ROW (2:1 Split) - Revenue Trend (Left) + Stacked KPIs (Right) */}
        <div id="pdf-section-hero" className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            {/* Left 2/3 (col-span-12 lg:col-span-8): Multi-Platform Revenue Trend */}
            <div className="lg:col-span-8">
              <ExecutiveRevenueTrend
                data={platformTimeSeries}
                platforms={availablePlatforms}
                selectedPlatform={filters.platform}
                onSelectPlatform={handleSelectPlatform}
              />
            </div>

            {/* Right 1/3 (col-span-12 lg:col-span-4): Stacked KPI Cards */}
            <div className="lg:col-span-4">
              <ExecutiveStackedKpis metrics={kpiMetrics} />
            </div>
          </div>
        </div>

        {/* SECTION 2: BOTTOM ROW (2:1 Split) - Revenue by Platform (Left) + Top Platform Ranking (Right) */}
        <div id="pdf-section-platforms" className="mb-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            {/* Left 2/3 (col-span-12 lg:col-span-8): Revenue by Platform (Donut + Progress bars) */}
            <div className="lg:col-span-8">
              <ExecutiveRevenueByPlatform
                platforms={platformMetrics}
                selectedPlatform={filters.platform}
                onSelectPlatform={handleSelectPlatform}
              />
            </div>

            {/* Right 1/3 (col-span-12 lg:col-span-4): Top Platform Ranking */}
            <div className="lg:col-span-4">
              <ExecutiveTopPlatform
                platforms={platformMetrics}
                selectedPlatform={filters.platform}
                onSelectPlatform={handleSelectPlatform}
              />
            </div>
          </div>

          {/* SECTION 3: MARKETPLACES BREAKDOWN ROW (Focal Software style in Image 2) */}
          <MarketplacesGrid
            platforms={platformMetrics}
            selectedPlatform={filters.platform}
            onSelectPlatform={handleSelectPlatform}
          />
        </div>

        {/* SECTION 4: PRODUCT CATALOG & COMPARATIVE ANALYTICS */}
        <div id="pdf-section-products" className="space-y-8 mb-8">
          {/* Sales by Category + Top Selling Products Table */}
          <CategoryAndProductSection
            categories={categoryMetrics}
            products={productMetrics}
            selectedCategory={filters.category}
            selectedProduct={filters.product}
            onSelectCategory={handleSelectCategory}
            onSelectProduct={handleSelectProduct}
          />

          {/* Monthly Sales Comparison (e.g. 2025 vs 2026) */}
          <MonthlySalesComparison
            data={monthlyComparison.data}
            years={monthlyComparison.years}
          />
        </div>

        {/* SECTION 5: MARKETPLACE HEATMAP & TREND MILESTONES */}
        <div id="pdf-section-insights" className="space-y-8 mb-8">
          {/* Platform x Category Heatmap Matrix */}
          <PlatformCategoryHeatmap
            heatmap={heatmapData}
            onFilterPlatformCategory={handleHeatmapFilter}
          />

          {/* Sales Trend Summary */}
          <SalesTrendSummary summary={trendSummary} />
        </div>

      </main>

      {/* Floating Export Status Toast */}
      {pdfToast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3"
          style={{
            backgroundColor: pdfToast.type === 'success' ? '#EAF3EC' : pdfToast.type === 'error' ? '#FFF1F2' : '#F7F5F0',
            borderColor: pdfToast.type === 'success' ? '#234E33' : pdfToast.type === 'error' ? '#BE123C' : '#DFD9CE',
            color: pdfToast.type === 'success' ? '#14331C' : pdfToast.type === 'error' ? '#881337' : '#18261B',
          }}
        >
          {pdfToast.type === 'info' && <Loader2 className="w-4 h-4 animate-spin text-[#1B4324]" />}
          {pdfToast.type === 'success' && <CheckCircle className="w-4 h-4 text-[#1B4324]" />}
          {pdfToast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#BE123C]" />}
          <span>{pdfToast.message}</span>
        </div>
      )}

      {/* Column Mapper Modal */}
      <ColumnMapperModal
        isOpen={isMapperOpen}
        onClose={() => setIsMapperOpen(false)}
        detectedColumns={detectedColumns}
        currentMapping={activeMapping}
        onSaveMapping={handleSaveMapping}
        missingColumns={missingColumns}
      />

      {/* Live Google Sheets Synchronization Modal */}
      <LiveSyncModal
        isOpen={isLiveSyncModalOpen}
        onClose={() => setIsLiveSyncModalOpen(false)}
        config={liveSyncConfig}
        status={liveSyncStatus}
        nextSyncCountdown={nextSyncCountdown}
        onSaveAndConnect={handleSaveAndConnectLiveSync}
        onTriggerSyncNow={() => performLiveSync(liveSyncConfig.sheetUrl, true, false)}
        onTogglePause={handleToggleLiveSyncPause}
        onDisconnect={handleDisconnectLiveSync}
      />

      {/* Brand Footer */}
      <footer className="bg-white border-t border-[#EAE4DA] py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7C6E]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#18261B]">Urban Organic Superfood</span>
            <span>•</span>
            <span>Sales Analytics & Performance Dashboard</span>
          </div>
          <div className="text-[11px] text-[#869688]">
            Multi-platform sales, volume, growth & category tracking
          </div>
        </div>
      </footer>

    </div>
  );
}
