import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { CalendarPlus, UserPlus, Search, Check, Users, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { type StudentAccount } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Schedules',
        href: '/schedules',
    },
];

interface TaggedSubject {
    id: number;
    subject_code: string;
    subject: string;
    year_level: string;
    section: string;
    tag_id: number;
    enrolled_student_ids?: number[];
}

interface TeacherWithSubjects {
    id: number;
    fullname: string;
    email: string;
    image?: string | null;
    image_url?: string | null;
    tagged_subjects: TaggedSubject[];
}

interface SchedulesPageProps {
    teachers: TeacherWithSubjects[];
    students?: StudentAccount[];
}

export default function Schedules({ teachers, students = [] }: SchedulesPageProps) {
    const { success: showSuccess, error: showError } = useToast();
    const page = usePage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [isEnrolledModalOpen, setIsEnrolledModalOpen] = useState(false);
    const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
    const [studentToRemove, setStudentToRemove] = useState<StudentAccount | null>(null);
    const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
    const [enrolledStudents, setEnrolledStudents] = useState<StudentAccount[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<{
        subject_code: string;
        subject: string;
        tag_id: number;
    } | null>(null);
    const [studentSearchQuery, setStudentSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<StudentAccount | null>(null);
    const [enrolledStudentIds, setEnrolledStudentIds] = useState<number[]>([]);

    const enrollForm = useForm({
        teacher_subject_tag_id: 0,
        student_account_id: 0,
    });

    const form = useForm({
        teacher_subject_tag_id: 0,
        day_name: '',
        start_at: '',
        end_at: '',
        status: 'active',
    });

    // Handle flash messages from backend
    useEffect(() => {
        const flash = (page.props as any).flash;
        if (flash?.success) {
            showSuccess('Success', flash.success);
        }
        if (flash?.error) {
            showError('Error', flash.error);
        }
    }, [page.props, showSuccess, showError]);

    const handleAddSchedule = (tagId: number, subjectCode: string, subject: string) => {
        setSelectedTagId(tagId);
        setSelectedSubject({ subject_code: subjectCode, subject, tag_id: tagId });
        form.setData({
            teacher_subject_tag_id: tagId,
            day_name: '',
            start_at: '',
            end_at: '',
            status: 'active',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/schedules', {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                setSelectedTagId(null);
                setSelectedSubject(null);
                form.reset();
                showSuccess('Success', 'Schedule added successfully.');
            },
            onError: () => {
                showError('Error', 'Failed to add schedule. Please check the form for errors.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Schedules" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between rounded-xl border border-sidebar-border/70 bg-card px-6 py-4 shadow-sm">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">
                            Teacher Schedules
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            View teachers and their assigned subjects for scheduling.
                        </p>
                    </div>
                </div>

                {teachers.length === 0 ? (
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-12 text-center shadow-sm">
                        <p className="text-muted-foreground">
                            No teachers with tagged subjects found.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {teachers.map((teacher) => (
                            <div
                                key={teacher.id}
                                className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm"
                            >
                                <div className="border-b px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="size-12">
                                            {teacher.image_url ? (
                                                <AvatarImage
                                                    src={teacher.image_url}
                                                    alt={teacher.fullname}
                                                />
                                            ) : null}
                                            <AvatarFallback>
                                                {teacher.fullname
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .toUpperCase()
                                                    .slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h2 className="text-base font-semibold text-foreground">
                                                {teacher.fullname}
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                {teacher.email}
                                            </p>
                                        </div>
                                        <Badge variant="default">
                                            {teacher.tagged_subjects.length}{' '}
                                            {teacher.tagged_subjects.length === 1
                                                ? 'Subject'
                                                : 'Subjects'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        {teacher.tagged_subjects.map((subject) => (
                                            <div
                                                key={subject.tag_id}
                                                className="rounded-lg border border-sidebar-border/60 bg-muted/30 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <div className="text-sm font-semibold text-foreground">
                                                            {subject.subject_code}
                                                        </div>
                                                        <div className="mt-1 text-sm text-muted-foreground">
                                                            {subject.subject}
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span>{subject.year_level}</span>
                                                            <span>•</span>
                                                            <span>{subject.section}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleAddSchedule(
                                                                    subject.tag_id,
                                                                    subject.subject_code,
                                                                    subject.subject,
                                                                )
                                                            }
                                                            className="flex-shrink-0"
                                                            title="Add Schedule"
                                                        >
                                                            <CalendarPlus className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={async () => {
                                                                setSelectedSubject({
                                                                    subject_code: subject.subject_code,
                                                                    subject: subject.subject,
                                                                    tag_id: subject.tag_id,
                                                                });
                                                                // Clear previous selections but don't reset form yet
                                                                setSelectedStudent(null);
                                                                setStudentSearchQuery('');
                                                                // Clear errors only
                                                                enrollForm.clearErrors();
                                                                
                                                                // Fetch current enrolled students for this subject
                                                                try {
                                                                    const response = await fetch(
                                                                        `/schedules/enrolled-students?teacher_subject_tag_id=${subject.tag_id}`,
                                                                        {
                                                                            headers: {
                                                                                'Accept': 'application/json',
                                                                                'X-Requested-With': 'XMLHttpRequest',
                                                                            },
                                                                        }
                                                                    );
                                                                    
                                                                    if (response.ok) {
                                                                        const data = await response.json();
                                                                        const enrolledIds = (data.students || []).map((s: StudentAccount) => s.id);
                                                                        setEnrolledStudentIds(enrolledIds);
                                                                    } else {
                                                                        setEnrolledStudentIds([]);
                                                                    }
                                                                } catch (error) {
                                                                    console.error('Error loading enrolled students:', error);
                                                                    setEnrolledStudentIds([]);
                                                                }
                                                                
                                                                setIsStudentModalOpen(true);
                                                            }}
                                                            className="flex-shrink-0"
                                                            title="Add Student"
                                                        >
                                                            <UserPlus className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={async () => {
                                                                setSelectedSubject({
                                                                    subject_code: subject.subject_code,
                                                                    subject: subject.subject,
                                                                    tag_id: subject.tag_id,
                                                                });
                                                                try {
                                                                    const response = await fetch(
                                                                        `/schedules/enrolled-students?teacher_subject_tag_id=${subject.tag_id}`,
                                                                        {
                                                                            headers: {
                                                                                'Accept': 'application/json',
                                                                                'X-Requested-With': 'XMLHttpRequest',
                                                                            },
                                                                        }
                                                                    );
                                                                    
                                                                    if (!response.ok) {
                                                                        throw new Error(`HTTP error! status: ${response.status}`);
                                                                    }
                                                                    
                                                                    const data = await response.json();
                                                                    setEnrolledStudents(data.students || []);
                                                                    setIsEnrolledModalOpen(true);
                                                                } catch (error) {
                                                                    console.error('Error loading enrolled students:', error);
                                                                    showError('Error', 'Failed to load enrolled students. Please try again.');
                                                                }
                                                            }}
                                                            className="flex-shrink-0"
                                                            title="View Enrolled Students"
                                                        >
                                                            <Users className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add Schedule</DialogTitle>
                            <DialogDescription>
                                Create a schedule for{' '}
                                {selectedSubject
                                    ? `${selectedSubject.subject_code} - ${selectedSubject.subject}`
                                    : 'this subject'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="day_name">Day</Label>
                                <select
                                    id="day_name"
                                    value={form.data.day_name}
                                    onChange={(event) =>
                                        form.setData('day_name', event.target.value)
                                    }
                                    required
                                    className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="">Select a day</option>
                                    {[
                                        'Monday',
                                        'Tuesday',
                                        'Wednesday',
                                        'Thursday',
                                        'Friday',
                                        'Saturday',
                                        'Sunday',
                                    ].map((day) => (
                                        <option key={day} value={day}>
                                            {day}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={form.errors.day_name} />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="start_at">Start Time</Label>
                                    <Input
                                        id="start_at"
                                        type="time"
                                        value={form.data.start_at}
                                        onChange={(event) =>
                                            form.setData('start_at', event.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={form.errors.start_at} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="end_at">End Time</Label>
                                    <Input
                                        id="end_at"
                                        type="time"
                                        value={form.data.end_at}
                                        onChange={(event) =>
                                            form.setData('end_at', event.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={form.errors.end_at} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={form.data.status}
                                    onChange={(event) =>
                                        form.setData('status', event.target.value)
                                    }
                                    className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <InputError message={form.errors.status} />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSelectedTagId(null);
                                        setSelectedSubject(null);
                                        form.reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="bg-[#18417f] hover:bg-[#113261]"
                                >
                                    {form.processing ? 'Saving…' : 'Save Schedule'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Add Student Modal */}
                <Dialog open={isStudentModalOpen} onOpenChange={setIsStudentModalOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Add Student</DialogTitle>
                            <DialogDescription>
                                Select a student to add to{' '}
                                {selectedSubject
                                    ? `${selectedSubject.subject_code} - ${selectedSubject.subject}`
                                    : 'this subject'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search students by name, ID, or class..."
                                    value={studentSearchQuery}
                                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Students List */}
                            <div className="max-h-96 space-y-2 overflow-y-auto">
                                {(() => {
                                    // Use local state for enrolled student IDs (updated when modal opens and after enrollment)
                                    const enrolledIds = enrolledStudentIds;
                                    
                                    // Filter out enrolled students and apply search filter
                                    const availableStudents = students
                                        .filter((student) => !enrolledIds.includes(student.id))
                                        .filter((student) =>
                                            student.fullname
                                                .toLowerCase()
                                                .includes(studentSearchQuery.toLowerCase()) ||
                                            student.student_id
                                                .toLowerCase()
                                                .includes(studentSearchQuery.toLowerCase()) ||
                                            `${student.year_level} ${student.section}`
                                                .toLowerCase()
                                                .includes(studentSearchQuery.toLowerCase())
                                        );
                                    
                                    if (availableStudents.length === 0) {
                                        return (
                                            <div className="py-8 text-center text-sm text-muted-foreground">
                                                {enrolledIds.length > 0 && students.length === enrolledIds.length
                                                    ? 'All students are already enrolled.'
                                                    : 'No students found matching your search.'}
                                            </div>
                                        );
                                    }
                                    
                                    return availableStudents.map((student: StudentAccount) => (
                                            <div
                                                key={student.id}
                                                onClick={() => setSelectedStudent(student)}
                                                className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                                                    selectedStudent?.id === student.id
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-sidebar-border/70 hover:bg-muted/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        {student.image_url ? (
                                                            <AvatarImage
                                                                src={student.image_url}
                                                                alt={student.fullname}
                                                            />
                                                        ) : null}
                                                        <AvatarFallback>
                                                            {student.fullname
                                                                .split(' ')
                                                                .map((n: string) => n[0])
                                                                .join('')
                                                                .toUpperCase()
                                                                .slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-foreground">
                                                            {student.fullname}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <span>{student.student_id}</span>
                                                            <span>•</span>
                                                            <span>
                                                                {student.year_level} - {student.section}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {selectedStudent?.id === student.id && (
                                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                                                            <Check className="h-3 w-3 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ));
                                })()}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 border-t pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsStudentModalOpen(false);
                                        setSelectedStudent(null);
                                        setStudentSearchQuery('');
                                        setSelectedSubject(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    disabled={!selectedStudent || enrollForm.processing}
                                    onClick={() => {
                                        if (selectedStudent && selectedSubject) {
                                            // Ensure we have valid IDs
                                            const teacherSubjectTagId = Number(selectedSubject.tag_id);
                                            const studentAccountId = Number(selectedStudent.id);
                                            
                                            // Validate IDs before submission
                                            if (!teacherSubjectTagId || !studentAccountId || teacherSubjectTagId === 0 || studentAccountId === 0) {
                                                showError('Error', 'Invalid student or subject selection. Please try again.');
                                                return;
                                            }
                                            
                                            // Create form data with correct IDs
                                            const formData = {
                                                teacher_subject_tag_id: teacherSubjectTagId,
                                                student_account_id: studentAccountId,
                                            };
                                            
                                            // Use router.post directly to ensure correct data is sent
                                            router.post('/schedules/enroll-student', formData, {
                                                preserveScroll: true,
                                                onSuccess: () => {
                                                    // Add the enrolled student ID to the local state
                                                    if (selectedStudent) {
                                                        setEnrolledStudentIds((prev) => [...prev, selectedStudent.id]);
                                                    }
                                                    
                                                    showSuccess(
                                                        'Success',
                                                        `Student ${selectedStudent.fullname} enrolled successfully.`,
                                                    );
                                                    setIsStudentModalOpen(false);
                                                    setSelectedStudent(null);
                                                    setStudentSearchQuery('');
                                                    setSelectedSubject(null);
                                                    enrollForm.reset();
                                                },
                                                onError: (errors) => {
                                                    // Handle validation errors
                                                    const errorMessages: string[] = [];
                                                    
                                                    // Check for field-specific validation errors
                                                    if (errors.teacher_subject_tag_id) {
                                                        errorMessages.push(
                                                            Array.isArray(errors.teacher_subject_tag_id)
                                                                ? errors.teacher_subject_tag_id[0]
                                                                : errors.teacher_subject_tag_id
                                                        );
                                                    }
                                                    if (errors.student_account_id) {
                                                        errorMessages.push(
                                                            Array.isArray(errors.student_account_id)
                                                                ? errors.student_account_id[0]
                                                                : errors.student_account_id
                                                        );
                                                    }
                                                    
                                                    // Check for general error message
                                                    if (errors.message) {
                                                        errorMessages.push(
                                                            Array.isArray(errors.message)
                                                                ? errors.message[0]
                                                                : errors.message
                                                        );
                                                    }
                                                    
                                                    // If no specific errors, show generic message
                                                    const errorMessage = errorMessages.length > 0
                                                        ? errorMessages.join('. ')
                                                        : 'Failed to enroll student. Please try again.';
                                                    
                                                    showError('Error', errorMessage);
                                                },
                                            });
                                        }
                                    }}
                                    className="bg-[#18417f] hover:bg-[#113261]"
                                >
                                    {enrollForm.processing ? 'Adding...' : 'Add Student'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Enrolled Students Modal */}
                <Dialog open={isEnrolledModalOpen} onOpenChange={setIsEnrolledModalOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Enrolled Students</DialogTitle>
                            <DialogDescription>
                                Students enrolled in{' '}
                                {selectedSubject
                                    ? `${selectedSubject.subject_code} - ${selectedSubject.subject}`
                                    : 'this subject'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            {enrolledStudents.length === 0 ? (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    No students enrolled yet.
                                </div>
                            ) : (
                                <div className="max-h-96 space-y-2 overflow-y-auto">
                                    {enrolledStudents.map((student) => (
                                        <div
                                            key={student.id}
                                            className="rounded-lg border border-sidebar-border/70 p-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    {student.image_url ? (
                                                        <AvatarImage
                                                            src={student.image_url}
                                                            alt={student.fullname}
                                                        />
                                                    ) : null}
                                                    <AvatarFallback>
                                                        {student.fullname
                                                            .split(' ')
                                                            .map((n: string) => n[0])
                                                            .join('')
                                                            .toUpperCase()
                                                            .slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground">
                                                        {student.fullname}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span>{student.student_id}</span>
                                                        <span>•</span>
                                                        <span>
                                                            {student.year_level} - {student.section}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setStudentToRemove(student);
                                                        setIsRemoveConfirmOpen(true);
                                                    }}
                                                    className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    title="Remove Student"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex justify-end border-t pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEnrolledModalOpen(false);
                                        setEnrolledStudents([]);
                                        setSelectedSubject(null);
                                    }}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Remove Student Confirmation Modal */}
                <Dialog open={isRemoveConfirmOpen} onOpenChange={setIsRemoveConfirmOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Remove Student</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to remove{' '}
                                <span className="font-semibold text-foreground">
                                    {studentToRemove?.fullname}
                                </span>{' '}
                                from{' '}
                                {selectedSubject
                                    ? `${selectedSubject.subject_code} - ${selectedSubject.subject}`
                                    : 'this subject'}?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                                <p className="text-sm text-destructive">
                                    This action cannot be undone. The student will be removed from this subject's enrollment list.
                                </p>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsRemoveConfirmOpen(false);
                                        setStudentToRemove(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => {
                                        if (!selectedSubject || !studentToRemove) return;
                                        
                                        router.delete('/schedules/remove-student', {
                                            data: {
                                                teacher_subject_tag_id: selectedSubject.tag_id,
                                                student_account_id: studentToRemove.id,
                                            },
                                            preserveScroll: true,
                                            onSuccess: () => {
                                                // Remove student from local state
                                                setEnrolledStudents((prev) => 
                                                    prev.filter((s) => s.id !== studentToRemove.id)
                                                );
                                                
                                                // Remove from enrolled IDs state
                                                setEnrolledStudentIds((prev) => 
                                                    prev.filter((id) => id !== studentToRemove.id)
                                                );
                                                
                                                setIsRemoveConfirmOpen(false);
                                                setStudentToRemove(null);
                                                showSuccess('Success', `${studentToRemove.fullname} has been removed from this subject.`);
                                            },
                                            onError: (errors) => {
                                                console.error('Error removing student:', errors);
                                                const errorMessage = errors.message || 'Failed to remove student. Please try again.';
                                                showError('Error', errorMessage);
                                            },
                                        });
                                    }}
                                >
                                    Remove Student
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

