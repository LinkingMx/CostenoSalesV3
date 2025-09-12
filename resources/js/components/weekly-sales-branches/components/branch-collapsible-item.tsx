import * as React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, TicketMinus, TicketCheck, TicketPercent } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BranchCollapsibleItemProps } from '../types';
import { formatCurrency, formatPercentage } from '../utils';

export function BranchCollapsibleItem({ branch }: BranchCollapsibleItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isPositiveGrowth = branch.percentage > 0;

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className={cn(
        "rounded-lg transition-all duration-200",
        isOpen 
          ? "bg-white border border-gray-300 shadow-sm" 
          : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
      )}
    >
      <CollapsibleTrigger className="w-full group">
        {/* Container matching SalesDayCard exact dimensions */}
        <div className="flex items-center justify-between px-3 py-3 transition-all duration-200">
          {/* Main section - Branch info with single row layout */}
          <div className="flex items-center justify-between min-w-0 flex-1">
            {/* Left: Branch name with avatar */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm bg-gray-600">
                {branch.avatar}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-tight text-gray-900 text-left">
                  {branch.name}
                </span>
              </div>
            </div>

            {/* Right: Amount and badge closer together */}
            <div className="text-right flex flex-col items-end gap-0.5">
              <div className="text-lg font-bold tabular-nums text-gray-900">
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
          <div className="bg-gray-50 rounded-lg p-2 space-y-2">
            {/* Sales Metrics - Individual Cards - Mobile optimized */}
            <div className="space-y-2">
              {/* Abiertas Card */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center">
                      <TicketMinus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">Cuentas Abiertas</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm text-gray-900">
                      {formatCurrency(branch.openAccounts)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cerradas Card */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center">
                      <TicketCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">Cuentas Cerradas</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm text-gray-900">
                      {formatCurrency(branch.closedSales)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Promedio Section */}
            <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center">
                    <TicketPercent className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Ticket Promedio</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm text-gray-900">
                    {formatCurrency(branch.averageTicket)}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                Total de tickets: {branch.totalTickets}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className={cn(
                  "bg-gray-700 text-white border-gray-700 text-xs px-2 py-1",
                  "transition-all duration-200 ease-out",
                  "hover:bg-gray-800 hover:scale-105 hover:shadow-md",
                  "active:scale-95 active:bg-gray-900",
                  "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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