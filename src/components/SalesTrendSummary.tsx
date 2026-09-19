import React from 'react';
import { SalesTrendHighlights } from '../types';
import { formatLakhs, formatPercentage, formatGrowth, formatQuantity } from '../utils/formatters';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Zap,
  Award,
  ShoppingBag,
  PackageCheck,
} from 'lucide-react';

interface SalesTrendSummaryProps {
  summary: SalesTrendHighlights;
}

export const SalesTrendSummary: React.FC<SalesTrendSummaryProps> = ({ summary }) => {
  const {
    highestSalesMonth,
    lowestSalesMonth,
    highestGrowthMonth,
    bestPlatform,
    bestCategory,
    bestProduct,
  } = summary;

  return (
    <section className="bg-white rounded-3xl border border-[#E5E0D8] p-5 sm:p-7 shadow-sm mb-8">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-[#EAF3EC] text-[#1B4324] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#A25D34]" />
        </div>
        <div>
          <h3 className="font-display font-bold text-xl text-[#18261B] tracking-tight">
            Sales Trend Summary
          </h3>
          <p className="text-xs text-[#5E7060]">
            Dynamically synthesized executive sales milestones
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 1. Highest Sales Month */}
        <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#ECE6DC] flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#EAF3EC] text-[#1B4324] flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="grow min-w-0">
            <span className="text-[11px] font-bold text-[#637265] uppercase tracking-wider block">
              Highest Sales Month
            </span>
            <div className="font-display font-bold text-base text-[#18261B] mt-0.5 truncate">
              {highestSalesMonth ? highestSalesMonth.label : '—'}
            </div>
            {highestSalesMonth && (
              <p className="text-xs text-[#2D6A4F] font-semibold mt-1">
                {formatLakhs(highestSalesMonth.sales)}
              </p>
            )}
          </div>
        </div>

        {/* 2. Lowest Sales Month */}
        <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#ECE6DC] flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#F5F2EC] text-[#69796B] flex items-center justify-center shrink-0">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="grow min-w-0">
            <span className="text-[11px] font-bold text-[#637265] uppercase tracking-wider block">
              Lowest Sales Month
            </span>
            <div className="font-display font-bold text-base text-[#18261B] mt-0.5 truncate">
              {lowestSalesMonth ? lowestSalesMonth.label : '—'}
            </div>
            {lowestSalesMonth && (
              <p className="text-xs text-[#6C7D6F] font-medium mt-1">
                {formatLakhs(lowestSalesMonth.sales)}
              </p>
            )}
          </div>
        </div>

        {/* 3. Highest Growth Month */}
        <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#ECE6DC] flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#FDF0E9] text-[#A25D34] flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="grow min-w-0">
            <span className="text-[11px] font-bold text-[#637265] uppercase tracking-wider block">
              Highest Growth Month
            </span>
            <div className="font-display font-bold text-base text-[#18261B] mt-0.5 truncate">
              {highestGrowthMonth ? highestGrowthMonth.label : '—'}
            </div>
            {highestGrowthMonth && (
              <p className="text-xs text-[#A25D34] font-semibold mt-1">
                {formatGrowth(highestGrowthMonth.growthPct)} MoM ({formatLakhs(highestGrowthMonth.sales, true)})
              </p>
            )}
          </div>
        </div>

        {/* 4. Best Performing Platform */}
        <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#ECE6DC] flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#EAF3EC] text-[#1B4324] flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="grow min-w-0">
            <span className="text-[11px] font-bold text-[#637265] uppercase tracking-wider block">
              Best Performing Platform
            </span>
            <div className="font-display font-bold text-base text-[#18261B] mt-0.5 truncate">
              {bestPlatform ? bestPlatform.name : '—'}
            </div>
            {bestPlatform && (
              <p className="text-xs text-[#2D6A4F] font-semibold mt-1">
                {formatLakhs(bestPlatform.sales)} ({formatPercentage(bestPlatform.sharePct)} share)
              </p>
            )}
          </div>
        </div>

        {/* 5. Best Selling Category */}
        <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#ECE6DC] flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#EAF3EC] text-[#1B4324] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="grow min-w-0">
            <span className="text-[11px] font-bold text-[#637265] uppercase tracking-wider block">
              Best Selling Category
            </span>
            <div className="font-display font-bold text-base text-[#18261B] mt-0.5 truncate">
              {bestCategory ? bestCategory.name : '—'}
            </div>
            {bestCategory && (
              <p className="text-xs text-[#2D6A4F] font-semibold mt-1">
                {formatLakhs(bestCategory.sales)} ({formatPercentage(bestCategory.sharePct)} share)
              </p>
            )}
          </div>
        </div>

        {/* 6. Best Selling Product */}
        <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#ECE6DC] flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#EAF3EC] text-[#1B4324] flex items-center justify-center shrink-0">
            <PackageCheck className="w-4 h-4" />
          </div>
          <div className="grow min-w-0">
            <span className="text-[11px] font-bold text-[#637265] uppercase tracking-wider block">
              Best Selling Product
            </span>
            <div className="font-display font-bold text-base text-[#18261B] mt-0.5 truncate" title={bestProduct?.name}>
              {bestProduct ? bestProduct.name : '—'}
            </div>
            {bestProduct && (
              <p className="text-xs text-[#2D6A4F] font-semibold mt-1">
                {formatLakhs(bestProduct.sales)} ({formatQuantity(bestProduct.quantity)} units)
              </p>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
