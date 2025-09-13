import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { registerSW } from 'virtual:pwa-register';
import { PWAWrapper } from './components/pwa-wrapper';
import React from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Register service worker for PWA
console.log('🔧 Attempting to register Service Worker...');
const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
        console.log('🔄 PWA: New content available');
        // Use custom modal instead of browser confirm()
        if ((window as any).__showPWAUpdateModal) {
            (window as any).__showPWAUpdateModal();
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
            setInterval(() => {
                registration.update();
            }, 60 * 60 * 1000);
        }
    },
    onRegisterError(error) {
        console.error('❌ PWA: Service Worker registration error:', error);
    },
});

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <PWAWrapper onUpdateConfirmed={() => updateSW(true)}>
                <App {...props} />
            </PWAWrapper>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
