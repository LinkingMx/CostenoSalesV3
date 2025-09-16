import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import * as React from 'react';
import { logger } from '../lib/logger';

/**
 * Props interface for CustomErrorBoundary component
 * @interface CustomErrorBoundaryProps
 * @property {React.ReactNode} children - Child components to wrap with error boundary
 * @property {string} [fallbackTitle] - Optional custom title for error display
 * @property {() => void} [onRetry] - Optional retry callback function
 */
export interface CustomErrorBoundaryProps {
    children: React.ReactNode;
    fallbackTitle?: string;
    onRetry?: () => void;
}

/**
 * Error boundary state interface
 * @interface ErrorBoundaryState
 * @property {boolean} hasError - Whether an error has been caught
 * @property {Error | null} error - The caught error object
 */
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * CustomErrorBoundary - React error boundary for custom sales comparison component
 *
 * Provides graceful error handling for runtime errors in the custom sales comparison
 * component tree. Displays a user-friendly error message with retry functionality
 * and logs detailed error information for debugging.
 *
 * @component
 * @param {CustomErrorBoundaryProps} props - Component props
 * @returns {React.ReactElement} Error boundary wrapper
 *
 * @description Key features:
 * - Catches JavaScript errors anywhere in the child component tree
 * - Displays Spanish-localized error messages for better UX
 * - Provides retry functionality to attempt recovery
 * - Logs detailed error information for debugging
 * - Consistent styling with other error boundaries in the app
 * - Prevents entire component tree crashes
 *
 * @example
 * ```tsx
 * <CustomErrorBoundary onRetry={refetchData}>
 *   <CustomSalesComparison selectedDateRange={dateRange} />
 * </CustomErrorBoundary>
 * ```
 */
export class CustomErrorBoundary extends React.Component<CustomErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: CustomErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    /**
     * Static method called when an error is caught
     * Updates state to trigger error UI rendering
     */
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    /**
     * Called when an error is caught
     * Logs error details for debugging
     */
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error details for debugging
        logger.error('Custom sales comparison error boundary caught an error', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            errorBoundary: 'CustomErrorBoundary',
        });
    }

    /**
     * Retry handler to attempt recovery from error state
     */
    handleRetry = () => {
        // Reset error state
        this.setState({ hasError: false, error: null });

        // Call external retry function if provided
        if (this.props.onRetry) {
            logger.debug('Retrying after error boundary reset');
            this.props.onRetry();
        }
    };

    render() {
        if (this.state.hasError) {
            const { fallbackTitle = 'Error en Ventas Personalizadas' } = this.props;
            const errorMessage = this.state.error?.message || 'Ha ocurrido un error inesperado';

            return (
                <Card className="w-full">
                    <CardContent className="px-4 py-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            {/* Error icon */}
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
                            </div>

                            {/* Error title */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-foreground">
                                    {fallbackTitle}
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    No se pudieron cargar los datos de comparación de ventas personalizadas.
                                </p>
                            </div>

                            {/* Error details in development */}
                            {process.env.NODE_ENV === 'development' && (
                                <div className="mt-4 max-w-md rounded-md bg-destructive/5 p-3">
                                    <p className="text-xs text-destructive font-mono">
                                        {errorMessage}
                                    </p>
                                </div>
                            )}

                            {/* Retry button */}
                            <Button
                                variant="outline"
                                onClick={this.handleRetry}
                                className="mt-4 gap-2"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Reintentar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}

export default CustomErrorBoundary;