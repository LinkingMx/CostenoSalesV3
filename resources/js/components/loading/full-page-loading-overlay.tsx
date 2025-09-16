import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { ApiCallInfo } from '@/contexts/api-loading-context';
import { cn } from '@/lib/utils';
import { AlertCircle, Clock, Loader2, RefreshCcw } from 'lucide-react';
import * as React from 'react';

interface FullPageLoadingOverlayProps {
    progress: number;
    activeCallsCount: number;
    totalCallsCount: number;
    hasErrors: boolean;
    failedCallsInfo?: ApiCallInfo[];
    onRetryFailed?: () => void;
    className?: string;
    showDetails?: boolean;
    style?: React.CSSProperties;
}

interface LoadingStageInfo {
    stage: 'initializing' | 'loading' | 'completing' | 'error';
    message: string;
    description?: string;
}

function getLoadingStage(progress: number, hasErrors: boolean, activeCallsCount: number): LoadingStageInfo {
    if (hasErrors && activeCallsCount === 0) {
        return {
            stage: 'error',
            message: 'Error al cargar algunos datos',
            description: 'Se mostrarán datos parciales disponibles',
        };
    }

    if (progress === 0) {
        return {
            stage: 'initializing',
            message: 'Inicializando carga de datos',
            description: 'Preparando solicitudes API...',
        };
    }

    if (progress < 100) {
        return {
            stage: 'loading',
            message: 'Cargando información del dashboard',
            description: 'Obteniendo datos de ventas actualizados...',
        };
    }

    return {
        stage: 'completing',
        message: 'Finalizando carga',
        description: 'Procesando datos finales...',
    };
}

function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
}

export function FullPageLoadingOverlay({
    progress,
    activeCallsCount,
    totalCallsCount,
    hasErrors,
    failedCallsInfo = [],
    onRetryFailed,
    className,
    showDetails = false,
    style,
}: FullPageLoadingOverlayProps) {
    const [startTime] = React.useState(() => Date.now());
    const [elapsedTime, setElapsedTime] = React.useState(0);

    const stage = React.useMemo(() => getLoadingStage(progress, hasErrors, activeCallsCount), [progress, hasErrors, activeCallsCount]);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(Date.now() - startTime);
        }, 100);

        return () => clearInterval(timer);
    }, [startTime]);

    const slowestCall = React.useMemo(() => {
        if (!failedCallsInfo.length) return null;

        return failedCallsInfo.reduce((slowest, current) => {
            const currentDuration = (current.endTime || Date.now()) - current.startTime;
            const slowestDuration = (slowest.endTime || Date.now()) - slowest.startTime;
            return currentDuration > slowestDuration ? current : slowest;
        });
    }, [failedCallsInfo]);

    return (
        <div className={cn('fixed inset-0 z-50 flex items-center justify-center', 'bg-background/95', className)} style={style}>
            <div className="mx-auto flex max-w-md flex-col items-center space-y-6 p-6">
                {/* Simple Costeno Logo */}
                <div className="relative">
                    {/* Main logo container */}
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                            <span className="text-lg font-bold text-primary-foreground">C</span>
                        </div>
                    </div>
                </div>

                {/* Main Loading Content */}
                <div className="w-full space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-lg font-medium text-foreground">{stage.message}</h2>
                        {stage.description && <p className="text-sm text-muted-foreground">{stage.description}</p>}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full space-y-3">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
                            <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="tabular-nums">{Math.round(progress)}% completado</span>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span className="tabular-nums">{formatDuration(elapsedTime)}</span>
                            </div>
                        </div>
                    </div>

                    {/* API Calls Status */}
                    <div className="flex items-center justify-center text-sm">
                        {activeCallsCount > 0 && (
                            <div className="flex items-center space-x-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <span>
                                    {activeCallsCount} de {totalCallsCount} solicitudes activas
                                </span>
                            </div>
                        )}

                        {activeCallsCount === 0 && totalCallsCount > 0 && !hasErrors && (
                            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-600">
                                    <div className="h-2 w-2 rounded-full bg-white" />
                                </div>
                                <span>Completado</span>
                            </div>
                        )}
                    </div>

                    {/* Detailed Information (Development Mode) */}
                    {showDetails && process.env.NODE_ENV === 'development' && (
                        <details className="text-left">
                            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">Detalles técnicos</summary>
                            <div className="mt-2 space-y-1 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                                <div>Total de llamadas: {totalCallsCount}</div>
                                <div>Completadas: {totalCallsCount - activeCallsCount}</div>
                                <div>Activas: {activeCallsCount}</div>
                                <div>Fallidas: {failedCallsInfo.length}</div>
                                <div>Tiempo transcurrido: {formatDuration(elapsedTime)}</div>
                                {slowestCall && (
                                    <div>
                                        Llamada más lenta: {slowestCall.componentName}(
                                        {formatDuration((slowestCall.endTime || Date.now()) - slowestCall.startTime)})
                                    </div>
                                )}
                            </div>
                        </details>
                    )}
                </div>

                {/* Error State */}
                {hasErrors && failedCallsInfo.length > 0 && (
                    <Alert className="max-w-sm">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex flex-col space-y-2">
                            <span>
                                {failedCallsInfo.length === 1 ? 'Una solicitud falló' : `${failedCallsInfo.length} solicitudes fallaron`}. Los datos
                                parciales se mostrarán correctamente.
                            </span>

                            {onRetryFailed && (
                                <Button variant="outline" size="sm" onClick={onRetryFailed} className="mt-2 self-start">
                                    <RefreshCcw className="mr-1 h-3 w-3" />
                                    Reintentar
                                </Button>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Simple Loading Dots */}
                <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="h-2 w-2 animate-pulse rounded-full bg-primary/60"
                            style={{
                                animationDelay: `${i * 0.3}s`,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default FullPageLoadingOverlay;
