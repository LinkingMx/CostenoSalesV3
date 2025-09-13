import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MonthlyChartHeader } from './components/monthly-chart-header';
import { MonthlyComparisonChart } from './components/monthly-comparison-chart';
import type { MonthlyChartComparisonProps, MonthlyChartData } from './types';
import {
  isCompleteMonthSelected,
  generateMockMonthlyChartData
} from './utils';
import { useMonthlyValidation } from './hooks/use-monthly-validation';

// Performance: Pre-memoized header component to prevent unnecessary re-renders
const MemoizedMonthlyChartHeader = React.memo(MonthlyChartHeader);

// Performance: Memoized chart component with simplified comparison
const MemoizedMonthlyComparisonChart = React.memo(MonthlyComparisonChart);

/**
 * MonthlyChartComparison - Main component for displaying monthly sales chart comparison.
 *
 * Shows a line chart comparing sales data for the selected complete month against:
 * - Previous month (same days - 1 month)
 * - Two months ago (same days - 2 months)
 *
 * Only renders when exactly one complete month is selected in the date filter.
 * Uses mock data for development but can accept real chart data via props.
 *
 * @component
 * @param {MonthlyChartComparisonProps} props - Component configuration props
 * @returns {JSX.Element | null} Monthly chart comparison interface or null if conditions not met
 *
 * @description Key features:
 * - Conditional rendering based on complete month selection
 * - Interactive line chart with 3-month daily comparison
 * - Responsive design that adapts to different screen sizes
 * - Accessibility-compliant structure with ARIA labels and proper semantics
 * - Support for both mock and real monthly chart data
 * - Runtime validation with development logging for data integrity
 * - Mexican peso currency formatting with abbreviated chart values
 * - Spanish localization for month labels and interface text
 * - Theme-consistent styling using design system variables
 * - Performance optimizations with memoized components
 * - Primary color highlighting for the selected month
 * - Days of month (1-31) on X-axis with proper month length handling
 *
 * @example
 * ```tsx
 * // Basic usage with mock data
 * <MonthlyChartComparison
 *   selectedDateRange={completeMonthRange}
 * />
 *
 * // With custom chart data
 * <MonthlyChartComparison
 *   selectedDateRange={completeMonthRange}
 *   chartData={realMonthlyChartData}
 * />
 * ```
 */
export function MonthlyChartComparison({
  selectedDateRange,
  chartData
}: MonthlyChartComparisonProps) {
  // Simplified validation - check if we have a complete month selected
  const isValidCompleteMonth = React.useMemo(() =>
    isCompleteMonthSelected(selectedDateRange),
    [selectedDateRange]
  );

  // Get the selected month - use current month as fallback for testing
  const selectedMonth = selectedDateRange?.from || new Date();

  // Generate mock data for chart display using primitive dependencies
  const selectedMonthTime = selectedMonth.getTime();

  const displayData = React.useMemo((): MonthlyChartData => {
    if (!isValidCompleteMonth) {
      // Return empty data if not a valid complete month
      return {
        monthlyData: [],
        selectedMonth: new Date()
      };
    }

    const monthFromTime = new Date(selectedMonthTime);
    return chartData || generateMockMonthlyChartData(monthFromTime);
  }, [selectedMonthTime, chartData, isValidCompleteMonth]);

  // Centralized validation using custom hook
  useMonthlyValidation(selectedDateRange, displayData);


  // Only show for complete month selections
  if (!isValidCompleteMonth) {
    return null;
  }

  return (
    <Card className="w-full border-border">
      <CardContent className="px-4 py-3">
        {/* Header section - memoized for performance */}
        <MemoizedMonthlyChartHeader />

        {/* Chart container - optimized rendering with proper accessibility */}
        <div
          className="mt-4 focus:outline-none focus:ring-0 [&_svg]:focus:outline-none [&_svg]:outline-none [&_*]:focus:outline-none [&_*]:outline-none"
          role="region"
          aria-label="Gráfico de comparación mensual de ventas"
          tabIndex={-1}
          style={{ outline: 'none' }}
        >
          <MemoizedMonthlyComparisonChart
            data={displayData}
            height={300}
            showGrid={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default MonthlyChartComparison;