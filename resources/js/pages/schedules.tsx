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
import { Head, useForm, usePage } from '@inertiajs/react';
import { CalendarPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';

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
}

export default function Schedules({ teachers }: SchedulesPageProps) {
    const { success: showSuccess, error: showError } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<{
        subject_code: string;
        subject: string;
    } | null>(null);

    const form = useForm({
        teacher_subject_tag_id: 0,
        day_name: '',
        start_at: '',
        end_at: '',
        status: 'active',
    });

    const handleAddSchedule = (tagId: number, subjectCode: string, subject: string) => {
        setSelectedTagId(tagId);
        setSelectedSubject({ subject_code: subjectCode, subject });
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
            </div>
        </AppLayout>
    );
}

