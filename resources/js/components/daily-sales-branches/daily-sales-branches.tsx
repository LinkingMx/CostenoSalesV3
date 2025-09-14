import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BranchCollapsibleItem } from './components/branch-collapsible-item';
import { DUMMY_BRANCHES_DATA } from './utils';
import { useBranchSalesData } from './hooks/use-branch-sales-data';
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
export function DailySalesBranches({
  selectedDateRange,
  branches: staticBranches
}: DailySalesBranchesProps) {
  // Use the API integration hook with fallback to dummy data
  const {
    branches,
    // totalSales, // Available for future use in summary displays
    isLoading,
    error,
    isVisible,
    refresh,
    clearError
  } = useBranchSalesData(selectedDateRange, {
    enabled: !staticBranches, // Only use API if no static branches provided
    fallbackData: DUMMY_BRANCHES_DATA,
    useFallbackDuringLoad: true
  });

  // Use static branches if provided, otherwise use API data
  const displayBranches = staticBranches || branches;

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
  if (!isVisible) {
    return null;
  }

  // Header component for consistent styling
  const HeaderSection = ({ showRefreshButton = false }: { showRefreshButton?: boolean }) => (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
          <Building className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-base font-semibold leading-none tracking-tight text-foreground">
            Ventas por sucursal (Por día)
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ventas diarias por sucursal detalladas
          </p>
        </div>
      </div>
      {showRefreshButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
          className="h-8 w-8 p-0"
          title="Actualizar datos"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  );

  // Loading state
  if (isLoading && sortedBranches.length === 0) {
    return (
      <Card className="w-full border-border">
        <CardContent className="px-4 py-3">
          <HeaderSection showRefreshButton />
          <div className="space-y-3">
            {/* Loading skeleton */}
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="animate-pulse bg-muted rounded-lg p-3 border border-border"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 bg-gray-300 rounded-full" />
                    <div className="h-4 w-32 bg-gray-300 rounded" />
                  </div>
                  <div className="text-right">
                    <div className="h-5 w-20 bg-gray-300 rounded mb-1" />
                    <div className="h-4 w-12 bg-gray-300 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
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
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
                className="ml-2 h-7"
              >
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
          <div className="text-center py-6 text-muted-foreground">
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
              <span className="text-sm">Mostrando datos en caché. {error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="h-6 w-6 p-0 ml-2"
                title="Cerrar"
              >
                ✕
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Collapsibles section */}
        <div
          className="space-y-2"
          role="region"
          aria-label="Detalles de ventas por sucursal"
        >
          {sortedBranches.map((branch) => (
            <BranchCollapsibleItem
              key={branch.id} // Using branch.id ensures stable React keys for proper reconciliation
              branch={branch}
            />
          ))}
        </div>

        {/* Loading overlay for refresh operations */}
        {isLoading && sortedBranches.length > 0 && (
          <div className="mt-2 flex items-center justify-center text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Actualizando datos con comparación semanal...
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export the component as default for cleaner imports
export default DailySalesBranches;