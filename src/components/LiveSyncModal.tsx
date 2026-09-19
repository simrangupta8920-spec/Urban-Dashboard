import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Link,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  ExternalLink,
  Clock,
  Sparkles,
  Pause,
  Play,
  Trash2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LiveSyncConfig, LiveSyncIntervalSeconds, LiveSyncStatus } from '../types';
import { parseGoogleSheetUrl } from '../utils/googleSheetsSync';

interface LiveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LiveSyncConfig;
  status: LiveSyncStatus;
  nextSyncCountdown: number;
  onSaveAndConnect: (url: string, interval: LiveSyncIntervalSeconds) => Promise<boolean>;
  onTriggerSyncNow: () => Promise<void>;
  onTogglePause: () => void;
  onDisconnect: () => void;
}

const INTERVAL_OPTIONS: { value: LiveSyncIntervalSeconds; label: string; desc: string }[] = [
  { value: 15, label: '15 sec', desc: 'Rapid' },
  { value: 30, label: '30 sec', desc: 'Recommended' },
  { value: 60, label: '1 min', desc: 'Balanced' },
  { value: 120, label: '2 min', desc: 'Standard' },
  { value: 300, label: '5 min', desc: 'Low bandwidth' },
];

export const LiveSyncModal: React.FC<LiveSyncModalProps> = ({
  isOpen,
  onClose,
  config,
  status,
  nextSyncCountdown,
  onSaveAndConnect,
  onTriggerSyncNow,
  onTogglePause,
  onDisconnect,
}) => {
  const [inputUrl, setInputUrl] = useState<string>(config.sheetUrl || '');
  const [selectedInterval, setSelectedInterval] = useState<LiveSyncIntervalSeconds>(config.intervalSeconds || 30);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputUrl(config.sheetUrl || '');
      setSelectedInterval(config.intervalSeconds || 30);
      setLocalError(config.lastError || null);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const parsed = parseGoogleSheetUrl(inputUrl);
  const isConnected = Boolean(config.sheetUrl && (status === 'connected' || status === 'syncing' || status === 'paused'));

  const handleConnect = async (urlToUse?: string) => {
    const targetUrl = (urlToUse || inputUrl).trim();
    if (!targetUrl) {
      setLocalError('Please enter a Google Sheets URL or CSV link.');
      return;
    }

    setLocalError(null);
    setIsSubmitting(true);
    try {
      const success = await onSaveAndConnect(targetUrl, selectedInterval);
      if (success) {
        // keep modal open or close based on user workflow
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to connect to Google Sheet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseSample = () => {
    setInputUrl('/api/sample-live-sheet');
    handleConnect('/api/sample-live-sheet');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18261B]/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF8F3] w-full max-w-2xl rounded-3xl border border-[#DFD9CE] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-[#FFFFFF] border-b border-[#EBE6DC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF3EC] border border-[#C5DDCB] flex items-center justify-center text-[#1B4324]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-display font-bold text-[#18261B]">
                  Live Google Sheets Synchronization
                </h2>
                {isConnected && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    status === 'paused'
                      ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                      : 'bg-[#EAF3EC] text-[#1B4324] border border-[#C5DDCB]'
                  }`}>
                    {status === 'paused' ? (
                      <>
                        <Pause className="w-2.5 h-2.5" /> Paused
                      </>
                    ) : (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B4324] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B4324]"></span>
                        </span>
                        Live Sync Active
                      </>
                    )}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6C7D6F]">
                Stream real-time sales transactions automatically every 30s or 1 min
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#78887A] hover:text-[#18261B] hover:bg-[#F2EFE8] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Active Connection Card (if currently connected) */}
          {isConnected && (
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#C5DDCB] shadow-xs space-y-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#78887A]">
                    Connected Data Stream
                  </span>
                  <h3 className="font-semibold text-sm text-[#18261B] truncate max-w-md mt-0.5">
                    {config.sheetTitle || 'Google Spreadsheet'}
                  </h3>
                  <p className="text-[11px] text-[#556958] font-mono truncate max-w-md">
                    {config.sheetUrl}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onTogglePause}
                    title={status === 'paused' ? 'Resume Live Sync' : 'Pause Live Sync'}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#DFD9CE] text-xs font-semibold text-[#18261B] hover:bg-[#F5F2EC] transition-all cursor-pointer"
                  >
                    {status === 'paused' ? (
                      <>
                        <Play className="w-3.5 h-3.5 text-[#1B4324]" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5 text-[#886D12]" />
                        <span>Pause</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onTriggerSyncNow}
                    disabled={status === 'syncing'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B4324] hover:bg-[#14331C] text-[#F3FBF5] text-xs font-semibold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${status === 'syncing' ? 'animate-spin text-[#A3E635]' : ''}`} />
                    <span>{status === 'syncing' ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                </div>
              </div>

              {/* Status bar */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#F0EBE1] text-xs">
                <div>
                  <span className="text-[11px] text-[#78887A]">Last Synced:</span>
                  <div className="font-semibold text-[#18261B]">
                    {config.lastSyncedAt
                      ? `${new Date(config.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                      : 'Just now'}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-[#78887A]">Next Sync:</span>
                  <div className="font-semibold text-[#1B4324] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#1B4324]" />
                    {status === 'paused' ? (
                      <span className="text-[#886D12]">Paused</span>
                    ) : status === 'syncing' ? (
                      <span>Refreshing now...</span>
                    ) : (
                      <span>in {nextSyncCountdown}s</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-[#78887A]">Records Loaded:</span>
                  <div className="font-semibold text-[#18261B]">
                    {config.lastRecordCount ? `${config.lastRecordCount.toLocaleString()} rows` : 'Active'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Google Sheets Link Input Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#18261B] flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-[#1B4324]" />
                Google Sheets Link (or published CSV)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl('/api/sample-live-sheet?format=xlsx');
                    handleConnect('/api/sample-live-sheet?format=xlsx');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B4324] hover:underline cursor-pointer bg-[#E2F0E5] px-2 py-0.5 rounded-md border border-[#A8D8B6]"
                >
                  <Sparkles className="w-3 h-3 text-[#1B4324]" />
                  Multi-Month Workbook (Sep & Aug)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl('/api/user-sheet');
                    handleConnect('/api/user-sheet');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B4324] hover:underline cursor-pointer bg-[#EAF3EC] px-2 py-0.5 rounded-md border border-[#C5DDCB]"
                >
                  User Sheet (13 Orders)
                </button>
                <button
                  type="button"
                  onClick={handleUseSample}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#556958] hover:underline cursor-pointer"
                >
                  Sample Stream
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={inputUrl}
                onChange={e => {
                  setInputUrl(e.target.value);
                  setLocalError(null);
                }}
                placeholder="Paste Google Sheets link (https://docs.google.com/spreadsheets/d/...) or raw table data"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#DFD9CE] focus:outline-none focus:border-[#1B4324] focus:ring-2 focus:ring-[#1B4324]/20 text-xs font-mono text-[#18261B] transition-all placeholder:text-[#9AA89C]"
              />
            </div>

            <p className="text-[11px] text-[#556958]">
              Accepts any shared Google Sheet link or Excel workbook. If your workbook contains multiple monthly tabs (e.g. <em>Sep 2026</em>, <em>Aug 2026</em>), all sheets are fetched and combined automatically, with an interactive tab switcher to view whole-workbook or month-by-month sales!
            </p>

            {/* Parsing preview indicator */}
            {inputUrl && parsed.isValid && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#245D30]">
                <CheckCircle className="w-3 h-3 text-[#1B4324]" />
                <span>Valid link detected: {parsed.displayTitle} {parsed.gid !== '0' ? `(Tab gid: ${parsed.gid})` : ''}</span>
              </div>
            )}
          </div>

          {/* Sync Frequency / Interval Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#18261B] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#1B4324]" />
              Live Sync Frequency
            </label>
            <p className="text-[11px] text-[#6C7D6F]">
              How frequently the dashboard will ping the Google Sheet for fresh sales records:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {INTERVAL_OPTIONS.map(opt => {
                const isSelected = selectedInterval === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedInterval(opt.value)}
                    className={`px-3 py-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1B4324] text-[#F3FBF5] border-[#14331C] shadow-xs'
                        : 'bg-[#FFFFFF] text-[#18261B] border-[#DFD9CE] hover:border-[#B5CDC0]'
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.label}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-[#C5E8CE]' : 'text-[#78887A]'}`}>
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {(localError || config.lastError) && (
            <div className="p-3.5 rounded-2xl bg-[#FFF1F2] border border-[#FCA5A5] text-xs text-[#881337] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#BE123C] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{localError || config.lastError}</p>
                <p className="text-[11px] text-[#9F1239]">
                  Ensure your Google Sheet general sharing is set to <strong>"Anyone with the link can view"</strong> so the dashboard can stream the sales data without logging in.
                </p>
              </div>
            </div>
          )}

          {/* How-To Accordion Guide */}
          <div className="rounded-2xl border border-[#EBE6DC] bg-[#FFFFFF] overflow-hidden">
            <button
              type="button"
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-[#18261B] hover:bg-[#FAF8F3] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#1B4324]" />
                <span>How to prepare your Google Sheet for live sync</span>
              </div>
              {showInstructions ? <ChevronUp className="w-4 h-4 text-[#78887A]" /> : <ChevronDown className="w-4 h-4 text-[#78887A]" />}
            </button>

            {showInstructions && (
              <div className="px-4 pb-4 pt-1 text-xs text-[#556958] space-y-2 border-t border-[#F0EBE1] bg-[#FAF8F3]">
                <ol className="list-decimal list-inside space-y-1.5 text-[11px]">
                  <li>
                    <strong>Format your headers:</strong> The top row of your sheet should include standard columns:
                    <code className="mx-1 px-1.5 py-0.5 rounded bg-[#EBE6DC] text-[#18261B] font-mono">Date</code>
                    <code className="mx-1 px-1.5 py-0.5 rounded bg-[#EBE6DC] text-[#18261B] font-mono">Platform</code>
                    <code className="mx-1 px-1.5 py-0.5 rounded bg-[#EBE6DC] text-[#18261B] font-mono">Product Name</code>
                    <code className="mx-1 px-1.5 py-0.5 rounded bg-[#EBE6DC] text-[#18261B] font-mono">Category</code>
                    <code className="mx-1 px-1.5 py-0.5 rounded bg-[#EBE6DC] text-[#18261B] font-mono">Quantity Sold</code>
                    <code className="mx-1 px-1.5 py-0.5 rounded bg-[#EBE6DC] text-[#18261B] font-mono">Sales</code>
                  </li>
                  <li>
                    <strong>Enable Public Access:</strong> In Google Sheets, click <strong>Share</strong> (top-right corner). Under <em>General access</em>, change from <em>Restricted</em> to <strong>"Anyone with the link can view"</strong>.
                  </li>
                  <li>
                    <strong>Copy & Paste:</strong> Click <strong>Copy link</strong> and paste it in the field above, then click <strong>Connect & Start Live Sync</strong>.
                  </li>
                </ol>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FFFFFF] border-t border-[#EBE6DC] flex items-center justify-between">
          <div>
            {isConnected && (
              <button
                type="button"
                onClick={onDisconnect}
                className="inline-flex items-center gap-1.5 text-xs text-[#BE123C] hover:text-[#9F1239] font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Disconnect Sheet
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#DFD9CE] text-xs font-semibold text-[#18261B] hover:bg-[#F2EFE8] transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleConnect()}
              disabled={isSubmitting || !inputUrl.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B4324] hover:bg-[#14331C] text-[#F3FBF5] text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#A3E635]" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Link className="w-3.5 h-3.5 text-[#A3E635]" />
                  <span>{isConnected && config.sheetUrl === inputUrl ? 'Update Settings' : 'Connect & Start Live Sync'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
