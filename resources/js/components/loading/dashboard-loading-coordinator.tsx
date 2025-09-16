import type { DateRange } from '@/components/main-filter-calendar';
import { useApiLoadingContext } from '@/contexts/api-loading-context';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { FullPageLoadingOverlay } from './full-page-loading-overlay';

interface DashboardLoadingCoordinatorProps {
    children: React.ReactNode;
    dateRange: DateRange | undefined;
    className?: string;
    minLoadingDuration?: number;
    showDetailedLoading?: boolean;
    fadeTransitionDuration?: number;
    skipInitialLoading?: boolean; // Flag to skip loading on restore scenarios
}

export function DashboardLoadingCoordinator({
    children,
    dateRange,
    className,
    minLoadingDuration = 800,
    showDetailedLoading = process.env.NODE_ENV === 'development',
    fadeTransitionDuration = 400,
    skipInitialLoading = false,
}: DashboardLoadingCoordinatorProps) {
    const {
        isGlobalLoading,
        onDateRangeChange,
        getLoadingProgress,
        activeApiCalls,
        totalCallsCount,
        failedCalls,
        getFailedCallsInfo,
        retryFailedCalls,
        resetLoadingState,
    } = useApiLoadingContext();

    const [loadingStartTime, setLoadingStartTime] = React.useState<number | null>(null);
    const [showOverlay, setShowOverlay] = React.useState(false);
    const [overlayOpacity, setOverlayOpacity] = React.useState(0);
    const [contentOpacity, setContentOpacity] = React.useState(1);

    const loadingProgress = getLoadingProgress();
    const hasErrors = failedCalls.length > 0;
    const activeCallsCount = Array.from(activeApiCalls.values()).filter((call) => call.status === 'pending').length;

    // Track if this is the first render to avoid unnecessary loading on restore
    const isFirstRender = React.useRef(true);
    const previousDateRange = React.useRef<DateRange | undefined>();

    React.useEffect(() => {
        // Skip date range change detection on first render for restore scenarios
        if (isFirstRender.current) {
            isFirstRender.current = false;
            previousDateRange.current = dateRange;

            if (process.env.NODE_ENV === 'development') {
                console.log('🔧 Dashboard loading coordinator: First render, skipping reset for restore');
            }
            return;
        }

        // For subsequent changes, use normal flow
        const hasActualChange = (() => {
            if (!dateRange && !previousDateRange.current) return false;
            if (!dateRange || !previousDateRange.current) return true;

            return (
                dateRange.from?.getTime() !== previousDateRange.current.from?.getTime() ||
                dateRange.to?.getTime() !== previousDateRange.current.to?.getTime()
            );
        })();

        if (hasActualChange) {
            if (process.env.NODE_ENV === 'development') {
                console.log('🔧 Dashboard loading coordinator: Actual date change detected, triggering reset');
            }
            onDateRangeChange(dateRange);
            previousDateRange.current = dateRange;
        } else if (process.env.NODE_ENV === 'development') {
            console.log('🔧 Dashboard loading coordinator: No actual date change, preserving state');
        }
    }, [dateRange, onDateRangeChange]);

    React.useEffect(() => {
        if (isGlobalLoading && !showOverlay) {
            // Skip loading overlay if this is a restore scenario
            if (skipInitialLoading && isFirstRender.current) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('🔄 Dashboard loading coordinator: Skipping initial loading for restore scenario');
                }
                return;
            }

            // Start loading: fade out content, fade in overlay
            setLoadingStartTime(Date.now());

            // Add a small delay before showing overlay to avoid flash for cached data
            const showLoadingTimeout = setTimeout(() => {
                setShowOverlay(true);

                // Start with content visible
                setContentOpacity(0.2);

                // Small delay to ensure DOM is ready, then fade in overlay
                setTimeout(() => {
                    setOverlayOpacity(1);
                }, 50);

                if (process.env.NODE_ENV === 'development') {
                    console.log('🔄 Dashboard loading coordinator: Starting global loading state');
                }
            }, 200); // Wait 200ms before showing loading overlay

            return () => clearTimeout(showLoadingTimeout);
        }

        if (!isGlobalLoading && showOverlay) {
            const currentTime = Date.now();
            const elapsedTime = loadingStartTime ? currentTime - loadingStartTime : 0;
            const remainingMinTime = Math.max(0, minLoadingDuration - elapsedTime);

            if (process.env.NODE_ENV === 'development') {
                console.log(`⏱️ Loading completed in ${elapsedTime}ms, minimum duration: ${minLoadingDuration}ms`);
            }

            // Wait for minimum duration, then start the fade out
            const fadeOutTimeout = setTimeout(() => {
                // Start fading out overlay
                setOverlayOpacity(0);

                // After a short delay, start fading in content
                setTimeout(() => {
                    setContentOpacity(1);
                }, 100);

                // After transition completes, hide overlay
                setTimeout(() => {
                    setShowOverlay(false);
                    setLoadingStartTime(null);

                    if (process.env.NODE_ENV === 'development') {
                        console.log('✅ Dashboard loading coordinator: Loading state cleared');
                    }
                }, fadeTransitionDuration);
            }, remainingMinTime);

            return () => clearTimeout(fadeOutTimeout);
        }
    }, [isGlobalLoading, showOverlay, loadingStartTime, minLoadingDuration, fadeTransitionDuration]);

    const handleRetryFailed = React.useCallback(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Dashboard coordinator: Retrying failed API calls');
        }
        retryFailedCalls();
    }, [retryFailedCalls]);

    const handleResetLoading = React.useCallback(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Dashboard coordinator: Manually resetting loading state');
        }
        resetLoadingState();
        setShowOverlay(false);
        setLoadingStartTime(null);
        setOverlayOpacity(0);
        setContentOpacity(1);
    }, [resetLoadingState]);

    React.useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && isGlobalLoading) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('👁️ Page became hidden during loading');
                }
            } else if (!document.hidden && !isGlobalLoading && totalCallsCount === 0) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('👁️ Page became visible, checking for stale loading state');
                }
                handleResetLoading();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isGlobalLoading, totalCallsCount, handleResetLoading]);

    React.useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isGlobalLoading && loadingStartTime) {
            const maxLoadingTime = 30000;
            timeoutId = setTimeout(() => {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('⚠️ Loading timeout reached, forcing completion');
                }
                handleResetLoading();
            }, maxLoadingTime);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isGlobalLoading, loadingStartTime, handleResetLoading]);

    const failedCallsInfo = React.useMemo(() => getFailedCallsInfo(), [getFailedCallsInfo]);

    React.useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            if (showOverlay && activeCallsCount === 0 && totalCallsCount > 0) {
                console.log(
                    `🔍 Debug: showOverlay=${showOverlay}, activeCallsCount=${activeCallsCount}, totalCallsCount=${totalCallsCount}, isGlobalLoading=${isGlobalLoading}`,
                );
            }
        }
    }, [showOverlay, activeCallsCount, totalCallsCount, isGlobalLoading]);

    return (
        <div className={cn('relative', className)}>
            {showOverlay && (
                <FullPageLoadingOverlay
                    progress={loadingProgress}
                    activeCallsCount={activeCallsCount}
                    totalCallsCount={totalCallsCount}
                    hasErrors={hasErrors}
                    failedCallsInfo={failedCallsInfo}
                    onRetryFailed={hasErrors ? handleRetryFailed : undefined}
                    showDetails={showDetailedLoading}
                    style={{
                        opacity: overlayOpacity,
                        transition: `opacity ${fadeTransitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                    }}
                />
            )}

            <div
                style={{
                    opacity: contentOpacity,
                    transition: `opacity ${fadeTransitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                    pointerEvents: contentOpacity === 1 ? 'auto' : 'none',
                }}
            >
                {children}
            </div>
        </div>
    );
}

export default DashboardLoadingCoordinator;
