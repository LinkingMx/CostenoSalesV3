import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WeeklySalesBranchesHeader } from './components/weekly-sales-branches-header';
import { BranchCollapsibleItem } from './components/branch-collapsible-item';
import { WeeklyBranchesLoadingSkeleton } from './components/weekly-branches-loading-skeleton';
import { WeeklyBranchesError } from './components/weekly-branches-error';
import type { WeeklySalesBranchesProps } from './types';
import { useWeeklyBranches } from './hooks/use-weekly-branches';

/**
 * WeeklySalesBranches - Component for displaying weekly branch sales data in collapsible format.
 *
 * This component shows detailed sales information for each branch when exactly one week
 * (Monday to Sunday) is selected in the date filter. Each branch is displayed as a
 * collapsible card showing sales metrics, open/closed accounts, and average ticket information.
 *
 * @component
 * @param {WeeklySalesBranchesProps} props - Component configuration props
 * @returns {JSX.Element | null} Weekly branch sales interface or null if conditions not met
 *
 * @description Key features:
 * - Real-time API data integration using weekly chart service
 * - Conditional rendering based on exact week selection (Monday to Sunday)
 * - Spanish-localized branch sales data display in Mexican pesos
 * - Collapsible cards for detailed branch metrics
 * - Loading states with skeleton animation
 * - Error handling with retry functionality
 * - Mobile-optimized responsive design (375px viewport)
 * - Branches sorted by total sales (descending order)
 *
 * Business Logic:
 * - Only renders when selectedDateRange represents exactly one week (7 days, Monday to Sunday)
 * - Fetches real branch data from API cards section
 * - Each branch shows: total sales, percentage growth, open accounts, closed sales, average ticket
 * - Maintains consistent Mexican peso formatting throughout the application
 *
 * @example
 * ```tsx
 * // Usage with real API data - shows for exact week selection
 * <WeeklySalesBranches selectedDateRange={weekRange} />
 * ```
 */
export function WeeklySalesBranches({ selectedDateRange }: WeeklySalesBranchesProps) {
  // Use custom hook for API integration and state management
  const { branchesData, isLoading, error, isValidCompleteWeek, isCurrentWeek, refetch } = useWeeklyBranches(selectedDateRange);

  // Only render if exactly one week is selected (Monday to Sunday)
  if (!isValidCompleteWeek) {
    return null;
  }

  // Show loading skeleton while fetching data
  if (isLoading) {
    return <WeeklyBranchesLoadingSkeleton />;
  }

  // Show error state with retry functionality
  if (error) {
    return <WeeklyBranchesError error={error} onRetry={refetch} />;
  }

  // Show empty state if no branches data
  if (branchesData.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="px-4 py-3">
          <WeeklySalesBranchesHeader />
          <div className="text-center py-8 text-muted-foreground">
            No hay datos de sucursales disponibles para esta semana.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="px-4 py-3">
        {/* Header section */}
        <WeeklySalesBranchesHeader />

        {/* Branch collapsibles with real API data */}
        <div
          className="space-y-2"
          role="region"
          aria-label="Detalles de ventas por sucursal semanales"
        >
          {branchesData.map((branch) => (
            <BranchCollapsibleItem
              key={branch.id}
              branch={branch}
              isCurrentWeek={isCurrentWeek}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default WeeklySalesBranches;