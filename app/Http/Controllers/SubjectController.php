<?php

namespace App\Http\Controllers;

use App\Models\subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    public function index(): Response
    {
        $subjects = subject::query()
            ->latest('id')
            ->get([
                'id',
                'subject_code',
                'subject',
                'year_level',
                'section',
                'status',
            ]);

        return Inertia::render('subject', [
            'subjects' => $subjects,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject_code' => ['required', 'string', 'max:50', 'unique:subject,subject_code'],
            'subject' => ['required', 'string', 'max:255'],
            'year_level' => ['required', 'string', 'max:50'],
            'section' => ['required', 'string', 'max:100'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        subject::create([
            'subject_code' => $validated['subject_code'],
            'subject' => $validated['subject'],
            'year_level' => $validated['year_level'],
            'section' => $validated['section'],
            'status' => $validated['status'],
        ]);

        return redirect()
            ->route('subject')
            ->with('success', 'Subject added successfully.');
    }
}

