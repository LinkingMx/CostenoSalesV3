import * as React from 'react';
import { DollarSign } from 'lucide-react';

/**
 * Header component for Branch Total Sales
 */
export function TotalSalesHeader() {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
        <DollarSign className="h-4 w-4 text-primary" />
      </div>
      <div className="flex flex-col">
        <h2 className="text-base font-semibold leading-none tracking-tight text-foreground">
          Venta Total
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Cuentas abiertas y cerradas
        </p>
      </div>
    </div>
  );
}