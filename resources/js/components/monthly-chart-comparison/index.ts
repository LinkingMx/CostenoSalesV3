/**
 * Monthly Chart Comparison Component Exports
 *
 * Provides centralized exports for the monthly chart comparison component and its related types.
 * This component displays a line chart comparing daily sales data across 3 consecutive months.
 *
 * @module MonthlyChartComparison
 */

// Main component export
export { MonthlyChartComparison, default } from './monthly-chart-comparison';

// Subcomponent exports for advanced usage
export { MonthlyChartHeader } from './components/monthly-chart-header';
export { MonthlyComparisonChart } from './components/monthly-comparison-chart';
export { MonthlyChartSkeleton } from './components/monthly-chart-skeleton';
export { MonthlyChartError } from './components/monthly-chart-error';

// Type exports for TypeScript integration
export type {
  MonthlyChartData,
  ChartDayData,
  MonthlyChartComparisonProps,
  MonthlyComparisonChartProps,
  MonthlyChartHeaderProps,
  MonthlyChartSkeletonProps,
  MonthlyChartErrorProps,
  MonthlyChartValidationResult
} from './types';

// Utility function exports for advanced integration
export {
  isCompleteMonthSelected,
  generateMockMonthlyChartData,
  validateMonthlyChartData,
  formatChartAmount,
  getDefaultChartTheme,
  SPANISH_MONTHS
} from './utils';