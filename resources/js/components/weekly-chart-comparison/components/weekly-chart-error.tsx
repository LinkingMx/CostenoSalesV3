/**
 * Weekly Chart Error Component
 * Elegant error display for weekly chart comparison with retry functionality
 */

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WeeklyChartErrorProps {
  /** Error message to display */
  message: string;
  /** Optional retry function */
  onRetry?: () => void;
  /** Whether retry is currently in progress */
  isRetrying?: boolean;
}

/**
 * WeeklyChartError - Error state component for weekly chart comparison.
 *
 * Displays a user-friendly error message with optional retry functionality.
 * Follows the same visual design as other chart components for consistency.
 *
 * @component
 * @param {WeeklyChartErrorProps} props - Component configuration props
 * @returns {JSX.Element} Error display interface with retry option
 *
 * @description Key features:
 * - Elegant error display with icon and message
 * - Optional retry button with loading state
 * - Consistent styling with other chart components
 * - Spanish localization for user messages
 * - Accessibility-compliant structure
 * - Theme-consistent colors and spacing
 *
 * @example
 * ```tsx
 * // Basic error display
 * <WeeklyChartError message="Error al cargar los datos" />
 *
 * // With retry functionality
 * <WeeklyChartError
 *   message="Error de conexión"
 *   onRetry={handleRetry}
 *   isRetrying={isLoading}
 * />
 * ```
 */
export const WeeklyChartError: React.FC<WeeklyChartErrorProps> = ({
  message,
  onRetry,
  isRetrying = false
}) => {
  return (
    <Card className="w-full border-border">
      <CardContent className="px-4 py-8">
        {/* Error content container */}
        <div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          role="alert"
          aria-live="polite"
        >
          {/* Error icon */}
          <div className="flex-shrink-0">
            <AlertCircle
              className="h-8 w-8 text-destructive"
              aria-hidden="true"
            />
          </div>

          {/* Error message */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              Error en el Gráfico Semanal
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {message}
            </p>
          </div>

          {/* Retry button if onRetry is provided */}
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
              className="min-w-[120px]"
              aria-describedby="retry-description"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  Reintentando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                  Reintentar
                </>
              )}
            </Button>
          )}

          {/* Screen reader description for retry button */}
          {onRetry && (
            <span id="retry-description" className="sr-only">
              Hacer clic para volver a cargar los datos del gráfico semanal
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyChartError;