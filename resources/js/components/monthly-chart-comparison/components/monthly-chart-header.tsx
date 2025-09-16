import { TrendingUp } from 'lucide-react';
import type { MonthlyChartHeaderProps } from '../types';

/**
 * MonthlyChartHeader - Header component for the monthly chart comparison section.
 *
 * Displays the main title with trending icon and descriptive subtitle for monthly chart analysis.
 * Matches the design pattern with proper spacing and typography for chart context.
 * Uses TrendingUp icon to differentiate from other monthly components and indicate comparison.
 *
 * @component
 * @param {MonthlyChartHeaderProps} props - Component configuration props
 * @returns {JSX.Element} Styled monthly chart header section
 *
 * @description Features:
 * - TrendingUp icon with main title for monthly chart comparison
 * - Descriptive subtitle explaining the 3-month analysis scope
 * - Consistent typography and spacing with other dashboard components
 * - Semantic HTML structure for accessibility
 * - Optional customizable title and subtitle text
 * - Default Spanish localization for Mexican market
 * - Theme-consistent styling using design system variables
 * - Perfect match with daily-chart-header and weekly-chart-header styling for consistency
 *
 * @example
 * ```tsx
 * <MonthlyChartHeader
 *   title="Gráfica de ventas (Mensuales)"
 *   subtitle="Mes filtrado + 2 meses anteriores"
 * />
 * ```
 */
export function MonthlyChartHeader({
    title = 'Gráfica de ventas (Mensuales)',
    subtitle = 'Comparación diaria de 3 meses consecutivos',
}: MonthlyChartHeaderProps) {
    return (
        <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
                <h2 className="text-base leading-none font-semibold tracking-tight text-foreground">
                    {title} {/* Default: "Gráfica de ventas (Mensuales)" (Monthly Sales Chart) */}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                    {subtitle} {/* Default: "Mes filtrado + 2 meses anteriores" (Filtered month + 2 previous months) */}
                </p>
            </div>
        </div>
    ); // End MonthlyChartHeader
}

export default MonthlyChartHeader;
