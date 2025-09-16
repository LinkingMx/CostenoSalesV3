import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }

    interface Navigator {
        standalone?: boolean;
    }
}

export function usePWA() {
    const [isInstalled, setIsInstalled] = useState(false);
    const [isInstallable, setIsInstallable] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);

    useEffect(() => {
        // Check if already installed
        const checkIfInstalled = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            const isInStandaloneMode =
                ('standalone' in window.navigator && window.navigator.standalone) || isStandalone || document.referrer.includes('android-app://');

            setIsInStandaloneMode(isInStandaloneMode);
            setIsInstalled(isInStandaloneMode);
        };

        // Check if iOS
        const checkIfIOS = () => {
            const userAgent = window.navigator.userAgent.toLowerCase();
            const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
            setIsIOS(isIOSDevice);

            // iOS doesn't support beforeinstallprompt, but we can check if it's installable
            if (isIOSDevice && !isInStandaloneMode) {
                setIsInstallable(true);
            }
        };

        checkIfInstalled();
        checkIfIOS();

        // Listen for beforeinstallprompt event (Chrome/Edge/Samsung)
        const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        // Listen for app installed event
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, [isInStandaloneMode]);

    const install = async () => {
        if (!deferredPrompt) {
            return false;
        }

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                setIsInstalled(true);
                setIsInstallable(false);
                setDeferredPrompt(null);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error installing PWA:', error);
            return false;
        }
    };

    return {
        isInstalled,
        isInstallable,
        isIOS,
        isInStandaloneMode,
        install,
    };
}
