/**
 * Monthly Chart Comparison Component Exports
 *
 * Provides centralized exports for the monthly chart comparison component and its related types.
 * This component displays a bar chart comparing monthly sales totals across 3 consecutive months.
 *
 * @module MonthlyChartComparison
 */

// Main component export
export { MonthlyChartComparison, default } from './monthly-chart-comparison';

// Subcomponent exports for advanced usage
export { MonthlyChartError } from './components/monthly-chart-error';
export { MonthlyChartHeader } from './components/monthly-chart-header';
export { MonthlyChartSkeleton } from './components/monthly-chart-skeleton';
export { MonthlyComparisonChart } from './components/monthly-comparison-chart';

// Type exports for TypeScript integration
export type {
    MonthlyChartComparisonProps,
    MonthlyChartData,
    MonthlyChartErrorProps,
    MonthlyChartHeaderProps,
    MonthlyChartSkeletonProps,
    MonthlyChartValidationResult,
    MonthlyComparisonChartProps,
    ChartConfig,
} from './types';

// Utility function exports for advanced integration
export {
    SPANISH_MONTHS,
    formatChartAmount,
    generateMockMonthlyChartData,
    getDefaultChartTheme,
    isCompleteMonthSelected,
    validateMonthlyChartData,
} from './utils';
