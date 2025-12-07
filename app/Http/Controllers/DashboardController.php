<?php

namespace App\Http\Controllers;

use App\Models\schedules;
use App\Models\student_account;
use App\Models\student_attendance;
use App\Models\student_subject_enrolled;
use App\Models\teacher_account;
use App\Models\teacher_subject_tag;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        // Check if user is logged in as student
        if (Auth::guard('student')->check()) {
            $student = Auth::guard('student')->user();
            
            // Get recent absences
            $recentAbsences = $this->getRecentAbsences($student->id);
            
            // Calculate attendance rate
            $attendanceRate = $this->calculateAttendanceRate($student->id);
            
            // Get today and tomorrow schedules
            $todaySchedule = $this->getScheduleForDate($student->id, now());
            $tomorrowSchedule = $this->getScheduleForDate($student->id, now()->addDay());
            
            // Return student dashboard
            return Inertia::render('dashboard/dashboard-student', [
                'attendanceRate' => $attendanceRate,
                'recentAbsences' => $recentAbsences,
                'todaySchedule' => $todaySchedule,
                'tomorrowSchedule' => $tomorrowSchedule,
            ]);
        }

        // Check if user is logged in as teacher
        if (Auth::guard('teacher')->check()) {
            $teacher = Auth::guard('teacher')->user();
            
            // Get class list (students with today's attendance)
            $classList = $this->getTeacherClassList($teacher->id);
            
            // Get attendance summary for teacher's subjects
            $attendanceSummary = $this->getTeacherAttendanceSummary($teacher->id);
            
            // Return teacher dashboard
            return Inertia::render('dashboard/dashboard-teacher', [
                'classList' => $classList,
                'attendanceSummary' => $attendanceSummary,
            ]);
        }

        // Check if user is authenticated (admin)
        if (!Auth::check()) {
            return redirect('/login'); // @phpstan-ignore-line
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

    private function getRecentAbsences($studentId, $limit = 10)
    {
        // Get all enrolled subjects for the student
        $enrollments = student_subject_enrolled::where('student_account_id', $studentId)
            ->where('status', 'active')
            ->with(['schedules.teacher_subject_tag.subject'])
            ->get();

        $absences = [];

        foreach ($enrollments as $enrollment) {
            $schedule = $enrollment->schedules;
            if (!$schedule || $schedule->status !== 'active') {
                continue;
            }

            $subject = $schedule->teacher_subject_tag->subject ?? null;
            if (!$subject) {
                continue;
            }

            // Determine if schedule is AM, PM, or full day based on start_at and end_at
            $startTime = Carbon::parse($schedule->start_at);
            $endTime = Carbon::parse($schedule->end_at);
            $isAM = $startTime->hour < 12; // Before 12 PM
            $isPM = $endTime->hour >= 12; // After 12 PM
            $isFullDay = $isAM && $isPM;

            // Get the day name (e.g., "Monday")
            $dayName = $schedule->day_name;

            // Get all dates for this day in the past 30 days
            $today = Carbon::now();
            $datesToCheck = [];
            for ($i = 0; $i < 30; $i++) {
                $checkDate = $today->copy()->subDays($i);
                if ($checkDate->format('l') === $dayName) {
                    $datesToCheck[] = $checkDate;
                }
            }

            // Check attendance for each date
            foreach ($datesToCheck as $checkDate) {
                $dateStart = $checkDate->copy()->startOfDay();
                $dateEnd = $checkDate->copy()->endOfDay();

                // Get attendance records for this date and enrollment
                $attendances = student_attendance::where('student_account_id', $studentId)
                    ->where('student_subject_enrolled_id', $enrollment->id)
                    ->whereBetween('timestamp', [$dateStart, $dateEnd])
                    ->get();

                // Determine if absent
                $hasAMAttendance = false;
                $hasPMAttendance = false;

                foreach ($attendances as $attendance) {
                    $attendanceTime = Carbon::parse($attendance->timestamp);
                    if ($attendanceTime->hour < 12) {
                        $hasAMAttendance = true;
                    } else {
                        $hasPMAttendance = true;
                    }
                }

                // Check if absent
                $isAbsent = false;
                if ($isFullDay) {
                    // Full day: need both AM and PM attendance
                    $isAbsent = !$hasAMAttendance || !$hasPMAttendance;
                } elseif ($isAM) {
                    // AM only: need AM attendance
                    $isAbsent = !$hasAMAttendance;
                } elseif ($isPM) {
                    // PM only: need PM attendance
                    $isAbsent = !$hasPMAttendance;
                }

                if ($isAbsent) {
                    $absences[] = [
                        'date' => $checkDate->format('F j, Y'),
                        'subject' => $subject->subject ?? 'N/A',
                        'subject_code' => $subject->subject_code ?? 'N/A',
                        'day_name' => $dayName,
                    ];
                }
            }
        }

        // Sort by date (most recent first) and limit
        usort($absences, function ($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        return array_slice($absences, 0, $limit);
    }

    private function calculateAttendanceRate($studentId)
    {
        // Get all enrolled subjects
        $enrollments = student_subject_enrolled::where('student_account_id', $studentId)
            ->where('status', 'active')
            ->with(['schedules'])
            ->get();

        $totalExpected = 0;
        $totalPresent = 0;

        $today = Carbon::now();
        $startDate = $today->copy()->subDays(30); // Last 30 days

        foreach ($enrollments as $enrollment) {
            $schedule = $enrollment->schedules;
            if (!$schedule || $schedule->status !== 'active') {
                continue;
            }

            $dayName = $schedule->day_name;
            $startTime = Carbon::parse($schedule->start_at);
            $endTime = Carbon::parse($schedule->end_at);
            $isAM = $startTime->hour < 12;
            $isPM = $endTime->hour >= 12;
            $isFullDay = $isAM && $isPM;

            // Count expected attendance days
            for ($date = $startDate->copy(); $date <= $today; $date->addDay()) {
                if ($date->format('l') === $dayName) {
                    if ($isFullDay) {
                        $totalExpected += 2; // AM and PM
                    } else {
                        $totalExpected += 1; // AM or PM only
                    }
                }
            }

            // Count actual attendance
            $attendances = student_attendance::where('student_account_id', $studentId)
                ->where('student_subject_enrolled_id', $enrollment->id)
                ->where('timestamp', '>=', $startDate)
                ->get();

            foreach ($attendances as $attendance) {
                $attendanceTime = Carbon::parse($attendance->timestamp);
                if ($isFullDay) {
                    // For full day, count both AM and PM
                    if ($attendanceTime->hour < 12) {
                        $totalPresent += 0.5; // AM
                    } else {
                        $totalPresent += 0.5; // PM
                    }
                } else {
                    $totalPresent += 1;
                }
            }
        }

        if ($totalExpected === 0) {
            return 0;
        }

        return round(($totalPresent / $totalExpected) * 100);
    }

    private function getScheduleForDate($studentId, $date)
    {
        $dayName = $date->format('l');
        
        $enrollments = student_subject_enrolled::where('student_account_id', $studentId)
            ->where('status', 'active')
            ->with(['schedules.teacher_subject_tag.subject'])
            ->get();

        $schedules = [];

        foreach ($enrollments as $enrollment) {
            $schedule = $enrollment->schedules;
            if (!$schedule || $schedule->status !== 'active' || $schedule->day_name !== $dayName) {
                continue;
            }

            $subject = $schedule->teacher_subject_tag->subject ?? null;
            if (!$subject) {
                continue;
            }

            $schedules[] = [
                'date' => $date->format('F j, Y'),
                'time' => Carbon::parse($schedule->start_at)->format('g:i A') . ' - ' . Carbon::parse($schedule->end_at)->format('g:i A'),
                'subject' => $subject->subject ?? 'N/A',
                'subject_code' => $subject->subject_code ?? 'N/A',
            ];
        }

        // Sort by time
        usort($schedules, function ($a, $b) {
            return strtotime($a['time']) - strtotime($b['time']);
        });

        return $schedules;
    }

    private function getTeacherClassList($teacherId)
    {
        $today = Carbon::now();
        $todayStart = $today->copy()->startOfDay();
        $todayEnd = $today->copy()->endOfDay();
        $dayName = $today->format('l'); // e.g., "Monday"

        // Get teacher's tagged subjects
        $taggedSubjects = teacher_subject_tag::where('teacher_id', $teacherId)
            ->where('status', 'active')
            ->with(['subject:id,subject_code,subject,year_level,section'])
            ->get();

        $classList = [];

        foreach ($taggedSubjects as $tag) {
            $subject = $tag->subject;
            if (!$subject) {
                continue;
            }

            // Get schedules for this subject that match today's day
            $scheduleIds = schedules::where('teacher_subject_tag_id', $tag->id)
                ->where('day_name', $dayName)
                ->where('status', 'active')
                ->pluck('id');

            if ($scheduleIds->isEmpty()) {
                continue;
            }

            // Get enrolled students for these schedules
            $enrollments = student_subject_enrolled::whereIn('schedules_id', $scheduleIds)
                ->where('status', 'active')
                ->with(['student:id,fullname,student_id'])
                ->get();

            foreach ($enrollments as $enrollment) {
                $student = $enrollment->student;
                if (!$student) {
                    continue;
                }

                // Get attendance for today
                $attendance = student_attendance::where('student_account_id', $student->id)
                    ->where('student_subject_enrolled_id', $enrollment->id)
                    ->whereBetween('timestamp', [$todayStart, $todayEnd])
                    ->orderBy('timestamp', 'asc')
                    ->first();

                // Determine status
                $status = 'Absent';
                $scanTime = '-';

                if ($attendance) {
                    $attendanceTime = Carbon::parse($attendance->timestamp);
                    $schedule = schedules::find($enrollment->schedules_id);
                    
                    if ($schedule) {
                        $scheduleStart = Carbon::parse($schedule->start_at);
                        $scheduleStartToday = $today->copy()->setTimeFromTimeString($schedule->start_at);
                        
                        // Check if late (more than 15 minutes after schedule start)
                        if ($attendanceTime->diffInMinutes($scheduleStartToday) > 15) {
                            $status = 'Late';
                        } else {
                            $status = 'Present';
                        }
                        
                        $scanTime = $attendanceTime->format('g:i A');
                    } else {
                        $status = 'Present';
                        $scanTime = $attendanceTime->format('g:i A');
                    }
                }

                $classList[] = [
                    'studentName' => $student->fullname,
                    'date' => $today->format('m/d/y'),
                    'status' => $status,
                    'scanTime' => $scanTime,
                    'subject' => $subject->subject_code . ' - ' . $subject->subject,
                ];
            }
        }

        // Sort by student name
        usort($classList, function ($a, $b) {
            return strcmp($a['studentName'], $b['studentName']);
        });

        return $classList;
    }

    private function getTeacherAttendanceSummary($teacherId)
    {
        $today = Carbon::now();
        $dayName = $today->format('l');

        // Get teacher's tagged subjects
        $taggedSubjects = teacher_subject_tag::where('teacher_id', $teacherId)
            ->where('status', 'active')
            ->with(['subject:id,subject_code,subject,year_level,section'])
            ->get();

        $summary = [];

        foreach ($taggedSubjects as $tag) {
            $subject = $tag->subject;
            if (!$subject) {
                continue;
            }

            // Get schedules for this subject that match today's day
            $scheduleIds = schedules::where('teacher_subject_tag_id', $tag->id)
                ->where('day_name', $dayName)
                ->where('status', 'active')
                ->pluck('id');

            if ($scheduleIds->isEmpty()) {
                continue;
            }

            // Get enrolled students
            $enrollments = student_subject_enrolled::whereIn('schedules_id', $scheduleIds)
                ->where('status', 'active')
                ->get();

            $totalStudents = $enrollments->count();
            $present = 0;
            $absent = 0;

            $todayStart = $today->copy()->startOfDay();
            $todayEnd = $today->copy()->endOfDay();

            foreach ($enrollments as $enrollment) {
                // Check if student has attendance for today
                $attendance = student_attendance::where('student_account_id', $enrollment->student_account_id)
                    ->where('student_subject_enrolled_id', $enrollment->id)
                    ->whereBetween('timestamp', [$todayStart, $todayEnd])
                    ->first();

                if ($attendance) {
                    $present++;
                } else {
                    $absent++;
                }
            }

            $attendanceRate = $totalStudents > 0 ? round(($present / $totalStudents) * 100) : 0;

            $summary[] = [
                'class' => $subject->year_level . ' - ' . $subject->section,
                'date' => $today->format('F j, Y'),
                'present' => $present,
                'absent' => $absent,
                'attendanceRate' => $attendanceRate,
            ];
        }

        return $summary;
    }
}

