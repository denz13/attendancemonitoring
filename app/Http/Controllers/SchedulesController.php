<?php

namespace App\Http\Controllers;

use App\Models\schedules;
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
                        return [
                            'id' => $tag->subject->id,
                            'subject_code' => $tag->subject->subject_code,
                            'subject' => $tag->subject->subject,
                            'year_level' => $tag->subject->year_level,
                            'section' => $tag->subject->section,
                            'tag_id' => $tag->id,
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

        return Inertia::render('schedules', [
            'teachers' => $teachers,
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
}

