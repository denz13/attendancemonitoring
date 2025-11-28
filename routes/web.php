<?php

use App\Http\Controllers\StudentAccountController;
use App\Http\Controllers\SubjectController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('users', [StudentAccountController::class, 'index'])
        ->name('users');
    Route::post('users', [StudentAccountController::class, 'store'])
        ->name('users.store');
    Route::put('users/{type}/{id}/status', [StudentAccountController::class, 'updateStatus'])
        ->name('users.status');
    Route::put('users/{type}/{id}', [StudentAccountController::class, 'update'])
        ->name('users.update');
    Route::delete('users/{type}/{id}', [StudentAccountController::class, 'destroy'])
        ->name('users.destroy');

    Route::get('subject', [SubjectController::class, 'index'])->name('subject');
    Route::post('subject', [SubjectController::class, 'store'])->name('subject.store');
});

require __DIR__.'/settings.php';
