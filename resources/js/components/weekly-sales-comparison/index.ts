/**
 * Weekly Sales Comparison Component
 * 
 * A comprehensive component for displaying weekly sales data comparison.
 * Shows the selected work week (Monday through Friday) with highlighted current week indicator.
 * Only renders when exactly one work week is selected in the date filter.
 */

// Main component exports
export { WeeklySalesComparison } from './weekly-sales-comparison';
export { default } from './weekly-sales-comparison';

// Sub-component exports
export { SalesWeekCard } from './components/sales-week-card';
export { WeeklyComparisonHeader } from './components/weekly-comparison-header';
export { WeeklyErrorBoundary } from './components/weekly-error-boundary';

// Type exports
export type {
  SalesWeekData,
  WeeklySalesComparisonProps,
  SalesWeekCardProps,
  WeeklyComparisonHeaderProps,
  ValidationResult
} from './types';

// Utility function exports
export {
  isWorkWeekSelected,
  generateWeekdays,
  formatSalesAmount,
  formatDateForWeekCard,
  getDayLetter,
  getDayName,
  generateMockWeeklySalesData,
  validateWeeklySalesData,
  validateWeekDateRange
} from './utils';