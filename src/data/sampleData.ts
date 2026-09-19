import { CleanSalesRecord } from '../types';

export const SAMPLE_RAW_DATA = [
  // September 2026 (Current Period in User Prompt Example)
  { date: '2026-09-01', platform: 'Amazon', productName: 'Roasted Makhana (Himalayan Salt)', category: 'Makhana', quantity: 25, sales: 9975 },
  { date: '2026-09-01', platform: 'Website', productName: 'Organic Chana Sattu', category: 'Sattu', quantity: 18, sales: 5382 },
  { date: '2026-09-02', platform: 'Flipkart', productName: 'Vedic A2 Desi Cow Ghee (500ml)', category: 'Ghee', quantity: 8, sales: 7192 },
  { date: '2026-09-02', platform: 'Amazon', productName: 'Tulsi Chamomile Herbal Tea', category: 'Tea & Beverages', quantity: 20, sales: 4980 },
  { date: '2026-09-03', platform: 'Website', productName: 'Kashmiri Raw Forest Honey', category: 'Honey', quantity: 14, sales: 6986 },
  { date: '2026-09-03', platform: 'Amazon', productName: 'Sprouted Ragi Millet Flour', category: 'Millets', quantity: 30, sales: 8970 },
  { date: '2026-09-04', platform: 'Blinkit', productName: 'Roasted Makhana (Peri Peri)', category: 'Makhana', quantity: 35, sales: 13965 },
  { date: '2026-09-04', platform: 'Flipkart', productName: 'Organic Chia & Flax Seeds Trio', category: 'Protein & Seeds', quantity: 22, sales: 8778 },
  { date: '2026-09-05', platform: 'Amazon', productName: 'Ashwagandha Gold Extract', category: 'Wellness', quantity: 15, sales: 11985 },
  { date: '2026-09-05', platform: 'Website', productName: 'Vedic A2 Desi Cow Ghee (1L)', category: 'Ghee', quantity: 12, sales: 19188 },
  { date: '2026-09-06', platform: 'Amazon', productName: 'Roasted Makhana (Himalayan Salt)', category: 'Makhana', quantity: 28, sales: 11172 },
  { date: '2026-09-06', platform: 'Blinkit', productName: 'Organic Chana Sattu', category: 'Sattu', quantity: 25, sales: 7475 },
  { date: '2026-09-07', platform: 'Website', productName: 'Immunity Booster Combo Kit', category: 'Combos', quantity: 16, sales: 23984 },
  { date: '2026-09-07', platform: 'Flipkart', productName: 'Kashmiri Kahwa Green Tea', category: 'Tea & Beverages', quantity: 18, sales: 5382 },
  { date: '2026-09-08', platform: 'Amazon', productName: 'Kashmiri Raw Forest Honey', category: 'Honey', quantity: 24, sales: 11976 },
  { date: '2026-09-08', platform: 'Website', productName: 'Sprouted Ragi Millet Flour', category: 'Millets', quantity: 26, sales: 7774 },
  { date: '2026-09-09', platform: 'Amazon', productName: 'Vedic A2 Desi Cow Ghee (500ml)', category: 'Ghee', quantity: 15, sales: 13485 },
  { date: '2026-09-09', platform: 'Blinkit', productName: 'Roasted Makhana (Mint Pudina)', category: 'Makhana', quantity: 40, sales: 15960 },
  { date: '2026-09-10', platform: 'Flipkart', productName: 'Organic Chana Sattu', category: 'Sattu', quantity: 20, sales: 5980 },
  { date: '2026-09-10', platform: 'Website', productName: 'Plant Protein Superfood Powder', category: 'Protein & Seeds', quantity: 19, sales: 24681 },
  { date: '2026-09-11', platform: 'Amazon', productName: 'Immunity Booster Combo Kit', category: 'Combos', quantity: 22, sales: 32978 },
  { date: '2026-09-11', platform: 'Website', productName: 'Tulsi Chamomile Herbal Tea', category: 'Tea & Beverages', quantity: 24, sales: 5976 },
  { date: '2026-09-12', platform: 'Blinkit', productName: 'Vedic A2 Desi Cow Ghee (500ml)', category: 'Ghee', quantity: 14, sales: 12586 },
  { date: '2026-09-12', platform: 'Amazon', productName: 'Foxtail & Little Millet Grain', category: 'Millets', quantity: 32, sales: 9568 },
  { date: '2026-09-13', platform: 'Flipkart', productName: 'Ashwagandha Gold Extract', category: 'Wellness', quantity: 11, sales: 8789 },
  { date: '2026-09-13', platform: 'Website', productName: 'Roasted Makhana (Himalayan Salt)', category: 'Makhana', quantity: 30, sales: 11970 },
  { date: '2026-09-14', platform: 'Amazon', productName: 'Organic Chana Sattu', category: 'Sattu', quantity: 38, sales: 11362 },
  { date: '2026-09-14', platform: 'Website', productName: 'Vedic A2 Desi Cow Ghee (500ml)', category: 'Ghee', quantity: 18, sales: 16182 },
  { date: '2026-09-15', platform: 'Blinkit', productName: 'Organic Chia & Flax Seeds Trio', category: 'Protein & Seeds', quantity: 26, sales: 10374 },
  { date: '2026-09-15', platform: 'Amazon', productName: 'Triphala & Amla Vitality Brew', category: 'Wellness', quantity: 20, sales: 9980 },
];

