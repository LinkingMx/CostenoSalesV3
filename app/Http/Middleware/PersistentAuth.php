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
        // Check if user is already authenticated
        if (Auth::check()) {
            $this->refreshSessionIfNeeded($request);
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
        
        if (!$sessionExpiry) {
            session(['session_expiry' => now()->addMinutes($sessionLifetime)->timestamp]);
            return;
        }

        $minutesUntilExpiry = (int) (($sessionExpiry - now()->timestamp) / 60);
        
        // Refresh if less than 1 day remaining
        if ($minutesUntilExpiry < 1440) {
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
                'expires_at' => now()->addDays(30),
                'last_used_at' => now()
            ]);
    }

    /**
     * Create a new persistent token for the user
     */
    public static function createPersistentToken(int $userId): string
    {
        $token = Str::random(60);
        
        DB::table('persistent_tokens')->insert([
            'user_id' => $userId,
            'token' => hash('sha256', $token),
            'expires_at' => now()->addDays(30),
            'created_at' => now(),
            'last_used_at' => now(),
        ]);

        Cookie::queue('persistent_token', $token, 60 * 24 * 30); // 30 days
        
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
}