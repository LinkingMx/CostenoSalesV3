import { PieChart } from 'lucide-react';
import type { BranchSalesCategoriesHeaderProps } from '../types';

/**
 * Header component for Branch Sales Categories section
 */
export function BranchSalesCategoriesHeader({
    title = 'Venta por tipos de producto',
    subtitle = 'Distribución de ventas por categorías',
}: BranchSalesCategoriesHeaderProps) {
    return (
        <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <PieChart className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
                <h2 className="text-base leading-none font-semibold tracking-tight text-foreground">{title}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            </div>
        </div>
    );
}
