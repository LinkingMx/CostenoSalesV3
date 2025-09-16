import { Calendar } from 'lucide-react';
import type { MonthlyComparisonHeaderProps } from '../types';

/**
 * MonthlyComparisonHeader - Header component for the monthly sales comparison section.
 *
 * Displays the main title with calendar icon and descriptive subtitle for monthly data.
 * Matches the design pattern with proper spacing and typography for monthly context.
 *
 * @component
 * @param {MonthlyComparisonHeaderProps} props - Component configuration props
 * @returns {JSX.Element} Styled monthly header section
 *
 * @description Features:
 * - Calendar icon with main title for monthly sales
 * - Descriptive subtitle explaining the monthly data scope
 * - Consistent typography and spacing with weekly component
 * - Semantic HTML structure for accessibility
 * - Optional customizable title and subtitle text
 * - Default Spanish localization for Mexican market
 *
 * @example
 * ```tsx
 * <MonthlyComparisonHeader
 *   title="Análisis de ventas (Mensuales)"
 *   subtitle="Mes completo seleccionado"
 * />
 * ```
 */
export function MonthlyComparisonHeader({
    title = 'Análisis de ventas (Mensuales)',
    subtitle = 'Mes completo seleccionado',
}: MonthlyComparisonHeaderProps) {
    return (
        <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Calendar className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
                <h2 className="text-base leading-none font-semibold tracking-tight text-foreground">
                    {title} {/* Default: "Análisis de ventas (Mensuales)" (Monthly Sales Analysis) */}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                    {subtitle} {/* Default: "Mes completo seleccionado" */}
                </p>
            </div>
        </div>
    ); // End MonthlyComparisonHeader
}

export default MonthlyComparisonHeader;
