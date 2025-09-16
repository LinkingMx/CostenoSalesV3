import * as React from 'react';
import { router } from '@inertiajs/react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, TicketMinus, TicketCheck, TicketPercent } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BranchCollapsibleItemProps } from '../types';
import { formatCurrency, formatPercentage } from '../utils';

export function BranchCollapsibleItem({ branch, isCurrentWeek }: BranchCollapsibleItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isPositiveGrowth = branch.percentage > 0;

  const handleViewDetails = () => {
    router.visit(`/branch/${branch.id}?name=${encodeURIComponent(branch.name)}&region=${encodeURIComponent(branch.location || '')}`);
  };

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className={cn(
        "rounded-lg transition-all duration-200",
        isOpen 
          ? "bg-card border border-border shadow-sm" 
          : "bg-muted border border-border hover:bg-muted/80"
      )}
    >
      <CollapsibleTrigger className="w-full group">
        {/* Container matching SalesDayCard exact dimensions */}
        <div className="flex items-center justify-between px-3 py-3 transition-all duration-200">
          {/* Main section - Branch info with single row layout */}
          <div className="flex items-center justify-between min-w-0 flex-1">
            {/* Left: Branch name with avatar */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground shadow-sm bg-primary">
                {branch.avatar}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-tight text-foreground text-left" title={branch.name}>
                  {branch.name.length > 15 ? `${branch.name.substring(0, 15)}...` : branch.name}
                </span>
              </div>
            </div>

            {/* Right: Amount and badge closer together */}
            <div className="text-right flex flex-col items-end gap-0.5">
              <div className="text-lg font-bold tabular-nums text-foreground">
                {formatCurrency(branch.totalSales)}
              </div>
              <Badge 
                variant="secondary" 
                className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full",
                  isPositiveGrowth 
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                )}
              >
                {formatPercentage(branch.percentage)}
              </Badge>
            </div>
          </div>
          
          {/* Chevron icon */}
          <div className="ml-2 flex-shrink-0">
            <ChevronDown 
              className={cn(
                "h-4 w-4 text-muted-foreground transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                "group-hover:text-foreground group-active:scale-95",
                isOpen && "rotate-180 text-foreground"
              )}
            />
          </div>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="px-3 pb-2">
          <div className="bg-muted rounded-lg p-2 space-y-2">
            {/* Sales Metrics - Individual Cards - Mobile optimized */}
            <div className="space-y-2">
              {/* Abiertas Card - Only show for current week */}
              {isCurrentWeek && (
                <div className="bg-card rounded-lg p-3 border border-border hover:border-border hover:shadow-sm transition-all duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <TicketMinus className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">Cuentas Abiertas</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm text-foreground">
                        {formatCurrency(branch.openAccounts)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cerradas Card */}
              <div className="bg-card rounded-lg p-3 border border-border hover:border-border hover:shadow-sm transition-all duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <TicketCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-foreground">Cuentas Cerradas</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm text-foreground">
                      {formatCurrency(branch.closedSales)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Promedio Section */}
            <div className="bg-card rounded-lg p-3 border border-border hover:border-border hover:shadow-sm transition-all duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <TicketPercent className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-foreground">Ticket Promedio</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm text-foreground">
                    {formatCurrency(branch.averageTicket)}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Total de tickets: {branch.totalTickets}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewDetails}
                className={cn(
                  "bg-primary text-primary-foreground border-primary text-xs px-2 py-1",
                  "transition-all duration-200 ease-out",
                  "hover:bg-primary/90 hover:scale-105 hover:shadow-md",
                  "active:scale-95 active:bg-primary/80",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
              >
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  Ver Detalles →
                </span>
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}