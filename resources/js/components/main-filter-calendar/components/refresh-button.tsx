import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import * as React from 'react';
import type { RefreshButtonProps } from '../types';

/**
 * RefreshButton - Simple button component for triggering data refresh or page reload.
 *
 * Provides a standard refresh icon button that can trigger custom refresh logic
 * or fall back to a full page reload. Includes accessibility features and
 * hover states for better user experience.
 *
 * @component
 * @param {RefreshButtonProps} props - Button configuration props
 * @returns {JSX.Element} Refresh button with icon and accessibility features
 *
 * @example
 * ```tsx
 * // Custom refresh logic
 * <RefreshButton onRefresh={() => refetchData()} />
 *
 * // Page reload fallback
 * <RefreshButton onRefresh={() => window.location.reload()} />
 * ```
 */
export function RefreshButton({ onRefresh }: RefreshButtonProps) {
    /**
     * Handles refresh button click with optional analytics or loading states.
     */
    const handleRefresh = React.useCallback(() => {
        onRefresh();
    }, [onRefresh]);

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-9 w-9 border-border bg-card p-0 shadow-sm transition-colors hover:border-border hover:bg-muted"
            title="Actualizar página"
            aria-label="Actualizar datos de la página"
            type="button"
        >
            <RefreshCw className="h-4 w-4 text-primary" aria-hidden="true" />
        </Button>
    );
}
