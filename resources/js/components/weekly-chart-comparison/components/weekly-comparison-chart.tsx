import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { WeeklyComparisonChartProps } from '../types';
import { formatChartAmount, getDefaultChartTheme } from '../utils';

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
  payload?: {
    fullDayName?: string;
    [key: string]: unknown;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

/**
 * Custom tooltip component for the weekly comparison chart.
 * Provides formatted currency values and proper Spanish localization.
 * Shows data for the specific selected day across all 3 weeks.
 *
 * @component
 * @param {CustomTooltipProps} props - Recharts tooltip props
 * @returns {JSX.Element | null} Custom tooltip component
 */
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    // Get full day name from the data
    const fullDayName = payload[0]?.payload?.fullDayName || label;
    
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs">
        <p className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-2">
          {fullDayName}
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
                  {entry.name}
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
 * WeeklyComparisonChart - Chart component for displaying 3-week sales comparison.
 * 
 * Renders a responsive line chart comparing daily sales data across 3 weeks.
 * Uses Recharts library with proper theming and accessibility features.
 * Integrates with the application's design system and theme variables.
 * 
 * @component
 * @param {WeeklyComparisonChartProps} props - Chart configuration and data
 * @returns {JSX.Element} Interactive line chart with 3-week comparison
 * 
 * @description Features:
 * - Responsive line chart with 3 week data series
 * - Custom tooltip with formatted currency amounts
 * - Spanish day name labels for Mexican localization
 * - Theme-consistent colors and styling
 * - Accessible chart structure with proper labels
 * - Smooth line animations and hover interactions
 * - Grid lines for better data readability
 * - Legend showing week labels with color coding
 * 
 * @example
 * ```tsx
 * <WeeklyComparisonChart 
 *   data={chartData}
 *   height={350}
 *   showLegend={true}
 *   showGrid={true}
 * />
 * ```
 */
export function WeeklyComparisonChart({ 
  data,
  height = 300,
  showLegend = true,
  showGrid = true
}: WeeklyComparisonChartProps) {
  const theme = getDefaultChartTheme();
  
  // Memoize chart configuration for performance
  const chartConfig = React.useMemo(() => ({
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
    strokeWidth: 2,
    dotSize: 4,
    activeDotSize: 6
  }), []);

  // Validate data before rendering
  if (!data?.dailyData || data.dailyData.length === 0) {
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
      aria-label="Gráfico de comparación semanal de ventas"
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data.dailyData}
          margin={chartConfig.margin}
        >
          {/* Grid lines for better readability */}
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="2 2" 
              stroke={theme.gridColor}
              opacity={0.8}
              horizontal={true}
              vertical={false}
            />
          )}
          
          {/* X-axis with improved Spanish day names */}
          <XAxis 
            dataKey="dayName"
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
          />
          
          {/* Y-axis hidden - no labels needed */}
          <YAxis hide />
          
          {/* Custom tooltip with proper formatting */}
          <Tooltip 
            content={<CustomTooltip />}
            cursor={false}
          />
          
          {/* Legend showing week labels */}
          {showLegend && (
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
                fontFamily: 'inherit'
              }}
            />
          )}
          
          {/* Week 1 line */}
          <Line
            type="monotone"
            dataKey="week1"
            name={data.weekLabels[0] || 'Semana 1'}
            stroke={data.weekColors[0] || theme.weekColors[0]}
            strokeWidth={chartConfig.strokeWidth}
            dot={{ 
              fill: data.weekColors[0] || theme.weekColors[0], 
              strokeWidth: 0, 
              r: chartConfig.dotSize 
            }}
            activeDot={{ 
              r: chartConfig.activeDotSize, 
              stroke: data.weekColors[0] || theme.weekColors[0],
              strokeWidth: 2,
              fill: theme.backgroundColor
            }}
            connectNulls={false}
          />
          
          {/* Week 2 line */}
          <Line
            type="monotone"
            dataKey="week2"
            name={data.weekLabels[1] || 'Semana 2'}
            stroke={data.weekColors[1] || theme.weekColors[1]}
            strokeWidth={chartConfig.strokeWidth}
            dot={{ 
              fill: data.weekColors[1] || theme.weekColors[1], 
              strokeWidth: 0, 
              r: chartConfig.dotSize 
            }}
            activeDot={{ 
              r: chartConfig.activeDotSize, 
              stroke: data.weekColors[1] || theme.weekColors[1],
              strokeWidth: 2,
              fill: theme.backgroundColor
            }}
            connectNulls={false}
          />
          
          {/* Week 3 line */}
          <Line
            type="monotone"
            dataKey="week3"
            name={data.weekLabels[2] || 'Semana 3'}
            stroke={data.weekColors[2] || theme.weekColors[2]}
            strokeWidth={chartConfig.strokeWidth}
            dot={{ 
              fill: data.weekColors[2] || theme.weekColors[2], 
              strokeWidth: 0, 
              r: chartConfig.dotSize 
            }}
            activeDot={{ 
              r: chartConfig.activeDotSize, 
              stroke: data.weekColors[2] || theme.weekColors[2],
              strokeWidth: 2,
              fill: theme.backgroundColor
            }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WeeklyComparisonChart;