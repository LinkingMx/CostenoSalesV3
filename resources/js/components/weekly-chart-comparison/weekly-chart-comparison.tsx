import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WeeklyChartHeader } from './components/weekly-chart-header';
import { WeeklyComparisonChart } from './components/weekly-comparison-chart';
import type { WeeklyChartComparisonProps, WeeklyChartData } from './types';
import { 
  isCompleteWeekSelected,
  generateMockWeeklyChartData,
  validateWeeklyChartData,
  validateChartDateRange
} from './utils';

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
 * Uses mock data for development but can accept real chart data via props.
 * 
 * @component
 * @param {WeeklyChartComparisonProps} props - Component configuration props
 * @returns {JSX.Element | null} Weekly chart comparison interface or null if conditions not met
 * 
 * @description Key features:
 * - Conditional rendering based on complete week selection (Monday to Sunday or Sunday to Saturday)
 * - Interactive line chart with 3-week daily sales comparison
 * - Responsive design that adapts to different screen sizes
 * - Accessibility-compliant structure with ARIA labels and proper semantics
 * - Support for both mock and real weekly chart data
 * - Runtime validation with development logging for data integrity
 * - Mexican peso currency formatting with abbreviated chart values
 * - Spanish localization for day names and interface text
 * - Theme-consistent styling using design system variables
 * - Performance optimizations with memoized components
 * 
 * @example
 * ```tsx
 * // Basic usage with mock data
 * <WeeklyChartComparison 
 *   selectedDateRange={completeWeekRange}
 * />
 * 
 * // With custom chart data
 * <WeeklyChartComparison 
 *   selectedDateRange={completeWeekRange}
 *   chartData={realWeeklyChartData}
 * />
 * ```
 */
export function WeeklyChartComparison({ 
  selectedDateRange, 
  chartData 
}: WeeklyChartComparisonProps) {
  // Performance: Memoize complete week validation to avoid repeated calculations
  const isValidCompleteWeek = React.useMemo(() => 
    isCompleteWeekSelected(selectedDateRange), 
    [selectedDateRange]
  );
  
  // Performance: Memoize chartData reference to avoid unnecessary regeneration
  const stableChartData = React.useMemo(() => chartData, [chartData]);

  // Prepare the chart data for display with comprehensive validation
  // Priority: custom chartData prop > generated mock data > empty state
  // Performance: Optimize dependencies for better memoization
  const displayData = React.useMemo((): WeeklyChartData | null => {
    // Return null if not valid complete week to avoid unnecessary processing
    if (!isValidCompleteWeek) return null;
    
    let data: WeeklyChartData;
    
    if (stableChartData) {
      // Use real chart data provided via props (production scenario)
      data = stableChartData;
    } else {
      // Generate realistic mock data for development and testing
      data = generateMockWeeklyChartData();
    }
    
    // Performance: Skip validation in production for better performance
    if (process.env.NODE_ENV === 'development') {
      // Perform comprehensive runtime validation on the chart data
      // This catches data integrity issues and provides debugging information
      const validation = validateWeeklyChartData(data);
      
      // Log validation results in development for debugging
      if (!validation.isValid) {
        console.error('WeeklyChartComparison: Chart data validation failed:', validation.errors);
      }
      if (validation.warnings.length > 0) {
        console.warn('WeeklyChartComparison: Chart data warnings:', validation.warnings);
      }
      
      // In development, return null if validation fails to force fixes
      if (!validation.isValid) return null;
    }
    
    return data;
  }, [isValidCompleteWeek, stableChartData]);

  // Performance: Only validate date range in development mode
  // Production skips validation for better performance
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && selectedDateRange) {
      // Validate the selected date range meets complete week requirements
      const dateRangeValidation = validateChartDateRange(selectedDateRange);
      
      if (!dateRangeValidation.isValid) {
        console.error('WeeklyChartComparison: Chart date range validation failed:', dateRangeValidation.errors);
      }
      if (dateRangeValidation.warnings.length > 0) {
        console.warn('WeeklyChartComparison: Chart date range warnings:', dateRangeValidation.warnings);
      }
    }
  }, [selectedDateRange]);

  // Early return for performance - avoid unnecessary computations if not valid complete week
  // IMPORTANT: Must come after ALL hooks to avoid "hooks rule" violation
  if (!isValidCompleteWeek || !displayData) {
    return null;
  }

  return (
    <Card className="w-full border-border">
      <CardContent className="px-4 py-3">
        {/* Header section - memoized for performance */}
        <MemoizedWeeklyChartHeader />
        
        {/* Chart container - optimized rendering with proper accessibility */}
        <div 
          className="mt-4 focus:outline-none focus:ring-0 [&_svg]:focus:outline-none [&_svg]:outline-none [&_*]:focus:outline-none [&_*]:outline-none"
          role="region"
          aria-label="Gráfico de comparación semanal de ventas"
          tabIndex={-1}
          style={{ outline: 'none' }}
        >
          <MemoizedWeeklyComparisonChart
            data={displayData}
            height={300}
            showLegend={true}
            showGrid={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default WeeklyChartComparison;