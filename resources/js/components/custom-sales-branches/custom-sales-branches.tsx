import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CustomSalesBranchesHeader } from './components/custom-sales-branches-header';
import { BranchCustomCollapsibleItem } from './components/branch-custom-collapsible-item';
import type { CustomSalesBranchesProps } from './types';
import { isCustomRangeSelected, DUMMY_CUSTOM_BRANCHES_DATA } from './utils';

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
export function CustomSalesBranches({ 
  selectedDateRange, 
  branches = DUMMY_CUSTOM_BRANCHES_DATA 
}: CustomSalesBranchesProps) {
  
  // Only render if custom range is selected (not single day, complete week, or complete month)
  if (!isCustomRangeSelected(selectedDateRange)) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardContent className="px-4 py-3">
        {/* Header section */}
        <CustomSalesBranchesHeader />
        
        {/* Branch collapsibles */}
        <div 
          className="space-y-2"
          role="region"
          aria-label="Detalles de ventas por sucursal rango personalizado"
        >
          {branches.map((branch) => (
            <BranchCustomCollapsibleItem
              key={branch.id}
              branch={branch}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CustomSalesBranches;