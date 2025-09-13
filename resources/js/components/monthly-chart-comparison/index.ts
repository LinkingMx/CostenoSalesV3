/**
 * Monthly Chart Comparison Component Exports
 *
 * Provides centralized exports for the monthly chart comparison component and its related types.
 * This component displays a line chart comparing sales data for a selected complete month against
 * the previous month and two months ago for comprehensive 3-month analysis.
 *
 * @module MonthlyChartComparison
 * @description
 * Key features:
 * - Complete month selection requirement (conditional rendering)
 * - 3-month comparison: Selected Month, Previous Month, Two Months Ago
 * - Responsive multi-line chart with Recharts
 * - Spanish localization and Mexican peso formatting
 * - Theme-consistent styling with primary color emphasis
 * - Performance optimizations with memoized components
 * - Comprehensive data validation in development mode
 * - Accessibility-compliant structure with ARIA labels
 * - Days of month (1-31) on X-axis with proper month length handling
 * - Interactive tooltips with detailed month information
 *
 * @example
 * ```tsx
 * import { MonthlyChartComparison } from '@/components/monthly-chart-comparison';
 *
 * <MonthlyChartComparison
 *   selectedDateRange={completeMonthRange}
 *   chartData={customData}
 * />
 * ```
 */

// Main component export
export { MonthlyChartComparison, default as MonthlyChartComparisonDefault } from './monthly-chart-comparison';

// Subcomponent exports for advanced usage
export { MonthlyChartHeader } from './components/monthly-chart-header';
export { MonthlyComparisonChart } from './components/monthly-comparison-chart';

// Type exports for TypeScript integration
export type {
  MonthlyChartData,
  MonthlyDataPoint,
  MonthlyChartComparisonProps,
  MonthlyComparisonChartProps,
  MonthlyChartHeaderProps,
  ChartValidationResult,
  MonthlyChartTheme
} from './types';

// Utility function exports for advanced integration
export {
  isCompleteMonthSelected,
  formatMonthLabel,
  formatMonthShortLabel,
  formatChartAmount,
  generateMockMonthlyChartData,
  validateMonthlyChartData,
  getDefaultMonthlyChartTheme,
  validateChartDateRange
} from './utils';