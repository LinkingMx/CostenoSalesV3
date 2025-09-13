import * as React from 'react';
import type { DateRange } from '@/components/main-filter-calendar';
import type { MonthlyChartData } from '../types';
import { validateMonthlyChartData, validateChartDateRange } from '../utils';

/**
 * Unified validation hook for monthly chart comparison component.
 * Consolidates all validation logic in a single, reusable hook.
 */
export function useMonthlyValidation(
  selectedDateRange: DateRange | undefined,
  chartData?: MonthlyChartData
) {
  // Validate chart data only in development mode
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && chartData) {
      const validation = validateMonthlyChartData(chartData);

      if (!validation.isValid) {
        console.error('MonthlyChartComparison: Monthly chart data validation failed:', validation.errors);
      }
      if (validation.warnings.length > 0) {
        console.warn('MonthlyChartComparison: Monthly chart data warnings:', validation.warnings);
      }
    }
  }, [chartData]);

  // Validate date range only in development mode
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && selectedDateRange) {
      const dateRangeValidation = validateChartDateRange(selectedDateRange);

      if (!dateRangeValidation.isValid) {
        console.error('MonthlyChartComparison: Month date range validation failed:', dateRangeValidation.errors);
      }
      if (dateRangeValidation.warnings.length > 0) {
        console.warn('MonthlyChartComparison: Month date range warnings:', dateRangeValidation.warnings);
      }
    }
  }, [selectedDateRange]);

  return {
    // Could return validation results here if needed for UI feedback
    // For now, just provides centralized validation side effects
  };
}