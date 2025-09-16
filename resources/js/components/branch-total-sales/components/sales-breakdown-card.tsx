import { cn } from '@/lib/utils';
import { Percent, TicketCheck, TicketMinus, TicketPercent, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculatePercentage, formatCurrency } from '../utils';

interface SalesBreakdownCardProps {
    type: 'open' | 'closed' | 'discounts' | 'diners' | 'totalDiners';
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
            label: '',
            icon: TicketPercent,
        },
        totalDiners: {
            label: '',
            icon: Users,
        },
    };

    const { label, icon: Icon } = config[type];

    // Función para formatear números (para comensales)
    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat('es-MX').format(num);
    };

    // Determinar si mostrar como currency o número
    const displayValue = type === 'totalDiners' ? formatNumber(amount) : formatCurrency(amount);

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
                    {type === 'diners' || type === 'totalDiners' ? (
                        <TooltipProvider delayDuration={300}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground cursor-pointer">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-popover border border-border text-popover-foreground">
                                    <p className="text-sm">{type === 'diners' ? 'Ticket Promedio' : 'Comensales'}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Icon className="h-4 w-4" />
                        </div>
                    )}
                    <div>
                        {label && <div className="text-sm font-medium text-foreground">{label}</div>}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-semibold text-foreground">{displayValue}</div>
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
