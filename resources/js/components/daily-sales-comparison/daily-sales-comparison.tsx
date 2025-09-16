import { Card, CardContent } from '@/components/ui/card';
import { useDailyChartContext } from '@/contexts/daily-chart-context';
import { useMinimumLoadingDuration } from '@/hooks/use-minimum-loading-duration';
import * as React from 'react';
import type { ProcessedChartData } from '@/lib/services/types';
import { logger } from './lib/logger';
import { SalesComparisonError } from './components/sales-comparison-error';
import { SalesComparisonHeader } from './components/sales-comparison-header';
import { SalesComparisonSkeleton } from './components/sales-comparison-skeleton';
import { SalesDayCard } from './components/sales-day-card';
import type { DailySalesComparisonProps, SalesDayData } from './types';
import { convertProcessedChartDataToSalesData, generateMockSalesData, generatePreviousDays, validateSalesDayData } from './utils';

/**
 * Helper function to resolve sales data from multiple sources with clear priority order
 */
function resolveSalesData({
    salesData,
    apiData,
    useMockData,
    isLoading,
    datesToShow,
    selectedDate
}: {
    salesData?: SalesDayData[];
    apiData: ProcessedChartData | null | undefined;
    useMockData: boolean;
    isLoading: boolean;
    datesToShow: Date[];
    selectedDate: Date;
}): SalesDayData[] {
    // Priority 1: Use provided sales data if available
    if (salesData) {
        logger.debug('Using provided sales data', { itemCount: salesData.length });
        return salesData;
    }

    // Priority 2: Use API data if available and valid
    if (apiData && !apiData.hasError && !apiData.isEmpty) {
        logger.debug('Using API data', { daysCount: apiData.days?.length || 0 });
        return convertProcessedChartDataToSalesData(apiData, selectedDate);
    }

    // Priority 3: Use mock data if explicitly requested or as fallback
    if (useMockData || (!isLoading && !apiData)) {
        logger.debug('Using mock data', { reason: useMockData ? 'explicit' : 'fallback' });
        return generateMockSalesData(datesToShow);
    }

    // Priority 4: Return empty array while loading
    logger.debug('Returning empty data', { isLoading });
    return [];
}

/**
 * Helper function to validate and process sales data with improved error handling
 */
function validateAndProcessSalesData(data: SalesDayData[]): SalesDayData[] {
    if (data.length === 0) {
        return data;
    }

    // Validate the data for runtime integrity
    const validation = validateSalesDayData(data);

    // Log validation issues with improved error handling
    if (!validation.isValid) {
        logger.error('Sales data validation failed', {
            errorCount: validation.errors.length,
            errors: validation.errors.slice(0, 3) // Limit logged errors for performance
        });
    }

    if (validation.warnings.length > 0) {
        logger.warn('Sales data validation warnings', {
            warningCount: validation.warnings.length,
            warnings: validation.warnings.slice(0, 3) // Limit logged warnings for performance
        });
    }

    // Return data even if validation fails (graceful degradation in production)
    return validation.isValid ? data : process.env.NODE_ENV === 'production' ? data : [];
}

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
    useMockData = false, // Allow override for testing
}: Omit<DailySalesComparisonProps, 'selectedDateRange'>) {
    // Get shared data from context (single API call)
    const { data: apiData, isLoading: actualIsLoading, error, refetch, isValidForDailyComponents } = useDailyChartContext();

    // Enhanced loading state with minimum duration for better UX (1.5s for optimal performance)
    const isLoading = useMinimumLoadingDuration(actualIsLoading, 1500);

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
    const datesToShow = React.useMemo(() => (selectedDate ? generatePreviousDays(selectedDate) : []), [selectedDate]);

    // Data resolution and validation split into focused functions
    const rawSalesData = React.useMemo(() => {
        return resolveSalesData({
            salesData,
            apiData,
            useMockData,
            isLoading,
            datesToShow,
            selectedDate: selectedDate || new Date()
        });
    }, [salesData, apiData, useMockData, isLoading, datesToShow, selectedDate]);

    const displayData = React.useMemo(() => {
        return validateAndProcessSalesData(rawSalesData);
    }, [rawSalesData]);

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
        return <SalesComparisonError error={error} onRetry={refetch} />;
    }

    return (
        <Card className="w-full border-border">
            <CardContent className="px-4 py-3">
                {/* Header section */}
                <SalesComparisonHeader />

                {/* Sales cards grid */}
                <div className="space-y-2" role="region" aria-label="Comparación de ventas diarias">
                    {displayData.map((dayData) => (
                        <SalesDayCard key={dayData.date.getTime()} data={dayData} isHighlighted={dayData.isToday} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default DailySalesComparison;
