import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Download, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { downloadSampleExcelTemplate } from '../utils/dataProcessor';
import { OfficialLogoImage } from './BrandLogo';

interface EmptyStateProps {
  onFileUpload: (file: File) => void;
  onSwitchToDemo: () => void;
  onOpenLiveSync?: () => void;
  error?: string | null;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onFileUpload, onSwitchToDemo, onOpenLiveSync, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-[#E5DFD5] shadow-sm overflow-hidden text-center p-6 sm:p-10">
        
        {/* Official Brand Logo */}
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-[#E2E1C4] shadow-xs bg-white p-1 mb-2">
            <OfficialLogoImage className="w-full h-full object-contain" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3EC] border border-[#CFE4D4] text-[#1B4324] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse"></span>
            Urban Organic Superfood • Data Ingestion
          </div>
        </div>

        <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#18261B] tracking-tight max-w-xl mx-auto">
          Upload Excel / CSV or Link Live Sheet
        </h2>
        <p className="text-[#5E6F61] text-xs sm:text-sm mt-2 max-w-lg mx-auto">
          All metrics below are currently initialized to <strong>0</strong>. Upload your marketplace sales report or connect a live Google Sheet to calculate revenue, volume, growth velocity, and channel distribution.
        </p>

        {error && (
          <div className="mt-5 max-w-lg mx-auto p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 text-left">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to process file:</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-6 max-w-xl mx-auto border-2 border-dashed rounded-2xl p-6 sm:p-8 cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-[#234E33] bg-[#F1F7F2]'
              : 'border-[#D9D2C7] bg-[#FCFBF8] hover:border-[#234E33] hover:bg-[#FAF8F3]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-[#EAF3EC] text-[#234E33] flex items-center justify-center mx-auto shadow-xs mb-3">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#234E33] text-white text-sm font-semibold shadow-xs hover:bg-[#1B3E28] transition-colors">
              <FileSpreadsheet className="w-4 h-4" />
              Upload Excel / CSV
            </span>

            {onOpenLiveSync && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLiveSync();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#1B4324] border border-[#B5DBC0] text-sm font-semibold shadow-xs hover:bg-[#EAF3EC] transition-all cursor-pointer"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B4324] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B4324]"></span>
                </span>
                <span>Live Google Sheet Sync</span>
              </button>
            )}
          </div>
          <p className="text-xs text-[#7A8A7C] mt-2.5">Drag & drop your .xlsx, .xls, or .csv sales report here</p>
        </div>

        {/* Supported fields requirement */}
        <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#F6F4EE] border border-[#EAE3D7] text-xs text-[#526354]">
          <span className="font-medium text-[#18261B]">Supported columns:</span>
          <span>Platform • Product • Quantity Sold • Total Sales • Date</span>
          <span className="text-[#88978A] text-[11px]">(Auto-mapped with multi-sheet support)</span>
        </div>

        {/* Quick Help & Demo Switch */}
        <div className="mt-8 pt-6 border-t border-[#EDE7DD] flex flex-col sm:flex-row items-center justify-between gap-4 max-w-xl mx-auto">
          <button
            type="button"
            onClick={downloadSampleExcelTemplate}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#2D6A4F] hover:text-[#18261B] transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Sample Excel Template (.xlsx)
          </button>

          <button
            type="button"
            onClick={onSwitchToDemo}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#F2EDE4] hover:bg-[#EBE4D8] text-xs font-semibold text-[#18261B] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A25D34]" />
            Preview with Sample Data
            <ArrowRight className="w-3 h-3 text-[#5A6B5D]" />
          </button>
        </div>

        {/* Privacy Note */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#7E8E81]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>Strict sales and volume analytics. All file parsing occurs securely in your browser.</span>
        </div>
      </div>
    </div>
  );
};
