import { useState, useCallback } from 'react';

interface PWAUpdateState {
  isUpdateModalOpen: boolean;
  showUpdateModal: () => void;
  hideUpdateModal: () => void;
  confirmUpdate: () => void;
  cancelUpdate: () => void;
}

/**
 * Hook for managing PWA update modal state and actions.
 * Provides state management for the custom update modal.
 */
export function usePWAUpdate(onUpdateConfirmed: () => void): PWAUpdateState {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const showUpdateModal = useCallback(() => {
    setIsUpdateModalOpen(true);
  }, []);

  const hideUpdateModal = useCallback(() => {
    setIsUpdateModalOpen(false);
  }, []);

  const confirmUpdate = useCallback(() => {
    setIsUpdateModalOpen(false);
    onUpdateConfirmed();
  }, [onUpdateConfirmed]);

  const cancelUpdate = useCallback(() => {
    setIsUpdateModalOpen(false);
  }, []);

  return {
    isUpdateModalOpen,
    showUpdateModal,
    hideUpdateModal,
    confirmUpdate,
    cancelUpdate,
  };
}