import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import type { DailyChartHeaderProps } from '../types';

/**
 * DailyChartHeader - Header component for the daily chart comparison section.
 * 
 * Displays the main title with trending icon and descriptive subtitle for daily chart analysis.
 * Matches the design pattern with proper spacing and typography for chart context.
 * Uses TrendingUp icon to differentiate from other daily components and indicate comparison.
 * 
 * @component
 * @param {DailyChartHeaderProps} props - Component configuration props
 * @returns {JSX.Element} Styled daily chart header section
 * 
 * @description Features:
 * - TrendingUp icon with main title for daily chart comparison
 * - Descriptive subtitle explaining the single day analysis scope
 * - Consistent typography and spacing with other dashboard components
 * - Semantic HTML structure for accessibility
 * - Optional customizable title and subtitle text
 * - Default Spanish localization for Mexican market
 * - Theme-consistent styling using design system variables
 * - Perfect match with weekly-chart-header styling for consistency
 * 
 * @example
 * ```tsx
 * <DailyChartHeader
 *   title="Gráfica de ventas (Diarias)"
 *   subtitle="Día filtrado + 3 días anteriores"
 * />
 * ```
 */
export function DailyChartHeader({
  title = "Gráfica de ventas (Diarias)",
  subtitle = "Día filtrado + 3 días anteriores"
}: DailyChartHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <TrendingUp className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="flex flex-col">
        <h2 className="text-base font-semibold leading-none tracking-tight text-foreground">
          {title} {/* Default: "Gráfica de ventas (Diarias)" (Daily Sales Chart) */}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {subtitle} {/* Default: "Día filtrado + 3 días anteriores" (Filtered day + 3 previous days) */}
        </p>
      </div>
    </div>
  ); // End DailyChartHeader
}

export default DailyChartHeader;