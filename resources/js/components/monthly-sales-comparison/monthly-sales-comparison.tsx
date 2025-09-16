import { Card, CardContent } from '@/components/ui/card';
import { useMonthlyChartContext } from '@/contexts/monthly-chart-context';
import { isCompleteMonthSelected } from '@/lib/date-validation';
import * as React from 'react';
import { MonthlyComparisonHeader } from './components/monthly-comparison-header';
import type { MonthlySalesComparisonProps, MonthlySummaryData } from './types';
import { formatMonthlySalesAmount, transformApiDataToMonthlySummary } from './utils';

// Performance: Pre-memoized header component to prevent unnecessary re-renders
const MemoizedMonthlyComparisonHeader = React.memo(MonthlyComparisonHeader);

/**
 * MonthlySalesComparison - Main component for displaying monthly sales comparison.
 *
 * Shows 3 cards representing sales totals for monthly periods in chronological order.
 * Only renders when exactly one complete month is selected in the date filter.
 * Uses real API data from MonthlyChartProvider context.
 *
 * @component
 * @param {MonthlySalesComparisonProps} props - Component configuration props
 * @returns {JSX.Element | null} Monthly sales comparison interface or null if conditions not met
 *
 * @description Key features:
 * - Displays 3 monthly summary cards (Julio, Agosto, Septiembre)
 * - Each card shows month name with year and total sales amount
 * - Uses shared API data from MonthlyChartProvider context
 * - Conditional rendering based on complete month selection (first day to last day)
 * - Mexican peso currency formatting
 * - Responsive card layout matching the weekly design pattern
 * - Accessibility-compliant structure with ARIA labels
 *
 * @example
 * ```tsx
 * <MonthlyChartProvider selectedDateRange={selectedDateRange}>
 *   <MonthlySalesComparison selectedDateRange={selectedDateRange} />
 * </MonthlyChartProvider>
 * ```
 */
export function MonthlySalesComparison({ selectedDateRange }: MonthlySalesComparisonProps) {
    // Get shared data from context - single API call for all monthly components
    const { rawApiData, isLoading, error, isValidForMonthlyChart } = useMonthlyChartContext();

    // Performance: Memoize complete month validation to avoid repeated calculations
    const isValidCompleteMonth = React.useMemo(() => {
        return isCompleteMonthSelected(selectedDateRange);
    }, [selectedDateRange]);

    // Transform raw API data to monthly summary format
    const monthlySummaryData = React.useMemo((): MonthlySummaryData[] => {
        if (!rawApiData) {
            return [];
        }
        // Cast rawApiData to expected type since we know the structure from API
        return transformApiDataToMonthlySummary(rawApiData as unknown, selectedDateRange);
    }, [rawApiData, selectedDateRange]);

    // Early return for performance - avoid unnecessary computations if not valid complete month
    if (!isValidCompleteMonth || !isValidForMonthlyChart) {
        return null;
    }

    // Show nothing only if there's an error or no data after loading completes
    if (error) {
        return null;
    }

    // If still loading but no data, show loading state
    if (isLoading && monthlySummaryData.length === 0) {
        return (
            <Card className="w-full">
                <CardContent className="px-4 py-3">
                    <MemoizedMonthlyComparisonHeader />
                    <div className="space-y-2" role="region" aria-label="Cargando comparación de ventas mensuales">
                        <div className="flex items-center justify-center py-8">
                            <div className="text-sm text-muted-foreground">Cargando datos mensuales...</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // If not loading but still no data, don't show the component
    if (!isLoading && monthlySummaryData.length === 0) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardContent className="px-4 py-3">
                {/* Header section - memoized for performance */}
                <MemoizedMonthlyComparisonHeader />

                {/* Monthly summary cards container - optimized rendering */}
                <div className="space-y-2" role="region" aria-label="Comparación de ventas mensuales por totales">
                    {monthlySummaryData.map((monthSummary) => (
                        <MonthlySummaryCard key={monthSummary.monthLabel} data={monthSummary} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * MonthlySummaryCard - Individual card component for displaying monthly summary data.
 * Renders a card with month indicator, month name with year, and total sales amount.
 */
function MonthlySummaryCard({ data }: { data: MonthlySummaryData }) {
    // Get month letter for circular indicator from the month name
    const monthLetter = getMonthLetter(data.monthNameWithYear);
    const formattedAmount = formatMonthlySalesAmount(data.totalAmount);

    return (
        <div
            className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-3 transition-all duration-200 hover:bg-muted"
            role="article"
            aria-label={`Ventas del mes ${data.monthNameWithYear}: ${formattedAmount}`}
        >
            {/* Left side - Month indicator and month name information */}
            <div className="flex items-center gap-2.5">
                {/* Circular month indicator */}
                <div
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm"
                    aria-hidden="true"
                >
                    {monthLetter}
                </div>

                {/* Formatted month name with year display */}
                <div className="flex flex-col">
                    <span className="text-sm leading-tight font-medium text-foreground">{data.monthNameWithYear}</span>
                </div>
            </div>

            {/* Right side - Total sales amount information */}
            <div className="text-right">
                <div className="text-lg font-bold text-foreground tabular-nums">{formattedAmount}</div>
            </div>
        </div>
    );
}

/**
 * Gets the first letter of the month name for display.
 */
function getMonthLetter(monthNameWithYear: string): string {
    // Extract the first letter from the month name (before the year)
    if (!monthNameWithYear) return 'M';
    return monthNameWithYear.charAt(0).toUpperCase();
}

export default MonthlySalesComparison;
