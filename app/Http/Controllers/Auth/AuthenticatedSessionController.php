<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Middleware\PersistentAuth;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Check if this is a PWA request
        $isPwa = $this->isPwaRequest($request);

        // Create persistent token if remember me is checked OR if it's a PWA
        if ($request->boolean('remember') || $isPwa) {
            PersistentAuth::createPersistentToken(Auth::id());
        }

        // Set session expiry for refresh handling
        session(['session_expiry' => now()->addMinutes(config('session.lifetime'))->timestamp]);

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Revoke persistent tokens when logging out
        if (Auth::check()) {
            PersistentAuth::revokePersistentTokens(Auth::id());
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Check if the request is from a PWA
     */
    private function isPwaRequest(Request $request): bool
    {
        $userAgent = $request->userAgent();

        return
            str_contains($request->header('Referer', ''), 'mode=standalone') ||
            str_contains($userAgent, 'Mobile') ||
            $request->query('pwa') === 'true' ||
            $request->header('X-Requested-With') === 'PWA' ||
            $request->cookie('pwa_mode') === 'true';
    }
}
