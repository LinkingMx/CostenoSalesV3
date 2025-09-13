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
import { formatChartAmount, getDefaultDailyChartTheme } from '../utils';
import { formatFullDayName } from '@/lib/utils/currency-formatting';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Custom tooltip component for the daily comparison chart.
 * Provides formatted currency values and proper Spanish localization.
 * Shows data for the specific comparison period with full date information.
 * Only renders when actively hovering over a data point.
 *
 * @component
 * @param {any} props - Recharts tooltip props
 * @returns {JSX.Element | null} Custom tooltip component
 */
function CustomTooltip({ active, payload, label }: any) {
  // Only show tooltip when actively hovering over a data point
  if (!active || !payload || !payload.length || payload.length === 0) {
    return null;
  }

  const data = payload[0]?.payload;
  const value = payload[0]?.value;

  // Additional validation to ensure we have valid data
  if (!data || typeof value !== 'number') {
    return null;
  }

  // Format full Spanish date (05 de Septiembre)
  const fullSpanishDate = data.date ?
    data.date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long'
    }) : '';

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs">
      <p className="text-sm font-semibold text-foreground mb-2 border-b border-border pb-2">
        {label} {/* Period label from API: "Sep 05" */}
      </p>
      {fullSpanishDate && (
        <p className="text-xs text-muted-foreground mb-3">
          {fullSpanishDate} {/* Full Spanish date: "05 de septiembre" */}
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
          {formatChartAmount(value)}
        </span>
      </div>
    </div>
  );
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
  height = 210, // Reduced from 300 to 210 (70% of original height)
  showGrid = true,
  orientation = 'vertical'
}: DailyComparisonChartProps) {
  const theme = getDefaultDailyChartTheme();
  const isMobile = useIsMobile();

  // Memoize chart configuration for performance - with mobile optimizations
  const chartConfig = React.useMemo(() => ({
    margin: isMobile
      ? { top: 20, right: 35, left: 35, bottom: 25 } // Extra margins for mobile
      : { top: 20, right: 30, left: 30, bottom: 20 }, // Standard margins for desktop
    cornerRadius: 4,
    maxBarSize: orientation === 'vertical' ? 80 : undefined
  }), [orientation, isMobile]);
  
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
          margin={chartConfig.margin}
        >
          {/* Grid lines for better readability - matching weekly chart style */}
          {showGrid && (
            <CartesianGrid
              strokeDasharray="2 2"
              stroke={theme.gridColor}
              opacity={0.8}
              horizontal={true}
              vertical={false}
            />
          )}

          {/* X-axis with improved styling matching weekly chart */}
          <XAxis
            dataKey="period"
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 13,
              fill: theme.textColor,
              fontFamily: 'inherit',
              fontWeight: 600
            }}
            dy={10}
            height={40}
            interval={0}
            angle={0}
            textAnchor="middle"
            domain={['dataMin', 'dataMax']}
            padding={{ left: 10, right: 10 }}
          />

          {/* Y-axis hidden - no labels needed */}
          <YAxis hide />

          {/* Custom tooltip with proper hover behavior */}
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: theme.primaryColor, strokeWidth: 1, strokeDasharray: '3 3' }}
            allowEscapeViewBox={{ x: false, y: false }}
            wrapperStyle={{ outline: 'none' }}
            animationDuration={200}
          />

          {/* Line with improved styling matching weekly chart */}
          <Line
            type="monotone"
            dataKey="amount"
            stroke={theme.primaryColor}
            strokeWidth={2}
            dot={{
              fill: theme.primaryColor,
              strokeWidth: 0,
              r: 4,
              cursor: 'pointer'
            }}
            activeDot={{
              r: 6,
              stroke: theme.primaryColor,
              strokeWidth: 2,
              fill: theme.backgroundColor,
              cursor: 'pointer'
            }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DailyComparisonChart;