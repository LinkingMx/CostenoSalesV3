import { Building } from 'lucide-react';

/**
 * MonthlySalesBranchesHeader - Header component for the monthly sales branches section.
 * 
 * Displays the title and subtitle for the monthly branch sales data section.
 * Maintains consistent styling with other dashboard components while clearly
 * indicating this is monthly (not daily or weekly) branch data.
 * 
 * @component
 * @returns {JSX.Element} Header section with icon, title, and description
 * 
 * @description Styling choices:
 * - Uses Building icon to represent branches/locations
 * - Title emphasizes "Por mes" to differentiate from daily and weekly versions
 * - Subtitle describes the monthly nature of the data
 * - Follows the same visual hierarchy as other components
 * 
 * @example
 * ```tsx
 * <MonthlySalesBranchesHeader />
 * ```
 */
export function MonthlySalesBranchesHeader() {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
        <Building className="h-4 w-4 text-gray-600" />
      </div>
      <div className="flex flex-col">
        <h2 className="text-base font-semibold leading-none tracking-tight text-gray-900">
          Ventas por sucursal (Por mes)
        </h2>
        <p className="text-sm text-gray-600 mt-0.5">
          Ventas mensuales por sucursal detalladas
        </p>
      </div>
    </div>
  );
}