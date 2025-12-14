<?php

namespace App\Http\Controllers;

use App\Models\schedules;
use App\Models\student_account;
use App\Models\student_attendance;
use App\Models\student_subject_enrolled;
use App\Models\teacher_account;
use App\Models\teacher_subject_tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SchedulesController extends Controller
{
    public function index(): Response
    {
        $teachers = teacher_account::query()
            ->where('status', 'active')
            ->latest('id')
            ->get(['id', 'fullname', 'email', 'image'])
            ->map(function ($teacher) {
                $teacher->image_url = $teacher->image
                    ? Storage::url($teacher->image)
                    : null;

                // Get tagged subjects for this teacher
                $taggedSubjects = teacher_subject_tag::where('teacher_id', $teacher->id)
                    ->where('status', 'active')
                    ->with('subject:id,subject_code,subject,year_level,section')
                    ->get()
                    ->filter(function ($tag) {
                        return $tag->subject !== null;
                    })
                    ->map(function ($tag) {
                        // Get enrolled student IDs for this tag
                        $scheduleIds = schedules::where('teacher_subject_tag_id', $tag->id)
                            ->where('status', 'active')
                            ->pluck('id');
                        
                        $enrolledStudentIds = student_subject_enrolled::whereIn('schedules_id', $scheduleIds)
                            ->where('status', 'active')
                            ->pluck('student_account_id')
                            ->unique()
                            ->toArray();
                        
                        return [
                            'id' => $tag->subject->id,
                            'subject_code' => $tag->subject->subject_code,
                            'subject' => $tag->subject->subject,
                            'year_level' => $tag->subject->year_level,
                            'section' => $tag->subject->section,
                            'tag_id' => $tag->id,
                            'enrolled_student_ids' => $enrolledStudentIds,
                        ];
                    });

                $teacher->tagged_subjects = $taggedSubjects;

                return $teacher;
            })
            ->filter(function ($teacher) {
                // Only show teachers who have at least one tagged subject
                return $teacher->tagged_subjects->count() > 0;
            })
            ->values();

        $students = student_account::query()
            ->where('status', 'active')
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
                    ? Storage::url($student->image)
                    : null;
                return $student;
            });

        return Inertia::render('schedules', [
            'teachers' => $teachers,
            'students' => $students,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'teacher_subject_tag_id' => [
                'required',
                'integer',
                'exists:teacher_subject_tag,id',
            ],
            'day_name' => [
                'required',
                'string',
                Rule::in([
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                ]),
            ],
            'start_at' => ['required', 'string'],
            'end_at' => ['required', 'string'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        schedules::create([
            'teacher_subject_tag_id' => $validated['teacher_subject_tag_id'],
            'day_name' => $validated['day_name'],
            'start_at' => $validated['start_at'],
            'end_at' => $validated['end_at'],
            'status' => $validated['status'],
        ]);

        return redirect()
            ->route('schedules')
            ->with('success', 'Schedule added successfully.');
    }

    public function enrollStudent(Request $request)
    {
        try {
            $validated = $request->validate([
                'teacher_subject_tag_id' => [
                    'required',
                    'integer',
                    Rule::exists('teacher_subject_tag', 'id'),
                ],
                'student_account_id' => [
                    'required',
                    'integer',
                    Rule::exists('student_account', 'id'),
                ],
            ]);

            // Verify student exists and is active
            $student = student_account::find($validated['student_account_id']);
            if (!$student) {
                return back()->withErrors([
                    'message' => 'Student not found.',
                ]);
            }
            
            if ($student->status !== 'active') {
                return back()->withErrors([
                    'message' => 'Student account is not active.',
                ]);
            }

            // Find the first active schedule for this teacher_subject_tag
            $schedule = schedules::where('teacher_subject_tag_id', $validated['teacher_subject_tag_id'])
                ->where('status', 'active')
                ->first();

            if (!$schedule) {
                return back()->withErrors([
                    'message' => 'No active schedule found for this subject. Please create a schedule first.',
                ]);
            }

            // Check if student is already enrolled in this schedule
            $existingEnrollment = student_subject_enrolled::where('student_account_id', $validated['student_account_id'])
                ->where('schedules_id', $schedule->id)
                ->first();

            if ($existingEnrollment) {
                return back()->withErrors([
                    'message' => 'Student is already enrolled in this schedule.',
                ]);
            }

            // Enroll the student
            student_subject_enrolled::create([
                'student_account_id' => $validated['student_account_id'],
                'schedules_id' => $schedule->id,
                'status' => 'active',
            ]);

            return back()->with('success', 'Student enrolled successfully.');
        } catch (\Exception $e) {
            return back()->withErrors([
                'message' => 'An error occurred while enrolling the student: ' . $e->getMessage(),
            ]);
        }
    }

    public function getEnrolledStudents(Request $request)
    {
        $validated = $request->validate([
            'teacher_subject_tag_id' => [
                'required',
                'integer',
                Rule::exists('teacher_subject_tag', 'id'),
            ],
        ]);

        // Get schedule IDs for this tag
        $scheduleIds = schedules::where('teacher_subject_tag_id', $validated['teacher_subject_tag_id'])
            ->where('status', 'active')
            ->pluck('id');

        // Get enrolled students (exclude soft-deleted)
        $enrolledStudentIds = student_subject_enrolled::whereIn('schedules_id', $scheduleIds)
            ->where('status', 'active')
            ->pluck('student_account_id')
            ->unique();

        $enrolledStudents = student_account::whereIn('id', $enrolledStudentIds)
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
                    ? Storage::url($student->image)
                    : null;
                return $student;
            });

        return response()->json(['students' => $enrolledStudents]);
    }

    public function removeStudent(Request $request)
    {
        // Accept data from both query string and request body
        $validated = $request->validate([
            'teacher_subject_tag_id' => [
                'required',
                'integer',
                Rule::exists('teacher_subject_tag', 'id'),
            ],
            'student_account_id' => [
                'required',
                'integer',
                Rule::exists('student_account', 'id'),
            ],
        ]);

        // Get schedule IDs for this tag
        $scheduleIds = schedules::where('teacher_subject_tag_id', $validated['teacher_subject_tag_id'])
            ->where('status', 'active')
            ->pluck('id');

        // Find and delete the enrollment
        $enrollment = student_subject_enrolled::whereIn('schedules_id', $scheduleIds)
            ->where('student_account_id', $validated['student_account_id'])
            ->where('status', 'active')
            ->first();

        if (!$enrollment) {
            return response()->json(['error' => 'Enrollment not found.'], 404);
        }

        // Use soft delete if SoftDeletes is enabled, otherwise hard delete
        if (method_exists($enrollment, 'delete')) {
            $enrollment->delete();
        } else {
            $enrollment->update(['status' => 'inactive']);
        }

        return back()->with('success', 'Student removed successfully.');
    }

    public function validateStudentEnrollment(Request $request)
    {
        $validated = $request->validate([
            'student_account_id' => [
                'required',
                'integer',
                Rule::exists('student_account', 'id'),
            ],
            'subject_id' => [
                'sometimes',
                'integer',
                Rule::exists('subject', 'id'),
            ],
        ]);

        $query = student_subject_enrolled::where('student_account_id', $validated['student_account_id'])
            ->where('status', 'active')
            ->whereHas('schedules', function ($q) {
                $q->where('status', 'active');
            })
            ->whereHas('schedules.teacher_subject_tag', function ($q) {
                $q->where('status', 'active');
            })
            ->with(['schedules' => function ($q) {
                $q->where('status', 'active');
            }, 'schedules.teacher_subject_tag' => function ($q) {
                $q->where('status', 'active');
            }, 'schedules.teacher_subject_tag.subject']);

        // If subject_id is provided, filter by that subject
        if (isset($validated['subject_id'])) {
            $query->whereHas('schedules.teacher_subject_tag', function ($q) use ($validated) {
                $q->where('subject_id', $validated['subject_id'])
                  ->where('status', 'active');
            });
        }

        $enrollments = $query->get();
        
        // Filter out enrollments with null schedules or teacher_subject_tags (due to whereHas constraints)
        $enrollments = $enrollments->filter(function ($enrollment) {
            return $enrollment->schedules 
                && $enrollment->schedules->teacher_subject_tag 
                && $enrollment->schedules->teacher_subject_tag->subject;
        });

        if ($enrollments->isEmpty()) {
            return response()->json([
                'enrolled' => false,
                'message' => 'Student is not enrolled in any subject.',
            ], 404);
        }

        // Get student info
        $student = student_account::find($validated['student_account_id']);

        return response()->json([
            'enrolled' => true,
            'student' => [
                'id' => $student->id,
                'student_id' => $student->student_id,
                'fullname' => $student->fullname,
                'year_level' => $student->year_level,
                'section' => $student->section,
            ],
            'enrollments' => $enrollments->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'schedule_id' => $enrollment->schedules_id,
                    'subject' => $enrollment->schedules->teacher_subject_tag->subject->subject ?? 'N/A',
                    'subject_code' => $enrollment->schedules->teacher_subject_tag->subject->subject_code ?? 'N/A',
                ];
            }),
        ]);
    }

    public function timeIn(Request $request)
    {
        $validated = $request->validate([
            'student_account_id' => [
                'required',
                'integer',
                Rule::exists('student_account', 'id'),
            ],
            'schedules_id' => [
                'required',
                'integer',
                Rule::exists('schedules', 'id'),
            ],
            'time_period' => [
                'required',
                'string',
                Rule::in(['AM', 'PM']),
            ],
            'workstate' => [
                'required',
                'integer',
                Rule::in([0, 1]), // 0 for time-in, 1 for time-out
            ],
        ]);

        // Verify student is enrolled
        $enrollment = student_subject_enrolled::where('student_account_id', $validated['student_account_id'])
            ->where('schedules_id', $validated['schedules_id'])
            ->where('status', 'active')
            ->first();

        if (!$enrollment) {
            return back()->withErrors([
                'message' => 'Student is not enrolled in this schedule.',
            ]);
        }

        // Record attendance
        student_attendance::create([
            'student_account_id' => $validated['student_account_id'],
            'student_subject_enrolled_id' => $enrollment->id,
            'workstate' => $validated['workstate'], // 0 for time-in, 1 for time-out
            'timestamp' => now(), // Current timestamp when button is clicked
            'status' => 'active',
        ]);
        
        $action = $validated['workstate'] === 0 ? 'Time-in' : 'Time-out';
        return back()->with('success', $action . ' recorded successfully for ' . $validated['time_period'] . '.');
    }
}

