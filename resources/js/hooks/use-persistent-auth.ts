import { useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';

interface SessionData {
    sessionExpiry?: number;
    userId?: number;
}

export function usePersistentAuth() {
    const checkAndRefreshSession = useCallback(() => {
        const sessionData = localStorage.getItem('session_data');
        
        if (!sessionData) {
            return;
        }

        try {
            const data: SessionData = JSON.parse(sessionData);
            
            if (!data.sessionExpiry) {
                return;
            }

            const now = Date.now() / 1000;
            const minutesUntilExpiry = (data.sessionExpiry - now) / 60;

            // Refresh if less than 24 hours remaining
            if (minutesUntilExpiry < 1440 && minutesUntilExpiry > 0) {
                // Make a background request to refresh the session
                fetch('/api/session/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    credentials: 'same-origin',
                })
                .then(response => response.json())
                .then(data => {
                    if (data.session_expiry) {
                        localStorage.setItem('session_data', JSON.stringify({
                            sessionExpiry: data.session_expiry,
                            userId: data.user_id,
                        }));
                    }
                })
                .catch(error => {
                    console.error('Failed to refresh session:', error);
                });
            }
        } catch (error) {
            console.error('Error parsing session data:', error);
        }
    }, []);

    const saveSessionData = useCallback((expiry: number, userId: number) => {
        localStorage.setItem('session_data', JSON.stringify({
            sessionExpiry: expiry,
            userId: userId,
        }));
    }, []);

    const clearSessionData = useCallback(() => {
        localStorage.removeItem('session_data');
        localStorage.removeItem('persistent_token');
    }, []);

    useEffect(() => {
        // Check session on mount
        checkAndRefreshSession();

        // Set up periodic check every 30 minutes
        const interval = setInterval(checkAndRefreshSession, 30 * 60 * 1000);

        // Listen for visibility change to check when app becomes visible
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                checkAndRefreshSession();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Listen for Inertia navigation to check session
        const removeInertiaListener = router.on('navigate', () => {
            checkAndRefreshSession();
        });

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            removeInertiaListener();
        };
    }, [checkAndRefreshSession]);

    return {
        saveSessionData,
        clearSessionData,
        checkAndRefreshSession,
    };
}