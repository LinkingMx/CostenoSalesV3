import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import type { MonthlyComparisonChartProps } from '../types';
import { formatChartAmount } from '../utils';
import { CHART_CONFIG, CHART_COLORS } from '../constants';
import { useMonthlyChartTheme } from '../hooks/use-monthly-chart-theme';

/**
 * Props for the MonthlyChartTooltip component.
 */
interface MonthlyChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      fullMonthLabel: string;
      color: string;
      totalSales: number;
    };
  }>;
  label?: string;
}

/**
 * Custom tooltip component for the monthly chart.
 * Shows formatted sales amounts with month name and year information.
 *
 * @function MonthlyChartTooltip
 * @param {MonthlyChartTooltipProps} props - Recharts tooltip props
 * @returns {JSX.Element | null} Formatted tooltip content
 */
function MonthlyChartTooltip({ active, payload }: MonthlyChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-md">
      <p className="font-medium text-card-foreground text-sm mb-2">
        {data.fullMonthLabel}
      </p>
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <span className="text-sm text-muted-foreground">
          Ventas totales: <span className="font-semibold text-card-foreground">
            {formatChartAmount(data.totalSales, false)}
          </span>
        </span>
      </div>
    </div>
  );
}

/**
 * MonthlyComparisonChart - Line chart component for monthly sales comparison.
 *
 * Displays a simple line chart with 3 data points showing total sales for each month.
 * The chart shows the selected month plus 2 previous months for comparison.
 * Uses a clean, minimal design with just the essential elements.
 *
 * @component
 * @param {MonthlyComparisonChartProps} props - Chart configuration and data
 * @returns {JSX.Element} Interactive line chart with monthly totals
 *
 * @description Features:
 * - Simple line chart with 3 data points (months)
 * - X-axis shows abbreviated month names (Sept, Ago, Jul)
 * - Y-axis is hidden for clean appearance
 * - Hover tooltips show full month name and formatted sales total
 * - Primary color (#897053) for the line with subtle styling
 * - Responsive design that adapts to container size
 * - Theme integration for light/dark mode support
 * - Accessibility-compliant with proper ARIA labels
 *
 * @example
 * ```tsx
 * <MonthlyComparisonChart
 *   data={monthlyChartData}
 *   height={300}
 *   showGrid={true}
 * />
 * ```
 */
export function MonthlyComparisonChart({
  data,
  height = CHART_CONFIG.DEFAULT_HEIGHT
}: MonthlyComparisonChartProps) {
  // Use memoized theme hook to prevent unnecessary recalculations
  const theme = useMonthlyChartTheme();

  // Early return if no data
  if (!data.monthlyData || data.monthlyData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ height }}
        role="alert"
        aria-label="No hay datos de gráfico disponibles"
      >
        <p className="text-sm">No hay datos disponibles para mostrar</p>
      </div>
    );
  }

  // Prepare chart data - reverse order so most recent month appears on the right
  const chartData = [...data.monthlyData].reverse();

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          {/* X-Axis with month labels */}
          <XAxis
            dataKey="monthLabel"
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 12,
              fill: theme.textColor,
              dy: 10
            }}
            interval={0}
          />

          {/* Hidden Y-Axis for clean appearance */}
          <YAxis hide />

          {/* Custom Tooltip */}
          <Tooltip
            content={<MonthlyChartTooltip />}
            cursor={{
              stroke: theme.primaryColor,
              strokeWidth: 1,
              strokeDasharray: '3 3'
            }}
          />

          {/* Single line showing the monthly totals */}
          <Line
            type="monotone"
            dataKey="totalSales"
            stroke={theme.primaryColor}
            strokeWidth={3}
            dot={{
              fill: theme.primaryColor,
              strokeWidth: 2,
              stroke: CHART_COLORS.DOT_FILL,
              r: 6
            }}
            activeDot={{
              r: 8,
              stroke: theme.primaryColor,
              strokeWidth: 2,
              fill: CHART_COLORS.DOT_FILL
            }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlyComparisonChart;