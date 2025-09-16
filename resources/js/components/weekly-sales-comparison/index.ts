/**
 * Weekly Sales Comparison Component
 *
 * A comprehensive component for displaying weekly sales data comparison.
 * Shows the selected work week (Monday through Friday) with highlighted current week indicator.
 * Only renders when exactly one work week is selected in the date filter.
 */

// Main component exports
export { WeeklySalesComparison, default } from './weekly-sales-comparison';

// Sub-component exports
export { SalesWeekCard } from './components/sales-week-card';
export { WeeklyComparisonHeader } from './components/weekly-comparison-header';
export { WeeklyErrorBoundary } from './components/weekly-error-boundary';

// Type exports
export type {
    SalesWeekCardProps,
    SalesWeekData,
    ValidationResult,
    WeeklyComparisonHeaderProps,
    WeeklySalesComparisonProps,
    WeeklySummaryCardProps,
    WeeklySummaryData,
} from './types';

// Utility function exports
export {
    formatDateForWeekCard,
    formatSalesAmount,
    formatWeekDateRange,
    formatWeeklySalesAmount,
    generateMockWeeklySalesData,
    generateWeekdays,
    getDayLetter,
    getDayName,
    isWorkWeekSelected,
    transformApiDataToWeeklySummary,
    validateWeekDateRange,
    validateWeeklySalesData,
} from './utils';
