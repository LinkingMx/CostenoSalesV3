/**
 * Daily Sales Comparison Component
 * 
 * A comprehensive component for displaying daily sales data comparison.
 * Shows the selected day plus 3 previous days with highlighted today indicator.
 * Only renders when exactly one day is selected in the date filter.
 */

// Main component exports
export { DailySalesComparison } from './daily-sales-comparison';
export { default } from './daily-sales-comparison';

// Sub-component exports
export { SalesDayCard } from './components/sales-day-card';
export { SalesComparisonHeader } from './components/sales-comparison-header';
export { SalesComparisonSkeleton } from './components/sales-comparison-skeleton';
export { SalesComparisonError } from './components/sales-comparison-error';

// Type exports
export type {
  SalesDayData,
  DailySalesComparisonProps,
  SalesDayCardProps,
  SalesComparisonHeaderProps,
  ValidationResult
} from './types';

// Utility function exports
export {
  isSingleDaySelected,
  generatePreviousDays,
  formatSalesAmount,
  formatDateForCard,
  getDayLetter,
  generateMockSalesData,
  validateSalesDayData,
  validateDateRange,
  convertProcessedChartDataToSalesData
} from './utils';