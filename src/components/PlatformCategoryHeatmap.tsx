import React from 'react';
import { HeatmapMatrix } from '../types';
import { formatLakhs, formatCurrencyINR } from '../utils/formatters';
import { Grid, Sparkles, Layers } from 'lucide-react';

interface PlatformCategoryHeatmapProps {
  heatmap: HeatmapMatrix;
  onFilterPlatformCategory?: (platform: string, category: string) => void;
}

export const PlatformCategoryHeatmap: React.FC<PlatformCategoryHeatmapProps> = ({
  heatmap,
  onFilterPlatformCategory,
}) => {
  const { categories, platforms, matrix, maxVal } = heatmap;

  if (categories.length === 0 || platforms.length === 0) {
    return null;
  }

  // Calculate column totals
  const platformTotals: Record<string, number> = {};
  platforms.forEach(p => {
    platformTotals[p] = categories.reduce((sum, c) => sum + (matrix[c]?.[p] || 0), 0);
  });

  // Calculate row totals
  const categoryTotals: Record<string, number> = {};
  categories.forEach(c => {
    categoryTotals[c] = platforms.reduce((sum, p) => sum + (matrix[c]?.[p] || 0), 0);
  });

  const grandTotal = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  // Intensity color generator (green scale for organic brand)
  const getCellBgColor = (val: number) => {
    if (val === 0 || maxVal === 0) return '#F9F8F5';
    const ratio = Math.min(1, Math.max(0.08, val / maxVal));

    // Thresholds for botanical green intensity
    if (ratio > 0.75) return '#1B4324'; // rich deep forest
    if (ratio > 0.5) return '#2D6A4F';  // emerald organic
    if (ratio > 0.3) return '#529071';  // medium sage
    if (ratio > 0.15) return '#8DBFA3'; // light sage
    return '#D4E8DC';                   // soft wash
  };

  const getTextColor = (val: number) => {
    if (val === 0 || maxVal === 0) return '#88988A';
    const ratio = val / maxVal;
    return ratio > 0.4 ? '#FFFFFF' : '#14331C';
  };

  return (
    <section className="bg-white rounded-3xl border border-[#E5E0D8] p-5 sm:p-7 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EAF3EC] text-[#1B4324] flex items-center justify-center">
              <Grid className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-xl text-[#18261B] tracking-tight">
              Sales by Platform and Category
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#5E7060] mt-1">
            Performance matrix revealing which superfood categories thrive on each marketplace
          </p>
        </div>

        {/* Legend scale */}
        <div className="flex items-center gap-2 text-xs text-[#5E7060]">
          <span className="text-[11px] font-medium text-[#7A8C7E]">Intensity:</span>
          <span className="text-[11px]">Low</span>
          <div className="flex items-center gap-0.5">
            <span className="w-4 h-4 rounded-xs bg-[#D4E8DC]" />
            <span className="w-4 h-4 rounded-xs bg-[#8DBFA3]" />
            <span className="w-4 h-4 rounded-xs bg-[#529071]" />
            <span className="w-4 h-4 rounded-xs bg-[#2D6A4F]" />
            <span className="w-4 h-4 rounded-xs bg-[#1B4324]" />
          </div>
          <span className="text-[11px]">High</span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1.5 text-xs text-left">
          <thead>
            <tr>
              <th className="p-3 font-display font-semibold text-[#68796A] bg-[#FAF8F3] rounded-xl min-w-[140px]">
                Category \ Platform
              </th>
              {platforms.map(p => (
                <th
                  key={p}
                  className="p-3 font-display font-bold text-[#18261B] bg-[#FAF8F3] rounded-xl text-center min-w-[110px]"
                >
                  {p}
                </th>
              ))}
              <th className="p-3 font-display font-bold text-[#18261B] bg-[#F2EDE4] rounded-xl text-center min-w-[110px]">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => {
              const rowTotal = categoryTotals[cat] || 0;
              return (
                <tr key={cat}>
                  <td className="p-3 font-semibold text-[#18261B] bg-[#FAF9F5] rounded-xl">
                    {cat}
                  </td>
                  {platforms.map(plat => {
                    const val = matrix[cat]?.[plat] || 0;
                    const bg = getCellBgColor(val);
                    const textColor = getTextColor(val);

                    return (
                      <td
                        key={`${cat}-${plat}`}
                        onClick={() => onFilterPlatformCategory && onFilterPlatformCategory(plat, cat)}
                        style={{ backgroundColor: bg, color: textColor }}
                        title={`${cat} on ${plat}: ${formatCurrencyINR(val)}`}
                        className="p-3 rounded-xl text-center font-semibold transition-all hover:scale-[1.02] cursor-pointer shadow-2xs"
                      >
                        <div className="flex flex-col items-center">
                          <span>{val > 0 ? formatLakhs(val, true) : '—'}</span>
                          {val > 0 && (
                            <span className="text-[10px] opacity-80 mt-0.5">
                              {formatCurrencyINR(val)}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-3 bg-[#F2EDE4] text-[#18261B] rounded-xl text-center font-bold">
                    {formatLakhs(rowTotal, true)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="p-3 font-display font-bold text-[#18261B] bg-[#F2EDE4] rounded-xl">
                Total
              </td>
              {platforms.map(p => (
                <td
                  key={`foot-${p}`}
                  className="p-3 font-display font-bold text-[#18261B] bg-[#F2EDE4] rounded-xl text-center"
                >
                  {formatLakhs(platformTotals[p] || 0, true)}
                </td>
              ))}
              <td className="p-3 font-display font-extrabold text-[#1B4324] bg-[#EAF3EC] border border-[#CFE4D4] rounded-xl text-center text-sm">
                {formatLakhs(grandTotal, true)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 text-center text-[11px] text-[#7A8C7E]">
        Click any cell in the heatmap matrix to filter the dashboard to that specific category & platform.
      </div>
    </section>
  );
};
