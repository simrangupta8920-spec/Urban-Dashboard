import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Granularity, TimeSeriesPoint } from '../types';
import { formatCurrencyINR, formatLakhs, formatQuantity } from '../utils/formatters';
import { TrendingUp, Calendar, Info } from 'lucide-react';

interface SalesGrowthHeroChartProps {
  data: TimeSeriesPoint[];
  granularity: Granularity;
  onGranularityChange: (g: Granularity) => void;
}

export const SalesGrowthHeroChart: React.FC<SalesGrowthHeroChartProps> = ({
  data,
  granularity,
  onGranularityChange,
}) => {
  const totalSalesInView = data.reduce((s, p) => s + p.sales, 0);
  const totalUnitsInView = data.reduce((s, p) => s + p.quantity, 0);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const pt: TimeSeriesPoint = payload[0].payload;
      return (
        <div className="bg-[#18261B] text-white p-3.5 rounded-xl shadow-lg border border-[#2D4532] text-xs space-y-2 min-w-[180px]">
          <div className="flex items-center gap-1.5 text-[#A3E635] font-semibold border-b border-[#2A3F30] pb-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{pt.label}</span>
            {pt.date && pt.date !== pt.label && (
              <span className="text-[10px] text-[#869688] ml-auto">({pt.date})</span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#A1B2A4]">Sales:</span>
            <span className="font-bold text-white text-sm">{formatCurrencyINR(pt.sales)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#A1B2A4]">Quantity Sold:</span>
            <span className="font-semibold text-[#D1E6D6]">{formatQuantity(pt.quantity)} units</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="bg-white rounded-3xl border border-[#E5E0D8] p-5 sm:p-7 shadow-sm mb-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EAF3EC] text-[#1B4324] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#18261B] tracking-tight">
              Sales Growth Over Time
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#5E7060] mt-1">
            Dynamic sales trajectory and volume velocity across the selected timeline
          </p>
        </div>

        {/* View Switcher: Daily | Weekly | Monthly */}
        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 rounded-xl bg-[#F2EFE9] border border-[#E2DDD3] text-xs font-semibold">
            <button
              type="button"
              onClick={() => onGranularityChange('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                granularity === 'daily'
                  ? 'bg-[#234E33] text-white shadow-xs'
                  : 'text-[#5A6B5D] hover:text-[#18261B]'
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => onGranularityChange('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                granularity === 'weekly'
                  ? 'bg-[#234E33] text-white shadow-xs'
                  : 'text-[#5A6B5D] hover:text-[#18261B]'
              }`}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => onGranularityChange('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                granularity === 'monthly'
                  ? 'bg-[#234E33] text-white shadow-xs'
                  : 'text-[#5A6B5D] hover:text-[#18261B]'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Sub-summary stats banner */}
      <div className="mb-4 px-4 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#EBE5DA] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-[#5A6B5D]">
          <span>
            Timeline Total: <strong className="text-[#18261B] font-bold">{formatLakhs(totalSalesInView)}</strong>
          </span>
          <span className="hidden sm:inline text-[#DDD6CB]">•</span>
          <span className="hidden sm:inline">
            Volume: <strong className="text-[#18261B] font-bold">{formatQuantity(totalUnitsInView)} units</strong>
          </span>
        </div>
        <div className="text-[11px] text-[#7A8C7E] flex items-center gap-1">
          <Info className="w-3 h-3 text-[#2D6A4F]" />
          <span>Interactive timeline • Hover any point for sales & volume</span>
        </div>
      </div>

      {/* Hero Chart Container */}
      <div className="h-[340px] sm:h-[380px] w-full mt-2">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-[#7A8C7E]">
            No sales records available for this filter combination.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 15, right: 15, left: 10, bottom: 25 }}>
              <defs>
                <linearGradient id="salesGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#234E33" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#234E33" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ECE7DE" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: '#DFD8CC' }}
                tick={{ fill: '#6C7E70', fontSize: 11 }}
                interval={data.length > 20 ? 'preserveStartEnd' : 0}
                dy={10}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: '#DFD8CC' }}
                tick={{ fill: '#6C7E70', fontSize: 11 }}
                tickFormatter={val => formatLakhs(val, true)}
                dx={-6}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#234E33"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#salesGrowthGrad)"
                activeDot={{ r: 6, fill: '#14331C', stroke: '#A3E635', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
};
