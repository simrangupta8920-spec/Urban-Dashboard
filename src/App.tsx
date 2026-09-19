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
} from './utils/googleSheetsSync';

import { Header } from './components/Header';
import { EmptyState } from './components/EmptyState';
import { FilterBar } from './components/FilterBar';
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
  // Data source mode: 'demo' or 'user'
  const [dataSourceMode, setDataSourceMode] = useState<'demo' | 'user'>('demo');

  // Pre-seeded demo dataset
  const demoDataset = useMemo(() => generateFullSampleDataset(), []);

  // User uploaded dataset
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

  // Live Sync State
  const [liveSyncConfig, setLiveSyncConfig] = useState<LiveSyncConfig>(() => {
    return loadStoredLiveSyncConfig() || {
      sheetUrl: '',
      intervalSeconds: 30,
      isEnabled: false,
      lastSyncedAt: null,
      lastError: null,
    };
  });
  const [liveSyncStatus, setLiveSyncStatus] = useState<LiveSyncStatus>(() => {
    const stored = loadStoredLiveSyncConfig();
    return stored && stored.isEnabled && stored.sheetUrl ? 'connected' : 'idle';
  });
  const [nextSyncCountdown, setNextSyncCountdown] = useState<number>(30);
  const [isLiveSyncModalOpen, setIsLiveSyncModalOpen] = useState<boolean>(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER);

  // Time granularity for hero chart: 'daily' | 'weekly' | 'monthly'
  const [granularity, setGranularity] = useState<Granularity>('monthly');

  // Determine active full records based on mode
  const currentDataset = dataSourceMode === 'demo' ? demoDataset : userDataset;

  // Extract distinct platforms, categories, products, years from current active dataset
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
  const performLiveSync = async (sheetUrl: string, isManual = false, silent = false): Promise<boolean> => {
    if (!sheetUrl) return false;
    setLiveSyncStatus('syncing');

    try {
      const { rawText, sheetId } = await fetchLiveSheetData(sheetUrl);
      const { records, report } = await parseUploadedFile(rawText, activeMapping.date ? activeMapping : undefined);

      if (!report.isValid) {
        if (report.missingColumns.length > 0) {
          setDetectedColumns(report.detectedColumns);
          setActiveMapping(report.initialMapping);
          setMissingColumns(report.missingColumns);
          setIsMapperOpen(true);
          setLiveSyncStatus('error');
          setLiveSyncConfig(prev => ({
            ...prev,
            lastError: `Missing columns: ${report.missingColumns.join(', ')}`,
          }));
          return false;
        }
        throw new Error(report.errors.join(' '));
      }

      const prevCount = userDataset.length;
      setUserDataset(records);
      setDataSourceMode('user');
      setUploadError(null);
      setLiveSyncStatus('connected');

      const title = sheetId && sheetId !== 'sample-stream'
        ? `Google Sheet (${sheetId.slice(0, 6)}...${sheetId.slice(-4)})`
        : 'Urban Organic Sample Live Stream';

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
        setPdfToast({
          message: `Live Sync: Refreshed with ${records.length.toLocaleString()} transactions from Google Sheet`,
          type: 'success',
        });
        setTimeout(() => setPdfToast(null), 4000);
      }

      return true;
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
      return false;
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
    const success = await performLiveSync(url, true, false);
    if (success) {
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
    }
    return success;
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

        {showEmptyState ? (
          <EmptyState
            onFileUpload={handleFileUpload}
            onSwitchToDemo={() => setDataSourceMode('demo')}
            onOpenLiveSync={() => setIsLiveSyncModalOpen(true)}
            error={uploadError}
          />
        ) : (
          <>
            {/* 2. Filter Bar */}
            <FilterBar
              filter={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              platforms={availablePlatforms}
              categories={availableCategories}
              products={availableProducts}
              years={availableYears}
              totalRecords={currentDataset.length}
              filteredCount={filteredRecords.length}
            />

            {/* SECTION 1: HERO & KPIS */}
            <div id="pdf-section-hero" className="space-y-8 mb-8">
              {/* 3. 4 KPI Cards */}
              <KpiCards metrics={kpiMetrics} />

              {/* 4. Large Sales Growth Hero Chart */}
              <SalesGrowthHeroChart
                data={salesTimeSeries}
                granularity={granularity}
                onGranularityChange={setGranularity}
              />
            </div>

            {/* SECTION 2: PLATFORM PERFORMANCE & GROWTH */}
            <div id="pdf-section-platforms" className="space-y-8 mb-8">
              {/* 5. Sales by Platform (Donut + Bar) & Platform Growth (Multi-line) */}
              <SalesByPlatform
                platforms={platformMetrics}
                selectedPlatform={filters.platform}
                onSelectPlatform={handleSelectPlatform}
              />

              <PlatformGrowthChart
                data={platformTimeSeries}
                platforms={availablePlatforms}
              />
            </div>

            {/* SECTION 3: MONTHLY COMPARISON & PRODUCT CATALOG */}
            <div id="pdf-section-products" className="space-y-8 mb-8">
              {/* 6. Monthly Sales Comparison (e.g. 2025 vs 2026) */}
              <MonthlySalesComparison
                data={monthlyComparison.data}
                years={monthlyComparison.years}
              />

              {/* 7. Sales by Category + Top Selling Products Table */}
              <CategoryAndProductSection
                categories={categoryMetrics}
                products={productMetrics}
                selectedCategory={filters.category}
                selectedProduct={filters.product}
                onSelectCategory={handleSelectCategory}
                onSelectProduct={handleSelectProduct}
              />
            </div>

            {/* SECTION 4: MARKETPLACE HEATMAP & TREND MILESTONES */}
            <div id="pdf-section-insights" className="space-y-8 mb-8">
              {/* 8. Platform x Category Heatmap Matrix */}
              <PlatformCategoryHeatmap
                heatmap={heatmapData}
                onFilterPlatformCategory={handleHeatmapFilter}
              />

              {/* 9. Sales Trend Summary */}
              <SalesTrendSummary summary={trendSummary} />
            </div>
          </>
        )}

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
