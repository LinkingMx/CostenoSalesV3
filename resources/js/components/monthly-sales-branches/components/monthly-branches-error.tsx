import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import * as React from 'react';
import type { MonthlyBranchesErrorProps } from '../types';
import { MonthlySalesBranchesHeader } from './monthly-sales-branches-header';

/**
 * Error state component for monthly branches data.
 * Displays error message and retry functionality when API calls fail.
 *
 * @component
 * @param {MonthlyBranchesErrorProps} props - Error component props
 * @returns {JSX.Element} Error state UI with retry capability
 *
 * @description This error component:
 * - Shows the same header as the actual component for consistency
 * - Displays user-friendly error message in Spanish
 * - Provides retry button to attempt data fetch again
 * - Uses consistent styling with other error states in the app
 * - Includes proper accessibility attributes
 *
 * @example
 * ```tsx
 * {error ? (
 *   <MonthlyBranchesError error={error} onRetry={refetch} />
 * ) : (
 *   <MonthlySalesBranches data={branchesData} />
 * )}
 * ```
 */
export function MonthlyBranchesError({ error, onRetry }: MonthlyBranchesErrorProps) {
    const [isRetrying, setIsRetrying] = React.useState(false);

    const handleRetry = async () => {
        if (!onRetry) return;

        setIsRetrying(true);
        try {
            await onRetry();
        } finally {
            // Reset retry state after a short delay to show feedback
            setTimeout(() => setIsRetrying(false), 1000);
        }
    };

    return (
        <Card className="w-full">
            <CardContent className="px-4 py-3">
                {/* Header section - same as actual component */}
                <MonthlySalesBranchesHeader />

                {/* Error state content */}
                <div className="space-y-4 px-4 py-8" role="region" aria-label="Error en datos de sucursales mensuales">
                    {/* Error icon and message */}
                    <div className="flex flex-col items-center space-y-3 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <AlertCircle className="h-6 w-6 text-destructive" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-foreground">Error al cargar datos de sucursales</h3>
                            <p className="max-w-sm text-xs text-muted-foreground">
                                No se pudieron obtener los datos de las sucursales. Por favor, intenta nuevamente.
                            </p>

                            {/* Technical error message for development */}
                            {process.env.NODE_ENV === 'development' && (
                                <details className="mt-2 text-xs text-muted-foreground">
                                    <summary className="cursor-pointer hover:text-foreground">Detalles técnicos</summary>
                                    <p className="mt-1 rounded bg-muted p-2 text-left font-mono">{error}</p>
                                </details>
                            )}
                        </div>

                        {/* Retry button */}
                        {onRetry && (
                            <Button variant="outline" size="sm" onClick={handleRetry} disabled={isRetrying} className="min-w-24">
                                {isRetrying ? (
                                    <>
                                        <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                                        Intentando...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-2 h-3 w-3" />
                                        Reintentar
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
