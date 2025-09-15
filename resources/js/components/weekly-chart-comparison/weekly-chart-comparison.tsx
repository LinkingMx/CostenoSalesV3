import * as React from 'react';
import { WeeklyChartHeader } from './components/weekly-chart-header';
import { WeeklyComparisonChart } from './components/weekly-comparison-chart';
import { WeeklyChartError } from './components/weekly-chart-error';
import { WeeklyChartSkeleton } from './components/weekly-chart-skeleton';
import { useWeeklyChartContext } from '@/contexts/weekly-chart-context';
import type { WeeklyChartComparisonProps } from './types';
import { isCompleteWeekSelected } from './utils';

// Weekly chart comparison component optimized for performance

// Performance: Pre-memoized header component to prevent unnecessary re-renders
const MemoizedWeeklyChartHeader = React.memo(WeeklyChartHeader);

// Performance: Memoized chart component with deep comparison for chart data
const MemoizedWeeklyComparisonChart = React.memo(WeeklyComparisonChart, (prevProps, nextProps) => {
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
      prevDay.dayName !== nextDay.dayName ||
      prevDay.fullDayName !== nextDay.fullDayName ||
      prevDay.week1 !== nextDay.week1 ||
      prevDay.week2 !== nextDay.week2 ||
      prevDay.week3 !== nextDay.week3
    ) {
      return false; // Data changed
    }
  }
  
  // Compare week labels and colors
  if (
    JSON.stringify(prevData.weekLabels) !== JSON.stringify(nextData.weekLabels) ||
    JSON.stringify(prevData.weekColors) !== JSON.stringify(nextData.weekColors)
  ) {
    return false; // Labels or colors changed
  }
  
  return true; // No changes detected
});

/**
 * WeeklyChartComparison - Main component for displaying weekly sales chart comparison.
 *
 * Shows a line chart comparing daily sales data across 3 weeks for the selected complete week.
 * Only renders when exactly one complete week (7 consecutive days) is selected in the date filter.
 * Uses real API data through the WeeklyChartProvider context.
 *
 * @component
 * @param {WeeklyChartComparisonProps} props - Component configuration props
 * @returns {JSX.Element | null} Weekly chart comparison interface or null if conditions not met
 *
 * @description Key features:
 * - Real-time API data integration through context provider
 * - Elegant loading states with skeleton animation
 * - Comprehensive error handling with retry functionality
 * - Conditional rendering based on complete week selection
 * - Interactive line chart with 3-week daily sales comparison
 * - Responsive design that adapts to different screen sizes
 * - Accessibility-compliant structure with ARIA labels
 * - Mexican peso currency formatting with chart values
 * - Spanish localization for all interface text
 * - Theme-consistent styling using design system variables
 * - Performance optimizations with memoized components
 *
 * @example
 * ```tsx
 * // Usage within WeeklyChartProvider context
 * <WeeklyChartProvider selectedDateRange={dateRange}>
 *   <WeeklyChartComparison selectedDateRange={dateRange} />
 * </WeeklyChartProvider>
 * ```
 */
export const WeeklyChartComparison = React.memo(function WeeklyChartComparison({
  selectedDateRange
}: WeeklyChartComparisonProps) {
  // Get shared data from context
  const { data, isLoading, error, refetch, isValidForWeeklyChart } = useWeeklyChartContext();


  // Performance: Memoize complete week validation to avoid repeated calculations
  const isValidCompleteWeek = React.useMemo(() =>
    isCompleteWeekSelected(selectedDateRange),
    [selectedDateRange]
  );

  // Early return for performance - avoid unnecessary computations if not valid complete week
  // IMPORTANT: Must come after ALL hooks to avoid "hooks rule" violation
  if (!isValidCompleteWeek || !isValidForWeeklyChart) {
    return null;
  }

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return <WeeklyChartSkeleton height={300} />;
  }

  // Show error state with retry option
  if (error) {
    return (
      <WeeklyChartError
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
        <MemoizedWeeklyChartHeader />
      </div>

      {/* Chart container - optimized rendering with proper accessibility */}
      <div
        className="focus:outline-none focus:ring-0 [&_svg]:focus:outline-none [&_svg]:outline-none [&_*]:focus:outline-none [&_*]:outline-none"
        role="region"
        aria-label="Gráfico de comparación semanal de ventas"
        tabIndex={-1}
        style={{ outline: 'none' }}
      >
        <MemoizedWeeklyComparisonChart
          data={data}
          height={225}
          showLegend={true}
          showGrid={true}
        />
      </div>
    </div>
  );
});

export default WeeklyChartComparison;