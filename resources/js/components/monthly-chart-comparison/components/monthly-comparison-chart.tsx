/**
 * Monthly Comparison Chart Component
 * Recharts bar chart for displaying 3-month sales totals
 */

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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
            <div className="max-w-xs rounded-lg border border-border bg-card p-3 shadow-lg">
                <p className="mb-3 border-b border-border pb-2 text-sm font-semibold text-foreground">{label}</p>
                <div className="space-y-1">
                    {payload.map((entry: TooltipPayload, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-sm font-medium text-foreground">Total</span>
                            </div>
                            <span className="text-sm font-bold text-primary">{formatChartAmount(entry.value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
}

/**
 * MonthlyComparisonChart - Bar chart component for monthly sales comparison
 *
 * Displays total sales for 3 consecutive months as a bar chart
 */
export const MonthlyComparisonChart = React.memo(function MonthlyComparisonChart({
    data,
    height = 300,
    showLegend = false,
}: MonthlyComparisonChartProps) {
    const theme = getDefaultChartTheme();

    // Transform data for bar chart - 3 bars with individual colors
    const chartData = React.useMemo(() => {
        return data.monthLabels.map((label, index) => ({
            month: label,
            value: data.monthValues[index] || 0,
            color: data.monthColors[index] || theme.primaryColor,
        }));
    }, [data, theme.primaryColor]);

    // Memoize chart configuration for performance
    const chartConfig = React.useMemo(
        () => ({
            margin: { top: 20, right: 30, left: 30, bottom: 40 }, // Increased left and bottom margins
            barCategoryGap: '20%',
            radius: [4, 4, 0, 0] as [number, number, number, number], // Rounded top corners for bars
        }),
        [],
    );

    // Early return if no data
    if (!data?.monthValues || data.monthValues.length === 0) {
        return (
            <div className="flex items-center justify-center rounded-lg bg-muted/50" style={{ height }} role="img" aria-label="Gráfico no disponible">
                <p className="text-sm text-muted-foreground">No hay datos disponibles para mostrar el gráfico</p>
            </div>
        );
    }

    return (
        <div
            className="w-full focus:ring-0 focus:outline-none [&_*]:outline-none [&_*]:focus:outline-none [&_svg]:outline-none [&_svg]:focus:outline-none"
            role="img"
            aria-label="Gráfico de comparación mensual de ventas"
            tabIndex={-1}
            style={{ outline: 'none' }}
        >
            <ResponsiveContainer width="100%" height={height}>
                <BarChart data={chartData} margin={chartConfig.margin}>
                    {/* Grid lines for better readability */}
                    <CartesianGrid strokeDasharray="2 2" stroke={theme.gridColor} opacity={0.8} horizontal={true} vertical={false} />

                    {/* X-axis with month names */}
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fontSize: 13,
                            fill: theme.textColor,
                            fontFamily: 'inherit',
                            fontWeight: 600,
                        }}
                        dy={10}
                        height={40}
                        interval={0}
                        textAnchor="middle"
                    />

                    {/* Y-axis hidden - no labels needed */}
                    <YAxis hide />

                    {/* Custom tooltip with proper formatting */}
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }} />

                    {/* Legend showing month labels */}
                    {showLegend && (
                        <Legend
                            wrapperStyle={{
                                paddingTop: '20px',
                                fontSize: '12px',
                                fontFamily: 'inherit',
                            }}
                        />
                    )}

                    {/* Bar for monthly data with individual colors */}
                    <Bar
                        dataKey="value"
                        name="Ventas Mensuales"
                        radius={chartConfig.radius}
                        maxBarSize={120}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
});

export default MonthlyComparisonChart;
