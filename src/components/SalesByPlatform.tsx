import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { PlatformMetric } from '../types';
import { formatLakhs, formatPercentage, formatGrowth, formatCurrencyINR } from '../utils/formatters';
import { Layers, ArrowUpRight, ArrowDownRight, Globe, ShoppingCart, CheckCircle2 } from 'lucide-react';

interface SalesByPlatformProps {
  platforms: PlatformMetric[];
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
}

// Organic earthy color mapping for platforms
export const PLATFORM_COLORS: Record<string, string> = {
  Amazon: '#D97706', // warm amber/orange
  Website: '#234E33', // signature brand forest green
  Flipkart: '#1D4ED8', // deep royal blue
  Blinkit: '#0D9488', // teal / quick commerce
  'Offline Order': '#8B5CF6', // violet / direct retail
  Offline: '#8B5CF6',
  Other: '#64748B', // slate
};

export const getPlatformColor = (platform: string, idx = 0): string => {
  if (PLATFORM_COLORS[platform]) return PLATFORM_COLORS[platform];
  const fallbackColors = ['#234E33', '#D97706', '#1D4ED8', '#0D9488', '#8B5CF6', '#EC4899', '#64748B'];
  return fallbackColors[idx % fallbackColors.length];
};

export const SalesByPlatform: React.FC<SalesByPlatformProps> = ({
  platforms,
  selectedPlatform,
  onSelectPlatform,
}) => {
  if (platforms.length === 0) {
    return (
      <section className="bg-white rounded-3xl border border-[#E5E0D8] p-5 sm:p-7 shadow-xs mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#F4F1EA] text-[#637365] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-[#18261B] tracking-tight">
              Sales by Platform
            </h3>
            <p className="text-xs text-[#5E7060]">
              Marketplace distribution and channel velocity
            </p>
          </div>
        </div>
        <div className="p-8 text-center bg-[#FCFBF8] rounded-2xl border border-dashed border-[#E5E0D8] text-xs text-[#7A8C7E]">
          <p className="font-semibold text-sm text-[#18261B]">No Platform Data Loaded</p>
          <p className="mt-1">All platform sales values are 0 (₹ 0). Upload an Excel/CSV file or link a Google Sheet to view marketplace sales distribution.</p>
        </div>
      </section>
    );
  }

  const pieData = platforms.map(p => ({
    name: p.platform,
    value: p.sales,
    sharePct: p.sharePct,
  }));

  const barData = platforms.map(p => ({
    name: p.platform,
    sales: p.sales,
    sharePct: p.sharePct,
  }));

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#18261B] text-white p-3 rounded-xl shadow-lg border border-[#2D4532] text-xs space-y-1">
          <p className="font-bold text-white">{data.name}</p>
          <p className="text-[#D1E6D6]">Sales: {formatCurrencyINR(data.value)} ({formatLakhs(data.value, true)})</p>
          <p className="text-[#A3E635] font-semibold">Share: {formatPercentage(data.sharePct)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#18261B] text-white p-3 rounded-xl shadow-lg border border-[#2D4532] text-xs space-y-1">
          <p className="font-bold text-white">{data.name}</p>
          <p className="text-[#D1E6D6]">Total Sales: {formatCurrencyINR(data.sales)}</p>
          <p className="text-[#A3E635] font-semibold">Market Contribution: {formatPercentage(data.sharePct)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E5E0D8] p-5 sm:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EAF3EC] text-[#1B4324] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-xl text-[#18261B] tracking-tight">
              Sales by Platform
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#5E7060] mt-1">
            Revenue volume share and growth performance across marketplaces
          </p>
        </div>

        {selectedPlatform !== 'ALL' && (
          <button
            type="button"
            onClick={() => onSelectPlatform('ALL')}
            className="text-xs font-semibold text-[#1B4324] bg-[#EAF3EC] hover:bg-[#D8ECD9] px-3 py-1.5 rounded-lg transition-colors border border-[#CFE4D4] self-start sm:self-auto cursor-pointer"
          >
            Clear Platform Filter ({selectedPlatform})
          </button>
        )}
      </div>

      {/* Platform Cards: Platform — Sales — Percentage — Growth % */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {platforms.map((p, idx) => {
          const isSelected = selectedPlatform.toLowerCase() === p.platform.toLowerCase();
          const color = getPlatformColor(p.platform, idx);
          const isPos = p.growthPct !== null && p.growthPct > 0;
          const isNeg = p.growthPct !== null && p.growthPct < 0;

          return (
            <div
              key={p.platform}
              onClick={() => onSelectPlatform(isSelected ? 'ALL' : p.platform)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'border-[#234E33] bg-[#F7FAF7] shadow-sm ring-1 ring-[#234E33]'
                  : 'border-[#E6DFD5] bg-[#FCFBF9] hover:border-[#CBD5CB] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-display font-bold text-sm text-[#18261B]">
                    {p.platform}
                  </span>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-[#234E33]" />
                )}
              </div>

              {/* Sales & Share */}
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-display font-extrabold text-lg text-[#18261B]">
                  {formatLakhs(p.sales, true)}
                </span>
                <span className="text-xs font-bold text-[#5A6B5D] bg-[#F2EDE4] px-2 py-0.5 rounded-md">
                  {formatPercentage(p.sharePct)}
                </span>
              </div>

              {/* Growth % */}
              <div className="mt-3 pt-2.5 border-t border-[#EDE7DD] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#78887A]">Growth:</span>
                <div className="flex items-center gap-0.5">
                  {isPos && <ArrowUpRight className="w-3.5 h-3.5 text-[#1B4324]" />}
                  {isNeg && <ArrowDownRight className="w-3.5 h-3.5 text-[#B91C1C]" />}
                  <span
                    className={`font-semibold text-xs ${
                      isPos ? 'text-[#1B4324]' : isNeg ? 'text-[#B91C1C]' : 'text-[#6C7D6F]'
                    }`}
                  >
                    {formatGrowth(p.growthPct)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dual Charts: Donut Chart + Horizontal Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Donut Chart: Sales Share */}
        <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#ECE6DC]">
          <h4 className="font-display font-semibold text-sm text-[#18261B] mb-2 flex items-center gap-2">
            <span>Sales Share Distribution</span>
            <span className="text-[11px] font-normal text-[#6C7D6F]">(Donut chart)</span>
          </h4>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getPlatformColor(entry.name, index)}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      onClick={() => onSelectPlatform(entry.name)}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#5A6B5D] mt-2">
            {pieData.map((entry, idx) => (
              <div
                key={entry.name}
                onClick={() => onSelectPlatform(entry.name)}
                className="flex items-center gap-1.5 cursor-pointer hover:text-[#18261B]"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getPlatformColor(entry.name, idx) }} />
                <span className="font-medium">{entry.name}: {formatPercentage(entry.sharePct)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal Bar Chart: Sales Value */}
        <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#ECE6DC]">
          <h4 className="font-display font-semibold text-sm text-[#18261B] mb-2 flex items-center gap-2">
            <span>Platform Sales Volume</span>
            <span className="text-[11px] font-normal text-[#6C7D6F]">(Horizontal bar chart)</span>
          </h4>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={barData}
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE7DC" horizontal={false} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={{ stroke: '#DFD8CC' }}
                  tick={{ fill: '#6C7E70', fontSize: 11 }}
                  tickFormatter={val => formatLakhs(val, true)}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={{ stroke: '#DFD8CC' }}
                  tick={{ fill: '#18261B', fontSize: 12, fontWeight: 500 }}
                  width={75}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="sales"
                  radius={[0, 6, 6, 0]}
                  onClick={(data: any) => data?.name && onSelectPlatform(data.name)}
                  className="cursor-pointer"
                >
                  {barData.map((entry, index) => (
                    <Cell
                      key={`bar-cell-${index}`}
                      fill={getPlatformColor(entry.name, index)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-[11px] text-[#7A8C7E] mt-2">
            Click any bar or platform pill to drill down across the entire dashboard
          </div>
        </div>
      </div>
    </div>
  );
};
