<?php

namespace App\Http\Controllers;

use App\Models\student_account;
use App\Models\teacher_account;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // Check if user is logged in as teacher
        if (Auth::guard('teacher')->check()) {
            // Return teacher dashboard
            return Inertia::render('dashboard/dashboard-teacher', [
                'classList' => [],
                'attendanceSummary' => [],
            ]);
        }

        // Default admin dashboard
        $totalStudents = student_account::count();
        $totalTeachers = teacher_account::count();
        $totalAdmins = User::count();
        $totalUsers = $totalTeachers + $totalAdmins;

        return Inertia::render('dashboard', [
            'totalStudents' => $totalStudents,
            'totalUsers' => $totalUsers,
        ]);
    }
}

