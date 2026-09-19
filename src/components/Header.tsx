import React, { useRef } from 'react';
import { Upload, Download, FileSpreadsheet, RefreshCw, Layers, FileText, Loader2, Radio } from 'lucide-react';
import { downloadSampleExcelTemplate, exportRecordsToCSV } from '../utils/dataProcessor';
import { CleanSalesRecord, LiveSyncStatus } from '../types';
import { BrandLogo, LotusMark } from './BrandLogo';

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
          
          {/* Brand & Title: Official Urban Organic Identity */}
          <div className="flex items-center gap-3.5">
            <BrandLogo variant="horizontal" />
          </div>

          {/* Right Controls: Mode Toggle & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Demo Data | My Data Segmented Control */}
            <div className="inline-flex p-1 rounded-xl bg-[#F4F2E6] border border-[#E4E2CD] text-xs font-semibold">
              <button
                type="button"
                onClick={() => onToggleDataSource('demo')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  dataSourceMode === 'demo'
                    ? 'bg-white text-[#2A4B23] shadow-xs font-bold'
                    : 'text-[#5A6B5D] hover:text-[#18261B]'
                }`}
              >
                Demo Data
              </button>
              <button
                type="button"
                onClick={() => onToggleDataSource('user')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  dataSourceMode === 'user'
                    ? 'bg-white text-[#2A4B23] shadow-xs font-bold'
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
                    ? 'bg-[#EBF3EC] hover:bg-[#DEEDE0] border-[#97C9A4] text-[#2A4B23]'
                    : 'bg-[#FFFFFF] hover:bg-[#FAF9ED] border-[#DDDCC6] text-[#18261B]'
                }`}
              >
                {isLiveSyncActive ? (
                  <>
                    {liveSyncStatus === 'syncing' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2A4B23]" />
                    ) : (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2A4B23] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2A4B23]"></span>
                      </span>
                    )}
                    <span>Live Sync ({liveSyncInterval}s)</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-3.5 h-3.5 text-[#22733A]" />
                    <span>Live Sheet Sync</span>
                    <span className="px-1.5 py-0.2 rounded-sm bg-[#EAF3EC] text-[10px] text-[#2A4B23] font-bold">
                      Live
                    </span>
                  </>
                )}
              </button>
            )}

            {/* Upload Button: Primary Dark Green (#2A4B23) */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2A4B23] hover:bg-[#1E3719] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F6F5E8] hover:bg-[#EEECCE] border border-[#DDDCC6] text-[#2A4B23] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Map Columns</span>
              </button>
            )}

            {/* Export to PDF Button: Secondary Warm Green (#22733A) with Cool Green (#82C55E) accents */}
            {allRecordsCount > 0 && onExportPDF && (
              <button
                type="button"
                onClick={onExportPDF}
                disabled={isExportingPDF}
                title="Export executive summary report for management (PDF)"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#22733A] hover:bg-[#1B5C2E] text-[#FBFAE3] text-xs font-semibold shadow-xs border border-[#1A5C2E] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isExportingPDF ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#82C55E]" />
                    <span>Exporting PDF...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-[#82C55E]" />
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
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F6F5E8] hover:bg-[#EEECCE] border border-[#DDDCC6] text-[#2A4B23] text-xs font-medium transition-colors cursor-pointer"
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
              className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#F6F5E8] hover:bg-[#EEECCE] border border-[#DDDCC6] text-[#2A4B23] transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#22733A]" />
            </button>
          </div>

        </div>

        {/* Demo Data Notice Banner if active */}
        {dataSourceMode === 'demo' && (
          <div className="mt-2.5 pt-2 border-t border-[#F0EEDC] flex items-center justify-between text-[11px] text-[#6A7B6D]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#82C55E]"></span>
              <strong className="font-semibold text-[#2A4B23]">Demo Dataset Active:</strong> Showing authentic Urban Organic sales data (Foxnuts, Sattu, Moringa & Superfoods) across Amazon, Quick Commerce & Direct channels.
            </span>
            <span className="text-[#6B7B6D] hidden md:inline">
              Click &ldquo;Upload Excel / CSV&rdquo; or &ldquo;Live Sheet Sync&rdquo; anytime to view your real data.
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
