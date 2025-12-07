<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SchedulesController;
use App\Http\Controllers\StudentAccountController;
use App\Http\Controllers\SubjectController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    if (Auth::check() || Auth::guard('student')->check() || Auth::guard('teacher')->check()) {
        return redirect()->route('dashboard');
    }
    return redirect('/login');
})->name('home');

// Dashboard accessible by admin (web guard) and teacher (teacher guard)
Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {

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
    Route::post('schedules/enroll-student', [SchedulesController::class, 'enrollStudent'])->name('schedules.enroll-student');
    Route::get('schedules/enrolled-students', [SchedulesController::class, 'getEnrolledStudents'])->name('schedules.enrolled-students');
    Route::delete('schedules/remove-student', [SchedulesController::class, 'removeStudent'])->name('schedules.remove-student');
    Route::post('qr-codes/validate-enrollment', [SchedulesController::class, 'validateStudentEnrollment'])->name('qr-codes.validate-enrollment');
    Route::post('qr-codes/time-in', [SchedulesController::class, 'timeIn'])->name('qr-codes.time-in');

    Route::get('reports', [\App\Http\Controllers\ReportsController::class, 'index'])->name('reports');

    Route::get('qr-codes', function () {
        $students = \App\Models\student_account::query()
            ->latest('id')
            ->get([
                'id',
                'student_id',
                'fullname',
                'year_level',
                'section',
                'status',
                'image',
            ])
            ->map(function ($student) {
                $student->image_url = $student->image
                    ? \Illuminate\Support\Facades\Storage::url($student->image)
                    : null;
                return $student;
            });

        // Get teacher's tagged subjects if logged in as teacher
        $teacherSubjects = [];
        if (\Illuminate\Support\Facades\Auth::guard('teacher')->check()) {
            $teacher = \Illuminate\Support\Facades\Auth::guard('teacher')->user();
            $teacherSubjects = \App\Models\teacher_subject_tag::where('teacher_id', $teacher->id)
                ->where('status', 'active')
                ->with(['subject:id,subject_code,subject,year_level,section'])
                ->get()
                ->map(function ($tag) {
                    return [
                        'id' => $tag->id,
                        'subject_id' => $tag->subject_id,
                        'subject_code' => $tag->subject->subject_code ?? '',
                        'subject' => $tag->subject->subject ?? '',
                        'year_level' => $tag->subject->year_level ?? '',
                        'section' => $tag->subject->section ?? '',
                    ];
                })
                ->filter(function ($tag) {
                    return $tag['subject'] !== '';
                })
                ->values();
        }

        return Inertia::render('qrcodes', [
            'students' => $students,
            'teacherSubjects' => $teacherSubjects,
        ]);
    })->name('qr-codes');

    Route::get('help', function () {
        return Inertia::render('help');
    })->name('help');
});

require __DIR__.'/settings.php';
