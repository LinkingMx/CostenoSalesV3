import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { BranchCollapsibleItem } from './components/branch-collapsible-item';
import { isSingleDaySelected, DUMMY_BRANCHES_DATA } from './utils';
import type { DailySalesBranchesProps } from './types';

/**
 * DailySalesBranches - A Spanish-localized branch sales collapsible component for daily sales data.
 * 
 * This component displays detailed sales information for each branch using independent collapsible items,
 * but only when a single day is selected from the main filter calendar. The component 
 * automatically hides when a date range (multiple days) is selected, ensuring the data
 * relevance and preventing confusion with aggregated multi-day data.
 * 
 * @component
 * @param {DailySalesBranchesProps} props - Component configuration props
 * @param {DateRange} [props.selectedDateRange] - The currently selected date range from main filter
 * @param {BranchSalesData[]} [props.branches=DUMMY_BRANCHES_DATA] - Array of branch sales data to display
 * 
 * @returns {JSX.Element | null} Branch sales collapsibles or null when date range spans multiple days
 * 
 * @description Key features:
 * - Spanish localization for all labels and currency formatting
 * - Conditional rendering based on single-day selection
 * - Independent collapsible interface - each branch can be expanded/collapsed separately
 * - 2x2 Grid layout in headers with branch name, total sales, ID, and performance badge
 * - Comprehensive sales metrics including totals, percentages, and ticket averages
 * - Visual indicators for sales growth using color-coded badges
 * - Integration with main-filter-calendar component via DateRange interface
 * 
 * @example
 * ```tsx
 * // Controlled usage with live data
 * <DailySalesBranches 
 *   selectedDateRange={selectedDateRange}
 *   branches={branchSalesData}
 * />
 * 
 * // Simple usage with dummy data (development/testing)
 * <DailySalesBranches selectedDateRange={selectedDateRange} />
 * 
 * // Will render null when multiple days are selected
 * const multiDayRange = { from: new Date('2025-01-01'), to: new Date('2025-01-07') };
 * <DailySalesBranches selectedDateRange={multiDayRange} /> // Returns null
 * ```
 * 
 * @see {@link MainFilterCalendar} for date range selection component
 * @see {@link BranchCollapsibleItem} for individual branch display logic
 * @see {@link isSingleDaySelected} for visibility condition logic
 */
export function DailySalesBranches({ 
  selectedDateRange, 
  branches = DUMMY_BRANCHES_DATA 
}: DailySalesBranchesProps) {
  // Memoize visibility check to prevent unnecessary recalculations
  // This optimization is especially important when parent components re-render frequently
  const isVisible = React.useMemo(() => {
    return isSingleDaySelected(selectedDateRange);
  }, [selectedDateRange]);

  // Memoize validated and sorted branches to prevent unnecessary processing on each render
  // Includes data validation and sorting by total sales in descending order for better UX
  const sortedBranches = React.useMemo(() => {
    // Validate branches data to prevent runtime errors
    if (!Array.isArray(branches) || branches.length === 0) {
      console.warn('DailySalesBranches: Invalid or empty branches data provided');
      return [];
    }

    // Filter out invalid branch objects and log warnings
    const validBranches = branches.filter((branch) => {
      if (!branch || typeof branch !== 'object') {
        console.warn('DailySalesBranches: Invalid branch object found:', branch);
        return false;
      }
      if (!branch.id || typeof branch.name !== 'string') {
        console.warn('DailySalesBranches: Branch missing required fields (id, name):', branch);
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
  }, [branches]);

  // Conditional rendering: Only display component when a single day is selected
  // This ensures data relevance and prevents confusion with multi-day aggregates
  if (!isVisible) {
    return null;
  }

  // Handle empty data state gracefully
  if (sortedBranches.length === 0) {
    return (
      <Card className="w-full border-border">
        <CardContent className="px-4 py-3">
          {/* Header section - matching custom-sales-branches style exactly */}
          <div className="flex items-center gap-3 mb-3">
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
          
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No hay datos de sucursales disponibles para la fecha seleccionada.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-border">
      <CardContent className="px-4 py-3">
        {/* Header section - matching custom-sales-branches style exactly */}
        <div className="flex items-center gap-3 mb-3">
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
      </CardContent>
    </Card>
  );
}

// Export the component as default for cleaner imports
export default DailySalesBranches;