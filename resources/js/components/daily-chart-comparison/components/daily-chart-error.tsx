/**
 * Daily Chart Error Component
 * Error state display for daily chart comparison
 */

import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface DailyChartErrorProps {
  message?: string;
  onRetry?: () => void;
  height?: number;
}

/**
 * Error state component for the daily chart comparison.
 * Displays error message and optional retry button.
 */
export function DailyChartError({ 
  message = 'Error al cargar los datos del gráfico',
  onRetry,
  height = 300 
}: DailyChartErrorProps) {
  return (
    <div className="bg-card rounded-lg border border-destructive/20 p-4">
      {/* Header with error icon */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Error en el gráfico
          </h3>
          <p className="text-sm text-muted-foreground">
            No se pudieron cargar los datos
          </p>
        </div>
      </div>

      {/* Error content area */}
      <div 
        className="flex flex-col items-center justify-center bg-destructive/5 rounded-lg border border-destructive/10"
        style={{ height }}
      >
        <AlertTriangle className="w-12 h-12 text-destructive/50 mb-4" />
        
        <p className="text-sm text-foreground/70 text-center mb-6 max-w-xs">
          {message}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Reintentar carga de datos"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Reintentar</span>
          </button>
        )}
      </div>

      {/* Additional help text */}
      <div className="mt-4 p-3 bg-muted/50 rounded-md">
        <p className="text-xs text-muted-foreground">
          Si el problema persiste, verifica tu conexión a internet o contacta al soporte técnico.
        </p>
      </div>
    </div>
  );
}

export default DailyChartError;