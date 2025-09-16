import { cn } from '@/lib/utils';
import { Percent, TicketCheck, TicketMinus, Users } from 'lucide-react';
import { calculatePercentage, formatCurrency } from '../utils';

interface SalesBreakdownCardProps {
    type: 'open' | 'closed' | 'discounts' | 'diners';
    amount: number;
    totalAmount?: number;
    isLoading?: boolean;
}

/**
 * Individual card for sales breakdown (open/closed)
 */
export function SalesBreakdownCard({ type, amount, totalAmount, isLoading = false }: SalesBreakdownCardProps) {
    const percentage = totalAmount ? calculatePercentage(amount, totalAmount) : 0;
    const showPercentage = type === 'discounts' && totalAmount && totalAmount > 0;

    const config = {
        open: {
            label: 'Cuentas Abiertas',
            icon: TicketMinus,
        },
        closed: {
            label: 'Cuentas Cerradas',
            icon: TicketCheck,
        },
        discounts: {
            label: 'Descuentos',
            icon: Percent,
        },
        diners: {
            label: 'Ticket Promedio',
            icon: Users,
        },
    };

    const { label, icon: Icon } = config[type];

    if (isLoading) {
        return (
            <div className="animate-pulse rounded-lg border border-border bg-muted p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-300" />
                        <div className="h-4 w-24 rounded bg-gray-300" />
                    </div>
                    <div className="text-right">
                        <div className="mb-1 h-5 w-20 rounded bg-gray-300" />
                        <div className="h-3 w-12 rounded bg-gray-300" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-border bg-card p-3 transition-all duration-150 hover:border-border hover:shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Icon className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-foreground">{label}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-semibold text-foreground">{formatCurrency(amount)}</div>
                    {showPercentage && (
                        <div
                            className={cn(
                                'inline-block rounded-full px-1.5 py-0.5 text-xs font-medium',
                                percentage < 2 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                            )}
                        >
                            {percentage.toFixed(1)}%
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
