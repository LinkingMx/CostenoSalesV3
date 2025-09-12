<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SessionController extends Controller
{
    /**
     * Refresh the user's session.
     */
    public function refresh(Request $request): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Update session expiry
        $sessionLifetime = config('session.lifetime');
        $newExpiry = now()->addMinutes($sessionLifetime)->timestamp;
        
        session(['session_expiry' => $newExpiry]);
        
        // Touch the session to keep it alive
        $request->session()->regenerate();

        return response()->json([
            'session_expiry' => $newExpiry,
            'user_id' => Auth::id(),
            'message' => 'Session refreshed successfully',
        ]);
    }

    /**
     * Check current session status.
     */
    public function status(Request $request): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json([
                'authenticated' => false,
            ]);
        }

        $sessionExpiry = session('session_expiry');
        
        return response()->json([
            'authenticated' => true,
            'user_id' => Auth::id(),
            'session_expiry' => $sessionExpiry,
            'minutes_remaining' => $sessionExpiry ? (int)(($sessionExpiry - now()->timestamp) / 60) : null,
        ]);
    }
}