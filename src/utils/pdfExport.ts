import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { FilterState, CleanSalesRecord, KpiMetrics, SalesTrendHighlights } from '../types';
import { formatCurrencyINR, formatLakhs, formatPercentage, formatGrowth, formatQuantity } from './formatters';

export interface ExportPdfOptions {
  containerElement: HTMLElement;
  filterState: FilterState;
  kpiMetrics: KpiMetrics;
  trendSummary: SalesTrendHighlights;
  dataSourceMode: 'demo' | 'user';
  recordCount: number;
}

/**
 * Generates an executive management PDF report capturing the active dashboard state.
 */
export async function exportDashboardToPDF({
  containerElement,
  filterState,
  kpiMetrics,
  trendSummary,
  dataSourceMode,
  recordCount,
}: ExportPdfOptions): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  // Header & Footer helper
  const addPageDecorations = (pageNumber: number, totalPagesPlaceholder: boolean = false) => {
    // Top banner bar
    pdf.setFillColor(27, 67, 36); // #1B4324 signature brand forest green
    pdf.rect(0, 0, pageWidth, 4, 'F');

    // Running top header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(27, 67, 36);
    pdf.text('URBAN ORGANIC SUPERFOOD', margin, 10);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(110, 126, 112);
    pdf.text('Executive Sales Performance & Management Report', margin + 55, 10);

    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(7.5);
    pdf.setTextColor(140, 155, 142);
    pdf.text('Internal Management Confidential', pageWidth - margin, 10, { align: 'right' });

    // Subtle divider line
    pdf.setDrawColor(229, 224, 216); // #E5E0D8
    pdf.setLineWidth(0.3);
    pdf.line(margin, 12, pageWidth - margin, 12);

    // Bottom running footer
    pdf.setDrawColor(229, 224, 216);
    pdf.setLineWidth(0.3);
    pdf.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(120, 136, 122);
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    pdf.text(`Generated: ${dateStr}  •  Source: ${dataSourceMode === 'demo' ? 'Sample Verified Health Food Dataset' : 'Uploaded Business Sales Records'} (${recordCount} transactions)`, margin, pageHeight - 6);

    pdf.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  };

  // 1. Collect target sections to snapshot
  const sectionIds = [
    'pdf-section-hero',       // Filters + KPI cards + Sales growth hero chart
    'pdf-section-platforms',  // Sales by Platform (Cards + Donut & Bar) + Platform growth multi-line
    'pdf-section-products',   // Monthly sales YoY comparison + Category chart & Top products table
    'pdf-section-insights',   // Platform x Category Heatmap + Sales trend milestones
  ];

  const sectionElements = sectionIds
    .map(id => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);

  // If specific sections are not found, fallback to container
  const elementsToCapture = sectionElements.length > 0 ? sectionElements : [containerElement];

  let currentPage = 1;

  // First page cover block with executive filter summary
  addPageDecorations(currentPage);

  // Document Title Block
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(24, 38, 27); // #18261B
  pdf.text('Executive Sales Performance Dashboard', margin, 20);

  // Active Filter Badges String
  const activeFilters = [
    `Period: ${filterState.year !== 'ALL' ? filterState.year : 'All Years'}`,
    filterState.month !== 'ALL' ? `Month: ${filterState.month}` : null,
    filterState.platform !== 'ALL' ? `Platform: ${filterState.platform}` : 'All Platforms',
    filterState.category !== 'ALL' ? `Category: ${filterState.category}` : 'All Categories',
    filterState.product !== 'ALL' ? `Product: ${filterState.product}` : null,
  ].filter(Boolean).join('  |  ');

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(90, 107, 93);
  pdf.text(`Applied Filters: ${activeFilters}`, margin, 25);

  // Executive Scorecard Mini Table
  pdf.setFillColor(250, 248, 243); // #FAF8F3
  pdf.roundedRect(margin, 28, contentWidth, 14, 2, 2, 'F');
  pdf.setDrawColor(229, 224, 216);
  pdf.roundedRect(margin, 28, contentWidth, 14, 2, 2, 'S');

  const kpiCols = [
    { label: 'TOTAL SALES', value: formatLakhs(kpiMetrics.totalSales, true), sub: formatCurrencyINR(kpiMetrics.totalSales) },
    { label: 'TOTAL UNITS SOLD', value: formatQuantity(kpiMetrics.totalUnits), sub: 'Packs Shipped' },
    {
      label: 'SALES GROWTH',
      value: formatGrowth(kpiMetrics.salesGrowthPct),
      sub: kpiMetrics.salesGrowthPct !== null ? (kpiMetrics.salesGrowthPct >= 0 ? 'Positive Growth' : 'Negative Momentum') : 'Baseline Period',
    },
    {
      label: 'TOP MARKETPLACE',
      value: kpiMetrics.topPlatform ? kpiMetrics.topPlatform.name : 'N/A',
      sub: kpiMetrics.topPlatform ? `${formatPercentage(kpiMetrics.topPlatform.sharePct)} share` : '',
    },
  ];

  const colWidth = contentWidth / 4;
  kpiCols.forEach((col, idx) => {
    const x = margin + idx * colWidth + 4;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(100, 115, 103);
    pdf.text(col.label, x, 32);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10.5);
    pdf.setTextColor(24, 38, 27);
    pdf.text(col.value, x, 37.5);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(110, 125, 113);
    pdf.text(col.sub, x, 40.5);
  });

  let currentY = 46;

  // Process sections and render high-resolution images
  for (let i = 0; i < elementsToCapture.length; i++) {
    const sectionEl = elementsToCapture[i];

    // High quality canvas capture
    const canvas = await html2canvas(sectionEl, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: 1280, // standardized desktop width for consistent layout
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    // Check if section fits on the current page
    const availableHeight = pageHeight - margin - 14 - currentY;

    if (imgHeight > availableHeight && currentY > 50) {
      // Create a new page
      pdf.addPage();
      currentPage++;
      addPageDecorations(currentPage);
      currentY = 16;
    }

    // If a single image is taller than a single page, scale it to fit or split
    if (imgHeight > pageHeight - 32) {
      const scaledHeight = pageHeight - 32;
      const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
      const offsetX = margin + (contentWidth - scaledWidth) / 2;
      pdf.addImage(imgData, 'JPEG', offsetX, currentY, scaledWidth, scaledHeight);
      currentY += scaledHeight + 6;
    } else {
      pdf.addImage(imgData, 'JPEG', margin, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 6;
    }
  }

  // Update total page numbers in footer
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(120, 136, 122);
    // Overwrite the page count placeholder with exact total
    pdf.setFillColor(255, 255, 255);
    pdf.rect(pageWidth - margin - 22, pageHeight - 9, 24, 6, 'F');
    pdf.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  // Format file name
  const today = new Date().toISOString().split('T')[0];
  const filterTag = filterState.year !== 'ALL' ? `_${filterState.year}` : '';
  const filename = `Urban_Organic_Superfood_Sales_Report${filterTag}_${today}.pdf`;

  pdf.save(filename);
}
