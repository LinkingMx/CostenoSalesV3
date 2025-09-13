/**
 * Weekly Chart Comparison Component Exports
 * 
 * This module provides a comprehensive weekly sales chart comparison system
 * for displaying 3-week daily sales data in an interactive line chart format.
 * 
 * @module WeeklyChartComparison
 */

// Main component export
export { WeeklyChartComparison } from './weekly-chart-comparison';
export { default } from './weekly-chart-comparison';

// Sub-component exports for advanced usage
export { WeeklyChartHeader } from './components/weekly-chart-header';
export { WeeklyComparisonChart } from './components/weekly-comparison-chart';

// Type exports for TypeScript integration
export type {
  ChartDayData,
  WeeklyChartData,
  WeeklyChartComparisonProps,
  WeeklyComparisonChartProps,
  WeeklyChartHeaderProps,
  ChartValidationResult,
  ChartTheme
} from './types';

// Utility function exports for external usage
export {
  isCompleteWeekSelected,
  getSpanishDayNames,
  getFullSpanishDayNames,
  formatChartAmount,
  generateMockWeeklyChartData,
  validateWeeklyChartData,
  validateChartDateRange,
  getDefaultChartTheme
} from './utils';