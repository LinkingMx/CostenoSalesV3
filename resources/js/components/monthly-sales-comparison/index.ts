/**
 * Monthly Sales Comparison Component
 * 
 * A comprehensive component for displaying monthly sales data comparison.
 * Shows the selected complete month (first day through last day) with highlighted current month indicator.
 * Only renders when exactly one complete month is selected in the date filter.
 */

// Main component exports
export { MonthlySalesComparison } from './monthly-sales-comparison';
export { default } from './monthly-sales-comparison';

// Sub-component exports
export { MonthlyComparisonHeader } from './components/monthly-comparison-header';
export { MonthlyErrorBoundary } from './components/monthly-error-boundary';

// Type exports
export type {
  SalesMonthData,
  MonthlySalesComparisonProps,
  MonthlySummaryData,
  MonthlyComparisonHeaderProps,
  ValidationResult
} from './types';

// Utility function exports
export {
  isCompleteMonthSelected,
  generateMonthDays,
  formatSalesAmount,
  formatChartAmount,
  formatMonthlySalesAmount,
  formatDateForMonthCard,
  getMonthLetter,
  getMonthName,
  generateMockMonthlySalesData,
  validateMonthlySalesData,
  validateMonthDateRange,
  transformApiDataToMonthlySummary
} from './utils';