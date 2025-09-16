import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { SalesBreakdownCard } from './components/sales-breakdown-card';
import { TotalSalesHeader } from './components/total-sales-header';
import type { BranchTotalSalesProps } from './types';
import { formatCurrency } from './utils';

/**
 * Main component for displaying branch total sales
 * Shows total sales with breakdown of open and closed money
 */
export function BranchTotalSales({ data, isLoading = false, error = null, className }: BranchTotalSalesProps) {
    if (process.env.NODE_ENV === 'development') {
        React.useEffect(() => {
            if (data) {
                console.log('💰 BranchTotalSales rendering with data:', {
                    totalSales: data.totalSales,
                    openMoney: data.openMoney,
                    closedMoney: data.closedMoney,
                    openPercentage: data.totalSales > 0 ? ((data.openMoney / data.totalSales) * 100).toFixed(1) : 0,
                    closedPercentage: data.totalSales > 0 ? ((data.closedMoney / data.totalSales) * 100).toFixed(1) : 0,
                });
            }
        }, [data]);
    }

    return (
        <Card className={cn('w-full border-border', className)}>
            <CardContent className="px-4 py-3">
                {/* Header */}
                <TotalSalesHeader />

                {/* Error state */}
                {error && !isLoading && (
                    <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                        <p className="text-center text-sm text-destructive">Error al cargar ventas totales: {error}</p>
                    </div>
                )}

                {/* Content */}
                <div className="mt-3 space-y-3">
                    {isLoading ? (
                        // Loading state
                        <>
                            {/* Total sales skeleton */}
                            <div className="animate-pulse rounded-lg border border-border bg-primary/10 p-4">
                                <div className="text-center">
                                    <div className="mx-auto mb-2 h-4 w-20 rounded bg-gray-300" />
                                    <div className="mx-auto h-8 w-32 rounded bg-gray-300" />
                                </div>
                            </div>

                            {/* Breakdown skeleton */}
                            <div className="space-y-2">
                                <SalesBreakdownCard type="open" amount={0} totalAmount={0} isLoading={true} />
                                <SalesBreakdownCard type="closed" amount={0} totalAmount={0} isLoading={true} />
                                <SalesBreakdownCard type="discounts" amount={0} totalAmount={0} isLoading={true} />
                                {/* Fila con 2 columnas para ticket promedio y comensales */}
                                <div className="grid grid-cols-2 gap-2">
                                    <SalesBreakdownCard type="diners" amount={0} isLoading={true} />
                                    <SalesBreakdownCard type="totalDiners" amount={0} isLoading={true} />
                                </div>
                            </div>
                        </>
                    ) : data && !error ? (
                        // Success state - show actual data
                        <>
                            {/* Total Sales Display */}
                            <div className="rounded-lg border border-border bg-primary/10 p-4">
                                <div className="text-center">
                                    <p className="mb-1 text-sm font-medium text-muted-foreground">Venta Total</p>
                                    <p className="text-2xl font-bold text-foreground">{formatCurrency(data.totalSales)}</p>
                                </div>
                            </div>

                            {/* Breakdown Cards */}
                            <div className="space-y-2">
                                <SalesBreakdownCard type="open" amount={data.openMoney} totalAmount={data.totalSales} isLoading={false} />
                                <SalesBreakdownCard type="closed" amount={data.closedMoney} totalAmount={data.totalSales} isLoading={false} />
                                <SalesBreakdownCard type="discounts" amount={data.discounts} totalAmount={data.totalSales} isLoading={false} />
                                {/* Fila con 2 columnas para ticket promedio y comensales */}
                                <div className="grid grid-cols-2 gap-2">
                                    <SalesBreakdownCard type="diners" amount={data.diners} isLoading={false} />
                                    <SalesBreakdownCard type="totalDiners" amount={data.totalDiners} isLoading={false} />
                                </div>
                            </div>
                        </>
                    ) : !error ? (
                        // No data state
                        <div className="rounded-lg border border-muted bg-muted/20 p-4">
                            <p className="text-center text-sm text-muted-foreground">No hay datos de ventas disponibles</p>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}

export default BranchTotalSales;
