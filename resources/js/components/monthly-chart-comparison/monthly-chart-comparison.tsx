/**
 * Monthly Chart Comparison Component
 * Main component for displaying monthly sales chart comparison
 */

import * as React from 'react';
import { MonthlyChartHeader } from './components/monthly-chart-header';
import { MonthlyComparisonChart } from './components/monthly-comparison-chart';
import { MonthlyChartError } from './components/monthly-chart-error';
import { MonthlyChartSkeleton } from './components/monthly-chart-skeleton';
import { useMonthlyChartContext } from '@/contexts/monthly-chart-context';
import type { MonthlyChartComparisonProps } from './types';
import { isCompleteMonthSelected } from './utils';

// Performance: Pre-memoized header component to prevent unnecessary re-renders
const MemoizedMonthlyChartHeader = React.memo(MonthlyChartHeader);

// Performance: Memoized chart component with deep comparison for chart data
const MemoizedMonthlyComparisonChart = React.memo(MonthlyComparisonChart, (prevProps, nextProps) => {
  // Custom comparison for better performance - only re-render if actual data changes
  const prevData = prevProps.data;
  const nextData = nextProps.data;

  // Compare chart configuration props
  if (
    prevProps.height !== nextProps.height ||
    prevProps.showLegend !== nextProps.showLegend ||
    prevProps.showGrid !== nextProps.showGrid
  ) {
    return false; // Props changed, need to re-render
  }

  // Deep comparison of chart data
  if (prevData === nextData) return true; // Same reference, no change
  if (!prevData || !nextData) return false; // One is null/undefined

  // Compare daily data arrays
  if (prevData.dailyData.length !== nextData.dailyData.length) return false;

  for (let i = 0; i < prevData.dailyData.length; i++) {
    const prevDay = prevData.dailyData[i];
    const nextDay = nextData.dailyData[i];

    if (
      prevDay.dayNumber !== nextDay.dayNumber ||
      prevDay.dayLabel !== nextDay.dayLabel ||
      prevDay.month1 !== nextDay.month1 ||
      prevDay.month2 !== nextDay.month2 ||
      prevDay.month3 !== nextDay.month3
    ) {
      return false; // Data changed
    }
  }

  // Compare month labels and colors
  if (
    JSON.stringify(prevData.monthLabels) !== JSON.stringify(nextData.monthLabels) ||
    JSON.stringify(prevData.monthColors) !== JSON.stringify(nextData.monthColors) ||
    JSON.stringify(prevData.legendLabels) !== JSON.stringify(nextData.legendLabels)
  ) {
    return false; // Labels or colors changed
  }

  return true; // No changes detected
});

/**
 * MonthlyChartComparison - Main component for displaying monthly sales chart comparison.
 *
 * Shows a line chart comparing daily sales data across 3 consecutive months.
 * Only renders when exactly one complete month (first to last day) is selected in the date filter.
 * Uses real API data through the MonthlyChartProvider context.
 *
 * @component
 * @param {MonthlyChartComparisonProps} props - Component configuration props
 * @returns {JSX.Element | null} Monthly chart comparison interface or null if conditions not met
 *
 * @description Key features:
 * - Real-time API data integration through context provider
 * - Elegant loading states with skeleton animation
 * - Comprehensive error handling with retry functionality
 * - Conditional rendering based on complete month selection
 * - Interactive line chart with 3-month daily sales comparison
 * - Shows up to 31 days with simulated daily patterns
 * - Responsive design that adapts to different screen sizes
 * - Accessibility-compliant structure with ARIA labels
 * - Mexican peso currency formatting with chart values
 * - Spanish localization for all interface text
 * - Theme-consistent styling using design system variables
 * - Performance optimizations with memoized components
 *
 * @example
 * ```tsx
 * // Usage within MonthlyChartProvider context
 * <MonthlyChartProvider selectedDateRange={dateRange}>
 *   <MonthlyChartComparison selectedDateRange={dateRange} />
 * </MonthlyChartProvider>
 * ```
 */
export const MonthlyChartComparison = React.memo(function MonthlyChartComparison({
  selectedDateRange
}: MonthlyChartComparisonProps) {
  // Get shared data from context
  const { data, isLoading, error, refetch, isValidForMonthlyChart } = useMonthlyChartContext();

  // Performance: Memoize complete month validation to avoid repeated calculations
  const isValidCompleteMonth = React.useMemo(() =>
    isCompleteMonthSelected(selectedDateRange),
    [selectedDateRange]
  );

  // Early return for performance - avoid unnecessary computations if not valid complete month
  // IMPORTANT: Must come after ALL hooks to avoid "hooks rule" violation
  if (!isValidCompleteMonth || !isValidForMonthlyChart) {
    return null;
  }

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return <MonthlyChartSkeleton height={300} />;
  }

  // Show error state with retry option
  if (error) {
    return (
      <MonthlyChartError
        message={error}
        onRetry={refetch}
        isRetrying={isLoading}
      />
    );
  }

  // Show nothing if no data available
  if (!data) {
    return null;
  }

  return (
    <div className="w-full rounded-xl bg-card border border-border p-6">
      {/* Header section - memoized for performance */}
      <div className="mb-6">
        <MemoizedMonthlyChartHeader />
      </div>

      {/* Chart container - optimized rendering with proper accessibility */}
      <div
        className="focus:outline-none focus:ring-0 [&_svg]:focus:outline-none [&_svg]:outline-none [&_*]:focus:outline-none [&_*]:outline-none"
        role="region"
        aria-label="Gráfico de comparación mensual de ventas"
        tabIndex={-1}
        style={{ outline: 'none' }}
      >
        <MemoizedMonthlyComparisonChart
          data={data}
          height={225}
          showLegend={true}
          showGrid={true}
        />
      </div>
    </div>
  );
});

export default MonthlyChartComparison;