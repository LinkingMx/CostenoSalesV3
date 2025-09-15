/**
 * Monthly Comparison Chart Component
 * Recharts line chart for displaying 3-month sales totals
 */

import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import type { MonthlyComparisonChartProps } from '../types';
import { formatChartAmount, getDefaultChartTheme } from '../utils';

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
  payload?: {
    month?: string;
    [key: string]: unknown;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

/**
 * Custom tooltip component for the monthly comparison chart.
 * Provides formatted currency values and proper Spanish localization.
 * Shows data for the specific selected month.
 */
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs">
        <p className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-2">
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((entry: TooltipPayload, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-foreground">
                  Total
                </span>
              </div>
              <span className="text-sm font-bold text-primary">
                {formatChartAmount(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

/**
 * MonthlyComparisonChart - Line chart component for monthly sales comparison
 *
 * Displays total sales for 3 consecutive months as a line chart
 */
export const MonthlyComparisonChart = React.memo(function MonthlyComparisonChart({
  data,
  height = 300,
  showLegend = false,
  className = ''
}: MonthlyComparisonChartProps) {
  const theme = getDefaultChartTheme();

  // Transform data for line chart - 3 points
  const chartData = React.useMemo(() => {
    return data.monthLabels.map((label, index) => ({
      month: label,
      value: data.monthValues[index] || 0
    }));
  }, [data]);

  // Memoize chart configuration for performance
  const chartConfig = React.useMemo(() => ({
    margin: { top: 20, right: 30, left: 30, bottom: 40 }, // Increased left and bottom margins
    strokeWidth: 2,
    dotSize: 4,
    activeDotSize: 6
  }), []);

  // Early return if no data
  if (!data?.monthValues || data.monthValues.length === 0) {
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
      aria-label="Gráfico de comparación mensual de ventas"
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={chartConfig.margin}
        >
          {/* Grid lines for better readability */}
          <CartesianGrid
            strokeDasharray="2 2"
            stroke={theme.gridColor}
            opacity={0.8}
            horizontal={true}
            vertical={false}
          />

          {/* X-axis with month names */}
          <XAxis
            dataKey="month"
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
            textAnchor="middle"
          />

          {/* Y-axis hidden - no labels needed */}
          <YAxis hide />

          {/* Custom tooltip with proper formatting */}
          <Tooltip
            content={<CustomTooltip />}
            cursor={false}
          />

          {/* Legend showing month labels */}
          {showLegend && (
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
                fontFamily: 'inherit'
              }}
            />
          )}

          {/* Line for monthly data */}
          <Line
            type="monotone"
            dataKey="value"
            name="Ventas Mensuales"
            stroke={data.monthColors[0] || theme.primaryColor}
            strokeWidth={chartConfig.strokeWidth}
            dot={{
              fill: data.monthColors[0] || theme.primaryColor,
              strokeWidth: 0,
              r: chartConfig.dotSize
            }}
            activeDot={{
              r: chartConfig.activeDotSize,
              stroke: data.monthColors[0] || theme.primaryColor,
              strokeWidth: 2,
              fill: theme.backgroundColor
            }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default MonthlyComparisonChart;