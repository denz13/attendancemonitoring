import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type Subject } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Subject',
        href: '/subject',
    },
];

interface SubjectPageProps {
    subjects: Subject[];
}

export default function Subject({ subjects }: SubjectPageProps) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const form = useForm({
        subject_code: '',
        subject: '',
        year_level: '1st Year',
        section: '',
        status: 'active',
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/subject', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('subject_code', 'subject', 'section');
                setIsModalOpen(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subject" />
            <div className="flex flex-col gap-6 p-4">
                {props.flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
                        {props.flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between rounded-xl border border-sidebar-border/70 bg-card px-6 py-4 shadow-sm">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">
                            Subject Management
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage course subjects and curriculum for Lyceum.
                        </p>
                    </div>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#18417f] hover:bg-[#113261]">
                                Add new subject
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Add Subject</DialogTitle>
                                <DialogDescription>
                                    Create a new course subject for the curriculum.
                                </DialogDescription>
                            </DialogHeader>
                            <form
                                onSubmit={handleSubmit}
                                className="grid gap-4 md:grid-cols-2"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="subject_code">Subject Code</Label>
                                    <Input
                                        id="subject_code"
                                        value={form.data.subject_code}
                                        onChange={(event) =>
                                            form.setData(
                                                'subject_code',
                                                event.target.value,
                                            )
                                        }
                                        required
                                        placeholder="e.g., CS101"
                                    />
                                    <InputError message={form.errors.subject_code} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="subject">Subject Name</Label>
                                    <Input
                                        id="subject"
                                        value={form.data.subject}
                                        onChange={(event) =>
                                            form.setData('subject', event.target.value)
                                        }
                                        required
                                        placeholder="e.g., Introduction to Computer Science"
                                    />
                                    <InputError message={form.errors.subject} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="year_level">Year Level</Label>
                                    <select
                                        id="year_level"
                                        value={form.data.year_level}
                                        onChange={(event) =>
                                            form.setData(
                                                'year_level',
                                                event.target.value,
                                            )
                                        }
                                        className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(
                                            (year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <InputError message={form.errors.year_level} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="section">Section</Label>
                                    <Input
                                        id="section"
                                        value={form.data.section}
                                        onChange={(event) =>
                                            form.setData('section', event.target.value)
                                        }
                                        required
                                        placeholder="e.g., A, B, C"
                                    />
                                    <InputError message={form.errors.section} />
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
                                <div className="md:col-span-2">
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                        className="w-full md:w-auto"
                                    >
                                        {form.processing ? 'Saving...' : 'Add subject'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                Subjects
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {subjects.length} subject(s) in the curriculum
                            </p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Subject Code
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Subject Name
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Year Level
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Section
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-card text-foreground">
                                {subjects.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-8 text-center text-muted-foreground"
                                        >
                                            No subjects yet. Add the first subject above.
                                        </td>
                                    </tr>
                                )}
                                {subjects.map((subject) => (
                                    <tr key={subject.id}>
                                        <td className="px-6 py-4 font-medium">
                                            {subject.subject_code}
                                        </td>
                                        <td className="px-6 py-4">{subject.subject}</td>
                                        <td className="px-6 py-4">
                                            {subject.year_level}
                                        </td>
                                        <td className="px-6 py-4">{subject.section}</td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant={
                                                    subject.status === 'active'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {subject.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
