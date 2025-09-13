import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import type { DailyComparisonChartProps } from '../types';
import { formatChartAmount, formatFullDayName, getDefaultDailyChartTheme } from '../utils';

/**
 * Custom tooltip component for the daily comparison chart.
 * Provides formatted currency values and proper Spanish localization.
 * Shows data for the specific comparison period with full date information.
 * 
 * @component
 * @param {any} props - Recharts tooltip props
 * @returns {JSX.Element | null} Custom tooltip component
 */
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    
    if (!data) return null;
    
    // Get the full date information
    const fullDate = data.date ? formatFullDayName(data.date) : '';
    const formattedDate = data.date ? 
      data.date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) : '';
    
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs">
        <p className="text-sm font-semibold text-foreground mb-2 border-b border-border pb-2">
          {label} {/* Period label: "Hoy", "Ayer", etc. */}
        </p>
        {fullDate && (
          <p className="text-xs text-muted-foreground mb-2">
            {fullDate} {/* Full day name: "Jueves, 12 de Septiembre" */}
          </p>
        )}
        {formattedDate && (
          <p className="text-xs text-muted-foreground mb-3">
            {formattedDate} {/* Date: "12/09/2025" */}
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: payload[0]?.color }}
            />
            <span className="text-sm font-medium text-foreground">
              Ventas
            </span>
          </div>
          <span className="text-sm font-bold text-primary">
            {formatChartAmount(payload[0]?.value)}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * DailyComparisonChart - Chart component for displaying daily sales comparison.
 * 
 * Renders a responsive bar chart comparing sales data across 4 comparison periods:
 * Today, Yesterday, Last Week Same Day, Last Month Same Day.
 * Uses Recharts library with proper theming and accessibility features.
 * Integrates with the application's design system and theme variables.
 * 
 * @component
 * @param {DailyComparisonChartProps} props - Chart configuration and data
 * @returns {JSX.Element} Interactive bar chart with daily comparison
 * 
 * @description Features:
 * - Responsive vertical or horizontal bar chart with 4 comparison periods
 * - Custom tooltip with formatted currency amounts and full date information
 * - Spanish period labels for Mexican localization
 * - Theme-consistent colors with primary color for selected day
 * - Accessible chart structure with proper ARIA labels
 * - Smooth animations and hover interactions
 * - Grid lines for better data readability (optional)
 * - Automatic color coding with visual emphasis on selected day
 * - Hidden Y-axis for cleaner appearance following weekly chart pattern
 * 
 * @example
 * ```tsx
 * <DailyComparisonChart 
 *   data={chartData}
 *   height={350}
 *   showGrid={true}
 *   orientation="vertical"
 * />
 * ```
 */
export function DailyComparisonChart({ 
  data,
  height = 300,
  showGrid = true,
  orientation = 'vertical'
}: DailyComparisonChartProps) {
  const theme = getDefaultDailyChartTheme();
  
  // Memoize chart configuration for performance
  const chartConfig = React.useMemo(() => ({
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
    cornerRadius: 4,
    maxBarSize: orientation === 'vertical' ? 80 : undefined
  }), [orientation]);
  
  // Format Y-axis tick values for better readability
  const formatYAxisTick = React.useCallback((value: number) => {
    return formatChartAmount(value, true); // Use abbreviated format
  }, []);
  
  // Prepare chart data from comparison points
  const chartData = React.useMemo(() => {
    return data.comparisonData.map(point => ({
      period: point.period,
      amount: Number(point.amount), // Ensure it's a number
      fill: point.color,
      date: point.date,
      isSelected: point.isSelected
    }));
  }, [data.comparisonData]);
  
  // Validate data before rendering
  if (!data?.comparisonData || data.comparisonData.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-muted/50 rounded-lg"
        style={{ height }}
        role="img"
        aria-label="Gráfico no disponible"
      >
        <p className="text-sm text-muted-foreground">
          No hay datos disponibles para mostrar el gráfico
        </p>
      </div>
    );
  }
  
  return (
    <div 
      className="w-full focus:outline-none focus:ring-0 [&_svg]:focus:outline-none [&_svg]:outline-none [&_*]:focus:outline-none [&_*]:outline-none"
      role="img"
      aria-label="Gráfico de comparación diaria de ventas"
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="period"
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone"
            dataKey="amount"
            stroke="#897053"
            strokeWidth={3}
            dot={{ r: 6, strokeWidth: 2 }}
            activeDot={{ r: 8, strokeWidth: 2 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DailyComparisonChart;