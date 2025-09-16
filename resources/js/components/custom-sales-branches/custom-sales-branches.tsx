import { Card, CardContent } from '@/components/ui/card';
import { DateRangeProvider } from '@/contexts/date-range-context';
import { useCustomBranchesContext } from '@/contexts/custom-branches-context';
import * as React from 'react';
import { BranchCustomCollapsibleItem } from './components/branch-custom-collapsible-item';
import { CustomSalesBranchesHeader } from './components/custom-sales-branches-header';
import { CustomSalesBranchesSkeleton } from './components/custom-sales-branches-skeleton';
import type { CustomSalesBranchesProps } from './types';

/**
 * CustomSalesBranches - Component for displaying custom range branch sales data in collapsible format.
 *
 * This component shows detailed sales information for each branch when a custom date range
 * (not single day, complete week, or complete month) is selected in the date filter. Each branch is displayed as a
 * collapsible card showing sales metrics, open/closed accounts, and average ticket information.
 *
 * @component
 * @param {CustomSalesBranchesProps} props - Component configuration props
 * @returns {JSX.Element | null} Custom range branch sales interface or null if conditions not met
 *
 * @description Key features:
 * - Conditional rendering based on custom range selection (2-365 days, not standard patterns)
 * - Spanish-localized branch sales data display
 * - Collapsible cards for detailed branch metrics
 * - Mobile-optimized responsive design (375px viewport)
 * - Consistent styling with other sales components
 * - Support for both mock and real branch data
 *
 * Business Logic:
 * - Only renders when selectedDateRange represents a custom range (not single day, complete week, or complete month)
 * - Uses dummy data for development but can accept real branch data via props
 * - Each branch shows: total sales, percentage growth, open accounts, closed sales, average ticket
 * - Maintains consistent currency formatting throughout the application
 *
 * @example
 * ```tsx
 * // Basic usage with mock data - only shows for custom range selection
 * <CustomSalesBranches
 *   selectedDateRange={customRange}
 * />
 *
 * // With custom branch data
 * <CustomSalesBranches
 *   selectedDateRange={customRange}
 *   branches={realBranchData}
 * />
 * ```
 */
// Performance: Memoized header component to prevent unnecessary re-renders
const MemoizedCustomSalesBranchesHeader = React.memo(CustomSalesBranchesHeader);
MemoizedCustomSalesBranchesHeader.displayName = 'MemoizedCustomSalesBranchesHeader';

// Performance: Memoized collapsible item component
const MemoizedBranchCustomCollapsibleItem = React.memo(BranchCustomCollapsibleItem);
MemoizedBranchCustomCollapsibleItem.displayName = 'MemoizedBranchCustomCollapsibleItem';

export const CustomSalesBranches = React.memo<CustomSalesBranchesProps>(({ selectedDateRange }) => {
    // Use context for shared state management and avoid duplicate API calls
    const { branchesData, isLoading, error, isValidCustomRange, refetch } = useCustomBranchesContext();

    // Only render if custom range is selected (not single day, complete week, or complete month)
    if (!isValidCustomRange) {
        return null;
    }

    // Show loading state
    if (isLoading) {
        return <CustomSalesBranchesSkeleton />;
    }

    // Show error state
    if (error) {
        return (
            <Card className="w-full">
                <CardContent className="px-4 py-3">
                    <MemoizedCustomSalesBranchesHeader />
                    <div className="flex flex-col items-center justify-center space-y-2 py-8">
                        <div className="text-sm text-destructive">Error al cargar los datos</div>
                        <button onClick={refetch} className="text-xs text-muted-foreground underline hover:text-foreground">
                            Reintentar
                        </button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show empty state if no branches data
    if (branchesData.length === 0) {
        return (
            <Card className="w-full">
                <CardContent className="px-4 py-3">
                    <MemoizedCustomSalesBranchesHeader />
                    <div className="py-8 text-center text-muted-foreground">No hay datos de sucursales disponibles para este rango.</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardContent className="px-4 py-3">
                {/* Header section */}
                <MemoizedCustomSalesBranchesHeader />

                {/* Branch collapsibles with real API data */}
                <DateRangeProvider dateRange={selectedDateRange}>
                    <div className="space-y-2" role="region" aria-label="Detalles de ventas por sucursal rango personalizado">
                        {branchesData.map((branch) => (
                            <MemoizedBranchCustomCollapsibleItem key={branch.id} branch={branch} />
                        ))}
                    </div>
                </DateRangeProvider>
            </CardContent>
        </Card>
    );
});

CustomSalesBranches.displayName = 'CustomSalesBranches';

export default CustomSalesBranches;
