import React from 'react';
import { FilterState, SheetSummary } from '../types';
import { RotateCcw, Filter, Calendar, ShoppingBag, Grid, Tag, ChevronDown, X, Layers, FileSpreadsheet } from 'lucide-react';

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  onResetFilters: () => void;
  platforms: string[];
  categories: string[];
  products: string[];
  years: string[];
  sheets?: string[];
  sheetsSummary?: SheetSummary[];
  totalRecords: number;
  filteredCount: number;
}

const MONTHS = [
  { value: 'ALL', label: 'All Months' },
  { value: '0', label: 'January' },
  { value: '1', label: 'February' },
  { value: '2', label: 'March' },
  { value: '3', label: 'April' },
  { value: '4', label: 'May' },
  { value: '5', label: 'June' },
  { value: '6', label: 'July' },
  { value: '7', label: 'August' },
  { value: '8', label: 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  onResetFilters,
  platforms,
  categories,
  products,
  years,
  sheets,
  sheetsSummary,
  totalRecords,
  filteredCount,
}) => {
  const isFiltered =
    filter.platform !== 'ALL' ||
    filter.category !== 'ALL' ||
    filter.product !== 'ALL' ||
    filter.month !== 'ALL' ||
    filter.year !== 'ALL' ||
    (filter.sheet && filter.sheet !== 'ALL') ||
    !!filter.startDate ||
    !!filter.endDate;

  const handleFieldChange = (key: keyof FilterState, val: string) => {
    // If user changes category, also reset product if the current product does not belong to that category
    onFilterChange({
      ...filter,
      [key]: val,
    });
  };

  const handleDatePreset = (preset: 'all' | '30d' | '90d' | '2026' | '2025') => {
    if (preset === 'all') {
      onFilterChange({
        ...filter,
        startDate: '',
        endDate: '',
        year: 'ALL',
        month: 'ALL',
      });
      return;
    }

    if (preset === '2026') {
      onFilterChange({
        ...filter,
        startDate: '',
        endDate: '',
        year: '2026',
        month: 'ALL',
      });
      return;
    }

    if (preset === '2025') {
      onFilterChange({
        ...filter,
        startDate: '',
        endDate: '',
        year: '2025',
        month: 'ALL',
      });
      return;
    }

    // 30d or 90d based on latest known date September 2026
    const anchorDate = new Date(Date.UTC(2026, 8, 16));
    const days = preset === '30d' ? 30 : 90;
    const pastDate = new Date(anchorDate.getTime() - days * 86400000);

    onFilterChange({
      ...filter,
      startDate: pastDate.toISOString().split('T')[0],
      endDate: anchorDate.toISOString().split('T')[0],
      year: 'ALL',
      month: 'ALL',
    });
  };

  return (
    <section className="bg-white rounded-2xl border border-[#E5E0D8] p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex flex-col gap-3.5">
        
        {/* Top line of filter bar: Label + Reset */}
        <div className="flex items-center justify-between gap-2 border-b border-[#F0ECE4] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#EAF3EC] text-[#234E33] flex items-center justify-center">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <span className="font-display font-semibold text-xs sm:text-sm text-[#18261B]">
              Sales Filters
            </span>
            <span className="text-[11px] text-[#697A6B] bg-[#F5F2EA] px-2 py-0.5 rounded-full border border-[#E7E2D6]">
              {filteredCount} of {totalRecords} records
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick date preset pills */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#5A6B5D]">
              <span className="text-[11px] font-medium text-[#7D8E7F]">Presets:</span>
              <button
                type="button"
                onClick={() => handleDatePreset('all')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  !filter.startDate && !filter.endDate && filter.year === 'ALL'
                    ? 'bg-[#234E33] text-white'
                    : 'bg-[#F2EFE8] text-[#4A5B4D] hover:bg-[#EAE5DC]'
                }`}
              >
                All Time
              </button>
              {years.includes('2026') && (
                <button
                  type="button"
                  onClick={() => handleDatePreset('2026')}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    filter.year === '2026'
                      ? 'bg-[#234E33] text-white'
                      : 'bg-[#F2EFE8] text-[#4A5B4D] hover:bg-[#EAE5DC]'
                  }`}
                >
                  2026
                </button>
              )}
              {years.includes('2025') && (
                <button
                  type="button"
                  onClick={() => handleDatePreset('2025')}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    filter.year === '2025'
                      ? 'bg-[#234E33] text-white'
                      : 'bg-[#F2EFE8] text-[#4A5B4D] hover:bg-[#EAE5DC]'
                  }`}
                >
                  2025
                </button>
              )}
            </div>

            {/* Reset Filters */}
            {isFiltered && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#A25D34] hover:text-[#7A3F1D] bg-[#FDF0E9] hover:bg-[#FBE4D8] border border-[#F5DACD] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Multi-Month Workbook Tabs Bar (if 2 or more sheet tabs detected) */}
        {sheets && sheets.length > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#F3F9F4] border border-[#CCE5D3] text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#E2F0E5] text-[#1B4324] flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-[#18261B] text-xs">
                Workbook Sheets ({sheets.length} Months):
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleFieldChange('sheet', 'ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !filter.sheet || filter.sheet === 'ALL'
                    ? 'bg-[#1B4324] text-white shadow-xs'
                    : 'bg-white text-[#3E5242] hover:text-[#18261B] border border-[#CFE4D4]'
                }`}
              >
                All Sheets ({totalRecords.toLocaleString()} rows)
              </button>

              {sheets.map(sheetName => {
                const summary = sheetsSummary?.find(s => s.sheetName === sheetName);
                const isSelected = filter.sheet === sheetName;
                return (
                  <button
                    key={sheetName}
                    type="button"
                    onClick={() => handleFieldChange('sheet', sheetName)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1B4324] text-white shadow-xs'
                        : 'bg-white text-[#3E5242] hover:text-[#18261B] border border-[#CFE4D4]'
                    }`}
                  >
                    {sheetName}
                    {summary ? ` (${summary.validCount})` : ''}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter Inputs Grid: Date Range, Platform, Category, Product, Month, Year, Sheet */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${sheets && sheets.length > 1 ? 'lg:grid-cols-7' : 'lg:grid-cols-6'} gap-3`}>
          
          {/* 1. Date Range: Start / End */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#5A6B5D] uppercase tracking-wider">
              Date Range
            </label>
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={filter.startDate}
                onChange={e => handleFieldChange('startDate', e.target.value)}
                title="Start Date"
                className="w-full text-xs bg-[#FAF9F5] hover:bg-white border border-[#DDD6CB] rounded-lg px-2 py-1.5 text-[#18261B] focus:outline-hidden focus:border-[#234E33]"
              />
              <span className="text-[#88988A] text-xs">–</span>
              <input
                type="date"
                value={filter.endDate}
                onChange={e => handleFieldChange('endDate', e.target.value)}
                title="End Date"
                className="w-full text-xs bg-[#FAF9F5] hover:bg-white border border-[#DDD6CB] rounded-lg px-2 py-1.5 text-[#18261B] focus:outline-hidden focus:border-[#234E33]"
              />
            </div>
          </div>

          {/* 2. Platform */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#5A6B5D] uppercase tracking-wider">
              Platform
            </label>
            <div className="relative">
              <select
                value={filter.platform}
                onChange={e => handleFieldChange('platform', e.target.value)}
                className="w-full text-xs font-medium bg-[#FAF9F5] hover:bg-white border border-[#DDD6CB] rounded-lg px-2.5 py-1.5 pr-7 text-[#18261B] appearance-none focus:outline-hidden focus:border-[#234E33]"
              >
                <option value="ALL">All Platforms</option>
                {platforms.map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#7E8E81] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 3. Category */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#5A6B5D] uppercase tracking-wider">
              Category
            </label>
            <div className="relative">
              <select
                value={filter.category}
                onChange={e => handleFieldChange('category', e.target.value)}
                className="w-full text-xs font-medium bg-[#FAF9F5] hover:bg-white border border-[#DDD6CB] rounded-lg px-2.5 py-1.5 pr-7 text-[#18261B] appearance-none focus:outline-hidden focus:border-[#234E33]"
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#7E8E81] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 4. Product */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#5A6B5D] uppercase tracking-wider">
              Product
            </label>
            <div className="relative">
              <select
                value={filter.product}
                onChange={e => handleFieldChange('product', e.target.value)}
                className="w-full text-xs font-medium bg-[#FAF9F5] hover:bg-white border border-[#DDD6CB] rounded-lg px-2.5 py-1.5 pr-7 text-[#18261B] appearance-none focus:outline-hidden focus:border-[#234E33] truncate"
              >
                <option value="ALL">All Products</option>
                {products.map(pr => (
                  <option key={pr} value={pr}>
                    {pr}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#7E8E81] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 5. Month */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#5A6B5D] uppercase tracking-wider">
              Month
            </label>
            <div className="relative">
              <select
                value={filter.month}
                onChange={e => handleFieldChange('month', e.target.value)}
                className="w-full text-xs font-medium bg-[#FAF9F5] hover:bg-white border border-[#DDD6CB] rounded-lg px-2.5 py-1.5 pr-7 text-[#18261B] appearance-none focus:outline-hidden focus:border-[#234E33]"
              >
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#7E8E81] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 6. Year */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#5A6B5D] uppercase tracking-wider">
              Year
            </label>
            <div className="relative">
              <select
                value={filter.year}
                onChange={e => handleFieldChange('year', e.target.value)}
                className="w-full text-xs font-medium bg-[#FAF9F5] hover:bg-white border border-[#DDD6CB] rounded-lg px-2.5 py-1.5 pr-7 text-[#18261B] appearance-none focus:outline-hidden focus:border-[#234E33]"
              >
                <option value="ALL">All Years</option>
                {years.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#7E8E81] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 7. Sheet Tab (if multi-sheet workbook) */}
          {sheets && sheets.length > 1 && (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#1B4324] uppercase tracking-wider flex items-center gap-1">
                <FileSpreadsheet className="w-3 h-3 text-[#1B4324]" />
                Sheet Tab
              </label>
              <div className="relative">
                <select
                  value={filter.sheet || 'ALL'}
                  onChange={e => handleFieldChange('sheet', e.target.value)}
                  className="w-full text-xs font-medium bg-[#F2F8F3] hover:bg-white border border-[#B8D8C0] rounded-lg px-2.5 py-1.5 pr-7 text-[#18261B] appearance-none focus:outline-hidden focus:border-[#234E33]"
                >
                  <option value="ALL">All Sheets ({sheets.length})</option>
                  {sheets.map(sh => (
                    <option key={sh} value={sh}>
                      {sh}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#5A7B62] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

        </div>

        {/* Active Filter Chips */}
        {isFiltered && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#F5F2EB]">
            <span className="text-[11px] text-[#7A8C7D] mr-1">Active Filters:</span>

            {filter.sheet && filter.sheet !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EAF3EC] border border-[#A5D4B2] text-[11px] text-[#1B4324] font-semibold">
                <FileSpreadsheet className="w-3 h-3 text-[#1B4324]" />
                Sheet: {filter.sheet}
                <button type="button" onClick={() => handleFieldChange('sheet', 'ALL')}>
                  <X className="w-3 h-3 text-[#5A7B62] hover:text-[#1B4324]" />
                </button>
              </span>
            )}
            
            {filter.platform !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EBF3EC] border border-[#CFE4D4] text-[11px] text-[#1B4324] font-medium">
                Platform: {filter.platform}
                <button type="button" onClick={() => handleFieldChange('platform', 'ALL')}>
                  <X className="w-3 h-3 text-[#5A7B62] hover:text-[#1B4324]" />
                </button>
              </span>
            )}

            {filter.category !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EBF3EC] border border-[#CFE4D4] text-[11px] text-[#1B4324] font-medium">
                Category: {filter.category}
                <button type="button" onClick={() => handleFieldChange('category', 'ALL')}>
                  <X className="w-3 h-3 text-[#5A7B62] hover:text-[#1B4324]" />
                </button>
              </span>
            )}

            {filter.product !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EBF3EC] border border-[#CFE4D4] text-[11px] text-[#1B4324] font-medium">
                Product: {filter.product}
                <button type="button" onClick={() => handleFieldChange('product', 'ALL')}>
                  <X className="w-3 h-3 text-[#5A7B62] hover:text-[#1B4324]" />
                </button>
              </span>
            )}

            {filter.month !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EBF3EC] border border-[#CFE4D4] text-[11px] text-[#1B4324] font-medium">
                Month: {MONTHS.find(m => m.value === filter.month)?.label}
                <button type="button" onClick={() => handleFieldChange('month', 'ALL')}>
                  <X className="w-3 h-3 text-[#5A7B62] hover:text-[#1B4324]" />
                </button>
              </span>
            )}

            {filter.year !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EBF3EC] border border-[#CFE4D4] text-[11px] text-[#1B4324] font-medium">
                Year: {filter.year}
                <button type="button" onClick={() => handleFieldChange('year', 'ALL')}>
                  <X className="w-3 h-3 text-[#5A7B62] hover:text-[#1B4324]" />
                </button>
              </span>
            )}

            {(filter.startDate || filter.endDate) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EBF3EC] border border-[#CFE4D4] text-[11px] text-[#1B4324] font-medium">
                Range: {filter.startDate || 'start'} to {filter.endDate || 'end'}
                <button type="button" onClick={() => onFilterChange({ ...filter, startDate: '', endDate: '' })}>
                  <X className="w-3 h-3 text-[#5A7B62] hover:text-[#1B4324]" />
                </button>
              </span>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
