import { Building } from 'lucide-react';

/**
 * CustomSalesBranchesHeader - Header component for the custom range sales branches section.
 *
 * Displays the title and subtitle for the custom range branch sales data section.
 * Maintains consistent styling with other dashboard components while clearly
 * indicating this is for custom date ranges (not single day, complete week, or complete month) branch data.
 *
 * @component
 * @returns {JSX.Element} Header section with icon, title, and description
 *
 * @description Styling choices:
 * - Uses Building icon to represent branches/locations
 * - Title emphasizes the custom range nature of the data
 * - Subtitle describes the range-based nature of the data
 * - Follows the same visual hierarchy as other components
 *
 * @example
 * ```tsx
 * <CustomSalesBranchesHeader />
 * ```
 */
export function CustomSalesBranchesHeader() {
    return (
        <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
                <h2 className="text-base leading-none font-semibold tracking-tight text-foreground">Ventas por sucursal</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">Ventas por sucursal detalladas</p>
            </div>
        </div>
    );
}
