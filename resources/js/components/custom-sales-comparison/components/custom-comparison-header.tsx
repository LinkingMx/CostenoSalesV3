import * as React from 'react';
import { Calendar } from 'lucide-react';
import type { CustomComparisonHeaderProps } from '../types';

/**
 * CustomComparisonHeader - Header component for the custom range sales comparison section.
 * 
 * Displays the main title with calendar icon and descriptive subtitle for custom range data.
 * Shows the selected date range information for better context.
 * 
 * @component
 * @param {CustomComparisonHeaderProps} props - Component configuration props
 * @returns {JSX.Element} Styled custom range header section
 * 
 * @description Features:
 * - Calendar icon with main title for custom range sales
 * - Descriptive subtitle with actual date range display
 * - Consistent typography and spacing with other comparison components
 * - Semantic HTML structure for accessibility
 * - Optional customizable title and subtitle text
 * - Default Spanish localization for Mexican market
 * 
 * @example
 * ```tsx
 * const dateRange = { from: new Date('2025-09-01'), to: new Date('2025-09-15') };
 * 
 * <CustomComparisonHeader 
 *   title="Análisis de ventas"
 *   subtitle="Rango seleccionado"
 *   dateRange={dateRange}
 * />
 * ```
 */
export function CustomComparisonHeader({
  title = "Análisis de ventas",
  subtitle = "Rango seleccionado"
}: CustomComparisonHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <Calendar className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="flex flex-col">
        <h2 className="text-base font-semibold leading-none tracking-tight text-foreground">
          {title} {/* Default: "Análisis de ventas" (Sales Analysis) */}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {subtitle} {/* Default: "Rango seleccionado" */}
        </p>
      </div>
    </div>
  ); // End CustomComparisonHeader
}

export default CustomComparisonHeader;