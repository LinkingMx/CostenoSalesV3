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
    <header className="mb-3">
      {/* Main title with calendar icon for visual context */}
      <div className="flex items-center gap-2 mb-1">
        <Calendar 
          className="h-5 w-5 text-gray-600" 
          aria-hidden="true" // Decorative icon, not essential for screen readers
        />
        <h2 className="text-lg font-semibold text-gray-900">
          {title} {/* Default: "Análisis de ventas (Mensuales)" (Monthly Sales Analysis) */}
        </h2>
      </div>
      
      {/* Descriptive subtitle explaining the data scope */}
      <p className="text-sm text-gray-600 ml-7"> {/* ml-7 aligns with title text after icon */}
        {subtitle} {/* Default: "Mes completo seleccionado" */}
      </p>
    </header>
  ); // End MonthlyComparisonHeader
}

export default MonthlyComparisonHeader;