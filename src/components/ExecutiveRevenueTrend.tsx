import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PlatformTimeSeriesPoint } from '../types';
import { getPlatformColor } from './SalesByPlatform';
import { formatCurrencyINR } from '../utils/formatters';
import {
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  Layers,
  Sparkles,
} from 'lucide-react';

export type ChartViewMode = 'lines' | 'stacked-bar' | 'stacked-area' | 'total-area';

interface ExecutiveRevenueTrendProps {
  data: PlatformTimeSeriesPoint[];
  platforms: string[];
  selectedPlatform: string;
  onSelectPlatform?: (platform: string) => void;
}

export const ExecutiveRevenueTrend: React.FC<ExecutiveRevenueTrendProps> = ({
  data,
  platforms,
  selectedPlatform,
  onSelectPlatform,
}) => {
  const [viewMode, setChartViewMode] = useState<ChartViewMode>('stacked-bar');
  const [hiddenPlatforms, setHiddenPlatforms] = useState<Record<string, boolean>>({});

  const togglePlatform = (platform: string) => {
    setHiddenPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const hasData = data.length > 0 && platforms.length > 0;

  // Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((acc: number, item: any) => acc + (Number(item.value) || 0), 0);
      return (
        <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-2xl shadow-xl border border-[#DFD9CE] text-xs space-y-2 min-w-[220px] animate-in fade-in-50 duration-150">
          <div className="font-bold text-xs text-[#18261B] border-b border-[#EAE4D9] pb-1.5 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[11px] text-[#234E33] font-bold">
              Total: {formatCurrencyINR(total)}
            </span>
          </div>
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
            {payload.map((item: any) => {
              const color = item.color || item.fill || '#234E33';
              return (
                <div key={item.name} className="flex justify-between items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[#4E6051] font-medium truncate max-w-[120px]">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    {item.name}
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-[#18261B]">
                      {formatCurrencyINR(item.value)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Format Y Axis ticks
  const formatYAxis = (val: number) => {
    if (val === 0) return '₹ 0';
    if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹ ${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹ ${(val / 1000).toFixed(0)}K`;
    return `₹ ${val}`;
  };

  const chartData = hasData
    ? data
    : [
        { monthLabel: 'Jan', total: 0, Amazon: 0, Blinkit: 0, Offline: 0, Website: 0 },
        { monthLabel: 'Feb', total: 0, Amazon: 0, Blinkit: 0, Offline: 0, Website: 0 },
        { monthLabel: 'Mar', total: 0, Amazon: 0, Blinkit: 0, Offline: 0, Website: 0 },
        { monthLabel: 'Apr', total: 0, Amazon: 0, Blinkit: 0, Offline: 0, Website: 0 },
      ];

  const activePlatforms = platforms.length > 0 ? platforms : ['Amazon', 'Blinkit', 'Offline', 'Website'];

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E6E1D8] p-5 sm:p-7 shadow-xs h-full flex flex-col justify-between">
      {/* Card Header with View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-xl text-[#18261B] tracking-tight">
              Revenue Performance
            </h3>
            {selectedPlatform !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-md bg-[#234E33] text-white text-[11px] font-bold">
                {selectedPlatform}
              </span>
            )}
          </div>
          <p className="text-xs text-[#7A8A7D] mt-0.5">
            {viewMode === 'stacked-bar' && 'Monthly breakdown by channel (Stacked Bar)'}
            {viewMode === 'stacked-area' && 'Cumulative channel volume over time (Stacked Area)'}
            {viewMode === 'total-area' && 'Net monthly sales trajectory (Filled Area)'}
            {viewMode === 'lines' && 'Individual channel comparison curves (Multi-Line)'}
          </p>
        </div>

        {/* Alternative Chart Type Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4F1EA] rounded-xl border border-[#E2DDD3] self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setChartViewMode('stacked-bar')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'stacked-bar'
                ? 'bg-white text-[#234E33] shadow-2xs font-bold'
                : 'text-[#6A7B6E] hover:text-[#18261B]'
            }`}
            title="Stacked Bar: Channel breakdown by month"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Stacked Bar</span>
          </button>

          <button
            type="button"
            onClick={() => setChartViewMode('stacked-area')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'stacked-area'
                ? 'bg-white text-[#234E33] shadow-2xs font-bold'
                : 'text-[#6A7B6E] hover:text-[#18261B]'
            }`}
            title="Stacked Area: Cumulative distribution"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Stacked Area</span>
          </button>

          <button
            type="button"
            onClick={() => setChartViewMode('total-area')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'total-area'
                ? 'bg-white text-[#234E33] shadow-2xs font-bold'
                : 'text-[#6A7B6E] hover:text-[#18261B]'
            }`}
            title="Total Area: Net overall revenue gradient"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Net Area</span>
          </button>

          <button
            type="button"
            onClick={() => setChartViewMode('lines')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'lines'
                ? 'bg-white text-[#234E33] shadow-2xs font-bold'
                : 'text-[#6A7B6E] hover:text-[#18261B]'
            }`}
            title="Multi-Line: Individual channel trends"
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>Lines</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] sm:h-[320px] w-full relative">
        {!hasData && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-2xs rounded-xl">
            <TrendingUp className="w-8 h-8 text-[#A8B6AB] mb-2 stroke-[1.5]" />
            <p className="text-sm font-semibold text-[#18261B]">All Revenue Metrics: ₹ 0</p>
            <p className="text-xs text-[#708173] max-w-xs text-center mt-1">
              Upload an Excel report or connect Google Sheets to render revenue trends.
            </p>
          </div>
        )}

        {/* 1. Stacked Bar Chart */}
        {viewMode === 'stacked-bar' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1ECE4" vertical={false} />
              <XAxis
                dataKey="monthLabel"
                stroke="#8C9C8F"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#EAE5DB' }}
              />
              <YAxis
                stroke="#8C9C8F"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              {activePlatforms.map((platform, idx) => {
                if (hiddenPlatforms[platform]) return null;
                const color = getPlatformColor(platform, idx);
                const isHighlighted =
                  selectedPlatform === 'ALL' ||
                  selectedPlatform.toLowerCase() === platform.toLowerCase();

                return (
                  <Bar
                    key={platform}
                    dataKey={platform}
                    name={platform}
                    stackId="a"
                    fill={color}
                    fillOpacity={isHighlighted ? 0.95 : 0.3}
                    radius={idx === activePlatforms.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    maxBarSize={48}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* 2. Stacked Area Chart */}
        {viewMode === 'stacked-area' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
              <defs>
                {activePlatforms.map((platform, idx) => {
                  const color = getPlatformColor(platform, idx);
                  return (
                    <linearGradient
                      key={`grad-${platform}`}
                      id={`grad-area-${platform}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.15} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1ECE4" vertical={false} />
              <XAxis
                dataKey="monthLabel"
                stroke="#8C9C8F"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#EAE5DB' }}
              />
              <YAxis
                stroke="#8C9C8F"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              {activePlatforms.map((platform, idx) => {
                if (hiddenPlatforms[platform]) return null;
                const color = getPlatformColor(platform, idx);
                return (
                  <Area
                    key={platform}
                    type="monotone"
                    dataKey={platform}
                    name={platform}
                    stackId="1"
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#grad-area-${platform})`}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* 3. Total Area (Single stream with soft gradient) */}
        {viewMode === 'total-area' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="totalRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#234E33" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#234E33" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1ECE4" vertical={false} />
              <XAxis
                dataKey="monthLabel"
                stroke="#8C9C8F"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#EAE5DB' }}
              />
              <YAxis
                stroke="#8C9C8F"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                name="Net Revenue"
                stroke="#234E33"
                strokeWidth={3}
                fill="url(#totalRevenueGrad)"
                dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF', stroke: '#234E33' }}
                activeDot={{ r: 6, strokeWidth: 2, fill: '#234E33', stroke: '#FFFFFF' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* 4. Multi-Line Chart (Original) */}
        {viewMode === 'lines' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1ECE4" vertical={false} />
              <XAxis
                dataKey="monthLabel"
                stroke="#8C9C8F"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#EAE5DB' }}
              />
              <YAxis
                stroke="#8C9C8F"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />

              {activePlatforms.map((platform, idx) => {
                if (hiddenPlatforms[platform]) return null;
                const color = getPlatformColor(platform, idx);
                const isHighlighted =
                  selectedPlatform === 'ALL' ||
                  selectedPlatform.toLowerCase() === platform.toLowerCase();

                return (
                  <Line
                    key={platform}
                    type="monotone"
                    dataKey={platform}
                    name={platform}
                    stroke={color}
                    strokeWidth={isHighlighted ? 3 : 1.5}
                    strokeOpacity={isHighlighted ? 1 : 0.3}
                    dot={{ r: 3.5, strokeWidth: 2, fill: '#FFFFFF', stroke: color }}
                    activeDot={{ r: 6, strokeWidth: 2, fill: color, stroke: '#FFFFFF' }}
                    isAnimationActive={true}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom Legend */}
      <div className="mt-4 pt-4 border-t border-[#F0EBE3] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {activePlatforms.map((platform, idx) => {
            const color = getPlatformColor(platform, idx);
            const isHidden = !!hiddenPlatforms[platform];

            return (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                className={`inline-flex items-center gap-2 text-xs transition-opacity cursor-pointer ${
                  isHidden ? 'opacity-35 line-through' : 'opacity-100'
                }`}
                title="Click to toggle channel visibility"
              >
                <span
                  className="w-3.5 h-3 rounded-xs shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="font-semibold text-[#18261B]">{platform}</span>
              </button>
            );
          })}
        </div>

        {selectedPlatform !== 'ALL' && onSelectPlatform && (
          <button
            type="button"
            onClick={() => onSelectPlatform('ALL')}
            className="text-xs font-semibold text-[#234E33] hover:underline"
          >
            Show All Channels
          </button>
        )}
      </div>
    </div>
  );
};
