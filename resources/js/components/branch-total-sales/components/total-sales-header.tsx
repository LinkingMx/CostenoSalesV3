import { DollarSign } from 'lucide-react';

/**
 * Header component for Branch Total Sales
 */
export function TotalSalesHeader() {
    return (
        <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <DollarSign className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
                <h2 className="text-base leading-none font-semibold tracking-tight text-foreground">Venta Total</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">Cuentas abiertas y cerradas (incluye IVA 16%)</p>
            </div>
        </div>
    );
}
