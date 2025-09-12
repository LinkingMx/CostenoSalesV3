import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WeeklySalesBranchesHeader } from './components/weekly-sales-branches-header';
import { BranchCollapsibleItem } from './components/branch-collapsible-item';
import type { WeeklySalesBranchesProps } from './types';
import { isExactWeekSelected, DUMMY_BRANCHES_DATA } from './utils';

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
 * - Conditional rendering based on exact week selection (Monday to Sunday)
 * - Spanish-localized branch sales data display
 * - Collapsible cards for detailed branch metrics
 * - Mobile-optimized responsive design (375px viewport)
 * - Consistent styling with daily-sales-comparison component
 * - Support for both mock and real branch data
 * 
 * Business Logic:
 * - Only renders when selectedDateRange represents exactly one week (7 days, Monday to Sunday)
 * - Uses dummy data for development but can accept real branch data via props
 * - Each branch shows: total sales, percentage growth, open accounts, closed sales, average ticket
 * - Maintains consistent currency formatting throughout the application
 * 
 * @example
 * ```tsx
 * // Basic usage with mock data - only shows for exact week selection
 * <WeeklySalesBranches 
 *   selectedDateRange={weekRange}
 * />
 * 
 * // With custom branch data
 * <WeeklySalesBranches 
 *   selectedDateRange={weekRange}
 *   branches={realBranchData}
 * />
 * ```
 */
export function WeeklySalesBranches({ 
  selectedDateRange, 
  branches = DUMMY_BRANCHES_DATA 
}: WeeklySalesBranchesProps) {
  
  // Only render if exactly one week is selected (Monday to Sunday)
  if (!isExactWeekSelected(selectedDateRange)) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardContent className="px-4 py-3">
        {/* Header section */}
        <WeeklySalesBranchesHeader />
        
        {/* Branch collapsibles */}
        <div 
          className="space-y-2"
          role="region"
          aria-label="Detalles de ventas por sucursal semanales"
        >
          {branches.map((branch) => (
            <BranchCollapsibleItem
              key={branch.id}
              branch={branch}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default WeeklySalesBranches;