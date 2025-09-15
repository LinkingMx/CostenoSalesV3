/**
 * Monthly Chart Error Component
 * Displays error state with retry option for monthly chart
 */

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { MonthlyChartErrorProps } from '../types';

/**
 * MonthlyChartError - Error state component for monthly chart
 *
 * Displays user-friendly error message with optional retry functionality
 * Matches the design pattern of other dashboard error states
 */
export const MonthlyChartError = React.memo(function MonthlyChartError({
  message,
  onRetry,
  isRetrying = false,
  className = ''
}: MonthlyChartErrorProps) {
  return (
    <div className={`w-full rounded-xl bg-card border border-border p-6 ${className}`}>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error al cargar el gráfico mensual</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">{message || 'No se pudieron cargar los datos del gráfico mensual.'}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
              className="mt-2"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                  Reintentando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Reintentar
                </>
              )}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
});

export default MonthlyChartError;