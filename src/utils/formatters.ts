/**
 * Formats a number into Indian Lakhs (L) or Crores (Cr) style
 * e.g., 780000 -> "₹ 7.80 L" or "₹7.8L"
 */
export function formatLakhs(amount: number, compact = false): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹ 0.00 L';
  
  if (Math.abs(amount) >= 10000000) {
    const cr = amount / 10000000;
    return compact ? `₹${cr.toFixed(1)}Cr` : `₹ ${cr.toFixed(2)} Cr`;
  }
  
  if (Math.abs(amount) >= 100000) {
    const l = amount / 100000;
    return compact ? `₹${l.toFixed(1)}L` : `₹ ${l.toFixed(2)} L`;
  }

  if (Math.abs(amount) >= 1000) {
    const k = amount / 1000;
    return compact ? `₹${k.toFixed(1)}K` : `₹ ${k.toFixed(1)} K`;
  }

  return `₹ ${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Formats standard Indian Currency with ₹ symbol and Indian grouping:
 * 1234567 -> "₹ 12,34,567"
 */
export function formatCurrencyINR(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹ 0';
  return '₹ ' + Math.round(amount).toLocaleString('en-IN');
}

/**
 * Formats quantity with comma formatting e.g. 24,500
 */
export function formatQuantity(num: number): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return Math.round(num).toLocaleString('en-IN');
}

/**
 * Formats growth percentage with explicit + / - sign
 * e.g. 28.4 -> "+28.4%", -5.1 -> "-5.1%"
 */
export function formatGrowth(pct: number | null | undefined): string {
  if (pct === null || pct === undefined || isNaN(pct)) return '—';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

/**
 * Formats percentage e.g. 42.1%
 */
export function formatPercentage(pct: number): string {
  if (isNaN(pct)) return '0%';
  return `${pct.toFixed(1)}%`;
}

/**
 * Parses any string or number into a valid numerical amount,
 * safely handling ₹ symbols, commas, spaces, and currency text.
 */
export function parseCleanNumber(val: unknown): number {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val;
  }
  if (!val) return 0;
  
  const cleaned = String(val)
    .replace(/[₹$,\s]/g, '')
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
