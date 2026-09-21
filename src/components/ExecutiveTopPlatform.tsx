import React from 'react';
import { PlatformMetric } from '../types';
import { getPlatformColor } from './SalesByPlatform';
import { PlatformLogo } from './PlatformLogo';
import { formatCurrencyINR, formatLakhs, formatPercentage } from '../utils/formatters';
import { Award, ShoppingBag, ArrowUpRight } from 'lucide-react';

interface ExecutiveTopPlatformProps {
  platforms: PlatformMetric[];
  onSelectPlatform: (platform: string) => void;
  selectedPlatform: string;
}

export const ExecutiveTopPlatform: React.FC<ExecutiveTopPlatformProps> = ({
  platforms,
  onSelectPlatform,
  selectedPlatform,
}) => {
  // Sort platforms by sales descending
  const sortedPlatforms = [...platforms].sort((a, b) => b.sales - a.sales);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E6E1D8] p-5 sm:p-6 shadow-xs h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-xl text-[#18261B] tracking-tight">
              Top Platform
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[#7A8A7D]">
            By Volume & Share
          </span>
        </div>

        {/* Platform Ranking List matching Image 1 */}
        <div className="space-y-3">
          {sortedPlatforms.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#7A8A7D]">
              <p className="font-medium text-[#18261B]">No Platforms Active</p>
              <p className="mt-1">All channel shares: 0%</p>
            </div>
          ) : (
            sortedPlatforms.map((p, index) => {
              const color = getPlatformColor(p.platform, index);
              const isSelected = selectedPlatform === p.platform;

              return (
                <div
                  key={p.platform}
                  onClick={() => onSelectPlatform(p.platform)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#EBF3EC] border border-[#B5DBC0]'
                      : 'hover:bg-[#F9F7F3]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Platform logo / badge */}
                    <PlatformLogo platform={p.platform} size="sm" />
                    <div>
                      <span className="font-bold text-sm text-[#18261B] block">
                        {p.platform}
                      </span>
                      <span className="text-[11px] text-[#7A8A7D]">
                        {p.sales > 0 ? formatLakhs(p.sales, true) : '₹ 0'}
                      </span>
                    </div>
                  </div>

                  {/* Percentage Share (matching Image 1 e.g. 43%, 25%, etc.) */}
                  <div className="text-right">
                    <span className="font-display font-bold text-base text-[#18261B]">
                      {p.sharePct > 0 ? formatPercentage(p.sharePct) : '0%'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {sortedPlatforms.length > 0 && sortedPlatforms[0] && (
        <div className="mt-4 pt-3 border-t border-[#F0EBE3] flex items-center justify-between text-xs">
          <span className="text-[#6D7F70]">Leading Channel</span>
          <span className="font-bold text-[#234E33] flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            {sortedPlatforms[0].platform} ({formatPercentage(sortedPlatforms[0].sharePct)})
          </span>
        </div>
      )}
    </div>
  );
};
