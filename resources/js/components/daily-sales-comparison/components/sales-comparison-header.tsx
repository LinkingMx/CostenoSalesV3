import * as React from 'react';
import { Calendar } from 'lucide-react';
import type { SalesComparisonHeaderProps } from '../types';

/**
 * SalesComparisonHeader - Header component for the daily sales comparison section.
 * 
 * Displays the main title with calendar icon and descriptive subtitle.
 * Matches the design from the provided mockup with proper spacing and typography.
 * 
 * @component
 * @param {SalesComparisonHeaderProps} props - Component configuration props
 * @returns {JSX.Element} Styled header section
 * 
 * @description Features:
 * - Calendar icon with main title
 * - Descriptive subtitle explaining the data shown
 * - Consistent typography and spacing
 * - Semantic HTML structure for accessibility
 * - Optional customizable title and subtitle text
 * 
 * @example
 * ```tsx
 * <SalesComparisonHeader 
 *   title="Análisis de ventas (Diarias)"
 *   subtitle="Día filtrado + 3 días anteriores"
 * />
 * ```
 */
export function SalesComparisonHeader({ 
  title = "Análisis de ventas (Diarias)",
  subtitle = "Día filtrado + 3 días anteriores"
}: SalesComparisonHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
        <Calendar className="h-4 w-4 text-gray-600" />
      </div>
      <div className="flex flex-col">
        <h2 className="text-base font-semibold leading-none tracking-tight text-gray-900">
          {title}
        </h2>
        <p className="text-sm text-gray-600 mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export default SalesComparisonHeader;