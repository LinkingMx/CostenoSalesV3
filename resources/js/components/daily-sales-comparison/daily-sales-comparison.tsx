import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SalesComparisonHeader } from './components/sales-comparison-header';
import { SalesDayCard } from './components/sales-day-card';
import { SalesComparisonSkeleton } from './components/sales-comparison-skeleton';
import { SalesComparisonError } from './components/sales-comparison-error';
import type { DailySalesComparisonProps, SalesDayData } from './types';
import {
  generatePreviousDays,
  generateMockSalesData,
  validateSalesDayData,
  validateDateRange,
  convertProcessedChartDataToSalesData
} from './utils';
import { useDailyChartContext } from '@/contexts/daily-chart-context';
import { isSingleDaySelected } from '@/lib/utils/date-validation';

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
  salesData,
  useMockData = false // Allow override for testing
}: Omit<DailySalesComparisonProps, 'selectedDateRange'>) {

  // Get shared data from context (single API call)
  const {
    data: apiData,
    isLoading,
    error,
    refetch,
    isValidForDailyComponents
  } = useDailyChartContext();

  // Get the selected date from context data
  const selectedDate = React.useMemo(() => {
    if (apiData?.days?.[0]?.date) {
      // Use the first day's date from API data
      return new Date(apiData.days[0].date + 'T00:00:00');
    }
    return new Date();
  }, [apiData?.days]);

  // Note: datesToShow is only used for mock data fallback when API is unavailable
  // Real API data provides the actual dates (e.g., 4 consecutive Fridays, not calculated days)
  const datesToShow = React.useMemo(() =>
    selectedDate ? generatePreviousDays(selectedDate) : [],
    [selectedDate]
  );
  
  // Use provided sales data, API data, or generate mock data with validation
  const displayData = React.useMemo((): SalesDayData[] => {
    let data: SalesDayData[];

    // Priority 1: Use provided sales data if available
    if (salesData) {
      data = salesData;
    }
    // Priority 2: Use API data if available and valid
    else if (apiData && !apiData.hasError && !apiData.isEmpty) {
      data = convertProcessedChartDataToSalesData(apiData, selectedDate || new Date());
    }
    // Priority 3: Use mock data if explicitly requested or as fallback
    else if (useMockData || (!isLoading && !apiData)) {
      data = generateMockSalesData(datesToShow);
    }
    // Priority 4: Return empty array while loading
    else {
      return [];
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
    return validation.isValid ? data : (process.env.NODE_ENV === 'production' ? data : []);
  }, [salesData, apiData, useMockData, isLoading, datesToShow, selectedDate]);

  // Date range validation is handled by the context

  // Only render if exactly one day is selected (using context validation)
  if (!isValidForDailyComponents) {
    return null;
  }

  // Show loading state
  if (isLoading && !salesData && !useMockData) {
    return <SalesComparisonSkeleton />;
  }

  // Show error state
  if (error && !salesData && !useMockData) {
    return (
      <SalesComparisonError
        error={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <Card className="w-full border-border">
      <CardContent className="px-4 py-3">
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