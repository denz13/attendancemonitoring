<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SchedulesController;
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
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

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
    Route::get('teachers/{id}/subjects', [StudentAccountController::class, 'getTeacherSubjects'])
        ->name('teachers.subjects');
    Route::post('teachers/{id}/tag-subjects', [StudentAccountController::class, 'tagSubjects'])
        ->name('teachers.tag-subjects');

    Route::get('subject', [SubjectController::class, 'index'])->name('subject');
    Route::post('subject', [SubjectController::class, 'store'])->name('subject.store');

    Route::get('schedules', [SchedulesController::class, 'index'])->name('schedules');
    Route::post('schedules', [SchedulesController::class, 'store'])->name('schedules.store');
});

require __DIR__.'/settings.php';
