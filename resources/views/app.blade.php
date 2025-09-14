<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme --}}
        <style>
            :root {
                --background: #F8F8F8;
                --foreground: #5A5A5A;
            }

            html.dark {
                --background: #1A1A1A;
                --foreground: #E0E0E0;
            }

            * {
                box-sizing: border-box;
            }

            html {
                background-color: var(--background) !important;
                color: var(--foreground);
                height: 100%;
                margin: 0;
                padding: 0;
            }

            body {
                background-color: var(--background) !important;
                color: var(--foreground);
                height: 100%;
                margin: 0;
                padding: 0;
                overflow-x: hidden;
            }

            #app {
                min-height: 100vh;
                background-color: var(--background);
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="/icons/icon-192.png" type="image/png" sizes="192x192">
        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="manifest" href="/manifest.json">
        
        {{-- PWA Meta Tags --}}
        <meta name="theme-color" content="#F8F8F8">
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1A1A1A">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="Costeno Sales">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
