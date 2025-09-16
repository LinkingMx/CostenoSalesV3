import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useDateRange } from '@/contexts/date-range-context';
import { useDashboardState } from '@/hooks/use-dashboard-state';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { ChevronDown, TicketCheck, TicketMinus, TicketPercent } from 'lucide-react';
import * as React from 'react';
import type { BranchCustomCollapsibleItemProps } from '../types';
import { formatCurrency } from '../utils';

export function BranchCustomCollapsibleItem({ branch }: BranchCustomCollapsibleItemProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    // Access date range from context and dashboard state management
    const { dateRange } = useDateRange();
    const { setOriginalDateRange } = useDashboardState();

    const handleViewDetails = () => {
        try {
            // Debug logging
            if (process.env.NODE_ENV === 'development') {
                console.log('🔍 CustomSalesBranches navigating to branch:', {
                    id: branch.id,
                    idType: typeof branch.id,
                    name: branch.name,
                    location: branch.location,
                    dateRange: dateRange
                        ? {
                              from: dateRange.from?.toISOString(),
                              to: dateRange.to?.toISOString(),
                          }
                        : null,
                });
            }

            // Branch.id is already a string based on type definition
            const branchId = branch.id;

            // Save current dateRange as original for return navigation
            if (dateRange) {
                setOriginalDateRange(dateRange);
            }

            // Navigate with iOS transition - NO preserveState to avoid refresh issues
            router.visit(`/branch/${branchId}`, {
                data: {
                    name: branch.name,
                    region: branch.location || '',
                    dateRange: dateRange
                        ? {
                              from: dateRange.from?.toISOString(),
                              to: dateRange.to?.toISOString(),
                          }
                        : undefined,
                },
                // Removed preserveState and preserveScroll for clean iOS transitions
            });
        } catch (error) {
            console.error('Error navigating to branch details:', error);
            // Fallback to basic navigation
            router.visit(`/branch/${branch.id}?name=${encodeURIComponent(branch.name)}&region=${encodeURIComponent(branch.location || '')}`);
        }
    };

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className={cn(
                'rounded-lg transition-all duration-200',
                isOpen ? 'border border-border bg-card shadow-sm' : 'border border-border bg-muted hover:bg-muted/80',
            )}
        >
            <CollapsibleTrigger className="group w-full">
                {/* Container matching SalesCustomCard exact dimensions */}
                <div className="flex items-center justify-between px-3 py-3 transition-all duration-200">
                    {/* Main section - Branch info with single row layout */}
                    <div className="flex min-w-0 flex-1 items-center justify-between">
                        {/* Left: Branch name with avatar */}
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
                                {branch.avatar}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-left text-sm leading-tight font-medium text-foreground">{branch.name}</span>
                            </div>
                        </div>

                        {/* Right: Amount only */}
                        <div className="text-right">
                            <div className="text-lg font-bold text-foreground tabular-nums">{formatCurrency(branch.totalSales)}</div>
                        </div>
                    </div>

                    {/* Chevron icon */}
                    <div className="ml-2 flex-shrink-0">
                        <ChevronDown
                            className={cn(
                                'h-4 w-4 text-muted-foreground transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                                'group-hover:text-foreground group-active:scale-95',
                                isOpen && 'rotate-180 text-foreground',
                            )}
                        />
                    </div>
                </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
                <div className="px-3 pb-2">
                    <div className="space-y-2 rounded-lg bg-muted p-2">
                        {/* Sales Metrics - Individual Cards - Mobile optimized */}
                        <div className="space-y-2">
                            {/* Abiertas Card */}
                            <div className="rounded-lg border border-border bg-card p-3 transition-all duration-150 hover:border-border hover:shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                            <TicketMinus className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-foreground">Cuentas Abiertas</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-foreground">{formatCurrency(branch.openAccounts)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Cerradas Card */}
                            <div className="rounded-lg border border-border bg-card p-3 transition-all duration-150 hover:border-border hover:shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                            <TicketCheck className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-foreground">Cuentas Cerradas</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-foreground">{formatCurrency(branch.closedSales)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Promedio Section */}
                        <div className="rounded-lg border border-border bg-card p-3 transition-all duration-150 hover:border-border hover:shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        <TicketPercent className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-foreground">Ticket Promedio</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-foreground">{formatCurrency(branch.averageTicket)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-border pt-2">
                            <div className="text-xs text-muted-foreground">Total de tickets: {branch.totalTickets}</div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleViewDetails}
                                className={cn(
                                    'border-primary bg-primary px-2 py-1 text-xs text-primary-foreground',
                                    'transition-all duration-200 ease-out',
                                    'hover:scale-105 hover:bg-primary/90 hover:shadow-md',
                                    'active:scale-95 active:bg-primary/80',
                                    'focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none',
                                )}
                            >
                                <span className="transition-transform duration-200 group-hover:translate-x-0.5">Ver Detalles →</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
