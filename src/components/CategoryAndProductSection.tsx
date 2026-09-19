import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { CategoryMetric, ProductMetric } from '../types';
import { formatLakhs, formatPercentage, formatQuantity, formatGrowth, formatCurrencyINR } from '../utils/formatters';
import { Tag, Trophy, ArrowUpDown, ChevronRight, CheckCircle2 } from 'lucide-react';

interface CategoryAndProductSectionProps {
  categories: CategoryMetric[];
  products: ProductMetric[];
  selectedCategory: string;
  selectedProduct: string;
  onSelectCategory: (category: string) => void;
  onSelectProduct: (product: string) => void;
}

type SortField = 'sales' | 'quantitySold' | 'growthPct';

export const CategoryAndProductSection: React.FC<CategoryAndProductSectionProps> = ({
  categories,
  products,
  selectedCategory,
  selectedProduct,
  onSelectCategory,
  onSelectProduct,
}) => {
  const [topCount, setTopCount] = useState<5 | 10>(10);
  const [sortField, setSortField] = useState<SortField>('sales');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Sorting logic for products table
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for metrics
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    let aVal = a[sortField] ?? -Infinity;
    let bVal = b[sortField] ?? -Infinity;
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const displayedProducts = sortedProducts.slice(0, topCount);

  const CustomCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#18261B] text-white p-3 rounded-xl shadow-lg border border-[#2D4532] text-xs space-y-1">
          <p className="font-bold text-white">{data.category}</p>
          <p className="text-[#D1E6D6]">Sales: {formatCurrencyINR(data.sales)} ({formatLakhs(data.sales, true)})</p>
          <p className="text-[#A3E635] font-semibold">Share: {formatPercentage(data.sharePct)}</p>
          <p className="text-[#88988A] text-[10px]">Click to filter dashboard by this category</p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
      
      {/* LEFT: SALES BY CATEGORY (5 cols) */}
      <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E5E0D8] p-5 sm:p-7 shadow-sm flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EAF3EC] text-[#1B4324] flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#18261B] tracking-tight">
                Sales by Category
              </h3>
            </div>
            <p className="text-xs text-[#5E7060] mt-1">
              Ranked category contribution (highest to lowest)
            </p>
          </div>

          {selectedCategory !== 'ALL' && (
            <button
              type="button"
              onClick={() => onSelectCategory('ALL')}
              className="text-[11px] font-semibold text-[#1B4324] bg-[#EAF3EC] hover:bg-[#D8ECD9] px-2.5 py-1 rounded-lg transition-colors border border-[#CFE4D4] cursor-pointer"
            >
              Reset ({selectedCategory})
            </button>
          )}
        </div>

        {/* Horizontal Bar Chart for Categories */}
        <div className="h-[340px] w-full mt-2">
          {categories.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[#7A8C7E]">
              No category records available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={categories}
                margin={{ top: 5, right: 35, left: 10, bottom: 5 }}
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
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  axisLine={{ stroke: '#DFD8CC' }}
                  tick={{ fill: '#18261B', fontSize: 11, fontWeight: 500 }}
                  width={90}
                />
                <Tooltip content={<CustomCategoryTooltip />} />
                <Bar
                  dataKey="sales"
                  radius={[0, 6, 6, 0]}
                  className="cursor-pointer"
                  onClick={(entry: any) => entry?.category && onSelectCategory(entry.category)}
                >
                  {categories.map((c) => {
                    const isSelected = selectedCategory.toLowerCase() === c.category.toLowerCase();
                    return (
                      <Cell
                        key={c.category}
                        fill={isSelected ? '#14331C' : '#234E33'}
                        fillOpacity={isSelected ? 1 : 0.85}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category List Pills */}
        <div className="mt-4 pt-3 border-t border-[#EDE7DD] space-y-2 max-h-[140px] overflow-y-auto pr-1">
          {categories.map(c => {
            const isSelected = selectedCategory.toLowerCase() === c.category.toLowerCase();
            return (
              <div
                key={c.category}
                onClick={() => onSelectCategory(isSelected ? 'ALL' : c.category)}
                className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#EAF3EC] border border-[#234E33] text-[#1B4324] font-semibold'
                    : 'bg-[#FCFBF8] border border-[#EFE9DF] hover:bg-[#F6F4ED] text-[#2D3E30]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#234E33] shrink-0" />
                  <span className="truncate">{c.category}</span>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-semibold text-[#18261B]">{formatLakhs(c.sales, true)}</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[#EDE8DE] text-[#556757] font-medium">
                    {formatPercentage(c.sharePct)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: TOP SELLING PRODUCTS TABLE (7 cols) */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E5E0D8] p-5 sm:p-7 shadow-sm flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EAF3EC] text-[#1B4324] flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#18261B] tracking-tight">
                Top Selling Products
              </h3>
            </div>
            <p className="text-xs text-[#5E7060] mt-1">
              High-velocity health foods • Click product to isolate in dashboard
            </p>
          </div>

          {/* Controls: Top 5 / 10 + Clear Selection */}
          <div className="flex items-center gap-2">
            {selectedProduct !== 'ALL' && (
              <button
                type="button"
                onClick={() => onSelectProduct('ALL')}
                className="text-[11px] font-semibold text-[#1B4324] bg-[#EAF3EC] hover:bg-[#D8ECD9] px-2.5 py-1 rounded-lg transition-colors border border-[#CFE4D4] cursor-pointer"
              >
                Reset Product ({selectedProduct})
              </button>
            )}

            <div className="inline-flex p-1 rounded-xl bg-[#F0ECE4] border border-[#E0D9CD] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTopCount(5)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  topCount === 5
                    ? 'bg-white text-[#1B4324] shadow-xs font-bold'
                    : 'text-[#637265] hover:text-[#18261B]'
                }`}
              >
                Top 5
              </button>
              <button
                type="button"
                onClick={() => setTopCount(10)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  topCount === 10
                    ? 'bg-white text-[#1B4324] shadow-xs font-bold'
                    : 'text-[#637265] hover:text-[#18261B]'
                }`}
              >
                Top 10
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto grow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EDE7DC] text-[11px] font-bold text-[#556757] uppercase tracking-wider bg-[#FAF8F3]">
                <th className="py-2.5 px-3 rounded-l-xl">Rank</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 hidden sm:table-cell">Category</th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-[#18261B]"
                  onClick={() => handleSort('quantitySold')}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>Units</span>
                    <ArrowUpDown className="w-3 h-3 text-[#8A9B8C]" />
                  </div>
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-[#18261B]"
                  onClick={() => handleSort('sales')}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>Sales</span>
                    <ArrowUpDown className="w-3 h-3 text-[#8A9B8C]" />
                  </div>
                </th>
                <th
                  className="py-2.5 px-3 text-right rounded-r-xl cursor-pointer hover:text-[#18261B]"
                  onClick={() => handleSort('growthPct')}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>Growth</span>
                    <ArrowUpDown className="w-3 h-3 text-[#8A9B8C]" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE3] text-xs">
              {displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#7A8C7E]">
                    No products found for this filter.
                  </td>
                </tr>
              ) : (
                displayedProducts.map((p, idx) => {
                  const isSelected = selectedProduct.toLowerCase() === p.productName.toLowerCase();
                  const isPos = p.growthPct !== null && p.growthPct > 0;
                  const isNeg = p.growthPct !== null && p.growthPct < 0;

                  return (
                    <tr
                      key={p.productName}
                      onClick={() => onSelectProduct(isSelected ? 'ALL' : p.productName)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#EBF3EC] font-semibold text-[#1B4324]'
                          : 'hover:bg-[#FBF9F5] text-[#18261B]'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-display font-bold text-xs">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${
                          idx === 0 ? 'bg-[#FEF3C7] text-[#92400E]' : idx === 1 ? 'bg-[#E2E8F0] text-[#1E293B]' : idx === 2 ? 'bg-[#FFFBEB] text-[#78350F] border border-[#FDE68A]' : 'text-[#6C7D6F]'
                        }`}>
                          {p.rank || idx + 1}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[170px] sm:max-w-[220px]" title={p.productName}>
                            {p.productName}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#234E33] shrink-0" />}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 hidden sm:table-cell text-[#5E7060]">
                        <span className="px-2 py-0.5 rounded-md bg-[#F2EDE4] text-[11px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-[#465749]">
                        {formatQuantity(p.quantitySold)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#18261B]">
                        {formatCurrencyINR(p.sales)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold">
                        <span
                          className={`text-[11px] px-1.5 py-0.5 rounded-md ${
                            isPos
                              ? 'bg-[#EAF3EC] text-[#1B4324]'
                              : isNeg
                              ? 'bg-[#FFF1F2] text-[#BE123C]'
                              : 'text-[#6C7D6F]'
                          }`}
                        >
                          {formatGrowth(p.growthPct)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-[11px] text-[#7A8C7E] flex items-center justify-between border-t border-[#F0EBE1] pt-2">
          <span>Click any product row to filter all dashboard visuals</span>
          <span>Sorted by {sortField === 'sales' ? 'Sales Value' : sortField === 'quantitySold' ? 'Units Sold' : 'Growth %'}</span>
        </div>
      </div>

    </section>
  );
};
