<?php

namespace App\Http\Controllers;

use App\Models\schedules;
use App\Models\student_account;
use App\Models\student_attendance;
use App\Models\student_subject_enrolled;
use App\Models\subject;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    public function index(): Response
    {
        // Get attendance by subject
        $attendanceBySubject = $this->getAttendanceBySubject();
        
        // Get most absent students
        $mostAbsentStudents = $this->getMostAbsentStudents();
        
        // Get punctuality trend
        $punctualityTrend = $this->getPunctualityTrend();
        
        return Inertia::render('reports', [
            'attendanceBySubject' => $attendanceBySubject,
            'mostAbsentStudents' => $mostAbsentStudents,
            'punctualityTrend' => $punctualityTrend,
        ]);
    }

    private function getAttendanceBySubject()
    {
        // Get all active subjects
        $subjects = subject::where('status', 'active')->get();
        $attendanceData = [];

        $today = Carbon::now();
        $startDate = $today->copy()->subDays(30); // Last 30 days

        foreach ($subjects as $subject) {
            // Get all enrollments for this subject
            $scheduleIds = schedules::whereHas('teacher_subject_tag', function ($query) use ($subject) {
                $query->where('subject_id', $subject->id)
                    ->where('status', 'active');
            })
            ->where('status', 'active')
            ->pluck('id');

            if ($scheduleIds->isEmpty()) {
                continue;
            }

            $enrollments = student_subject_enrolled::whereIn('schedules_id', $scheduleIds)
                ->where('status', 'active')
                ->get();

            if ($enrollments->isEmpty()) {
                continue;
            }

            // Calculate attendance rate for this subject
            $totalExpected = 0;
            $totalPresent = 0;

            foreach ($enrollments as $enrollment) {
                $schedule = schedules::find($enrollment->schedules_id);
                if (!$schedule) {
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
                $attendances = student_attendance::where('student_account_id', $enrollment->student_account_id)
                    ->where('student_subject_enrolled_id', $enrollment->id)
                    ->where('timestamp', '>=', $startDate)
                    ->get();

                foreach ($attendances as $attendance) {
                    $attendanceTime = Carbon::parse($attendance->timestamp);
                    if ($isFullDay) {
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

            $attendanceRate = $totalExpected > 0 ? round(($totalPresent / $totalExpected) * 100) : 0;

            $attendanceData[] = [
                'subject' => $subject->subject,
                'attendance' => $attendanceRate,
            ];
        }

        // Sort by attendance rate (descending)
        usort($attendanceData, function ($a, $b) {
            return $b['attendance'] - $a['attendance'];
        });

        return $attendanceData;
    }

    private function getMostAbsentStudents($limit = 3)
    {
        $today = Carbon::now();
        $startDate = $today->copy()->subDays(30); // Last 30 days

        // Get all students
        $students = student_account::where('status', 'active')->get();
        $studentAbsences = [];

        foreach ($students as $student) {
            // Get all enrollments
            $enrollments = student_subject_enrolled::where('student_account_id', $student->id)
                ->where('status', 'active')
                ->with(['schedules'])
                ->get();

            $totalAbsentDays = 0;

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

                // Get all dates for this day in the past 30 days
                for ($date = $startDate->copy(); $date <= $today; $date->addDay()) {
                    if ($date->format('l') === $dayName) {
                        $dateStart = $date->copy()->startOfDay();
                        $dateEnd = $date->copy()->endOfDay();

                        // Get attendance records for this date
                        $attendances = student_attendance::where('student_account_id', $student->id)
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

                        $isAbsent = false;
                        if ($isFullDay) {
                            $isAbsent = !$hasAMAttendance || !$hasPMAttendance;
                        } elseif ($isAM) {
                            $isAbsent = !$hasAMAttendance;
                        } elseif ($isPM) {
                            $isAbsent = !$hasPMAttendance;
                        }

                        if ($isAbsent) {
                            $totalAbsentDays++;
                        }
                    }
                }
            }

            if ($totalAbsentDays > 0) {
                $studentAbsences[] = [
                    'name' => $student->fullname,
                    'days' => $totalAbsentDays,
                ];
            }
        }

        // Sort by days absent (descending) and limit
        usort($studentAbsences, function ($a, $b) {
            return $b['days'] - $a['days'];
        });

        return array_slice($studentAbsences, 0, $limit);
    }

    private function getPunctualityTrend()
    {
        $today = Carbon::now();
        $months = [];
        
        // Get last 5 months
        for ($i = 4; $i >= 0; $i--) {
            $month = $today->copy()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();

            // Get all attendance records for this month
            $attendances = student_attendance::whereBetween('timestamp', [$monthStart, $monthEnd])
                ->get();

            if ($attendances->isEmpty()) {
                $months[] = [
                    'month' => $month->format('M'),
                    'rate' => 0,
                ];
                continue;
            }

            // Calculate punctuality (on-time attendance)
            $onTimeCount = 0;
            $totalCount = 0;

            foreach ($attendances as $attendance) {
                $enrollment = student_subject_enrolled::find($attendance->student_subject_enrolled_id);
                if (!$enrollment) {
                    continue;
                }

                $schedule = schedules::find($enrollment->schedules_id);
                if (!$schedule) {
                    continue;
                }

                $attendanceTime = Carbon::parse($attendance->timestamp);
                $scheduleStart = $attendanceTime->copy()->setTimeFromTimeString($schedule->start_at);

                // Check if on time (within 15 minutes of schedule start)
                $minutesLate = $attendanceTime->diffInMinutes($scheduleStart);
                if ($minutesLate <= 15) {
                    $onTimeCount++;
                }
                $totalCount++;
            }

            $punctualityRate = $totalCount > 0 ? round(($onTimeCount / $totalCount) * 100) : 0;

            $months[] = [
                'month' => $month->format('M'),
                'rate' => $punctualityRate,
            ];
        }

        return $months;
    }
}
