import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import * as React from 'react';
import { logger } from '../lib/logger';

interface SalesComparisonErrorProps {
    error?: string | Error;
    onRetry?: () => void;
}

/**
 * SalesComparisonError - Error state component for daily sales comparison.
 *
 * Displays an error message and retry button when data loading fails.
 * Provides a user-friendly way to recover from API or network errors.
 *
 * @component
 * @param {SalesComparisonErrorProps} props - Component configuration
 * @returns {JSX.Element} Error state UI with retry functionality
 *
 * @description Features:
 * - Clear error messaging with icon indicator
 * - Retry button to attempt data reload
 * - Graceful fallback for undefined error messages
 * - Consistent styling with the main component
 * - Accessibility-compliant error announcements
 *
 * @example
 * ```tsx
 * if (error) {
 *   return (
 *     <SalesComparisonError
 *       error={error}
 *       onRetry={refetch}
 *     />
 *   );
 * }
 * ```
 */
export function SalesComparisonError({ error = 'Error al cargar los datos de ventas', onRetry }: SalesComparisonErrorProps) {
    // Improved error handling with consistent logging
    const errorMessage = React.useMemo(() => {
        if (typeof error === 'string') {
            return error;
        }
        if (error instanceof Error) {
            logger.error('Error object received', { message: error.message, name: error.name });
            return error.message || 'Error desconocido';
        }
        return 'Error al cargar los datos de ventas';
    }, [error]);

    // Log error state rendering for debugging
    React.useEffect(() => {
        logger.debug('Error component rendered', { errorMessage });
    }, [errorMessage]);
    return (
        <Card className="w-full border-border">
            <CardContent className="px-4 py-6">
                <div className="flex flex-col items-center justify-center space-y-3">
                    {/* Error icon */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>

                    {/* Error message */}
                    <div className="text-center">
                        <p className="text-sm font-medium text-foreground">No se pudieron cargar los datos</p>
                        <p className="mt-1 text-xs text-muted-foreground">{errorMessage}</p>
                    </div>

                    {/* Retry button with enhanced error handling */}
                    {onRetry && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                logger.debug('Retry button clicked');
                                onRetry();
                            }}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="h-3 w-3" />
                            Reintentar
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default SalesComparisonError;
