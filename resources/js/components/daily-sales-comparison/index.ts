/**
 * Daily Sales Comparison Component
 *
 * A comprehensive component for displaying daily sales data comparison.
 * Shows the selected day plus 3 previous days with highlighted today indicator.
 * Only renders when exactly one day is selected in the date filter.
 */

// Main component exports
export { DailySalesComparison, default } from './daily-sales-comparison';

// Sub-component exports
export { SalesComparisonError } from './components/sales-comparison-error';
export { SalesComparisonHeader } from './components/sales-comparison-header';
export { SalesComparisonSkeleton } from './components/sales-comparison-skeleton';
export { SalesDayCard } from './components/sales-day-card';

// Type exports
export type { DailySalesComparisonProps, SalesComparisonHeaderProps, SalesDayCardProps, SalesDayData, ValidationResult } from './types';

// Utility function exports
export {
    convertProcessedChartDataToSalesData,
    formatDateForCard,
    formatSalesAmount,
    generateMockSalesData,
    generatePreviousDays,
    getDayLetter,
    validateDateRange,
    validateSalesDayData,
} from './utils';

// Shared utility imports
export { isSingleDaySelected } from '@/lib/utils/date-validation';
