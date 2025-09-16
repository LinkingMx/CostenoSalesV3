/**
 * Weekly Chart Comparison Component Exports
 *
 * This module provides a comprehensive weekly sales chart comparison system
 * for displaying 3-week daily sales data in an interactive line chart format.
 *
 * @module WeeklyChartComparison
 */

// Main component export
export { WeeklyChartComparison, default } from './weekly-chart-comparison';

// Sub-component exports for advanced usage
export { WeeklyChartHeader } from './components/weekly-chart-header';
export { WeeklyComparisonChart } from './components/weekly-comparison-chart';

// Type exports for TypeScript integration
export type {
    ChartDayData,
    ChartTheme,
    ChartValidationResult,
    WeeklyChartComparisonProps,
    WeeklyChartData,
    WeeklyChartHeaderProps,
    WeeklyComparisonChartProps,
} from './types';

// Utility function exports for external usage
export {
    formatChartAmount,
    generateMockWeeklyChartData,
    getDefaultChartTheme,
    getFullSpanishDayNames,
    getSpanishDayNames,
    isCompleteWeekSelected,
    validateChartDateRange,
    validateWeeklyChartData,
} from './utils';
