import * as React from 'react';
import { TicketMinus, TicketCheck, Percent, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, calculatePercentage } from '../utils';

interface SalesBreakdownCardProps {
  type: 'open' | 'closed' | 'discounts' | 'diners';
  amount: number;
  totalAmount?: number;
  isLoading?: boolean;
}

/**
 * Individual card for sales breakdown (open/closed)
 */
export function SalesBreakdownCard({
  type,
  amount,
  totalAmount,
  isLoading = false
}: SalesBreakdownCardProps) {
  const percentage = totalAmount ? calculatePercentage(amount, totalAmount) : 0;
  const showPercentage = type === 'discounts' && totalAmount && totalAmount > 0;

  const config = {
    open: {
      label: 'Cuentas Abiertas',
      icon: TicketMinus
    },
    closed: {
      label: 'Cuentas Cerradas',
      icon: TicketCheck
    },
    discounts: {
      label: 'Descuentos',
      icon: Percent
    },
    diners: {
      label: 'Ticket Promedio',
      icon: Users
    }
  };

  const { label, icon: Icon } = config[type];

  if (isLoading) {
    return (
      <div className="bg-muted rounded-lg p-3 border border-border animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-300" />
            <div className="h-4 w-24 bg-gray-300 rounded" />
          </div>
          <div className="text-right">
            <div className="h-5 w-20 bg-gray-300 rounded mb-1" />
            <div className="h-3 w-12 bg-gray-300 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-3 border border-border hover:border-border hover:shadow-sm transition-all duration-150">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-sm text-foreground">{label}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-sm text-foreground">
            {formatCurrency(amount)}
          </div>
          {showPercentage && (
            <div className={cn(
              "text-xs font-medium rounded-full px-1.5 py-0.5 inline-block",
              percentage < 2
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            )}>
              {percentage.toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}