/**
 * Monthly Chart Comparison Component
 * Main component for displaying monthly sales chart comparison
 */

import { useMonthlyChartContext } from '@/contexts/monthly-chart-context';
import * as React from 'react';
import { MonthlyChartError } from './components/monthly-chart-error';
import { MonthlyChartHeader } from './components/monthly-chart-header';
import { MonthlyChartSkeleton } from './components/monthly-chart-skeleton';
import { MonthlyComparisonChart } from './components/monthly-comparison-chart';
import type { MonthlyChartComparisonProps } from './types';
import { isCompleteMonthSelected } from './utils';

// Performance: Pre-memoized header component to prevent unnecessary re-renders
const MemoizedMonthlyChartHeader = React.memo(MonthlyChartHeader);

// Performance: Memoized chart component with optimized comparison for monthly totals
const MemoizedMonthlyComparisonChart = React.memo(MonthlyComparisonChart, (prevProps, nextProps) => {
    // Custom comparison for better performance - only re-render if actual data changes
    const prevData = prevProps.data;
    const nextData = nextProps.data;

    // Compare chart configuration props
    if (prevProps.height !== nextProps.height || prevProps.showLegend !== nextProps.showLegend || prevProps.className !== nextProps.className) {
        return false; // Props changed, need to re-render
    }

    // Deep comparison of chart data
    if (prevData === nextData) return true; // Same reference, no change
    if (!prevData || !nextData) return false; // One is null/undefined

    // Compare monthly values arrays
    if (prevData.monthValues.length !== nextData.monthValues.length) return false;

    // Compare each monthly value
    for (let i = 0; i < prevData.monthValues.length; i++) {
        if (prevData.monthValues[i] !== nextData.monthValues[i]) {
            return false; // Monthly values changed
        }
    }

    // Compare month labels and colors using efficient comparison
    if (
        JSON.stringify(prevData.monthLabels) !== JSON.stringify(nextData.monthLabels) ||
        JSON.stringify(prevData.monthColors) !== JSON.stringify(nextData.monthColors) ||
        JSON.stringify(prevData.legendLabels) !== JSON.stringify(nextData.legendLabels)
    ) {
        return false; // Labels or colors changed
    }

    return true; // No changes detected
});

/**
 * MonthlyChartComparison - Main component for displaying monthly sales chart comparison.
 *
 * Shows a bar chart comparing monthly sales totals across 3 consecutive months.
 * Only renders when exactly one complete month (first to last day) is selected in the date filter.
 * Uses real API data through the MonthlyChartProvider context.
 *
 * @component
 * @param {MonthlyChartComparisonProps} props - Component configuration props
 * @returns {JSX.Element | null} Monthly chart comparison interface or null if conditions not met
 *
 * @description Key features:
 * - Real-time API data integration through context provider
 * - Elegant loading states with skeleton animation
 * - Comprehensive error handling with retry functionality
 * - Conditional rendering based on complete month selection
 * - Interactive bar chart with 3-month total sales comparison
 * - Shows monthly totals with individual bar colors for visual distinction
 * - Responsive design that adapts to different screen sizes
 * - Accessibility-compliant structure with ARIA labels
 * - Mexican peso currency formatting with chart values
 * - Spanish localization for all interface text
 * - Theme-consistent styling using design system variables
 * - Performance optimizations with memoized components
 *
 * @example
 * ```tsx
 * // Usage within MonthlyChartProvider context
 * <MonthlyChartProvider selectedDateRange={dateRange}>
 *   <MonthlyChartComparison selectedDateRange={dateRange} />
 * </MonthlyChartProvider>
 * ```
 */
export const MonthlyChartComparison = React.memo(function MonthlyChartComparison({ selectedDateRange }: MonthlyChartComparisonProps) {
    // Get shared data from context
    const { data, isLoading, error, refetch, isValidForMonthlyChart } = useMonthlyChartContext();

    // Performance: Memoize complete month validation to avoid repeated calculations
    const isValidCompleteMonth = React.useMemo(() => isCompleteMonthSelected(selectedDateRange), [selectedDateRange]);

    // Early return for performance - avoid unnecessary computations if not valid complete month
    // IMPORTANT: Must come after ALL hooks to avoid "hooks rule" violation
    if (!isValidCompleteMonth || !isValidForMonthlyChart) {
        return null;
    }

    // Show loading skeleton while data is being fetched
    if (isLoading) {
        return <MonthlyChartSkeleton height={300} />;
    }

    // Show error state with retry option
    if (error) {
        return <MonthlyChartError message={error} onRetry={refetch} isRetrying={isLoading} />;
    }

    // Show nothing if no data available
    if (!data) {
        return null;
    }

    return (
        <div className="w-full rounded-xl border border-border bg-card p-6">
            {/* Header section - memoized for performance */}
            <div className="mb-6">
                <MemoizedMonthlyChartHeader />
            </div>

            {/* Chart container - optimized rendering with proper accessibility */}
            <div
                className="focus:ring-0 focus:outline-none [&_*]:outline-none [&_*]:focus:outline-none [&_svg]:outline-none [&_svg]:focus:outline-none"
                role="region"
                aria-label="Gráfico de comparación mensual de ventas"
                tabIndex={-1}
                style={{ outline: 'none' }}
            >
                <MemoizedMonthlyComparisonChart data={data} height={225} showLegend={true} />
            </div>
        </div>
    );
});

export default MonthlyChartComparison;
