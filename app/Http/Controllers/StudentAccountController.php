<?php

namespace App\Http\Controllers;

use App\Models\student_account;
use App\Models\subject;
use App\Models\teacher_account;
use App\Models\teacher_subject_tag;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentAccountController extends Controller
{
    public function index(): Response
    {
        $students = student_account::query()
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

        $teachers = teacher_account::query()
            ->latest('id')
            ->get([
                'id',
                'fullname',
                'email',
                'status',
                'image',
            ])
            ->map(function ($teacher) {
                $teacher->image_url = $teacher->image
                    ? Storage::url($teacher->image)
                    : null;
                return $teacher;
            });

        $admins = User::query()
            ->latest('id')
            ->get([
                'id',
                'name',
                'email',
                'image',
            ])
            ->map(function ($admin) {
                $admin->image_url = $admin->image
                    ? Storage::url($admin->image)
                    : '/images/lyceum.png';
                return $admin;
            });

        $subjects = subject::query()
            ->where('status', 'active')
            ->orderBy('subject')
            ->get([
                'id',
                'subject_code',
                'subject',
            ]);

        return Inertia::render('users', [
            'students' => $students,
            'teachers' => $teachers,
            'admins' => $admins,
            'subjects' => $subjects,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $accountType = $request->input('account_type');

        switch ($accountType) {
            case 'student':
                $data = $request->validate([
                    'student_id' => ['required', 'string', 'max:50', 'unique:student_account,student_id'],
                    'fullname' => ['required', 'string', 'max:255'],
                    'year_level' => ['required', 'string', 'max:50'],
                    'section' => ['required', 'string', 'max:100'],
                    'password' => ['required', 'string', 'min:6'],
                    'status' => ['required', Rule::in(['active', 'inactive'])],
                    'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
                ]);

                $imagePath = null;
                if ($request->hasFile('image')) {
                    $imagePath = $request->file('image')->store('student_images', 'public');
                }

                student_account::create([
                    'student_id' => $data['student_id'],
                    'fullname' => $data['fullname'],
                    'year_level' => $data['year_level'],
                    'section' => $data['section'],
                    'password' => Hash::make($data['password']),
                    'status' => $data['status'],
                    'image' => $imagePath,
                ]);

                $message = 'Student account added successfully.';
                break;

            case 'teacher':
                $data = $request->validate([
                    'fullname' => ['required', 'string', 'max:255'],
                    'email' => ['required', 'email', 'max:255', 'unique:teacher_account,email'],
                    'password' => ['required', 'string', 'min:6'],
                    'status' => ['required', Rule::in(['active', 'inactive'])],
                    'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
                ]);

                $imagePath = null;
                if ($request->hasFile('image')) {
                    $imagePath = $request->file('image')->store('teacher_images', 'public');
                }

                teacher_account::create([
                    'fullname' => $data['fullname'],
                    'email' => $data['email'],
                    'password' => Hash::make($data['password']),
                    'status' => $data['status'],
                    'image' => $imagePath,
                ]);

                $message = 'Teacher account added successfully.';
                break;

            case 'admin':
                $data = $request->validate([
                    'name' => ['required', 'string', 'max:255'],
                    'email' => ['required', 'email', 'max:255', 'unique:users,email'],
                    'password' => ['required', 'string', 'min:8'],
                    'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
                ]);

                $imagePath = null;
                if ($request->hasFile('image')) {
                    $imagePath = $request->file('image')->store('admin_images', 'public');
                }

                User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => Hash::make($data['password']),
                    'image' => $imagePath,
                ]);

                $message = 'Admin account added successfully.';
                break;

            default:
                abort(422, 'Invalid account type.');
        }

        return redirect()
            ->route('users')
            ->with('success', $message);
    }

    public function updateStatus(Request $request, string $type, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        switch ($type) {
            case 'student':
                $account = student_account::findOrFail($id);
                $account->update(['status' => $validated['status']]);
                break;
            case 'teacher':
                $account = teacher_account::findOrFail($id);
                $account->update(['status' => $validated['status']]);
                break;
            default:
                abort(404, 'Invalid account type.');
        }

        return redirect()
            ->route('users')
            ->with('success', 'Status updated successfully.');
    }

    public function update(Request $request, string $type, int $id): RedirectResponse
    {
        switch ($type) {
            case 'student':
                $data = $request->validate([
                    'student_id' => ['required', 'string', 'max:50', Rule::unique('student_account', 'student_id')->ignore($id)],
                    'fullname' => ['required', 'string', 'max:255'],
                    'year_level' => ['required', 'string', 'max:50'],
                    'section' => ['required', 'string', 'max:100'],
                    'password' => ['nullable', 'string', 'min:6'],
                    'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
                ]);

                $account = student_account::findOrFail($id);
                $updateData = [
                    'student_id' => $data['student_id'],
                    'fullname' => $data['fullname'],
                    'year_level' => $data['year_level'],
                    'section' => $data['section'],
                ];

                if (!empty($data['password'])) {
                    $updateData['password'] = Hash::make($data['password']);
                }

                if ($request->hasFile('image')) {
                    if ($account->image) {
                        Storage::disk('public')->delete($account->image);
                    }
                    $updateData['image'] = $request->file('image')->store('student_images', 'public');
                }

                $account->update($updateData);
                $message = 'Student account updated successfully.';
                break;

            case 'teacher':
                $data = $request->validate([
                    'fullname' => ['required', 'string', 'max:255'],
                    'email' => ['required', 'email', 'max:255', Rule::unique('teacher_account', 'email')->ignore($id)],
                    'password' => ['nullable', 'string', 'min:6'],
                    'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
                ]);

                $account = teacher_account::findOrFail($id);
                $updateData = [
                    'fullname' => $data['fullname'],
                    'email' => $data['email'],
                ];

                if (!empty($data['password'])) {
                    $updateData['password'] = Hash::make($data['password']);
                }

                if ($request->hasFile('image')) {
                    if ($account->image) {
                        Storage::disk('public')->delete($account->image);
                    }
                    $updateData['image'] = $request->file('image')->store('teacher_images', 'public');
                }

                $account->update($updateData);
                $message = 'Teacher account updated successfully.';
                break;

            case 'admin':
                $data = $request->validate([
                    'name' => ['required', 'string', 'max:255'],
                    'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($id)],
                    'password' => ['nullable', 'string', 'min:8'],
                    'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
                ]);

                $account = User::findOrFail($id);
                $updateData = [
                    'name' => $data['name'],
                    'email' => $data['email'],
                ];

                if (!empty($data['password'])) {
                    $updateData['password'] = Hash::make($data['password']);
                }

                if ($request->hasFile('image')) {
                    if ($account->image) {
                        Storage::disk('public')->delete($account->image);
                    }
                    $updateData['image'] = $request->file('image')->store('admin_images', 'public');
                }

                $account->update($updateData);
                $message = 'Admin account updated successfully.';
                break;

            default:
                abort(404, 'Invalid account type.');
        }

        return redirect()
            ->route('users')
            ->with('success', $message);
    }

    public function destroy(string $type, int $id): RedirectResponse
    {
        switch ($type) {
            case 'student':
                $account = student_account::findOrFail($id);
                if ($account->image) {
                    Storage::disk('public')->delete($account->image);
                }
                $account->delete();
                $message = 'Student account deleted successfully.';
                break;

            case 'teacher':
                $account = teacher_account::findOrFail($id);
                if ($account->image) {
                    Storage::disk('public')->delete($account->image);
                }
                $account->delete();
                $message = 'Teacher account deleted successfully.';
                break;

            case 'admin':
                $account = User::findOrFail($id);
                if ($account->image) {
                    Storage::disk('public')->delete($account->image);
                }
                $account->delete();
                $message = 'Admin account deleted successfully.';
                break;

            default:
                abort(404, 'Invalid account type.');
        }

        return redirect()
            ->route('users')
            ->with('success', $message);
    }

    public function getTeacherSubjects(int $teacherId)
    {
        $teacher = teacher_account::findOrFail($teacherId);
        $taggedSubjects = teacher_subject_tag::where('teacher_id', $teacherId)
            ->where('status', 'active')
            ->pluck('subject_id')
            ->map(fn($id) => (int) $id)
            ->values()
            ->toArray();

        $subjects = subject::where('status', 'active')
            ->orderBy('subject')
            ->get(['id', 'subject_code', 'subject']);

        return response()->json([
            'teacher' => [
                'id' => $teacher->id,
                'fullname' => $teacher->fullname,
            ],
            'subjects' => $subjects,
            'taggedSubjects' => $taggedSubjects,
        ]);
    }

    public function tagSubjects(Request $request, int $teacherId): RedirectResponse
    {
        $validated = $request->validate([
            'subject_ids' => ['array'],
            'subject_ids.*' => ['integer', 'exists:subject,id'],
        ]);

        $selectedSubjectIds = $validated['subject_ids'] ?? [];

        // Get all existing active tags for this teacher
        $existingTags = teacher_subject_tag::where('teacher_id', $teacherId)
            ->where('status', 'active')
            ->get();

        // Mark unchecked subjects as inactive (remove from active tags)
        foreach ($existingTags as $tag) {
            if (!in_array($tag->subject_id, $selectedSubjectIds)) {
                $tag->update(['status' => 'inactive']);
            }
        }

        // Add or activate selected subjects
        foreach ($selectedSubjectIds as $subjectId) {
            teacher_subject_tag::updateOrCreate(
                [
                    'teacher_id' => $teacherId,
                    'subject_id' => $subjectId,
                ],
                [
                    'status' => 'active',
                ]
            );
        }

        return redirect()
            ->route('users')
            ->with('success', 'Subjects tagged successfully.');
    }
}

