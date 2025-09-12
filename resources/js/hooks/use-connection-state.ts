import { useEffect, useState, useCallback } from 'react';

interface ConnectionState {
    isOnline: boolean;
    isSlowConnection: boolean;
    connectionType: string | undefined;
    effectiveType: string | undefined;
    downlink: number | undefined;
    rtt: number | undefined;
    saveData: boolean;
}

interface NetworkInformation extends EventTarget {
    downlink?: number;
    effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
    rtt?: number;
    saveData?: boolean;
    type?: string;
}

declare global {
    interface Navigator {
        connection?: NetworkInformation;
        mozConnection?: NetworkInformation;
        webkitConnection?: NetworkInformation;
    }
}

export function useConnectionState() {
    const [connectionState, setConnectionState] = useState<ConnectionState>(() => {
        const connection = navigator.connection || 
                          navigator.mozConnection || 
                          navigator.webkitConnection;

        return {
            isOnline: navigator.onLine,
            isSlowConnection: connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g',
            connectionType: connection?.type,
            effectiveType: connection?.effectiveType,
            downlink: connection?.downlink,
            rtt: connection?.rtt,
            saveData: connection?.saveData || false,
        };
    });

    const [pendingActions, setPendingActions] = useState<Array<() => Promise<void>>>([]);

    const updateConnectionState = useCallback(() => {
        const connection = navigator.connection || 
                          navigator.mozConnection || 
                          navigator.webkitConnection;

        setConnectionState({
            isOnline: navigator.onLine,
            isSlowConnection: connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g',
            connectionType: connection?.type,
            effectiveType: connection?.effectiveType,
            downlink: connection?.downlink,
            rtt: connection?.rtt,
            saveData: connection?.saveData || false,
        });
    }, []);

    const addPendingAction = useCallback((action: () => Promise<void>) => {
        setPendingActions(prev => [...prev, action]);
    }, []);

    const processPendingActions = useCallback(async () => {
        if (!navigator.onLine || pendingActions.length === 0) {
            return;
        }

        const actionsToProcess = [...pendingActions];
        setPendingActions([]);

        for (const action of actionsToProcess) {
            try {
                await action();
            } catch (error) {
                console.error('Error processing pending action:', error);
                // Re-add failed action to queue
                setPendingActions(prev => [...prev, action]);
            }
        }
    }, [pendingActions]);

    useEffect(() => {
        const handleOnline = () => {
            updateConnectionState();
            processPendingActions();
        };

        const handleOffline = () => {
            updateConnectionState();
        };

        const handleConnectionChange = () => {
            updateConnectionState();
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const connection = navigator.connection || 
                          navigator.mozConnection || 
                          navigator.webkitConnection;

        if (connection) {
            connection.addEventListener('change', handleConnectionChange);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            
            if (connection) {
                connection.removeEventListener('change', handleConnectionChange);
            }
        };
    }, [updateConnectionState, processPendingActions]);

    return {
        ...connectionState,
        pendingActions,
        addPendingAction,
        processPendingActions,
    };
}