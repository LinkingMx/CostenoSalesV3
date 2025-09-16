import * as React from 'react';
import { router } from '@inertiajs/react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, TicketMinus, TicketCheck, TicketPercent } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BranchCollapsibleItemProps } from '../types';
import { formatCurrency, formatPercentage } from '../utils';
import { useDateRange } from '@/contexts/date-range-context';
import { useDashboardState } from '@/hooks/use-dashboard-state';

export function BranchCollapsibleItem({ branch, isToday = false }: BranchCollapsibleItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isPositiveGrowth = branch.percentage > 0;

  // Access date range from context and dashboard state management
  const { dateRange } = useDateRange();
  const { setOriginalDateRange } = useDashboardState();

  const handleViewDetails = () => {
    try {
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 DailySalesBranches navigating to branch:', {
          id: branch.id,
          idType: typeof branch.id,
          name: branch.name,
          location: branch.location,
          dateRange: dateRange ? {
            from: dateRange.from?.toISOString(),
            to: dateRange.to?.toISOString()
          } : null
        });
      }

      // Branch.id is already a string based on type definition
      const branchId = branch.id;

      // Save current dateRange as original for return navigation
      if (dateRange) {
        setOriginalDateRange(dateRange);
      }

      // Navigate with iOS transition - NO preserveState to avoid refresh issues
      // For daily navigation, ensure we pass the same date as both from and to for single day ranges
      const navigationDateRange = dateRange ? {
        from: dateRange.from?.toISOString(),
        to: dateRange.to?.toISOString() || dateRange.from?.toISOString() // Use same date if to is missing
      } : undefined;

      router.visit(`/branch/${branchId}`, {
        data: {
          name: branch.name,
          region: branch.location || '',
          dateRange: navigationDateRange
        }
        // Removed preserveState and preserveScroll for clean iOS transitions
      });
    } catch (error) {
      console.error('Error navigating to branch details:', error);
      // Fallback to basic navigation
      try {
        router.visit(`/branch/${branch.id}?name=${encodeURIComponent(branch.name)}&region=${encodeURIComponent(branch.location || '')}`);
      } catch (fallbackError) {
        console.error('Fallback navigation also failed:', fallbackError);
      }
    }
  };

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className={cn(
        "rounded-lg transition-all duration-200",
        isOpen 
          ? "bg-card border border-border shadow-sm" 
          : "bg-card border border-border hover:bg-card/80"
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
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-medium leading-tight text-foreground text-left">
                  {branch.name.length > 20 ? `${branch.name.substring(0, 20)}...` : branch.name}
                </span>
                {branch.previousWeekSales !== undefined && (
                  <span className="text-xs text-muted-foreground text-left">
                    Hace 1 sem: {formatCurrency(branch.previousWeekSales)}
                  </span>
                )}
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
                "h-4 w-4 text-gray-500 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                "group-hover:text-gray-700 group-active:scale-95",
                isOpen && "rotate-180 text-gray-700"
              )}
            />
          </div>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="px-3 pb-2">
          <div className="bg-card rounded-lg p-2 space-y-2">
            {/* Sales Metrics - Individual Cards - Mobile optimized */}
            <div className="space-y-2">
              {/* Abiertas Card - Only show for today's date */}
              {isToday && (
                <div className="bg-muted rounded-lg p-3 border border-border transition-all duration-150">
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
              <div className="bg-muted rounded-lg p-3 border border-border transition-all duration-150">
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
            <div className="bg-muted rounded-lg p-3 border border-border transition-all duration-150">
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
                  "hover:bg-primary/80 hover:scale-105 hover:shadow-md",
                  "active:scale-95 active:bg-primary/90",
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