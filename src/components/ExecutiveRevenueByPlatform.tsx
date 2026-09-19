import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { PlatformMetric } from '../types';
import { getPlatformColor } from './SalesByPlatform';
import { formatCurrencyINR, formatLakhs, formatPercentage } from '../utils/formatters';
import { ShoppingBag, ArrowUpRight } from 'lucide-react';

interface ExecutiveRevenueByPlatformProps {
  platforms: PlatformMetric[];
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
}

export const ExecutiveRevenueByPlatform: React.FC<ExecutiveRevenueByPlatformProps> = ({
  platforms,
  selectedPlatform,
  onSelectPlatform,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalSales = platforms.reduce((acc, p) => acc + p.sales, 0);
  const maxSales = platforms.length > 0 ? Math.max(...platforms.map(p => p.sales)) : 0;
  const hasData = platforms.length > 0 && totalSales > 0;

  // Pie chart data
  const pieData = hasData
    ? platforms.map((p, idx) => ({
        name: p.platform,
        value: p.sales,
        sharePct: p.sharePct,
        color: getPlatformColor(p.platform, idx),
      }))
    : [{ name: 'No Data', value: 1, sharePct: 0, color: '#EAE5DC' }];

  const onPieEnter = (_: any, index: number) => {
    if (hasData) setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && hasData) {
      const item = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl shadow-xl border border-[#DFD9CE] text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#18261B]">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.name}
          </div>
          <div className="text-[#556958]">
            Revenue: <span className="font-semibold text-[#18261B]">{formatCurrencyINR(item.value)}</span>
          </div>
          <div className="text-[#556958]">
            Share: <span className="font-semibold text-[#234E33]">{formatPercentage(item.sharePct)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E6E1D8] p-5 sm:p-7 shadow-xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-xl text-[#18261B] tracking-tight">
            Revenue by Platform
          </h3>
          <p className="text-xs text-[#7A8A7D]">
            Marketplace share and proportional contribution
          </p>
        </div>
        {selectedPlatform !== 'ALL' && (
          <button
            type="button"
            onClick={() => onSelectPlatform('ALL')}
            className="text-xs font-semibold text-[#234E33] hover:underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Main 2-column layout inside card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1">
        {/* Left Column: Platform list with colored bars & values */}
        <div className="md:col-span-7 space-y-3 sm:space-y-4">
          {platforms.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#7A8A7D]">
              No platform records. All values: ₹ 0.
            </div>
          ) : (
            platforms.map((item, idx) => {
              const color = getPlatformColor(item.platform, idx);
              const isSelected = selectedPlatform === item.platform;
              const barWidthPct = maxSales > 0 ? (item.sales / maxSales) * 100 : 0;

              return (
                <div
                  key={item.platform}
                  onClick={() => onSelectPlatform(item.platform)}
                  className={`group p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#EBF3EC] border border-[#B5DBC0]'
                      : 'hover:bg-[#F9F7F3]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-sm shrink-0 shadow-2xs"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-bold text-[#18261B] group-hover:text-[#234E33]">
                        {item.platform}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#18261B]">
                        {formatCurrencyINR(item.sales)}
                      </span>
                      <span className="text-[11px] text-[#7A8A7D] min-w-[36px] text-right">
                        ({formatPercentage(item.sharePct)})
                      </span>
                    </div>
                  </div>

                  {/* Proportional horizontal bar (matching Image 1) */}
                  <div className="w-full bg-[#F0EBE3] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(barWidthPct, 2)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Donut Chart */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative min-h-[200px]">
          <div className="w-[190px] h-[190px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={hasData ? 3 : 0}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="transition-transform duration-200 cursor-pointer"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#7A8A7D]">
                {activeIndex !== null && hasData ? pieData[activeIndex]?.name : 'Total'}
              </span>
              <span className="font-display font-bold text-sm text-[#18261B] px-2 truncate max-w-[110px]">
                {activeIndex !== null && hasData
                  ? formatPercentage(pieData[activeIndex]?.sharePct)
                  : totalSales > 0
                  ? formatLakhs(totalSales, true)
                  : '₹ 0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
