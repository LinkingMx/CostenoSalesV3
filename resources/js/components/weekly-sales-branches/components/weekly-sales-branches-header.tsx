import { Building } from 'lucide-react';

/**
 * WeeklySalesBranchesHeader - Header component for the weekly sales branches section.
 * 
 * Displays the title and subtitle for the weekly branch sales data section.
 * Maintains consistent styling with other dashboard components while clearly
 * indicating this is weekly (not daily) branch data.
 * 
 * @component
 * @returns {JSX.Element} Header section with icon, title, and description
 * 
 * @description Styling choices:
 * - Uses Building icon to represent branches/locations
 * - Title emphasizes "Semanal" to differentiate from daily version
 * - Subtitle describes the weekly nature of the data
 * - Follows the same visual hierarchy as daily-sales-comparison
 * 
 * @example
 * ```tsx
 * <WeeklySalesBranchesHeader />
 * ```
 */
export function WeeklySalesBranchesHeader() {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
        <Building className="h-4 w-4 text-gray-600" />
      </div>
      <div className="flex flex-col">
        <h2 className="text-base font-semibold leading-none tracking-tight text-gray-900">
          Ventas por sucursal (Semanal)
        </h2>
        <p className="text-sm text-gray-600 mt-0.5">
          Ventas semanales por sucursal detalladas
        </p>
      </div>
    </div>
  );
}