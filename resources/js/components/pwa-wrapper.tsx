import React from 'react';
import { usePWAUpdate } from '../hooks/use-pwa-update';
import { PWAUpdateModal } from './pwa-update-modal';

interface PWAWrapperProps {
    children: React.ReactNode;
    onUpdateConfirmed: () => void;
}

/**
 * Wrapper component that provides PWA update modal functionality.
 * Manages the state and display of PWA update notifications.
 */
export function PWAWrapper({ children, onUpdateConfirmed }: PWAWrapperProps) {
    const { isUpdateModalOpen, showUpdateModal, confirmUpdate, cancelUpdate } = usePWAUpdate(onUpdateConfirmed);

    // Expose the showUpdateModal function globally so it can be called from the SW registration
    React.useEffect(() => {
        (window as any).__showPWAUpdateModal = showUpdateModal;

        return () => {
            delete (window as any).__showPWAUpdateModal;
        };
    }, [showUpdateModal]);

    return (
        <>
            {children}
            <PWAUpdateModal open={isUpdateModalOpen} onConfirm={confirmUpdate} onCancel={cancelUpdate} />
        </>
    );
}
