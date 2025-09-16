import * as React from 'react';
import { PieChart } from 'lucide-react';
import type { BranchSalesCategoriesHeaderProps } from '../types';

/**
 * Header component for Branch Sales Categories section
 */
export function BranchSalesCategoriesHeader({
  title = "Venta por tipos de producto",
  subtitle = "Distribución de ventas por categorías"
}: BranchSalesCategoriesHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
        <PieChart className="h-4 w-4 text-primary" />
      </div>
      <div className="flex flex-col">
        <h2 className="text-base font-semibold leading-none tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
}