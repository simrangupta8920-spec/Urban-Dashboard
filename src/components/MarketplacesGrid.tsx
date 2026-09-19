import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { PlatformMetric } from '../types';
import { getPlatformColor } from './SalesByPlatform';
import { formatCurrencyINR, formatLakhs, formatQuantity } from '../utils/formatters';
import { Store, ShoppingCart, ArrowUpRight, ArrowDownRight, Package } from 'lucide-react';

interface MarketplacesGridProps {
  platforms: PlatformMetric[];
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
}

export const MarketplacesGrid: React.FC<MarketplacesGridProps> = ({
  platforms,
  selectedPlatform,
  onSelectPlatform,
}) => {
  if (platforms.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E6E1D8] p-5 sm:p-7 shadow-xs mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-xl text-[#18261B] tracking-tight">
              Marketplaces
            </h3>
            <span className="text-xs text-[#7A8A7D]">
              (Channel-level sales, orders, volume & mini-trends)
            </span>
          </div>
          <p className="text-xs text-[#5E7060] mt-0.5">
            Individual marketplace performance metrics inspired by multi-channel e-commerce systems
          </p>
        </div>

        {selectedPlatform !== 'ALL' && (
          <button
            type="button"
            onClick={() => onSelectPlatform('ALL')}
            className="text-xs font-semibold text-[#234E33] hover:underline cursor-pointer"
          >
            Show All Marketplaces
          </button>
        )}
      </div>

      {/* Grid of Marketplace Cards matching Image 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {platforms.map((p, idx) => {
          const color = getPlatformColor(p.platform, idx);
          const isSelected = selectedPlatform === p.platform;
          const trendData = p.monthlyTrend && p.monthlyTrend.length > 0
            ? p.monthlyTrend
            : [
                { month: 'M1', sales: 0 },
                { month: 'M2', sales: 0 },
                { month: 'M3', sales: 0 },
                { month: 'M4', sales: 0 },
              ];

          return (
            <div
              key={p.platform}
              onClick={() => onSelectPlatform(p.platform)}
              className={`rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'bg-[#F2F8F3] border-[#234E33] shadow-md ring-2 ring-[#234E33]/20'
                  : 'bg-[#FCFBF9] border-[#E8E2D8] hover:border-[#234E33] hover:bg-white hover:shadow-sm'
              }`}
            >
              {/* Card Header: Platform Name & Badge */}
              <div className="p-4 sm:p-5 pb-3 border-b border-[#EFECE4]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-2xs"
                      style={{ backgroundColor: color }}
                    >
                      {p.platform.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#18261B] tracking-tight">
                        {p.platform}
                      </h4>
                      <span className="text-[11px] text-[#7A8A7D]">
                        {p.sharePct > 0 ? `${p.sharePct.toFixed(1)}% revenue share` : '0% share'}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-md bg-[#234E33] text-white text-[10px] font-bold">
                      Active
                    </span>
                  )}
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <div className="bg-white p-2.5 rounded-xl border border-[#ECE6DC]">
                    <span className="text-[11px] font-medium text-[#7A8A7D] block">Revenue</span>
                    <span className="font-bold text-sm sm:text-base text-[#18261B] truncate block mt-0.5">
                      {p.sales > 0 ? formatCurrencyINR(p.sales) : '₹ 0'}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-[#ECE6DC]">
                    <span className="text-[11px] font-medium text-[#7A8A7D] block">Units Sold</span>
                    <span className="font-bold text-sm sm:text-base text-[#18261B] block mt-0.5">
                      {p.quantity ? p.quantity.toLocaleString('en-IN') : '0'}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-[#ECE6DC]">
                    <span className="text-[11px] font-medium text-[#7A8A7D] block">Channel Share</span>
                    <span className="font-bold text-sm sm:text-base text-[#234E33] block mt-0.5">
                      {p.sharePct > 0 ? `${p.sharePct.toFixed(1)}%` : '0.0%'}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-[#ECE6DC]">
                    <span className="text-[11px] font-medium text-[#7A8A7D] block">Avg Unit Price</span>
                    <span className="font-bold text-sm sm:text-base text-[#18261B] truncate block mt-0.5">
                      {p.quantity > 0 ? formatCurrencyINR(p.sales / p.quantity) : '₹ 0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini Trend Sparkline Chart (matching Image 2) */}
              <div className="p-3 bg-white/70 pt-2">
                <div className="flex items-center justify-between text-[11px] text-[#7A8A7D] px-1 mb-1">
                  <span>Sales Trajectory</span>
                  {p.growthPct !== null && (
                    <span
                      className={`font-semibold ${
                        p.growthPct >= 0 ? 'text-[#1E743A]' : 'text-rose-600'
                      }`}
                    >
                      {p.growthPct >= 0 ? '+' : ''}{p.growthPct.toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="h-[65px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`grad-${p.platform}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        formatter={(val: any) => [formatCurrencyINR(val), 'Sales']}
                        labelFormatter={(label: any) => `${label}`}
                        contentStyle={{
                          backgroundColor: '#18261B',
                          color: '#FFFFFF',
                          borderRadius: '8px',
                          fontSize: '11px',
                          padding: '4px 8px',
                          border: 'none',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#grad-${p.platform})`}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
