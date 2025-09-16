import { Card, CardContent } from '@/components/ui/card';
import { useDailyChartContext } from '@/contexts/daily-chart-context';
import { useMinimumLoadingDuration } from '@/hooks/use-minimum-loading-duration';
import * as React from 'react';
import { DailyChartError } from './components/daily-chart-error';
import { DailyChartHeader } from './components/daily-chart-header';
import { DailyChartSkeleton } from './components/daily-chart-skeleton';
import { DailyComparisonChart } from './components/daily-comparison-chart';
import { logger } from './lib/logger';
import type { DailyChartComparisonProps, DailyChartData } from './types';
import { convertApiDataToChartData, generateMockDailyChartData, validateDailyChartData } from './utils';

// Performance: Memoized components using standard React.memo patterns
const MemoizedDailyChartHeader = React.memo(DailyChartHeader);
const MemoizedDailyComparisonChart = React.memo(DailyComparisonChart);

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
    chartData,
    useMockData = false, // Allow override for testing
}: Omit<DailyChartComparisonProps, 'selectedDateRange'>) {
    // Get shared data from context (single API call)
    const { data: apiData, isLoading: actualIsLoading, error, refetch, isValidForDailyComponents: isValidSingleDay } = useDailyChartContext();

    // Enhanced loading state with minimum duration for better UX
    const isLoading = useMinimumLoadingDuration(actualIsLoading, 1500);

    // Extract selected date with simplified dependency
    const selectedDate = React.useMemo(() => {
        const firstDayDate = apiData?.days?.[0]?.date;
        return firstDayDate ? new Date(firstDayDate + 'T00:00:00') : new Date();
    }, [apiData?.days]);

    // Process chart data with optimized memoization
    const displayData = React.useMemo((): DailyChartData | null => {
        // Priority 1: Use explicit chart data if provided
        if (chartData) {
            return chartData;
        }

        // Priority 2: Generate mock data when needed
        if (useMockData || (!apiData && !isLoading)) {
            return generateMockDailyChartData(selectedDate);
        }

        // Priority 3: Convert API data
        if (apiData && !apiData.hasError) {
            const converted = convertApiDataToChartData(apiData, selectedDate);

            // Development validation (simplified)
            if (converted && process.env.NODE_ENV === 'development') {
                const validation = validateDailyChartData(converted);
                if (!validation.isValid) {
                    logger.error('Daily chart data validation failed:', validation.errors);
                }
            }

            return converted;
        }

        return null;
    }, [chartData, useMockData, apiData, isLoading, selectedDate]);

    // Only show for single day selections
    if (!isValidSingleDay) {
        return null;
    }

    // Show loading skeleton while fetching data (regardless of cached data)
    if (isLoading) {
        return <DailyChartSkeleton height={210} />;
    }

    // Show error state if API failed and no fallback data
    if (error && !displayData) {
        return <DailyChartError message={error} onRetry={refetch} height={210} />;
    }

    // Show nothing if no data available
    if (!displayData) {
        return null;
    }

    return (
        <Card className="w-full border-border">
            <CardContent className="px-4 py-3">
                {/* Header section - memoized for performance */}
                <MemoizedDailyChartHeader />

                {/* Chart container - optimized rendering with proper accessibility */}
                <div
                    className="mt-4 focus:ring-0 focus:outline-none [&_*]:outline-none [&_*]:focus:outline-none [&_svg]:outline-none [&_svg]:focus:outline-none"
                    role="region"
                    aria-label="Gráfico de comparación diaria de ventas"
                    tabIndex={-1}
                    style={{ outline: 'none' }}
                >
                    <MemoizedDailyComparisonChart data={displayData} height={210} showGrid={true} orientation="vertical" />
                </div>
            </CardContent>
        </Card>
    );
}

export default DailyChartComparison;
