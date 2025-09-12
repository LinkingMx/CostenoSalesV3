import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MonthlySalesBranchesHeader } from './components/monthly-sales-branches-header';
import { BranchCollapsibleItem } from './components/branch-collapsible-item';
import type { MonthlySalesBranchesProps } from './types';
import { isCompleteMonthSelected, DUMMY_BRANCHES_DATA } from './utils';

/**
 * MonthlySalesBranches - Component for displaying monthly branch sales data in collapsible format.
 * 
 * This component shows detailed sales information for each branch when exactly one complete month 
 * (first day to last day) is selected in the date filter. Each branch is displayed as a 
 * collapsible card showing sales metrics, open/closed accounts, and average ticket information.
 * 
 * @component
 * @param {MonthlySalesBranchesProps} props - Component configuration props
 * @returns {JSX.Element | null} Monthly branch sales interface or null if conditions not met
 * 
 * @description Key features:
 * - Conditional rendering based on complete month selection (first to last day)
 * - Spanish-localized branch sales data display
 * - Collapsible cards for detailed branch metrics
 * - Mobile-optimized responsive design (375px viewport)
 * - Consistent styling with other sales components
 * - Support for both mock and real branch data
 * 
 * Business Logic:
 * - Only renders when selectedDateRange represents exactly one complete month (first to last day)
 * - Uses dummy data for development but can accept real branch data via props
 * - Each branch shows: total sales, percentage growth, open accounts, closed sales, average ticket
 * - Maintains consistent currency formatting throughout the application
 * 
 * @example
 * ```tsx
 * // Basic usage with mock data - only shows for complete month selection
 * <MonthlySalesBranches 
 *   selectedDateRange={completeMonthRange}
 * />
 * 
 * // With custom branch data
 * <MonthlySalesBranches 
 *   selectedDateRange={completeMonthRange}
 *   branches={realBranchData}
 * />
 * ```
 */
export function MonthlySalesBranches({ 
  selectedDateRange, 
  branches = DUMMY_BRANCHES_DATA 
}: MonthlySalesBranchesProps) {
  
  // Only render if exactly one complete month is selected (first day to last day)
  if (!isCompleteMonthSelected(selectedDateRange)) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardContent className="px-4 py-3">
        {/* Header section */}
        <MonthlySalesBranchesHeader />
        
        {/* Branch collapsibles */}
        <div 
          className="space-y-2"
          role="region"
          aria-label="Detalles de ventas por sucursal mensuales"
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

export default MonthlySalesBranches;