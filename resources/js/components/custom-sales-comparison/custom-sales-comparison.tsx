import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CustomComparisonHeader } from './components/custom-comparison-header';
import { SalesCustomCard } from './components/sales-custom-card';
import type { CustomSalesComparisonProps, SalesCustomData } from './types';
import { 
  isCustomRangeSelected,
  validateCustomSalesData,
  validateCustomDateRange
} from './utils/validation';
import { generateMockCustomSalesData } from './utils/data-generation';

// Performance: Pre-memoized header component to prevent unnecessary re-renders
const MemoizedCustomComparisonHeader = React.memo(CustomComparisonHeader);
MemoizedCustomComparisonHeader.displayName = 'MemoizedCustomComparisonHeader';

// Performance: Memoized sales card component with proper comparison
const MemoizedSalesCustomCard = React.memo(SalesCustomCard, (prevProps, nextProps) => {
  // Custom comparison for better performance - only re-render if actual data changes
  return (
    prevProps.data.length === nextProps.data.length &&
    prevProps.data.every((item, index) => {
      const nextItem = nextProps.data[index];
      return nextItem && 
        item.date.getTime() === nextItem.date.getTime() &&
        item.amount === nextItem.amount &&
        item.isInRange === nextItem.isInRange;
    }) &&
    prevProps.dateRange.from?.getTime() === nextProps.dateRange.from?.getTime() &&
    prevProps.dateRange.to?.getTime() === nextProps.dateRange.to?.getTime()
  );
});
MemoizedSalesCustomCard.displayName = 'MemoizedSalesCustomCard';

/**
 * CustomSalesComparison - Main component for displaying custom date range sales comparison.
 * 
 * Shows a comparison of sales data for the selected custom date range (not single day, complete week, or complete month).
 * Only renders when a valid custom range is selected in the date filter.
 * Uses mock data for development but can accept real sales data via props.
 * 
 * @component
 * @param {CustomSalesComparisonProps} props - Component configuration props
 * @returns {JSX.Element | null} Custom sales comparison interface or null if conditions not met
 * 
 * @description Key features:
 * - Conditional rendering based on custom range selection (2-365 days, not standard patterns)
 * - Automatic generation of custom range data from selected date range
 * - Aggregated sales display with total and average calculations
 * - Responsive card layout matching other comparison components
 * - Accessibility-compliant structure with ARIA labels
 * - Support for both mock and real custom sales data
 * - Runtime validation with development logging
 * - Mexican peso currency formatting
 * - Date range display with Spanish localization
 * 
 * @example
 * ```tsx
 * // With custom date range selection (15 days)
 * const customRange = { 
 *   from: new Date('2025-09-01'), 
 *   to: new Date('2025-09-15') 
 * };
 * 
 * <CustomSalesComparison 
 *   selectedDateRange={customRange}
 *   salesData={optionalCustomData}
 * />
 * 
 * // Will not render for standard patterns:
 * const singleDay = { from: new Date('2025-09-15'), to: new Date('2025-09-15') }; // Single day
 * const completeWeek = { from: new Date('2025-09-01'), to: new Date('2025-09-07') }; // Complete week
 * const completeMonth = { from: new Date('2025-09-01'), to: new Date('2025-09-30') }; // Complete month
 * ```
 * 
 * @see {@link CustomComparisonHeader} for header component
 * @see {@link SalesCustomCard} for individual card component
 * @see {@link isCustomRangeSelected} for range validation logic
 */
export function CustomSalesComparison({ selectedDateRange, salesData }: CustomSalesComparisonProps) {
  // Early return: Only proceed if custom range is selected
  if (!isCustomRangeSelected(selectedDateRange)) {
    return null;
  }
  
  // Validate date range before proceeding
  const dateRangeValidation = validateCustomDateRange(selectedDateRange);
  if (!dateRangeValidation.isValid) {
    console.error('CustomSalesComparison: Custom date range validation failed:', dateRangeValidation.errors);
    return null;
  }
  
  // Generate display data with proper validation
  // Priority: custom salesData prop > generated mock data
  const displayData: SalesCustomData[] = React.useMemo(() => {
    if (salesData && salesData.length > 0) {
      // Validate provided sales data
      const validation = validateCustomSalesData(salesData);
      if (!validation.isValid) {
        console.error('CustomSalesComparison: Custom sales data validation failed:', validation.errors);
        // Fall back to mock data if provided data is invalid
        return generateMockCustomSalesData(selectedDateRange!);
      }
      return salesData;
    }
    
    // Generate mock data for the custom range
    return generateMockCustomSalesData(selectedDateRange!);
  }, [selectedDateRange, salesData]);
  
  // Validate final display data
  const displayDataValidation = validateCustomSalesData(displayData);
  if (!displayDataValidation.isValid) {
    console.error('CustomSalesComparison: Display data validation failed:', displayDataValidation.errors);
    return null;
  }
  
  // Log warnings for development debugging
  if (displayDataValidation.warnings.length > 0) {
    console.warn('CustomSalesComparison: Data warnings:', displayDataValidation.warnings);
  }
  
  return (
    <Card className="w-full">
      <CardContent className="px-4 py-3">
        {/* Header with title and custom date range info */}
        <MemoizedCustomComparisonHeader 
          dateRange={selectedDateRange}
        />
        
        {/* Custom range sales card - single aggregated view */}
        <div className="space-y-2">
          <MemoizedSalesCustomCard
            data={displayData}
            dateRange={selectedDateRange!}
            isHighlighted={false}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Set display name for React DevTools
CustomSalesComparison.displayName = 'CustomSalesComparison';

// Export the component as default for cleaner imports
export default CustomSalesComparison;