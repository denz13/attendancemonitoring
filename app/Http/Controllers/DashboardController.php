<?php

namespace App\Http\Controllers;

use App\Models\student_account;
use App\Models\teacher_account;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
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

