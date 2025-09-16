import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DateRangeProvider } from '@/contexts/date-range-context';
import { useMinimumLoadingDuration } from '@/hooks/use-minimum-loading-duration';
import { AlertCircle, Building, RefreshCw } from 'lucide-react';
import * as React from 'react';
import { BranchCollapsibleItem } from './components/branch-collapsible-item';
import { DailySalesBranchesSkeleton } from './components/daily-sales-branches-skeleton';
import { useDailyBranchesSimple } from './hooks/use-daily-branches-simple';
import type { DailySalesBranchesProps } from './types';

/**
 * DailySalesBranches - A Spanish-localized branch sales collapsible component for daily sales data.
 *
 * This component displays detailed sales information for each branch using independent collapsible items,
 * but only when a single day is selected from the main filter calendar. The component
 * automatically hides when a date range (multiple days) is selected, ensuring the data
 * relevance and preventing confusion with aggregated multi-day data.
 *
 * Now includes full API integration with the main_dashboard_data endpoint, featuring:
 * - Real-time data fetching with week-over-week percentage calculation
 * - Dual API calls for current and previous week comparison (single day only)
 * - Enhanced loading states with skeleton placeholders for both API calls
 * - Comprehensive error handling with Spanish localization and retry functionality
 * - Smart caching (20-minute TTL) for both current and comparison data
 * - Fallback to dummy data during development and error states
 *
 * @component
 * @param {DailySalesBranchesProps} props - Component configuration props
 * @param {DateRange} [props.selectedDateRange] - The currently selected date range from main filter
 * @param {BranchSalesData[]} [props.branches] - Optional static branch data (overrides API integration)
 *
 * @returns {JSX.Element | null} Branch sales collapsibles or null when date range spans multiple days
 *
 * @example
 * ```tsx
 * // API-integrated usage with automatic week-over-week comparison (recommended)
 * <DailySalesBranches selectedDateRange={selectedDateRange} />
 *
 * // Static data usage (testing/fallback) - disables API calls
 * <DailySalesBranches
 *   selectedDateRange={selectedDateRange}
 *   branches={staticBranchData}
 * />
 * ```
 *
 * @see {@link MainFilterCalendar} for date range selection component
 * @see {@link useBranchSalesData} for API integration hook
 * @see {@link BranchCollapsibleItem} for individual branch display logic
 */
export function DailySalesBranches({ selectedDateRange, branches: staticBranches }: DailySalesBranchesProps) {
    // Use simple API hook (no complex context needed)
    const { branchesData, isLoading: actualIsLoading, error, isValidSingleDay, isToday, refetch } = useDailyBranchesSimple(selectedDateRange);

    // Enhanced loading state with minimum duration for better UX
    const isLoading = useMinimumLoadingDuration(actualIsLoading, 3000);

    // Use static branches if provided, otherwise use API data
    const displayBranches = staticBranches || branchesData;

    // Debug logging to track data flow (reduced to prevent infinite loops)
    React.useEffect(() => {
        if (process.env.NODE_ENV === 'development' && selectedDateRange) {
            console.log('🔍 DailySalesBranches component state:', {
                isValidSingleDay,
                isLoading,
                error,
                staticBranches: !!staticBranches,
                branchesFromAPI: branchesData?.length || 0,
                displayBranches: displayBranches?.length || 0,
                selectedDate: selectedDateRange?.from?.toISOString()?.split('T')[0],
            });
        }
    }, [selectedDateRange?.from, selectedDateRange?.to, isValidSingleDay, isLoading, error]);

    // Memoize validated and sorted branches to prevent unnecessary processing on each render
    // Includes data validation and sorting by total sales in descending order for better UX
    const sortedBranches = React.useMemo(() => {
        // Validate branches data to prevent runtime errors
        if (!Array.isArray(displayBranches) || displayBranches.length === 0) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('DailySalesBranches: Invalid or empty branches data provided');
            }
            return [];
        }

        // Filter out invalid branch objects and log warnings
        const validBranches = displayBranches.filter((branch) => {
            if (!branch || typeof branch !== 'object') {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('DailySalesBranches: Invalid branch object found:', branch);
                }
                return false;
            }
            if (!branch.id || typeof branch.name !== 'string') {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('DailySalesBranches: Branch missing required fields (id, name):', branch);
                }
                return false;
            }
            return true;
        });

        // Sort by total sales in descending order, handling potential NaN values
        return validBranches.sort((a, b) => {
            const salesA = typeof a.totalSales === 'number' ? a.totalSales : 0;
            const salesB = typeof b.totalSales === 'number' ? b.totalSales : 0;
            return salesB - salesA;
        });
    }, [displayBranches]);

    // Conditional rendering: Only display component when a single day is selected
    // This ensures data relevance and prevents confusion with multi-day aggregates
    if (!isValidSingleDay) {
        return null;
    }

    // Header component for consistent styling
    const HeaderSection = ({ showRefreshButton = false }: { showRefreshButton?: boolean }) => (
        <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Building className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                    <h2 className="text-base leading-none font-semibold tracking-tight text-foreground">Ventas por sucursal (Por día)</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">Ventas diarias por sucursal detalladas</p>
                </div>
            </div>
            {showRefreshButton && (
                <Button variant="ghost" size="sm" onClick={refetch} disabled={isLoading} className="h-8 w-8 p-0" title="Actualizar datos">
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            )}
        </div>
    );

    // Enhanced loading state with modern skeleton
    if (isLoading && sortedBranches.length === 0) {
        return <DailySalesBranchesSkeleton itemCount={3} />;
    }

    // Error state
    if (error && sortedBranches.length === 0) {
        return (
            <Card className="w-full border-border">
                <CardContent className="px-4 py-3">
                    <HeaderSection showRefreshButton />
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>{error}</span>
                            <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading} className="ml-2 h-7">
                                Reintentar
                            </Button>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    // Empty state
    if (sortedBranches.length === 0) {
        return (
            <Card className="w-full border-border">
                <CardContent className="px-4 py-3">
                    <HeaderSection showRefreshButton />
                    <div className="py-6 text-center text-muted-foreground">
                        <p className="text-sm">No hay datos de sucursales disponibles para la fecha seleccionada.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full border-border">
            <CardContent className="px-4 py-3">
                <HeaderSection showRefreshButton={!staticBranches} />

                {/* Error banner for non-critical errors */}
                {error && sortedBranches.length > 0 && (
                    <Alert className="mb-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span className="text-sm">Error: {error}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    /* Error will clear on next fetch */
                                }}
                                className="ml-2 h-6 w-6 p-0"
                                title="Cerrar"
                            >
                                ✕
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Collapsibles section */}
                <DateRangeProvider dateRange={selectedDateRange}>
                    <div className="space-y-2" role="region" aria-label="Detalles de ventas por sucursal">
                        {sortedBranches.map((branch) => (
                            <BranchCollapsibleItem
                                key={branch.id} // Using branch.id ensures stable React keys for proper reconciliation
                                branch={branch}
                                isToday={isToday}
                            />
                        ))}
                    </div>
                </DateRangeProvider>

                {/* Loading overlay for refresh operations */}
                {isLoading && sortedBranches.length > 0 && (
                    <div className="mt-2 flex items-center justify-center text-sm text-muted-foreground">
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando datos con comparación semanal...
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Export the component as default for cleaner imports
export default DailySalesBranches;
