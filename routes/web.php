<?php

use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\BranchDetailsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function (Request $request) {
        return Inertia::render('dashboard', [
            'restoreDate' => $request->input('restoreDate'),
        ]);
    })->name('dashboard');

    Route::get('branch/{id}', [BranchDetailsController::class, 'show'])->name('branch.details');
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
