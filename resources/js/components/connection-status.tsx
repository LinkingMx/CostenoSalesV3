import { useEffect, useState } from 'react';
import { useConnectionState } from '@/hooks/use-connection-state';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ConnectionStatus() {
    const { isOnline, isSlowConnection, effectiveType, pendingActions } = useConnectionState();
    const [showStatus, setShowStatus] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            setShowStatus(true);
            setWasOffline(true);
        } else if (wasOffline) {
            // Show "back online" message briefly
            setShowStatus(true);
            const timer = setTimeout(() => {
                setShowStatus(false);
                setWasOffline(false);
            }, 3000);
            return () => clearTimeout(timer);
        } else if (isSlowConnection) {
            setShowStatus(true);
        } else {
            setShowStatus(false);
        }
    }, [isOnline, isSlowConnection, wasOffline]);

    if (!showStatus) {
        return null;
    }

    if (!isOnline) {
        return (
            <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-5">
                <Alert className="rounded-none border-x-0 border-b-0 border-t bg-destructive/10 text-destructive">
                    <WifiOff className="h-4 w-4" />
                    <AlertDescription className="font-medium">
                        You are currently offline. Changes will be synced when connection is restored.
                        {pendingActions.length > 0 && (
                            <span className="ml-2 text-sm">
                                ({pendingActions.length} pending {pendingActions.length === 1 ? 'action' : 'actions'})
                            </span>
                        )}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (wasOffline && isOnline) {
        return (
            <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-5">
                <Alert className="rounded-none border-x-0 border-b-0 border-t bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription className="font-medium">
                        Connection restored. Syncing data...
                        {pendingActions.length > 0 && (
                            <span className="ml-2 text-sm">
                                (Processing {pendingActions.length} pending {pendingActions.length === 1 ? 'action' : 'actions'})
                            </span>
                        )}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (isSlowConnection) {
        return (
            <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-5">
                <Alert className="rounded-none border-x-0 border-b-0 border-t bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-medium">
                        Slow connection detected ({effectiveType}). Some features may be limited.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return null;
}