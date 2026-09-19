import React from 'react';
import { FilterState } from '../types';
import { Calendar, ChevronDown, Filter, RotateCcw } from 'lucide-react';

interface ExecutiveTopControlBarProps {
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  onResetFilters: () => void;
  platforms: string[];
  totalRecords: number;
  filteredCount: number;
  isAdvancedOpen: boolean;
  onToggleAdvanced: () => void;
}

export const ExecutiveTopControlBar: React.FC<ExecutiveTopControlBarProps> = ({
  filter,
  onFilterChange,
  onResetFilters,
  platforms,
  totalRecords,
  filteredCount,
  isAdvancedOpen,
  onToggleAdvanced,
}) => {
  // Determine date range label for the dropdown
  let dateRangeValue = 'all';
  if (filter.year === '2026' && filter.month === 'ALL' && !filter.startDate) {
    dateRangeValue = '2026';
  } else if (filter.year === '2025' && filter.month === 'ALL' && !filter.startDate) {
    dateRangeValue = '2025';
  } else if (filter.month !== 'ALL') {
    dateRangeValue = `m-${filter.month}`;
  } else if (filter.startDate && filter.endDate) {
    dateRangeValue = 'custom';
  }

  const handleDateRangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'all') {
      onFilterChange({
        ...filter,
        startDate: '',
        endDate: '',
        year: 'ALL',
        month: 'ALL',
      });
    } else if (val === 'last30') {
      const today = new Date();
      const past30 = new Date(today.getTime() - 30 * 86400000);
      onFilterChange({
        ...filter,
        startDate: past30.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        year: 'ALL',
        month: 'ALL',
      });
    } else if (val === '2026') {
      onFilterChange({
        ...filter,
        startDate: '',
        endDate: '',
        year: '2026',
        month: 'ALL',
      });
    } else if (val === '2025') {
      onFilterChange({
        ...filter,
        startDate: '',
        endDate: '',
        year: '2025',
        month: 'ALL',
      });
    } else if (val.startsWith('m-')) {
      const m = val.replace('m-', '');
      onFilterChange({
        ...filter,
        startDate: '',
        endDate: '',
        month: m,
      });
    }
  };

  const isFiltered =
    filter.platform !== 'ALL' ||
    filter.category !== 'ALL' ||
    filter.product !== 'ALL' ||
    filter.month !== 'ALL' ||
    filter.year !== 'ALL' ||
    !!filter.startDate ||
    !!filter.endDate;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-[#EDE8DF]">
      {/* Left: Title matching Image 1 */}
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#18261B] tracking-tight">
          Sales Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-[#6C7D6F] mt-0.5">
          Multi-channel e-commerce performance overview
          {totalRecords > 0 && (
            <span className="ml-2 inline-flex items-center text-xs font-semibold text-[#234E33]">
              • {filteredCount.toLocaleString('en-IN')} of {totalRecords.toLocaleString('en-IN')} orders
            </span>
          )}
        </p>
      </div>

      {/* Right: Quick Controls matching Image 1 */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Date Range Selector */}
        <div className="relative inline-flex items-center bg-white rounded-xl border border-[#DFD9CE] shadow-2xs hover:border-[#234E33] transition-colors">
          <label htmlFor="top-date-range-select" className="pl-3 pr-1 text-xs text-[#6C7D6F] font-medium whitespace-nowrap">
            Date range:
          </label>
          <select
            id="top-date-range-select"
            aria-label="Filter by Date Range"
            value={dateRangeValue}
            onChange={handleDateRangeSelect}
            className="pl-1 pr-8 py-2 text-xs font-semibold text-[#18261B] bg-transparent border-0 rounded-xl focus:ring-0 cursor-pointer appearance-none outline-none"
          >
            <option value="all">All Time</option>
            <option value="last30">Last 30 days</option>
            <option value="2026">Year 2026</option>
            <option value="2025">Year 2025</option>
            <option value="m-8">September</option>
            <option value="m-9">October</option>
            <option value="m-10">November</option>
            <option value="m-11">December</option>
            {dateRangeValue === 'custom' && <option value="custom">Custom Date Range</option>}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#6C7D6F] absolute right-2.5 pointer-events-none" />
        </div>

        {/* Channel / Platform Selector */}
        <div className="relative inline-flex items-center bg-white rounded-xl border border-[#DFD9CE] shadow-2xs hover:border-[#234E33] transition-colors">
          <label htmlFor="top-channel-select" className="pl-3 pr-1 text-xs text-[#6C7D6F] font-medium whitespace-nowrap">
            Channel:
          </label>
          <select
            id="top-channel-select"
            aria-label="Filter by Sales Channel"
            value={filter.platform}
            onChange={(e) => onFilterChange({ ...filter, platform: e.target.value })}
            className="pl-1 pr-8 py-2 text-xs font-semibold text-[#18261B] bg-transparent border-0 rounded-xl focus:ring-0 cursor-pointer appearance-none outline-none"
          >
            <option value="ALL">All</option>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#6C7D6F] absolute right-2.5 pointer-events-none" />
        </div>

        {/* Advanced Filters Toggle */}
        <button
          type="button"
          onClick={onToggleAdvanced}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            isAdvancedOpen
              ? 'bg-[#EBF3EC] border-[#97C9A4] text-[#234E33]'
              : 'bg-white border-[#DFD9CE] text-[#556958] hover:bg-[#F9F7F3]'
          }`}
          title="Toggle category, product & custom date range filters"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters</span>
          {isFiltered && (
            <span className="w-2 h-2 rounded-full bg-[#234E33]"></span>
          )}
        </button>

        {/* Reset Filters if active */}
        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white border border-[#DFD9CE] hover:bg-rose-50 text-xs font-semibold text-rose-700 transition-colors cursor-pointer"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
