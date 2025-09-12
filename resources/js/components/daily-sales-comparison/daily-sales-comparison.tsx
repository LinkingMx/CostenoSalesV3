import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SalesComparisonHeader } from './components/sales-comparison-header';
import { SalesDayCard } from './components/sales-day-card';
import type { DailySalesComparisonProps, SalesDayData } from './types';
import { 
  isSingleDaySelected, 
  generatePreviousDays, 
  generateMockSalesData,
  validateSalesDayData,
  validateDateRange
} from './utils';

/**
 * DailySalesComparison - Main component for displaying daily sales comparison.
 * 
 * Shows a comparison of sales data for the selected day plus the previous 3 days.
 * Only renders when exactly one day is selected in the date filter.
 * Uses mock data for development but can accept real sales data via props.
 * 
 * @component
 * @param {DailySalesComparisonProps} props - Component configuration props
 * @returns {JSX.Element | null} Sales comparison interface or null if conditions not met
 * 
 * @description Key features:
 * - Conditional rendering based on single day selection
 * - Automatic generation of previous days data
 * - Highlighted card for today's sales
 * - Responsive card layout matching the provided design
 * - Accessibility-compliant structure
 * - Support for both mock and real sales data
 * 
 * @example
 * ```tsx
 * // Basic usage with mock data
 * <DailySalesComparison 
 *   selectedDateRange={dateRange}
 * />
 * 
 * // With custom sales data
 * <DailySalesComparison 
 *   selectedDateRange={dateRange}
 *   salesData={realSalesData}
 * />
 * ```
 */
export function DailySalesComparison({ 
  selectedDateRange, 
  salesData 
}: DailySalesComparisonProps) {
  // Get the selected date (from and to are the same for single day)
  const selectedDate = selectedDateRange?.from;
  
  // Generate the dates to display (selected date + 3 previous days)
  const datesToShow = React.useMemo(() => 
    selectedDate ? generatePreviousDays(selectedDate) : [], 
    [selectedDate]
  );
  
  // Use provided sales data or generate mock data with validation
  const displayData = React.useMemo((): SalesDayData[] => {
    let data: SalesDayData[];
    
    if (salesData) {
      data = salesData;
    } else {
      // Generate mock data for development
      data = generateMockSalesData(datesToShow);
    }
    
    // Validate the data for runtime integrity
    const validation = validateSalesDayData(data);
    
    if (process.env.NODE_ENV === 'development') {
      if (!validation.isValid) {
        console.error('DailySalesComparison: Sales data validation failed:', validation.errors);
      }
      if (validation.warnings.length > 0) {
        console.warn('DailySalesComparison: Sales data warnings:', validation.warnings);
      }
    }
    
    // Return data even if validation fails (graceful degradation in production)
    // In production, you might want to return empty array or show error state
    return validation.isValid ? data : (process.env.NODE_ENV === 'production' ? data : []);
  }, [salesData, datesToShow]);

  // Validate date range before processing
  const dateRangeValidation = React.useMemo(() => {
    return validateDateRange(selectedDateRange);
  }, [selectedDateRange]);

  // Log validation issues in development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && selectedDateRange) {
      if (!dateRangeValidation.isValid) {
        console.error('DailySalesComparison: Date range validation failed:', dateRangeValidation.errors);
      }
      if (dateRangeValidation.warnings.length > 0) {
        console.warn('DailySalesComparison: Date range warnings:', dateRangeValidation.warnings);
      }
    }
  }, [dateRangeValidation, selectedDateRange]);

  // Only render if exactly one day is selected
  if (!isSingleDaySelected(selectedDateRange)) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {/* Header section */}
        <SalesComparisonHeader />
        
        {/* Sales cards grid */}
        <div 
          className="space-y-2"
          role="region"
          aria-label="Comparación de ventas diarias"
        >
          {displayData.map((dayData) => (
            <SalesDayCard
              key={dayData.date.getTime()}
              data={dayData}
              isHighlighted={dayData.isToday}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default DailySalesComparison;