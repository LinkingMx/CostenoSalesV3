import { Card, CardContent } from '@/components/ui/card';
import * as React from 'react';
import { CustomComparisonHeader } from './components/custom-comparison-header';
import { CustomSalesComparisonSkeleton } from './components/custom-sales-comparison-skeleton';
import { SalesCustomCard } from './components/sales-custom-card';
import { useCustomSalesComparison } from './hooks/use-custom-sales-comparison';
import type { CustomSalesComparisonProps } from './types';

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
            return (
                nextItem &&
                item.date.getTime() === nextItem.date.getTime() &&
                item.amount === nextItem.amount &&
                item.isInRange === nextItem.isInRange
            );
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
    // Use dedicated hook for business logic abstraction
    const { customSalesData, isLoading, error, isValidCustomRange } = useCustomSalesComparison(selectedDateRange, salesData);

    // Early return for performance - avoid unnecessary computations if not valid custom range
    if (!isValidCustomRange) {
        return null;
    }

    // Loading state
    if (isLoading) {
        return <CustomSalesComparisonSkeleton />;
    }

    return (
        <Card className="w-full">
            <CardContent className="px-4 py-3">
                {/* Header with title and custom date range info */}
                <MemoizedCustomComparisonHeader dateRange={selectedDateRange} />

                {/* Error state */}
                {error && (
                    <div className="flex items-center justify-center py-4">
                        <div className="text-center text-sm text-destructive">
                            <p className="font-medium">Error al cargar datos</p>
                            <p className="mt-1 text-xs">{error}</p>
                        </div>
                    </div>
                )}

                {/* Success state with data */}
                {!error && customSalesData.length > 0 && (
                    <div className="space-y-2">
                        <MemoizedSalesCustomCard data={customSalesData} dateRange={selectedDateRange!} isHighlighted={false} />
                    </div>
                )}

                {/* Empty state */}
                {!error && customSalesData.length === 0 && (
                    <div className="flex items-center justify-center py-4">
                        <div className="text-center text-sm text-muted-foreground">
                            <p>No hay datos disponibles para el rango seleccionado</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Set display name for React DevTools
CustomSalesComparison.displayName = 'CustomSalesComparison';

// Export the component as default for cleaner imports
export default CustomSalesComparison;
