import { Card, CardContent } from '@/components/ui/card';
import { fetchCustomSalesComparisonData } from '@/lib/services/custom-sales-comparison.service';
import { formatDateForApi } from '@/lib/services/main-dashboard.service';
import * as React from 'react';
import { CustomComparisonHeader } from './components/custom-comparison-header';
import { CustomSalesComparisonSkeleton } from './components/custom-sales-comparison-skeleton';
import { SalesCustomCard } from './components/sales-custom-card';
import type { CustomSalesComparisonProps, SalesCustomData } from './types';
import { isCustomRangeSelected, validateCustomDateRange, validateCustomSalesData } from './utils/validation';

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
    const [displayData, setDisplayData] = React.useState<SalesCustomData[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | undefined>();

    // Fetch real API data when selectedDateRange changes
    React.useEffect(() => {
        if (!isCustomRangeSelected(selectedDateRange)) {
            // Only clear data if there's actually data to clear
            setDisplayData((prev) => (prev.length > 0 ? [] : prev));
            setError((prev) => (prev ? undefined : prev));
            return;
        }

        // If custom salesData is provided via props, use it instead of fetching
        if (salesData && salesData.length > 0) {
            const validation = validateCustomSalesData(salesData);
            if (validation.isValid) {
                setDisplayData(salesData);
                setError(undefined);
                return;
            } else {
                console.warn('CustomSalesComparison: Custom sales data validation failed:', validation.errors);
                // Continue with API fetch as fallback
            }
        }

        // Fetch data from API
        const fetchData = async () => {
            if (!selectedDateRange?.from || !selectedDateRange?.to) return;

            setLoading(true);
            setError(undefined);

            try {
                const startDate = formatDateForApi(selectedDateRange.from);
                const endDate = formatDateForApi(selectedDateRange.to);

                console.log('🚀 CustomSalesComparison: Fetching data for range:', { startDate, endDate });

                const result = await fetchCustomSalesComparisonData(startDate, endDate);

                if (result.error) {
                    setError(result.error);
                    setDisplayData([]);
                } else {
                    setDisplayData(result.data);
                    setError(undefined);

                    // Validate the fetched data
                    const validation = validateCustomSalesData(result.data);
                    if (!validation.isValid) {
                        console.warn('CustomSalesComparison: Fetched data validation failed:', validation.errors);
                    }
                    if (validation.warnings.length > 0) {
                        console.warn('CustomSalesComparison: Data warnings:', validation.warnings);
                    }
                }
            } catch (fetchError) {
                console.error('CustomSalesComparison: Failed to fetch data:', fetchError);
                setError('Error al cargar los datos de ventas personalizadas');
                setDisplayData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedDateRange, salesData]);

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

    // Loading state
    if (loading) {
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
                {!error && displayData.length > 0 && (
                    <div className="space-y-2">
                        <MemoizedSalesCustomCard data={displayData} dateRange={selectedDateRange!} isHighlighted={false} />
                    </div>
                )}

                {/* Empty state */}
                {!error && displayData.length === 0 && (
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
