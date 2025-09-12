import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WeeklyComparisonHeader } from './components/weekly-comparison-header';
import { SalesWeekCard } from './components/sales-week-card';
import type { WeeklySalesComparisonProps, SalesWeekData } from './types';
import { 
  isWorkWeekSelected, 
  generateWeekdays, 
  generateMockWeeklySalesData,
  validateWeeklySalesData,
  validateWeekDateRange
} from './utils';

// Performance: Pre-memoized header component to prevent unnecessary re-renders
const MemoizedWeeklyComparisonHeader = React.memo(WeeklyComparisonHeader);

// Performance: Memoized sales card component with proper comparison
const MemoizedSalesWeekCard = React.memo(SalesWeekCard, (prevProps, nextProps) => {
  // Custom comparison for better performance - only re-render if actual data changes
  return (
    prevProps.data.date.getTime() === nextProps.data.date.getTime() &&
    prevProps.data.amount === nextProps.data.amount &&
    prevProps.data.isCurrentWeek === nextProps.data.isCurrentWeek &&
    prevProps.data.dayName === nextProps.data.dayName
  );
});

/**
 * WeeklySalesComparison - Main component for displaying weekly sales comparison.
 * 
 * Shows a comparison of sales data for the selected work week (Monday through Friday).
 * Only renders when exactly one work week is selected in the date filter.
 * Uses mock data for development but can accept real sales data via props.
 * 
 * @component
 * @param {WeeklySalesComparisonProps} props - Component configuration props
 * @returns {JSX.Element | null} Weekly sales comparison interface or null if conditions not met
 * 
 * @description Key features:
 * - Conditional rendering based on work week selection (Monday to Friday)
 * - Automatic generation of weekday data from selected date range
 * - Highlighted card for current week sales
 * - Responsive card layout matching the weekly design pattern
 * - Accessibility-compliant structure with ARIA labels
 * - Support for both mock and real weekly sales data
 * - Runtime validation with development logging
 * - Mexican peso currency formatting
 * 
 * @example
 * ```tsx
 * // Basic usage with mock data
 * <WeeklySalesComparison 
 *   selectedDateRange={workWeekRange}
 * />
 * 
 * // With custom weekly sales data
 * <WeeklySalesComparison 
 *   selectedDateRange={workWeekRange}
 *   salesData={realWeeklySalesData}
 * />
 * ```
 */
export function WeeklySalesComparison({ 
  selectedDateRange, 
  salesData 
}: WeeklySalesComparisonProps) {
  // Performance: Memoize work week validation to avoid repeated calculations
  const isValidWorkWeek = React.useMemo(() => 
    isWorkWeekSelected(selectedDateRange), 
    [selectedDateRange]
  );

  // Extract the start date from the selected range
  const selectedStartDate = selectedDateRange?.from;
  
  // Performance: Generate weekdays with stable dependency to prevent unnecessary recalculations
  // Use date time value instead of date object reference for better memoization
  const weekdaysToShow = React.useMemo(() => {
    if (!selectedStartDate) return [];
    return generateWeekdays(selectedStartDate);
  }, [selectedStartDate?.getTime()]); // Use getTime() for stable dependency
  
  // Performance: Memoize salesData reference to avoid unnecessary regeneration
  const stableSalesData = React.useMemo(() => salesData, [salesData]);

  // Prepare the sales data for display with comprehensive validation
  // Priority: custom salesData prop > generated mock data > empty array
  // Performance: Optimize dependencies for better memoization
  const displayData = React.useMemo((): SalesWeekData[] => {
    // Return empty if not valid work week to avoid unnecessary processing
    if (!isValidWorkWeek) return [];
    
    let data: SalesWeekData[];
    
    if (stableSalesData) {
      // Use real sales data provided via props (production scenario)
      data = stableSalesData;
    } else {
      // Generate realistic mock data for development and testing
      // Only generate if weekdays are available
      if (weekdaysToShow.length === 0) return [];
      data = generateMockWeeklySalesData(weekdaysToShow);
    }
    
    // Performance: Skip validation in production for better performance
    if (process.env.NODE_ENV === 'development') {
      // Perform comprehensive runtime validation on the sales data
      // This catches data integrity issues and provides debugging information
      const validation = validateWeeklySalesData(data);
      
      // Log validation results in development for debugging
      if (!validation.isValid) {
        console.error('WeeklySalesComparison: Weekly sales data validation failed:', validation.errors);
      }
      if (validation.warnings.length > 0) {
        console.warn('WeeklySalesComparison: Weekly sales data warnings:', validation.warnings);
      }
      
      // In development, return empty array if validation fails to force fixes
      if (!validation.isValid) return [];
    }
    
    return data;
  }, [isValidWorkWeek, stableSalesData, weekdaysToShow]);

  // Performance: Only validate date range in development mode
  // Production skips validation for better performance
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && selectedDateRange) {
      // Validate the selected date range meets work week requirements
      const dateRangeValidation = validateWeekDateRange(selectedDateRange);
      
      if (!dateRangeValidation.isValid) {
        console.error('WeeklySalesComparison: Week date range validation failed:', dateRangeValidation.errors);
      }
      if (dateRangeValidation.warnings.length > 0) {
        console.warn('WeeklySalesComparison: Week date range warnings:', dateRangeValidation.warnings);
      }
    }
  }, [selectedDateRange]);

  // Early return for performance - avoid unnecessary computations if not valid work week
  // IMPORTANT: Must come after ALL hooks to avoid "hooks rule" violation
  if (!isValidWorkWeek) {
    return null;
  }

  // Note: Conditional rendering logic moved to early return for better performance

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {/* Header section - memoized for performance */}
        <MemoizedWeeklyComparisonHeader />
        
        {/* Weekly sales cards container - optimized rendering */}
        <div 
          className="space-y-2"
          role="region"
          aria-label="Comparación de ventas semanales"
        >
          {displayData.map((weekData) => (
            <MemoizedSalesWeekCard
              key={weekData.date.getTime()} // Unique key using timestamp
              data={weekData}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default WeeklySalesComparison;