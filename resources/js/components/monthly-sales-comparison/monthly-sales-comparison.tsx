import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MonthlyComparisonHeader } from './components/monthly-comparison-header';
import { SalesMonthCard } from './components/sales-month-card';
import type { MonthlySalesComparisonProps, SalesMonthData } from './types';
import { 
  isCompleteMonthSelected, 
  generateMonthDays, 
  generateMockMonthlySalesData,
  validateMonthlySalesData,
  validateMonthDateRange
} from './utils';

// Performance: Pre-memoized header component to prevent unnecessary re-renders
const MemoizedMonthlyComparisonHeader = React.memo(MonthlyComparisonHeader);

// Performance: Memoized sales card component with proper comparison
const MemoizedSalesMonthCard = React.memo(SalesMonthCard, (prevProps, nextProps) => {
  // Custom comparison for better performance - only re-render if actual data changes
  return (
    prevProps.data.date.getTime() === nextProps.data.date.getTime() &&
    prevProps.data.amount === nextProps.data.amount &&
    prevProps.data.isCurrentMonth === nextProps.data.isCurrentMonth &&
    prevProps.data.monthName === nextProps.data.monthName
  );
});

/**
 * MonthlySalesComparison - Main component for displaying monthly sales comparison.
 * 
 * Shows a comparison of sales data for the selected complete month (first day to last day).
 * Only renders when exactly one complete month is selected in the date filter.
 * Uses mock data for development but can accept real sales data via props.
 * 
 * @component
 * @param {MonthlySalesComparisonProps} props - Component configuration props
 * @returns {JSX.Element | null} Monthly sales comparison interface or null if conditions not met
 * 
 * @description Key features:
 * - Conditional rendering based on complete month selection (first to last day)
 * - Automatic generation of monthly data from selected date range
 * - Highlighted card for current month sales
 * - Responsive card layout matching the weekly design pattern
 * - Accessibility-compliant structure with ARIA labels
 * - Support for both mock and real monthly sales data
 * - Runtime validation with development logging
 * - Mexican peso currency formatting
 * 
 * @example
 * ```tsx
 * // Basic usage with mock data
 * <MonthlySalesComparison 
 *   selectedDateRange={completeMonthRange}
 * />
 * 
 * // With custom monthly sales data
 * <MonthlySalesComparison 
 *   selectedDateRange={completeMonthRange}
 *   salesData={realMonthlySalesData}
 * />
 * ```
 */
export function MonthlySalesComparison({ 
  selectedDateRange, 
  salesData 
}: MonthlySalesComparisonProps) {
  // Performance: Memoize complete month validation to avoid repeated calculations
  const isValidCompleteMonth = React.useMemo(() => 
    isCompleteMonthSelected(selectedDateRange), 
    [selectedDateRange]
  );

  // Extract the start date from the selected range
  const selectedStartDate = selectedDateRange?.from;
  
  // Performance: Generate month days with stable dependency to prevent unnecessary recalculations
  // Use date time value instead of date object reference for better memoization
  const monthDaysToShow = React.useMemo(() => {
    if (!selectedStartDate) return [];
    return generateMonthDays(selectedStartDate);
  }, [selectedStartDate]); // Use selectedStartDate directly
  
  // Performance: Memoize salesData reference to avoid unnecessary regeneration
  const stableSalesData = React.useMemo(() => salesData, [salesData]);

  // Prepare the sales data for display with comprehensive validation
  // Priority: custom salesData prop > generated mock data > empty array
  // Performance: Optimize dependencies for better memoization
  const displayData = React.useMemo((): SalesMonthData[] => {
    // Return empty if not valid complete month to avoid unnecessary processing
    if (!isValidCompleteMonth) return [];
    
    let data: SalesMonthData[];
    
    if (stableSalesData) {
      // Use real sales data provided via props (production scenario)
      data = stableSalesData;
    } else {
      // Generate realistic mock data for development and testing
      // Only generate if month days are available
      if (monthDaysToShow.length === 0) return [];
      data = generateMockMonthlySalesData(monthDaysToShow);
    }
    
    // Performance: Skip validation in production for better performance
    if (process.env.NODE_ENV === 'development') {
      // Perform comprehensive runtime validation on the sales data
      // This catches data integrity issues and provides debugging information
      const validation = validateMonthlySalesData(data);
      
      // Log validation results in development for debugging
      if (!validation.isValid) {
        console.error('MonthlySalesComparison: Monthly sales data validation failed:', validation.errors);
      }
      if (validation.warnings.length > 0) {
        console.warn('MonthlySalesComparison: Monthly sales data warnings:', validation.warnings);
      }
      
      // In development, return empty array if validation fails to force fixes
      if (!validation.isValid) return [];
    }
    
    return data;
  }, [isValidCompleteMonth, stableSalesData, monthDaysToShow]);

  // Performance: Only validate date range in development mode
  // Production skips validation for better performance
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && selectedDateRange) {
      // Validate the selected date range meets complete month requirements
      const dateRangeValidation = validateMonthDateRange(selectedDateRange);
      
      if (!dateRangeValidation.isValid) {
        console.error('MonthlySalesComparison: Month date range validation failed:', dateRangeValidation.errors);
      }
      if (dateRangeValidation.warnings.length > 0) {
        console.warn('MonthlySalesComparison: Month date range warnings:', dateRangeValidation.warnings);
      }
    }
  }, [selectedDateRange]);

  // Early return for performance - avoid unnecessary computations if not valid complete month
  // IMPORTANT: Must come after ALL hooks to avoid "hooks rule" violation
  if (!isValidCompleteMonth) {
    return null;
  }

  // Note: Conditional rendering logic moved to early return for better performance

  return (
    <Card className="w-full">
      <CardContent className="px-4 py-3">
        {/* Header section - memoized for performance */}
        <MemoizedMonthlyComparisonHeader />
        
        {/* Monthly sales cards container - optimized rendering */}
        <div 
          className="space-y-2"
          role="region"
          aria-label="Comparación de ventas mensuales"
        >
          {displayData.map((monthData) => (
            <MemoizedSalesMonthCard
              key={monthData.date.getTime()} // Unique key using timestamp
              data={monthData}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default MonthlySalesComparison;