import { Card, CardContent } from '@/components/ui/card';
import { DateRangeProvider } from '@/contexts/date-range-context';
import { BranchCollapsibleItem } from './components/branch-collapsible-item';
import { MonthlyBranchesError } from './components/monthly-branches-error';
import { MonthlyBranchesLoadingSkeleton } from './components/monthly-branches-loading-skeleton';
import { MonthlySalesBranchesHeader } from './components/monthly-sales-branches-header';
import { useMonthlyBranches } from './hooks/use-monthly-branches';
import type { MonthlySalesBranchesProps } from './types';

/**
 * MonthlySalesBranches - Component for displaying monthly branch sales data in collapsible format.
 *
 * This component shows detailed sales information for each branch when exactly one month
 * (first to last day) is selected in the date filter. Each branch is displayed as a
 * collapsible card showing sales metrics and closed accounts information.
 *
 * @component
 * @param {MonthlySalesBranchesProps} props - Component configuration props
 * @returns {JSX.Element | null} Monthly branch sales interface or null if conditions not met
 *
 * @description Key features:
 * - Real-time API data integration using monthly chart service
 * - Conditional rendering based on exact month selection (first to last day)
 * - Spanish-localized branch sales data display in Mexican pesos
 * - Collapsible cards for detailed branch metrics
 * - Loading states with skeleton animation
 * - Error handling with retry functionality
 * - Mobile-optimized responsive design (375px viewport)
 * - Branches sorted by total sales (descending order)
 * - Monthly-specific: NO "Abiertas" (open accounts) cards shown
 *
 * Business Logic:
 * - Only renders when selectedDateRange represents exactly one month (first to last day)
 * - Fetches real branch data from MonthlyChartProvider API cards section
 * - Each branch shows: total sales, percentage growth vs previous month, closed sales, average ticket
 * - openAccounts is always 0 for monthly view (not displayed)
 * - Maintains consistent Mexican peso formatting throughout the application
 *
 * @example
 * ```tsx
 * // Usage with real API data - shows for exact month selection
 * <MonthlySalesBranches selectedDateRange={monthRange} />
 * ```
 */
export function MonthlySalesBranches({ selectedDateRange }: MonthlySalesBranchesProps) {
    // Use custom hook for API integration and state management
    const { branchesData, isLoading, error, isValidCompleteMonth, isCurrentMonth, refetch } = useMonthlyBranches(selectedDateRange);

    // Only render if exactly one month is selected (first to last day)
    if (!isValidCompleteMonth) {
        return null;
    }

    // Show loading skeleton while fetching data
    if (isLoading) {
        return <MonthlyBranchesLoadingSkeleton />;
    }

    // Show error state with retry functionality
    if (error) {
        return <MonthlyBranchesError error={error} onRetry={refetch} />;
    }

    // Show empty state if no branches data
    if (branchesData.length === 0) {
        return (
            <Card className="w-full">
                <CardContent className="px-4 py-3">
                    <MonthlySalesBranchesHeader />
                    <div className="py-8 text-center text-muted-foreground">No hay datos de sucursales disponibles para este mes.</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardContent className="px-4 py-3">
                {/* Header section */}
                <MonthlySalesBranchesHeader />

                {/* Branch collapsibles with real API data */}
                <DateRangeProvider dateRange={selectedDateRange}>
                    <div className="space-y-2" role="region" aria-label="Detalles de ventas por sucursal mensuales">
                        {branchesData.map((branch) => (
                            <BranchCollapsibleItem key={branch.id} branch={branch} isCurrentMonth={isCurrentMonth} />
                        ))}
                    </div>
                </DateRangeProvider>
            </CardContent>
        </Card>
    );
}

export default MonthlySalesBranches;
