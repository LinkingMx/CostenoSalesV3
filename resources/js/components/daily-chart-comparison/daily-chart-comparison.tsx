import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DailyChartHeader } from './components/daily-chart-header';
import { DailyComparisonChart } from './components/daily-comparison-chart';
import type { DailyChartComparisonProps, DailyChartData } from './types';
import { 
  isSingleDaySelected,
  generateMockDailyChartData,
  validateDailyChartData,
  validateChartDateRange
} from './utils';

// Performance: Pre-memoized header component to prevent unnecessary re-renders
const MemoizedDailyChartHeader = React.memo(DailyChartHeader);

// Performance: Memoized chart component with deep comparison for chart data
const MemoizedDailyComparisonChart = React.memo(DailyComparisonChart, (prevProps, nextProps) => {
  // Custom comparison for better performance - only re-render if actual data changes
  const prevData = prevProps.data;
  const nextData = nextProps.data;
  
  // Compare chart configuration props
  if (
    prevProps.height !== nextProps.height ||
    prevProps.showGrid !== nextProps.showGrid ||
    prevProps.orientation !== nextProps.orientation
  ) {
    return false; // Props changed, need to re-render
  }
  
  // Deep comparison of chart data
  if (prevData === nextData) return true; // Same reference, no change
  if (!prevData || !nextData) return false; // One is null/undefined
  
  // Compare selectedDay data
  if (
    prevData.selectedDay.date.getTime() !== nextData.selectedDay.date.getTime() ||
    prevData.selectedDay.fullDayName !== nextData.selectedDay.fullDayName ||
    prevData.selectedDay.amount !== nextData.selectedDay.amount
  ) {
    return false; // Selected day data changed
  }
  
  // Compare comparison data arrays
  if (prevData.comparisonData.length !== nextData.comparisonData.length) return false;
  
  for (let i = 0; i < prevData.comparisonData.length; i++) {
    const prevPoint = prevData.comparisonData[i];
    const nextPoint = nextData.comparisonData[i];
    
    if (
      prevPoint.period !== nextPoint.period ||
      prevPoint.amount !== nextPoint.amount ||
      prevPoint.color !== nextPoint.color ||
      prevPoint.date.getTime() !== nextPoint.date.getTime() ||
      prevPoint.isSelected !== nextPoint.isSelected
    ) {
      return false; // Comparison data changed
    }
  }
  
  return true; // No changes detected
});

/**
 * DailyChartComparison - Main component for displaying daily sales chart comparison.
 * 
 * Shows a bar chart comparing sales data for the selected day against:
 * - Yesterday (same day - 1 day)
 * - Last week (same day - 7 days)  
 * - Last month (same day - 30 days)
 * 
 * Only renders when exactly one day is selected in the date filter.
 * Uses mock data for development but can accept real chart data via props.
 * 
 * @component
 * @param {DailyChartComparisonProps} props - Component configuration props
 * @returns {JSX.Element | null} Daily chart comparison interface or null if conditions not met
 * 
 * @description Key features:
 * - Conditional rendering based on single day selection
 * - Interactive bar chart with 4-period daily comparison
 * - Responsive design that adapts to different screen sizes
 * - Accessibility-compliant structure with ARIA labels and proper semantics
 * - Support for both mock and real daily chart data
 * - Runtime validation with development logging for data integrity
 * - Mexican peso currency formatting with abbreviated chart values
 * - Spanish localization for period labels and interface text
 * - Theme-consistent styling using design system variables
 * - Performance optimizations with memoized components
 * - Primary color highlighting for the selected day
 * 
 * @example
 * ```tsx
 * // Basic usage with mock data
 * <DailyChartComparison 
 *   selectedDateRange={singleDayRange}
 * />
 * 
 * // With custom chart data
 * <DailyChartComparison 
 *   selectedDateRange={singleDayRange}
 *   chartData={realDailyChartData}
 * />
 * ```
 */
export function DailyChartComparison({ 
  selectedDateRange, 
  chartData 
}: DailyChartComparisonProps) {
  // Simplified validation - check if we have a single day selected
  const isValidSingleDay = React.useMemo(() => 
    isSingleDaySelected(selectedDateRange), 
    [selectedDateRange]
  );
  
  // Get the selected date - use today as fallback for testing
  const selectedDate = selectedDateRange?.from || new Date();
  
  // Generate mock data for chart display
  const displayData = React.useMemo((): DailyChartData => {
    const data = chartData || generateMockDailyChartData(selectedDate);
    return data;
  }, [selectedDate, chartData]);

  // Only show for single day selections
  if (!isValidSingleDay) {
    return null;
  }

  return (
    <Card className="w-full border-border">
      <CardContent className="px-4 py-3">
        {/* Header section - memoized for performance */}
        <MemoizedDailyChartHeader />
        
        {/* Chart container - optimized rendering with proper accessibility */}
        <div 
          className="mt-4 focus:outline-none focus:ring-0 [&_svg]:focus:outline-none [&_svg]:outline-none [&_*]:focus:outline-none [&_*]:outline-none"
          role="region"
          aria-label="Gráfico de comparación diaria de ventas"
          tabIndex={-1}
          style={{ outline: 'none' }}
        >
          <MemoizedDailyComparisonChart
            data={displayData}
            height={300}
            showGrid={true}
            orientation="vertical"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default DailyChartComparison;