// Helper to seed a comprehensive multi-year dataset spanning Jan 2025 to Sep 2026
export function generateFullSampleDataset(): CleanSalesRecord[] {
  const records: CleanSalesRecord[] = [];
  let recordId = 1;

  const catalog = [
    { name: 'Roasted Makhana (Himalayan Salt)', category: 'Makhana', price: 399, popularity: { Amazon: 1.4, Website: 1.1, Flipkart: 1.0, Blinkit: 1.5 } },
    { name: 'Roasted Makhana (Peri Peri)', category: 'Makhana', price: 399, popularity: { Amazon: 1.2, Website: 0.9, Flipkart: 1.1, Blinkit: 1.3 } },
    { name: 'Roasted Makhana (Mint Pudina)', category: 'Makhana', price: 399, popularity: { Amazon: 1.0, Website: 0.8, Flipkart: 0.9, Blinkit: 1.2 } },
    { name: 'Organic Chana Sattu', category: 'Sattu', price: 299, popularity: { Amazon: 1.3, Website: 1.4, Flipkart: 1.2, Blinkit: 1.1 } },
    { name: 'Barley & Multi-Grain Sattu', category: 'Sattu', price: 329, popularity: { Amazon: 0.9, Website: 1.1, Flipkart: 0.8, Blinkit: 0.7 } },
    { name: 'Vedic A2 Desi Cow Ghee (500ml)', category: 'Ghee', price: 899, popularity: { Amazon: 1.5, Website: 1.6, Flipkart: 1.1, Blinkit: 1.0 } },
    { name: 'Vedic A2 Desi Cow Ghee (1L)', category: 'Ghee', price: 1599, popularity: { Amazon: 1.3, Website: 1.5, Flipkart: 0.9, Blinkit: 0.6 } },
    { name: 'Kashmiri Raw Forest Honey', category: 'Honey', price: 499, popularity: { Amazon: 1.2, Website: 1.3, Flipkart: 1.0, Blinkit: 0.9 } },
    { name: 'Acacia Flora Raw Honey', category: 'Honey', price: 549, popularity: { Amazon: 0.8, Website: 1.2, Flipkart: 0.7, Blinkit: 0.5 } },
    { name: 'Tulsi Chamomile Herbal Tea', category: 'Tea & Beverages', price: 249, popularity: { Amazon: 1.1, Website: 1.2, Flipkart: 0.9, Blinkit: 1.0 } },
    { name: 'Kashmiri Kahwa Green Tea', category: 'Tea & Beverages', price: 299, popularity: { Amazon: 1.0, Website: 1.1, Flipkart: 0.9, Blinkit: 0.8 } },
    { name: 'Sprouted Ragi Millet Flour', category: 'Millets', price: 299, popularity: { Amazon: 1.2, Website: 1.3, Flipkart: 1.0, Blinkit: 0.9 } },
    { name: 'Foxtail & Little Millet Grain', category: 'Millets', price: 299, popularity: { Amazon: 0.9, Website: 1.0, Flipkart: 0.8, Blinkit: 0.7 } },
    { name: 'Organic Chia & Flax Seeds Trio', category: 'Protein & Seeds', price: 399, popularity: { Amazon: 1.3, Website: 1.2, Flipkart: 1.0, Blinkit: 1.1 } },
    { name: 'Plant Protein Superfood Powder', category: 'Protein & Seeds', price: 1299, popularity: { Amazon: 1.1, Website: 1.5, Flipkart: 0.7, Blinkit: 0.5 } },
    { name: 'Ashwagandha Gold Extract', category: 'Wellness', price: 799, popularity: { Amazon: 1.4, Website: 1.3, Flipkart: 0.9, Blinkit: 0.6 } },
    { name: 'Triphala & Amla Vitality Brew', category: 'Wellness', price: 499, popularity: { Amazon: 0.9, Website: 1.0, Flipkart: 0.8, Blinkit: 0.7 } },
    { name: 'Immunity Booster Combo Kit', category: 'Combos', price: 1499, popularity: { Amazon: 1.2, Website: 1.6, Flipkart: 0.8, Blinkit: 0.5 } },
    { name: 'Desi Ghee & Sattu Energy Pack', category: 'Combos', price: 1149, popularity: { Amazon: 1.1, Website: 1.4, Flipkart: 0.9, Blinkit: 0.6 } },
  ];

  const platforms = [
    { name: 'Amazon', shareWeight: 0.42 },
    { name: 'Website', shareWeight: 0.31 },
    { name: 'Flipkart', shareWeight: 0.16 },
    { name: 'Blinkit', shareWeight: 0.11 },
  ];

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Predictable pseudo-random generator
  let seed = 42;
  function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  // 2025 full year + 2026 Jan through Sep
  const periods = [
    { year: 2025, months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], baseGrowth: 1.0 },
    { year: 2026, months: [0, 1, 2, 3, 4, 5, 6, 7, 8], baseGrowth: 1.28 }, // ~28% overall YoY growth as in example
  ];

  for (const period of periods) {
    for (const m of period.months) {
      // Month seasonal multiplier (Festive months like Oct/Nov and wellness months Jan/Feb are higher)
      let seasonalFactor = 1.0;
      if (m === 0 || m === 1) seasonalFactor = 1.12; // New Year health resolutions
      if (m === 4 || m === 5) seasonalFactor = 1.05; // Summer cooling sattu & teas
      if (m === 8 || m === 9 || m === 10) seasonalFactor = 1.25; // Festive gifting / Ghee / Makhana
      
      const daysInMonth = m === 1 ? 28 : (m === 3 || m === 5 || m === 8 || m === 10 ? 30 : 31);
      
      // Sample 12-16 sales days per month for a dense, high-fidelity timeline
      const sampleDays = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 28];

      for (const day of sampleDays) {
        if (day > daysInMonth) continue;
        const dateStr = `${period.year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dateObj = new Date(`${dateStr}T00:00:00Z`);

        // Generate 3 to 6 platform sales entries for this day
        const entriesCount = 3 + Math.floor(random() * 3);
        
        for (let i = 0; i < entriesCount; i++) {
          // Select platform with weighted probability
          const randPlatform = random();
          let cumWeight = 0;
          let selectedPlatform = platforms[0].name;
          for (const p of platforms) {
            cumWeight += p.shareWeight;
            if (randPlatform <= cumWeight) {
              selectedPlatform = p.name;
              break;
            }
          }

          // Select product
          const prodIdx = Math.floor(random() * catalog.length);
          const product = catalog[prodIdx];
          const pop = (product.popularity as Record<string, number>)[selectedPlatform] || 1.0;

          // Quantity calculation
          const baseQty = product.price > 1000 ? 5 + Math.floor(random() * 8) : 12 + Math.floor(random() * 25);
          const quantitySold = Math.max(1, Math.round(baseQty * period.baseGrowth * seasonalFactor * pop * (0.85 + random() * 0.3)));
          const sales = quantitySold * product.price;

          records.push({
            id: `rec-${recordId++}`,
            date: dateStr,
            timestamp: dateObj.getTime(),
            year: period.year,
            month: m,
            monthName: monthNames[m],
            monthYear: `${monthNames[m]} ${period.year}`,
            platform: selectedPlatform,
            productName: product.name,
            category: product.category,
            quantitySold,
            sales,
          });
        }
      }
    }
  }

  // Ensure prompt sample rows are strictly present in the dataset
  for (const s of SAMPLE_RAW_DATA) {
    const d = new Date(`${s.date}T00:00:00Z`);
    records.push({
      id: `seed-${recordId++}`,
      date: s.date,
      timestamp: d.getTime(),
      year: d.getUTCFullYear(),
      month: d.getUTCMonth(),
      monthName: monthNames[d.getUTCMonth()],
      monthYear: `${monthNames[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
      platform: s.platform,
      productName: s.productName,
      category: s.category,
      quantitySold: s.quantity,
      sales: s.sales,
    });
  }

  // Sort chronologically
  return records.sort((a, b) => a.timestamp - b.timestamp);
}
