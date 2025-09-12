import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface WeeklyErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * WeeklyErrorBoundary - Error boundary specific to weekly sales comparison component.
 * 
 * Provides graceful error handling and recovery for the weekly sales component.
 * Displays user-friendly error messages and allows recovery without full page reload.
 * 
 * @component
 * @param {WeeklyErrorBoundaryProps} props - Error boundary configuration
 * @returns {JSX.Element} Protected component wrapper or error fallback UI
 * 
 * @description Features:
 * - Catches JavaScript errors in weekly sales component tree
 * - Provides user-friendly error messages in Spanish
 * - Offers retry functionality to recover from transient errors
 * - Logs errors for debugging in development mode
 * - Custom fallback UI option for specific error scenarios
 * - Prevents error propagation to parent components
 * 
 * @example
 * ```tsx
 * <WeeklyErrorBoundary onError={handleError}>
 *   <WeeklySalesComparison selectedDateRange={range} />
 * </WeeklyErrorBoundary>
 * ```
 */
export class WeeklyErrorBoundary extends React.Component<
  WeeklyErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: WeeklyErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Static method to update state when an error is caught.
   * Called by React when a descendant component throws an error.
   * 
   * @param error - The error that was thrown
   * @returns Updated state object with error information
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state to trigger error UI rendering
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Lifecycle method called when an error is caught.
   * Used for error reporting and logging in development.
   * 
   * @param error - The error that was thrown
   * @param errorInfo - Additional information about the error (component stack)
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Store error information for display and debugging
    this.setState({
      error,
      errorInfo,
    });

    // Log error in development mode for debugging
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Weekly Sales Component Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Resets the error boundary state to allow recovery.
   * Clears error state and attempts to re-render the component.
   * Useful for transient errors or after user actions.
   */
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    // If there's an error, render the fallback UI
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI for weekly sales component
      return (
        <Card className="w-full border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Error icon with warning styling */}
              <div className="flex-shrink-0">
                <AlertTriangle 
                  className="h-6 w-6 text-destructive" 
                  aria-hidden="true" 
                />
              </div>
              
              {/* Error message content */}
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-destructive">
                    Error en Ventas Semanales
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No se pudieron cargar los datos de ventas semanales. 
                    Esto puede ser temporal.
                  </p>
                </div>

                {/* Error details in development mode */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                      Detalles técnicos (desarrollo)
                    </summary>
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <p className="text-xs font-mono text-muted-foreground break-words">
                        {this.state.error.message}
                      </p>
                      {this.state.error.stack && (
                        <pre className="mt-2 text-xs text-muted-foreground overflow-auto">
                          {this.state.error.stack}
                        </pre>
                      )}
                    </div>
                  </details>
                )}

                {/* Retry button */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={this.handleRetry}
                    className="text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reintentar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default WeeklyErrorBoundary;