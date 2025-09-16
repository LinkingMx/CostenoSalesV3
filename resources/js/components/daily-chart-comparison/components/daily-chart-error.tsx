/**
 * Daily Chart Error Component
 * Error state display for daily chart comparison
 */

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
export function DailyChartError({ message = 'Error al cargar los datos del gráfico', onRetry, height = 300 }: DailyChartErrorProps) {
    return (
        <div className="rounded-lg border border-destructive/20 bg-card p-4">
            {/* Header with error icon */}
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-foreground">Error en el gráfico</h3>
                    <p className="text-sm text-muted-foreground">No se pudieron cargar los datos</p>
                </div>
            </div>

            {/* Error content area */}
            <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/10 bg-destructive/5" style={{ height }}>
                <AlertTriangle className="mb-4 h-12 w-12 text-destructive/50" />

                <p className="mb-6 max-w-xs text-center text-sm text-foreground/70">{message}</p>

                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
                        aria-label="Reintentar carga de datos"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span className="text-sm font-medium">Reintentar</span>
                    </button>
                )}
            </div>

            {/* Additional help text */}
            <div className="mt-4 rounded-md bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                    Si el problema persiste, verifica tu conexión a internet o contacta al soporte técnico.
                </p>
            </div>
        </div>
    );
}

export default DailyChartError;
