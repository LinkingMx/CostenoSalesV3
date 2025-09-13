import * as React from 'react';
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
  title = "Análisis de ventas (Mensuales)",
  subtitle = "Mes completo seleccionado"
}: MonthlyComparisonHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
        <Calendar className="h-4 w-4 text-gray-600" />
      </div>
      <div className="flex flex-col">
        <h2 className="text-base font-semibold leading-none tracking-tight text-gray-900">
          {title} {/* Default: "Análisis de ventas (Mensuales)" (Monthly Sales Analysis) */}
        </h2>
        <p className="text-sm text-gray-600 mt-0.5">
          {subtitle} {/* Default: "Mes completo seleccionado" */}
        </p>
      </div>
    </div>
  ); // End MonthlyComparisonHeader
}

export default MonthlyComparisonHeader;