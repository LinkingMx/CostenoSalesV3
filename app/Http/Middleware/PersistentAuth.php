<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class PersistentAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Detect if request is from PWA
        $isPwa = self::isPwaRequest($request);

        // Check if user is already authenticated
        if (Auth::check()) {
            $this->refreshSessionIfNeeded($request);

            // Auto-create persistent token for PWA users
            if ($isPwa && ! $request->cookie('persistent_token')) {
                self::createPersistentToken(Auth::id());
            }

            return $next($request);
        }

        // Try to authenticate using persistent token
        $token = $request->cookie('persistent_token');

        if ($token) {
            $this->authenticateWithToken($token);
        }

        return $next($request);
    }

    /**
     * Refresh session if it's about to expire
     */
    private function refreshSessionIfNeeded(Request $request): void
    {
        $sessionLifetime = config('session.lifetime');
        $sessionExpiry = session('session_expiry');

        if (! $sessionExpiry) {
            session(['session_expiry' => now()->addMinutes($sessionLifetime)->timestamp]);

            return;
        }

        $minutesUntilExpiry = (int) (($sessionExpiry - now()->timestamp) / 60);

        // Refresh if less than 7 days remaining (more aggressive for PWA)
        if ($minutesUntilExpiry < 10080) {
            session(['session_expiry' => now()->addMinutes($sessionLifetime)->timestamp]);

            // Also refresh the persistent token if it exists
            if ($request->cookie('persistent_token')) {
                $this->refreshPersistentToken($request->cookie('persistent_token'));
            }
        }
    }

    /**
     * Authenticate user with persistent token
     */
    private function authenticateWithToken(string $token): void
    {
        $tokenData = DB::table('persistent_tokens')
            ->where('token', hash('sha256', $token))
            ->where('expires_at', '>', now())
            ->first();

        if ($tokenData) {
            Auth::loginUsingId($tokenData->user_id, true);

            // Update last used timestamp
            DB::table('persistent_tokens')
                ->where('id', $tokenData->id)
                ->update(['last_used_at' => now()]);

            // Set session expiry
            session(['session_expiry' => now()->addMinutes(config('session.lifetime'))->timestamp]);
        }
    }

    /**
     * Refresh persistent token expiry
     */
    private function refreshPersistentToken(string $token): void
    {
        DB::table('persistent_tokens')
            ->where('token', hash('sha256', $token))
            ->where('expires_at', '>', now())
            ->update([
                'expires_at' => now()->addDays(90), // Extended for PWA
                'last_used_at' => now(),
            ]);
    }

    /**
     * Create a new persistent token for the user
     */
    public static function createPersistentToken(int $userId): string
    {
        $token = Str::random(60);
        $request = request();

        DB::table('persistent_tokens')->insert([
            'user_id' => $userId,
            'token' => hash('sha256', $token),
            'user_agent' => $request->userAgent(),
            'ip_address' => $request->ip(),
            'is_pwa' => self::isPwaRequest($request),
            'expires_at' => now()->addDays(90), // Extended for PWA
            'created_at' => now(),
            'last_used_at' => now(),
        ]);

        // Set cookie with proper PWA-compatible settings
        Cookie::queue(
            Cookie::make('persistent_token', $token, 60 * 24 * 90) // 90 days
                ->withSameSite('none')
                ->withSecure($request->secure())
        );

        return $token;
    }

    /**
     * Revoke all persistent tokens for a user
     */
    public static function revokePersistentTokens(int $userId): void
    {
        DB::table('persistent_tokens')
            ->where('user_id', $userId)
            ->delete();

        Cookie::queue(Cookie::forget('persistent_token'));
    }

    /**
     * Check if the request is from a PWA
     */
    private static function isPwaRequest(Request $request): bool
    {
        // Check for standalone display mode (PWA)
        $displayMode = $request->header('Sec-Fetch-Dest');
        $userAgent = $request->userAgent();

        // Various ways to detect PWA
        return
            // Check for standalone mode in referrer
            str_contains($request->header('Referer', ''), 'mode=standalone') ||
            // Check for specific PWA user agents
            str_contains($userAgent, 'Mobile') ||
            // Check for display-mode media query (sent by some PWAs)
            $request->query('pwa') === 'true' ||
            // Check for custom PWA header
            $request->header('X-Requested-With') === 'PWA';
    }
}
