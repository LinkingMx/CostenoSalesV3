import * as React from 'react';
import { Calendar } from 'lucide-react';
import type { WeeklyComparisonHeaderProps } from '../types';

/**
 * WeeklyComparisonHeader - Header component for the weekly sales comparison section.
 * 
 * Displays the main title with calendar icon and descriptive subtitle for weekly data.
 * Matches the design pattern with proper spacing and typography for weekly context.
 * 
 * @component
 * @param {WeeklyComparisonHeaderProps} props - Component configuration props
 * @returns {JSX.Element} Styled weekly header section
 * 
 * @description Features:
 * - Calendar icon with main title for weekly sales
 * - Descriptive subtitle explaining the weekly data scope
 * - Consistent typography and spacing with daily component
 * - Semantic HTML structure for accessibility
 * - Optional customizable title and subtitle text
 * - Default Spanish localization for Mexican market
 * 
 * @example
 * ```tsx
 * <WeeklyComparisonHeader 
 *   title="Ventas semanales"
 *   subtitle="Semana seleccionada (Lunes - Viernes)"
 * />
 * ```
 */
export function WeeklyComparisonHeader({ 
  title = "Ventas semanales",
  subtitle = "Semana seleccionada (Lunes - Viernes)"
}: WeeklyComparisonHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
        <Calendar className="h-4 w-4 text-gray-600" />
      </div>
      <div className="flex flex-col">
        <h2 className="text-base font-semibold leading-none tracking-tight text-gray-900">
          {title} {/* Default: "Ventas semanales" (Weekly Sales) */}
        </h2>
        <p className="text-sm text-gray-600 mt-0.5">
          {subtitle} {/* Default: "Semana seleccionada (Lunes - Viernes)" */}
        </p>
      </div>
    </div>
  ); // End WeeklyComparisonHeader
}

export default WeeklyComparisonHeader;