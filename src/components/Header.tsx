import React, { useRef } from 'react';
import { Leaf, Upload, Download, FileSpreadsheet, RefreshCw, Layers, FileText, Loader2, Radio } from 'lucide-react';
import { downloadSampleExcelTemplate, exportRecordsToCSV } from '../utils/dataProcessor';
import { CleanSalesRecord, LiveSyncStatus } from '../types';

interface HeaderProps {
  dataSourceMode: 'demo' | 'user';
  onToggleDataSource: (mode: 'demo' | 'user') => void;
  onFileUpload: (file: File) => void;
  filteredRecords: CleanSalesRecord[];
  allRecordsCount: number;
  onOpenColumnMapper?: () => void;
  canMapColumns?: boolean;
  onExportPDF?: () => void;
  isExportingPDF?: boolean;
  isLiveSyncActive?: boolean;
  liveSyncStatus?: LiveSyncStatus;
  liveSyncInterval?: number;
  onOpenLiveSyncModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  dataSourceMode,
  onToggleDataSource,
  onFileUpload,
  filteredRecords,
  allRecordsCount,
  onOpenColumnMapper,
  canMapColumns = false,
  onExportPDF,
  isExportingPDF = false,
  isLiveSyncActive = false,
  liveSyncStatus = 'idle',
  liveSyncInterval = 30,
  onOpenLiveSyncModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <header className="bg-white border-b border-[#E7E2D8] sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#1B4324] text-[#E8F5E9] flex items-center justify-center shadow-xs border border-[#14331C] shrink-0">
              <Leaf className="w-6 h-6 text-[#A3E635]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-xl sm:text-2xl text-[#18261B] tracking-tight leading-none">
                  Urban Organic Superfood
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF3EC] text-[#1B4324] border border-[#CFE4D4]">
                  Pure • Organic • Desi
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#5A6B5D] mt-1">
                Sales Performance Dashboard
              </p>
            </div>
          </div>

          {/* Right Controls: Mode Toggle & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Demo Data | My Data Segmented Control */}
            <div className="inline-flex p-1 rounded-xl bg-[#F0EDE6] border border-[#E2DDD3] text-xs font-semibold">
              <button
                type="button"
                onClick={() => onToggleDataSource('demo')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dataSourceMode === 'demo'
                    ? 'bg-white text-[#1B4324] shadow-xs font-bold'
                    : 'text-[#5A6B5D] hover:text-[#18261B]'
                }`}
              >
                Demo Data
              </button>
              <button
                type="button"
                onClick={() => onToggleDataSource('user')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dataSourceMode === 'user'
                    ? 'bg-white text-[#1B4324] shadow-xs font-bold'
                    : 'text-[#5A6B5D] hover:text-[#18261B]'
                }`}
              >
                My Data
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Live Google Sheets Sync Button */}
            {onOpenLiveSyncModal && (
              <button
                type="button"
                onClick={onOpenLiveSyncModal}
                title="Live synchronization with Google Sheets"
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs border transition-all cursor-pointer ${
                  isLiveSyncActive
                    ? 'bg-[#EAF3EC] hover:bg-[#DCEDE0] border-[#97C9A4] text-[#1B4324]'
                    : 'bg-[#FFFFFF] hover:bg-[#F7F5F0] border-[#DFD9CE] text-[#18261B]'
                }`}
              >
                {isLiveSyncActive ? (
                  <>
                    {liveSyncStatus === 'syncing' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1B4324]" />
                    ) : (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B4324] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B4324]"></span>
                      </span>
                    )}
                    <span>Live Sync ({liveSyncInterval}s)</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-3.5 h-3.5 text-[#245D30]" />
                    <span>Live Sheet Sync</span>
                    <span className="px-1.5 py-0.2 rounded-sm bg-[#EAF3EC] text-[10px] text-[#1B4324] font-bold">
                      Live
                    </span>
                  </>
                )}
              </button>
            )}

            {/* Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#234E33] hover:bg-[#1B3E28] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Excel / CSV</span>
            </button>

            {/* Column Mapping Trigger */}
            {canMapColumns && onOpenColumnMapper && (
              <button
                type="button"
                onClick={onOpenColumnMapper}
                title="Map columns"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F4F1E9] hover:bg-[#EBE5DA] border border-[#DFD8CC] text-[#324335] text-xs font-medium transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Map Columns</span>
              </button>
            )}

            {/* Export to PDF Button */}
            {allRecordsCount > 0 && onExportPDF && (
              <button
                type="button"
                onClick={onExportPDF}
                disabled={isExportingPDF}
                title="Export executive summary report for management (PDF)"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B4324] hover:bg-[#14331C] text-[#F3FBF5] text-xs font-semibold shadow-xs border border-[#14331C] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isExportingPDF ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A3E635]" />
                    <span>Exporting PDF...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-[#A3E635]" />
                    <span>Export to PDF</span>
                  </>
                )}
              </button>
            )}

            {/* Export CSV Button */}
            {allRecordsCount > 0 && (
              <button
                type="button"
                onClick={() => exportRecordsToCSV(filteredRecords)}
                title="Export filtered records to CSV"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F4F1E9] hover:bg-[#EBE5DA] border border-[#DFD8CC] text-[#324335] text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}

            {/* Template Download */}
            <button
              type="button"
              onClick={downloadSampleExcelTemplate}
              title="Download sample spreadsheet template"
              className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#F4F1E9] hover:bg-[#EBE5DA] border border-[#DFD8CC] text-[#5A6B5D] hover:text-[#18261B] transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#2D6A4F]" />
            </button>
          </div>

        </div>

        {/* Demo Data Notice Banner if active */}
        {dataSourceMode === 'demo' && (
          <div className="mt-2.5 pt-2 border-t border-[#F0EBE1] flex items-center justify-between text-[11px] text-[#6A7B6D]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
              <strong className="font-semibold text-[#18261B]">Demo Dataset Active:</strong> Showing real-world Indian health food sales for 2025–2026 across Amazon, Website, Flipkart & Quick Commerce.
            </span>
            <span className="text-[#88988A] hidden md:inline">
              Click &ldquo;Upload Excel / CSV&rdquo; or &ldquo;My Data&rdquo; anytime to view your own sales figures.
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
