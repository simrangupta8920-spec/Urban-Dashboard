import React from 'react';
import { KpiMetrics } from '../types';
import { formatLakhs, formatCurrencyINR, formatQuantity, formatGrowth, formatPercentage } from '../utils/formatters';
import { TrendingUp, TrendingDown, IndianRupee, Package, Award, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KpiCardsProps {
  metrics: KpiMetrics;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics }) => {
  const { totalSales, totalUnits, salesGrowthPct, prevPeriodSales, prevPeriodLabel, topPlatform } = metrics;

  const isGrowthPositive = salesGrowthPct !== null && salesGrowthPct > 0;
  const isGrowthNegative = salesGrowthPct !== null && salesGrowthPct < 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      
      {/* KPI 1: TOTAL SALES */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all hover:border-[#CBD5CB]">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#637265] uppercase tracking-wider">
              Total Sales
            </span>
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#18261B] mt-1.5 tracking-tight">
              {formatLakhs(totalSales)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EAF3EC] text-[#234E33] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#F2ECE3] flex items-center justify-between text-xs">
          <span className="text-[#6C7D6F] truncate">
            Exact: <strong className="text-[#18261B] font-semibold">{formatCurrencyINR(totalSales)}</strong>
          </span>
          <span className="text-[11px] text-[#2D6A4F] font-semibold bg-[#EAF3EC] px-2 py-0.5 rounded-full">
            SUM(Sales)
          </span>
        </div>
      </div>

      {/* KPI 2: UNITS SOLD */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all hover:border-[#CBD5CB]">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#637265] uppercase tracking-wider">
              Units Sold
            </span>
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#18261B] mt-1.5 tracking-tight">
              {formatQuantity(totalUnits)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F4F1E9] text-[#556758] flex items-center justify-center shrink-0 border border-[#E3DDD1]">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#F2ECE3] flex items-center justify-between text-xs">
          <span className="text-[#6C7D6F]">
            Total volume shipped
          </span>
          <span className="text-[11px] text-[#4A5B4D] font-semibold bg-[#F2EFE8] px-2 py-0.5 rounded-full">
            SUM(Quantity)
          </span>
        </div>
      </div>

      {/* KPI 3: SALES GROWTH */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all hover:border-[#CBD5CB]">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#637265] uppercase tracking-wider">
              Sales Growth
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span
                className={`font-display font-extrabold text-2xl sm:text-3xl tracking-tight ${
                  isGrowthPositive
                    ? 'text-[#1B4324]'
                    : isGrowthNegative
                    ? 'text-rose-700'
                    : 'text-[#18261B]'
                }`}
              >
                {formatGrowth(salesGrowthPct)}
              </span>
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isGrowthPositive
                ? 'bg-[#EAF3EC] text-[#1B4324] border-[#CFE4D4]'
                : isGrowthNegative
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-[#F2ECE4] text-[#637265] border-[#E2DAD0]'
            }`}
          >
            {isGrowthPositive ? (
              <TrendingUp className="w-5 h-5" />
            ) : isGrowthNegative ? (
              <TrendingDown className="w-5 h-5" />
            ) : (
              <Minus className="w-5 h-5" />
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#F2ECE3] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            {isGrowthPositive && <ArrowUpRight className="w-3.5 h-3.5 text-[#1B4324]" />}
            {isGrowthNegative && <ArrowDownRight className="w-3.5 h-3.5 text-rose-700" />}
            <span className="text-[#6C7D6F] text-[11px] truncate">
              vs {prevPeriodLabel || 'prior period'}
            </span>
          </div>
          <span className="text-[11px] text-[#6C7D6F] font-medium">
            Prior: {formatLakhs(prevPeriodSales || 0, true)}
          </span>
        </div>
      </div>

      {/* KPI 4: TOP PLATFORM */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all hover:border-[#CBD5CB]">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#637265] uppercase tracking-wider">
              Top Platform
            </span>
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#18261B] mt-1.5 tracking-tight truncate">
              {topPlatform ? topPlatform.name : '0 (None)'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FDF0E9] text-[#A25D34] flex items-center justify-center shrink-0 border border-[#F5DACD]">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#F2ECE3] flex items-center justify-between text-xs">
          {topPlatform ? (
            <>
              <span className="text-[#6C7D6F]">
                Contribution: <strong className="text-[#18261B] font-semibold">{formatPercentage(topPlatform.sharePct)}</strong>
              </span>
              <span className="text-[11px] text-[#A25D34] font-semibold bg-[#FDF0E9] px-2 py-0.5 rounded-full border border-[#F5DACD]">
                {formatLakhs(topPlatform.sales, true)}
              </span>
            </>
          ) : (
            <>
              <span className="text-[#6C7D6F]">
                Contribution: <strong className="text-[#18261B] font-semibold">0%</strong>
              </span>
              <span className="text-[11px] text-[#6C7D6F] font-semibold bg-[#F4F2EC] px-2 py-0.5 rounded-full">
                ₹ 0
              </span>
            </>
          )}
        </div>
      </div>

    </section>
  );
};
