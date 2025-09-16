import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { PWAWrapper } from './components/pwa-wrapper';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// PWA Detection and Enhanced Session Management
const setupPWASessionManagement = () => {
    const isPWA =
        window.matchMedia('(display-mode: standalone)').matches ||
        ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true) ||
        document.referrer.includes('android-app://');

    if (isPWA) {
        console.log('🔐 PWA Mode detected - Enabling enhanced session management');

        // Set PWA indicator cookie
        document.cookie = 'pwa_mode=true; path=/; max-age=31536000; SameSite=None; Secure';

        // Add PWA header to all fetch requests
        const originalFetch = window.fetch;
        window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
            const options = init || {};
            options.headers = {
                ...options.headers,
                'X-Requested-With': 'PWA',
            };
            return originalFetch(input, options);
        };

        // Add PWA indicator to XMLHttpRequest
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (
            method: string,
            url: string | URL,
            async?: boolean,
            username?: string | null,
            password?: string | null,
        ) {
            const result = originalOpen.call(this, method, url, async ?? true, username, password);
            this.setRequestHeader('X-Requested-With', 'PWA');
            return result;
        };
    }
};

// Initialize PWA session management
setupPWASessionManagement();

// Register service worker for PWA with enhanced configuration
console.log('🔧 Attempting to register Service Worker with enhanced session support...');
const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
        console.log('🔄 PWA: New content available');
        // Use custom modal instead of browser confirm()
        const windowWithModal = window as Window & { __showPWAUpdateModal?: () => void };
        if (windowWithModal.__showPWAUpdateModal) {
            windowWithModal.__showPWAUpdateModal();
        } else {
            // Fallback for cases where modal isn't ready yet
            if (confirm('New content available. Reload?')) {
                updateSW(true);
            }
        }
    },
    onOfflineReady() {
        console.log('📱 PWA: App ready to work offline');
    },
    onRegisteredSW(swScriptUrl, registration) {
        console.log('✅ PWA: Service Worker registered successfully', swScriptUrl);
        console.log('📋 PWA: Registration details', registration);

        // Check for updates every hour
        if (registration) {
            setInterval(
                () => {
                    registration.update();
                },
                60 * 60 * 1000,
            );
        }
    },
    onRegisterError(error) {
        console.error('❌ PWA: Service Worker registration error:', error);
    },
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <PWAWrapper onUpdateConfirmed={() => updateSW(true)}>
                <App {...props} />
            </PWAWrapper>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
