import { BarChart3 } from 'lucide-react';
import type { WeeklyChartHeaderProps } from '../types';

/**
 * WeeklyChartHeader - Header component for the weekly chart comparison section.
 *
 * Displays the main title with chart icon and descriptive subtitle for weekly chart analysis.
 * Matches the design pattern with proper spacing and typography for chart context.
 * Uses BarChart3 icon to differentiate from other weekly components.
 *
 * @component
 * @param {WeeklyChartHeaderProps} props - Component configuration props
 * @returns {JSX.Element} Styled weekly chart header section
 *
 * @description Features:
 * - BarChart3 icon with main title for weekly chart comparison
 * - Descriptive subtitle explaining the 3-week analysis scope
 * - Consistent typography and spacing with other dashboard components
 * - Semantic HTML structure for accessibility
 * - Optional customizable title and subtitle text
 * - Default Spanish localization for Mexican market
 * - Theme-consistent styling using design system variables
 *
 * @example
 * ```tsx
 * <WeeklyChartHeader
 *   title="Comparación Semanal"
 *   subtitle="Análisis de 3 semanas por día"
 * />
 * ```
 */
export function WeeklyChartHeader({ title = 'Comparación Semanal', subtitle = 'Análisis de 3 semanas por día' }: WeeklyChartHeaderProps) {
    return (
        <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
                <h2 className="text-base leading-none font-semibold tracking-tight text-foreground">
                    {title} {/* Default: "Comparación Semanal" (Weekly Comparison) */}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                    {subtitle} {/* Default: "Análisis de 3 semanas por día" (3-week daily analysis) */}
                </p>
            </div>
        </div>
    ); // End WeeklyChartHeader
}

export default WeeklyChartHeader;
