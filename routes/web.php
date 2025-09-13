<?php

use App\Http\Controllers\Api\SessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// API routes for PWA session management
Route::prefix('api')->group(function () {
    Route::post('/session/refresh', [SessionController::class, 'refresh'])
        ->middleware('auth')
        ->name('api.session.refresh');
    
    Route::get('/session/status', [SessionController::class, 'status'])
        ->name('api.session.status');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
