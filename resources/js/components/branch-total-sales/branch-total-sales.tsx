import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { BranchTotalSalesProps } from './types';
import { TotalSalesHeader } from './components/total-sales-header';
import { SalesBreakdownCard } from './components/sales-breakdown-card';
import { formatCurrency } from './utils';

/**
 * Main component for displaying branch total sales
 * Shows total sales with breakdown of open and closed money
 */
export function BranchTotalSales({
  data,
  isLoading = false,
  error = null,
  className
}: BranchTotalSalesProps) {
  if (process.env.NODE_ENV === 'development') {
    React.useEffect(() => {
      if (data) {
        console.log('💰 BranchTotalSales rendering with data:', {
          totalSales: data.totalSales,
          openMoney: data.openMoney,
          closedMoney: data.closedMoney,
          openPercentage: data.totalSales > 0 ? ((data.openMoney / data.totalSales) * 100).toFixed(1) : 0,
          closedPercentage: data.totalSales > 0 ? ((data.closedMoney / data.totalSales) * 100).toFixed(1) : 0
        });
      }
    }, [data]);
  }

  return (
    <Card className={cn("w-full border-border", className)}>
      <CardContent className="px-4 py-3">
        {/* Header */}
        <TotalSalesHeader />

        {/* Error state */}
        {error && !isLoading && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 mt-3">
            <p className="text-sm text-destructive text-center">
              Error al cargar ventas totales: {error}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="space-y-3 mt-3">
          {isLoading ? (
            // Loading state
            <>
              {/* Total sales skeleton */}
              <div className="bg-primary/10 rounded-lg p-4 border border-border animate-pulse">
                <div className="text-center">
                  <div className="h-4 w-20 bg-gray-300 rounded mx-auto mb-2" />
                  <div className="h-8 w-32 bg-gray-300 rounded mx-auto" />
                </div>
              </div>

              {/* Breakdown skeleton */}
              <div className="space-y-2">
                <SalesBreakdownCard
                  type="open"
                  amount={0}
                  totalAmount={0}
                  isLoading={true}
                />
                <SalesBreakdownCard
                  type="closed"
                  amount={0}
                  totalAmount={0}
                  isLoading={true}
                />
                <SalesBreakdownCard
                  type="discounts"
                  amount={0}
                  totalAmount={0}
                  isLoading={true}
                />
                <SalesBreakdownCard
                  type="diners"
                  amount={0}
                  isLoading={true}
                />
              </div>
            </>
          ) : data && !error ? (
            // Success state - show actual data
            <>
              {/* Total Sales Display */}
              <div className="bg-primary/10 rounded-lg p-4 border border-border">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Venta Total
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(data.totalSales)}
                  </p>
                </div>
              </div>

              {/* Breakdown Cards */}
              <div className="space-y-2">
                <SalesBreakdownCard
                  type="open"
                  amount={data.openMoney}
                  totalAmount={data.totalSales}
                  isLoading={false}
                />
                <SalesBreakdownCard
                  type="closed"
                  amount={data.closedMoney}
                  totalAmount={data.totalSales}
                  isLoading={false}
                />
                <SalesBreakdownCard
                  type="discounts"
                  amount={data.discounts}
                  totalAmount={data.totalSales}
                  isLoading={false}
                />
                <SalesBreakdownCard
                  type="diners"
                  amount={data.diners}
                  isLoading={false}
                />
              </div>
            </>
          ) : !error ? (
            // No data state
            <div className="rounded-lg border border-muted bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground text-center">
                No hay datos de ventas disponibles
              </p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default BranchTotalSales;