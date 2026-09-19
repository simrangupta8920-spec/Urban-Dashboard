import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { MonthlyYearComparisonPoint } from '../types';
import { formatLakhs, formatCurrencyINR, formatGrowth } from '../utils/formatters';
import { BarChart3, CalendarRange, TrendingUp } from 'lucide-react';

interface MonthlySalesComparisonProps {
  data: MonthlyYearComparisonPoint[];
  years: string[];
}

const YEAR_COLORS: Record<string, string> = {
  '2024': '#CBD5E1',
  '2025': '#93B49B', // muted sage green
  '2026': '#1B4324', // signature deep forest green
  '2027': '#D97706',
};

const getYearColor = (year: string, idx = 0) => {
  if (YEAR_COLORS[year]) return YEAR_COLORS[year];
  const palette = ['#93B49B', '#1B4324', '#D97706', '#0D9488', '#64748B'];
  return palette[idx % palette.length];
};

export const MonthlySalesComparison: React.FC<MonthlySalesComparisonProps> = ({
  data,
  years,
}) => {
  // Check if data is populated
  const hasData = data.some(m => years.some(y => Number(m[y]) > 0));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // If 2 years exist, calculate YoY growth for this month
      let yoyPct: number | null = null;
      if (years.length >= 2) {
        const yOld = years[0];
        const yNew = years[1];
        const oldVal = Number(payload[0]?.payload[yOld]) || 0;
        const newVal = Number(payload[0]?.payload[yNew]) || 0;
        if (oldVal > 0) {
          yoyPct = ((newVal - oldVal) / oldVal) * 100;
        }
      }

      return (
        <div className="bg-[#18261B] text-white p-3.5 rounded-xl shadow-lg border border-[#2D4532] text-xs space-y-2 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-[#2A3F30] pb-1.5 font-bold text-sm">
            <span className="text-[#A3E635]">{label}</span>
            {yoyPct !== null && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${yoyPct >= 0 ? 'bg-[#2A4D30] text-[#A3E635]' : 'bg-[#451A1A] text-[#FCA5A5]'}`}>
                YoY: {formatGrowth(yoyPct)}
              </span>
            )}
          </div>
          <div className="space-y-1">
            {payload.map((item: any) => (
              <div key={item.dataKey} className="flex justify-between items-center gap-4">
                <span className="flex items-center gap-1.5 text-[#D1E6D6]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.dataKey}:
                </span>
                <span className="font-semibold text-white">{formatCurrencyINR(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="bg-white rounded-3xl border border-[#E5E0D8] p-5 sm:p-7 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EAF3EC] text-[#1B4324] flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-xl text-[#18261B] tracking-tight">
              Monthly Sales
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#5E7060] mt-1">
            {years.length > 1
              ? `Year-over-year comparison (${years.join(' vs ')}) across calendar months`
              : 'Monthly sales distribution for calendar months'}
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-2.5">
          {years.map((year, idx) => (
            <span
              key={year}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#FAF9F5] border border-[#E2DDD3]"
            >
              <span
                className="w-3 h-3 rounded-md shrink-0"
                style={{ backgroundColor: getYearColor(year, idx) }}
              />
              <span className="text-[#18261B]">{year}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="h-[320px] w-full">
        {!hasData ? (
          <div className="h-full flex items-center justify-center text-xs text-[#7A8C7E]">
            No monthly data recorded for selected criteria.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 15, right: 15, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE7DC" vertical={false} />
              <XAxis
                dataKey="month"
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
              {years.map((year, idx) => (
                <Bar
                  key={year}
                  dataKey={year}
                  name={year}
                  fill={getYearColor(year, idx)}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-2 text-center text-[11px] text-[#7A8C7E]">
        Grouped bars compare identical calendar periods across operating years to highlight organic sales momentum.
      </div>
    </section>
  );
};
