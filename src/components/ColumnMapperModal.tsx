import React, { useState } from 'react';
import { ColumnMapping } from '../types';
import { Check, X, ArrowRight, Table, AlertCircle } from 'lucide-react';

interface ColumnMapperModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedColumns: string[];
  currentMapping: ColumnMapping;
  onSaveMapping: (mapping: ColumnMapping) => void;
  missingColumns?: string[];
}

export const ColumnMapperModal: React.FC<ColumnMapperModalProps> = ({
  isOpen,
  onClose,
  detectedColumns,
  currentMapping,
  onSaveMapping,
  missingColumns = [],
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>(currentMapping);

  if (!isOpen) return null;

  const requiredFields: { key: keyof ColumnMapping; label: string; desc: string; sample: string }[] = [
    { key: 'date', label: 'Date', desc: 'Date of sale or transaction', sample: '01-Sep-2026 or 2026-09-01' },
    { key: 'platform', label: 'Platform', desc: 'Selling channel/marketplace', sample: 'Amazon, Website, Flipkart' },
    { key: 'productName', label: 'Product Name', desc: 'Item or SKU title', sample: 'Roasted Makhana, Sattu' },
    { key: 'category', label: 'Category', desc: 'Product grouping', sample: 'Makhana, Ghee, Millets' },
    { key: 'quantitySold', label: 'Quantity Sold', desc: 'Units or volume sold', sample: '25, 18, 8' },
    { key: 'sales', label: 'Sales', desc: 'Total sales value in ₹', sample: '9975, 5382, ₹7,192' },
  ];

  const handleSelect = (field: keyof ColumnMapping, value: string) => {
    setMapping(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    onSaveMapping(mapping);
    onClose();
  };

  const allMapped = requiredFields.every(f => !!mapping[f.key]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E3DDD4] shadow-xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 bg-[#F6F4EE] border-b border-[#E8E2D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#234E33] text-white flex items-center justify-center shadow-xs">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-[#18261B]">Map Excel Columns</h3>
              <p className="text-xs text-[#637265]">Match your sheet headers to the dashboard fields</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#637265] hover:text-[#18261B] p-1.5 rounded-lg hover:bg-[#EBE6DC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
          {missingColumns.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Missing automatic matches: </span>
                {missingColumns.join(', ')}. Please choose the corresponding header from your spreadsheet below.
              </div>
            </div>
          )}

          <div className="space-y-3">
            {requiredFields.map(field => {
              const isSelected = !!mapping[field.key];
              return (
                <div
                  key={field.key}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isSelected ? 'border-[#C4D9C7] bg-[#F9FCFA]' : 'border-[#E6DFD5] bg-[#FDFCFB]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#18261B]">{field.label}</span>
                        <span className="text-[10px] text-[#A25D34] font-medium bg-[#FDF0E9] px-2 py-0.5 rounded-full border border-[#F3DACD]">
                          Required
                        </span>
                      </div>
                      <p className="text-xs text-[#68796A] mt-0.5">{field.desc} <span className="text-[#88978A] italic">({field.sample})</span></p>
                    </div>

                    <div className="sm:w-56">
                      <select
                        value={mapping[field.key] || ''}
                        onChange={e => handleSelect(field.key, e.target.value)}
                        className="w-full text-xs font-medium bg-white border border-[#D5CDC2] rounded-lg px-3 py-2 text-[#18261B] focus:outline-hidden focus:border-[#234E33] focus:ring-1 focus:ring-[#234E33]"
                      >
                        <option value="">-- Select Column --</option>
                        {detectedColumns.map(col => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 bg-[#FAF9F5] border-t border-[#E8E2D8] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#5A6B5D] hover:text-[#18261B] rounded-lg hover:bg-[#EDE8DE] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!allMapped}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all ${
              allMapped
                ? 'bg-[#234E33] text-white hover:bg-[#1B3E28] cursor-pointer'
                : 'bg-[#D2CBC0] text-[#7A746B] cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            Apply & View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
