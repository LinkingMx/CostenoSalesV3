import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for managing minimum loading duration with smooth UX transitions
 *
 * Ensures that loading states persist for at least the specified duration
 * to prevent jarring quick flashes and provide better user experience.
 *
 * @param actualIsLoading - The actual loading state from API/data source
 * @param minimumDurationMs - Minimum duration in milliseconds (default: 3000ms)
 * @returns {boolean} - Enhanced loading state that respects minimum duration
 *
 * @example
 * ```tsx
 * const { isLoading: apiLoading } = useSomeApiHook();
 * const isLoading = useMinimumLoadingDuration(apiLoading, 3000);
 *
 * if (isLoading) {
 *   return <SkeletonComponent />;
 * }
 * ```
 */
export function useMinimumLoadingDuration(
    actualIsLoading: boolean,
    minimumDurationMs: number = 3000
): boolean {
    const [displayLoading, setDisplayLoading] = useState(false);
    const loadingStartedRef = useRef<number | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // When actual loading starts
        if (actualIsLoading && !displayLoading) {
            loadingStartedRef.current = Date.now();
            setDisplayLoading(true);

            // Clear any existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }

        // When actual loading ends
        if (!actualIsLoading && displayLoading && loadingStartedRef.current) {
            const elapsedTime = Date.now() - loadingStartedRef.current;
            const remainingTime = Math.max(0, minimumDurationMs - elapsedTime);

            if (remainingTime > 0) {
                // Wait for remaining time before hiding loading
                timeoutRef.current = setTimeout(() => {
                    setDisplayLoading(false);
                    loadingStartedRef.current = null;
                    timeoutRef.current = null;
                }, remainingTime);
            } else {
                // Minimum duration already elapsed, hide immediately
                setDisplayLoading(false);
                loadingStartedRef.current = null;
            }
        }

        // Cleanup function
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [actualIsLoading, displayLoading, minimumDurationMs]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return displayLoading;
}