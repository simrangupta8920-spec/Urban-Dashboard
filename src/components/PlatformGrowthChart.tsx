import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PlatformTimeSeriesPoint } from '../types';
import { getPlatformColor } from './SalesByPlatform';
import { formatLakhs, formatCurrencyINR } from '../utils/formatters';
import { Activity, Eye, EyeOff, Info } from 'lucide-react';

interface PlatformGrowthChartProps {
  data: PlatformTimeSeriesPoint[];
  platforms: string[];
}

export const PlatformGrowthChart: React.FC<PlatformGrowthChartProps> = ({
  data,
  platforms,
}) => {
  if (platforms.length === 0) {
    return null;
  }

  // State for toggling platforms on/off in the chart
  const [hiddenPlatforms, setHiddenPlatforms] = useState<Record<string, boolean>>({});

  const togglePlatform = (platform: string) => {
    setHiddenPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#18261B] text-white p-3.5 rounded-xl shadow-lg border border-[#2D4532] text-xs space-y-2 min-w-[200px]">
          <div className="font-bold text-sm text-[#A3E635] border-b border-[#2A3F30] pb-1.5">
            {label}
          </div>
          <div className="space-y-1">
            {payload.map((item: any) => {
              const color = item.color || '#A3E635';
              return (
                <div key={item.name} className="flex justify-between items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[#D1E6D6]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    {item.name}:
                  </span>
                  <span className="font-semibold text-white">{formatCurrencyINR(item.value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E5E0D8] p-5 sm:p-7 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EAF3EC] text-[#1B4324] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-xl text-[#18261B] tracking-tight">
              Platform-wise Sales Growth
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#5E7060] mt-1">
            Multi-channel comparative monthly sales velocity
          </p>
        </div>

        {/* Interactive Legend with toggle on/off */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-[#6C7D6F] mr-1">Legend (click to toggle):</span>
          {platforms.map((platform, idx) => {
            const isHidden = !!hiddenPlatforms[platform];
            const color = getPlatformColor(platform, idx);

            return (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isHidden
                    ? 'bg-[#F2ECE4] text-[#8C9C8F] line-through opacity-60'
                    : 'bg-[#F7F5F0] text-[#18261B] border border-[#DFD9CE] shadow-2xs hover:bg-white'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: isHidden ? '#A0A0A0' : color }}
                />
                <span>{platform}</span>
                {isHidden ? (
                  <EyeOff className="w-3 h-3 text-[#8C9C8F]" />
                ) : (
                  <Eye className="w-3 h-3 text-[#5A6B5D]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-line Chart */}
      <div className="h-[320px] w-full mt-4">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-[#7A8C7E]">
            No multi-channel data available for the current filter.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE7DC" vertical={false} />
              <XAxis
                dataKey="monthLabel"
                tickLine={false}
                axisLine={{ stroke: '#DFD8CC' }}
                tick={{ fill: '#6C7E70', fontSize: 11 }}
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
              {platforms.map((platform, idx) => {
                if (hiddenPlatforms[platform]) return null;
                const color = getPlatformColor(platform, idx);
                return (
                  <Line
                    key={platform}
                    type="monotone"
                    dataKey={platform}
                    name={platform}
                    stroke={color}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: color, stroke: '#FFFFFF', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, stroke: '#18261B', strokeWidth: 2 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-2 text-right text-[11px] text-[#7A8C7E] flex items-center justify-end gap-1">
        <Info className="w-3 h-3" />
        <span>Click any platform pill in the legend above to toggle its line in real time</span>
      </div>
    </div>
  );
};
