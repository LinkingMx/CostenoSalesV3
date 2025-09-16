/**
 * Daily Chart Comparison Component Exports
 *
 * Provides centralized exports for the daily chart comparison component and its related types.
 * This component displays a bar chart comparing sales data for a selected day against
 * yesterday, last week, and last month for the same day.
 *
 * @module DailyChartComparison
 * @description
 * Key features:
 * - Single day selection requirement (conditional rendering)
 * - 4-period comparison: Today, Yesterday, Last Week, Last Month
 * - Responsive vertical bar chart with Recharts
 * - Spanish localization and Mexican peso formatting
 * - Theme-consistent styling with primary color emphasis
 * - Performance optimizations with memoized components
 * - Comprehensive data validation in development mode
 * - Accessibility-compliant structure with ARIA labels
 *
 * @example
 * ```tsx
 * import { DailyChartComparison } from '@/components/daily-chart-comparison';
 *
 * <DailyChartComparison
 *   selectedDateRange={singleDayRange}
 *   chartData={customData}
 * />
 * ```
 */

// Main component export
export { DailyChartComparison, default as DailyChartComparisonDefault } from './daily-chart-comparison';

// Subcomponent exports for advanced usage
export { DailyChartError } from './components/daily-chart-error';
export { DailyChartHeader } from './components/daily-chart-header';
export { DailyChartSkeleton } from './components/daily-chart-skeleton';
export { DailyComparisonChart } from './components/daily-comparison-chart';

// Type exports for TypeScript integration
export type {
    ChartPoint,
    ChartValidationResult,
    DailyChartComparisonProps,
    DailyChartData,
    DailyChartErrorProps,
    DailyChartHeaderProps,
    DailyChartTheme,
    DailyComparisonChartProps,
} from './types';

// Utility function exports for advanced integration
export {
    convertApiDataToChartData,
    formatChartAmount,
    generateMockDailyChartData,
    getDefaultDailyChartTheme,
    validateChartDateRange,
    validateDailyChartData,
} from './utils';

// Shared utility imports
export { formatFullDayName } from '@/lib/utils/currency-formatting';
export { isSingleDaySelected } from '@/lib/utils/date-validation';
