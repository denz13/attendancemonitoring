<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // Determine user role based on which guard is authenticated
        // Check guards in order: teacher, student, then default web guard
        $userRole = 'guest';
        $user = null;

        if (\Illuminate\Support\Facades\Auth::guard('teacher')->check()) {
            $userRole = 'teacher';
            $teacher = \Illuminate\Support\Facades\Auth::guard('teacher')->user();
            // Format teacher data to match expected structure
            $user = $teacher ? [
                'id' => $teacher->id,
                'name' => $teacher->fullname ?? $teacher->email,
                'email' => $teacher->email,
                'fullname' => $teacher->fullname,
                'image' => $teacher->image,
                'status' => $teacher->status,
            ] : null;
        } elseif (\Illuminate\Support\Facades\Auth::guard('student')->check()) {
            $userRole = 'student';
            $student = \Illuminate\Support\Facades\Auth::guard('student')->user();
            // Format student data to match expected structure
            $user = $student ? [
                'id' => $student->id,
                'name' => $student->fullname ?? $student->student_id,
                'email' => $student->student_id,
                'fullname' => $student->fullname,
                'student_id' => $student->student_id,
                'image' => $student->image,
                'status' => $student->status,
            ] : null;
        } elseif ($request->user()) {
            $userRole = 'admin';
            $user = $request->user();
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user,
                'role' => $userRole,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
