import React from 'react';
import { KpiMetrics } from '../types';
import { formatCurrencyINR, formatGrowth, formatLakhs } from '../utils/formatters';
import { ArrowUpRight, ArrowDownRight, Package, DollarSign, Tag } from 'lucide-react';

interface ExecutiveStackedKpisProps {
  metrics: KpiMetrics;
}

export const ExecutiveStackedKpis: React.FC<ExecutiveStackedKpisProps> = ({ metrics }) => {
  const isPositiveGrowth = metrics.salesGrowthPct !== null && metrics.salesGrowthPct > 0;
  const isNegativeGrowth = metrics.salesGrowthPct !== null && metrics.salesGrowthPct < 0;

  const isPositiveUnitsGrowth =
    metrics.unitsGrowthPct !== undefined && metrics.unitsGrowthPct !== null && metrics.unitsGrowthPct > 0;
  const isNegativeUnitsGrowth =
    metrics.unitsGrowthPct !== undefined && metrics.unitsGrowthPct !== null && metrics.unitsGrowthPct < 0;

  const avgPrice =
    metrics.avgSellingPrice && metrics.avgSellingPrice > 0
      ? metrics.avgSellingPrice
      : metrics.totalUnits > 0
      ? metrics.totalSales / metrics.totalUnits
      : 0;

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 h-full">
      {/* 1. Total Revenue Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E6E1D8] p-5 sm:p-6 shadow-xs flex flex-col justify-between flex-1 transition-all hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-[#5A6D5E] tracking-tight">
            Total Revenue
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#EAF3EC] text-[#234E33] flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="font-display font-bold text-2xl sm:text-3xl text-[#18261B] tracking-tight">
            {metrics.totalSales > 0 ? formatCurrencyINR(metrics.totalSales) : '₹ 0'}
          </div>

          <div className="mt-2 flex items-center gap-2">
            {metrics.salesGrowthPct !== null && metrics.salesGrowthPct !== 0 ? (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-md ${
                  isPositiveGrowth
                    ? 'bg-[#EBF7EE] text-[#1E743A]'
                    : isNegativeGrowth
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-[#F4F1EA] text-[#5A6D5E]'
                }`}
              >
                {isPositiveGrowth ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {formatGrowth(metrics.salesGrowthPct)} MoM
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F4F1EA] text-[#6E7F71]">
                0.0% MoM
              </span>
            )}
            {metrics.totalSales > 0 && (
              <span className="text-[11px] text-[#7A8A7D]">
                ({formatLakhs(metrics.totalSales)})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Units Sold Card (replaces unreliable Total Orders) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E6E1D8] p-5 sm:p-6 shadow-xs flex flex-col justify-between flex-1 transition-all hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-[#5A6D5E] tracking-tight">
            Units Sold
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#EAF3EC] text-[#234E33] flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="font-display font-bold text-2xl sm:text-3xl text-[#18261B] tracking-tight">
            {metrics.totalUnits ? metrics.totalUnits.toLocaleString('en-IN') : '0'}
          </div>

          <div className="mt-2 flex items-center gap-2">
            {metrics.unitsGrowthPct !== undefined && metrics.unitsGrowthPct !== null && metrics.unitsGrowthPct !== 0 ? (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-md ${
                  isPositiveUnitsGrowth
                    ? 'bg-[#EBF7EE] text-[#1E743A]'
                    : isNegativeUnitsGrowth
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-[#F4F1EA] text-[#5A6D5E]'
                }`}
              >
                {isPositiveUnitsGrowth ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {formatGrowth(metrics.unitsGrowthPct)} MoM
              </span>
            ) : (
              <span className="text-xs text-[#7A8A7D]">
                Total volume dispatched
              </span>
            )}
            {metrics.prevPeriodUnits > 0 && (
              <span className="text-[11px] text-[#7A8A7D]">
                (prev {metrics.prevPeriodUnits.toLocaleString('en-IN')})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Avg Selling Price / Unit Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E6E1D8] p-5 sm:p-6 shadow-xs flex flex-col justify-between flex-1 transition-all hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-[#5A6D5E] tracking-tight">
            Avg Selling Price
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#F6F4EB] text-[#A25D34] flex items-center justify-center">
            <Tag className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="font-display font-bold text-2xl sm:text-3xl text-[#18261B] tracking-tight">
            {avgPrice > 0 ? formatCurrencyINR(avgPrice) : '₹ 0'}
          </div>
          <p className="mt-1 text-xs text-[#7A8A7D]">
            Average realization per unit sold
          </p>
        </div>
      </div>
    </div>
  );
};
