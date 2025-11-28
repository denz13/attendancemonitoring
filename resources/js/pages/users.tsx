import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import {
    type AdminAccount,
    type BreadcrumbItem,
    type StudentAccount,
    type SubjectOption,
    type TeacherAccount,
} from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Users',
        href: '/users',
    },
];

interface UsersPageProps {
    students: StudentAccount[];
    teachers: TeacherAccount[];
    admins: AdminAccount[];
    subjects: SubjectOption[];
}

type AccountType = 'student' | 'teacher' | 'admin';

export default function Users({
    students,
    teachers,
    admins,
    subjects,
}: UsersPageProps) {
    const { props } = usePage<{ flash?: { success?: string; error?: string; warning?: string } }>();
    const { success: showSuccess, error: showError, warning: showWarning } = useToast();
    const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeType, setActiveType] = useState<AccountType>('student');

    useEffect(() => {
        if (props.flash?.success) {
            showSuccess('Success', props.flash.success);
        }
        if (props.flash?.error) {
            showError('Error', props.flash.error);
        }
        if (props.flash?.warning) {
            showWarning('Warning', props.flash.warning);
        }
    }, [props.flash, showSuccess, showError, showWarning]);
    const [editingAccount, setEditingAccount] = useState<{
        type: AccountType;
        id: number;
        data: StudentAccount | TeacherAccount | AdminAccount;
    } | null>(null);
    const form = useForm({
        account_type: 'student' as AccountType,
        student_id: '',
        fullname: '',
        name: '',
        email: '',
        year_level: '1st Year',
        section: '',
        password: '',
        status: 'active',
        subject_id: '',
        image: null as File | null,
    });

    const resetFormForType = (type: AccountType) => {
        form.setData({
            account_type: type,
            student_id: '',
            fullname: '',
            name: '',
            email: '',
            year_level: '1st Year',
            section: '',
            password: '',
            status: 'active',
            subject_id: '',
            image: null,
        });
        form.clearErrors();
    };

    const handleTypeSelection = (type: AccountType) => {
        setActiveType(type);
        resetFormForType(type);
        setIsSelectModalOpen(false);
        setIsFormModalOpen(true);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.setData('account_type', activeType);
        form.post('/users', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                resetFormForType('student');
                setActiveType('student');
                setIsFormModalOpen(false);
                showSuccess(
                    'Account Created',
                    `${activeType === 'student' ? 'Student' : activeType === 'teacher' ? 'Teacher' : 'Admin'} account has been created successfully.`,
                );
            },
            onError: () => {
                showError('Error', 'Failed to create account. Please check the form for errors.');
            },
        });
    };

    const typeContent = {
        student: {
            title: 'Add Student Account',
            description:
                'Capture new Lyceum student credentials for attendance tracking.',
        },
        teacher: {
            title: 'Add Teacher Account',
            description: 'Provide faculty credentials and activation status.',
        },
        admin: {
            title: 'Add Admin Account',
            description: 'Create a system administrator with email access.',
        },
    };

    const typeOptions: { type: AccountType; title: string; blurb: string }[] = [
        {
            type: 'student',
            title: 'Student',
            blurb: 'Year level, section, and attendance credentials.',
        },
        {
            type: 'teacher',
            title: 'Teacher',
            blurb: 'Faculty account with email-based login.',
        },
        {
            type: 'admin',
            title: 'Admin',
            blurb: 'Core system administrator with dashboard access.',
        },
    ];

    const handleFormModalChange = (open: boolean) => {
        setIsFormModalOpen(open);
        if (!open) {
            resetFormForType('student');
            setActiveType('student');
        }
    };

    const editForm = useForm({
        student_id: '',
        fullname: '',
        name: '',
        email: '',
        year_level: '1st Year',
        section: '',
        password: '',
        subject_id: '',
        image: null as File | null,
    });

    const handleEdit = (
        type: AccountType,
        account: StudentAccount | TeacherAccount | AdminAccount,
    ) => {
        setEditingAccount({ type, id: account.id, data: account });
        if (type === 'student') {
            const student = account as StudentAccount;
            editForm.setData({
                student_id: student.student_id,
                fullname: student.fullname,
                year_level: student.year_level,
                section: student.section,
                password: '',
                name: '',
                email: '',
                subject_id: '',
                image: null,
            });
        } else if (type === 'teacher') {
            const teacher = account as TeacherAccount;
            editForm.setData({
                fullname: teacher.fullname,
                email: teacher.email,
                subject_id: teacher.subject_id?.toString() || '',
                password: '',
                name: '',
                student_id: '',
                year_level: '1st Year',
                section: '',
                image: null,
            });
        } else {
            const admin = account as AdminAccount;
            editForm.setData({
                name: admin.name,
                email: admin.email,
                password: '',
                fullname: '',
                student_id: '',
                year_level: '1st Year',
                section: '',
                subject_id: '',
                image: null,
            });
        }
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editingAccount) return;

        editForm.put(`/users/${editingAccount.type}/${editingAccount.id}`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingAccount(null);
                editForm.reset();
                showSuccess(
                    'Account Updated',
                    `${editingAccount.type === 'student' ? 'Student' : editingAccount.type === 'teacher' ? 'Teacher' : 'Admin'} account has been updated successfully.`,
                );
            },
            onError: () => {
                showError('Error', 'Failed to update account. Please check the form for errors.');
            },
        });
    };

    const handleToggleStatus = (
        type: AccountType,
        id: number,
        currentStatus: string,
    ) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        router.put(
            `/users/${type}/${id}/status`,
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    showSuccess(
                        'Status Updated',
                        `Account status has been changed to ${newStatus}.`,
                    );
                },
                onError: () => {
                    showError('Error', 'Failed to update status. Please try again.');
                },
            },
        );
    };

    const handleDelete = (type: AccountType, id: number) => {
        if (confirm('Are you sure you want to delete this account?')) {
            router.delete(`/users/${type}/${id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    showSuccess(
                        'Account Deleted',
                        `${type === 'student' ? 'Student' : type === 'teacher' ? 'Teacher' : 'Admin'} account has been deleted successfully.`,
                    );
                },
                onError: () => {
                    showError('Error', 'Failed to delete account. Please try again.');
                },
            });
        }
    };

    const renderFormFields = () => {
        if (activeType === 'student') {
            return (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="student_id">Student ID</Label>
                        <Input
                            id="student_id"
                            value={form.data.student_id}
                            onChange={(event) =>
                                form.setData('student_id', event.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.student_id} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="fullname">Full name</Label>
                        <Input
                            id="fullname"
                            value={form.data.fullname}
                            onChange={(event) =>
                                form.setData('fullname', event.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.fullname} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="year_level">Year level</Label>
                        <select
                            id="year_level"
                            value={form.data.year_level}
                            onChange={(event) =>
                                form.setData('year_level', event.target.value)
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
                        />
                        <InputError message={form.errors.section} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.password} />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="student_image">Profile Image (Optional)</Label>
                        <Input
                            id="student_image"
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                                const file = event.target.files?.[0] || null;
                                form.setData('image', file);
                            }}
                        />
                        <InputError message={form.errors.image} />
                        {form.data.image && (
                            <p className="text-xs text-muted-foreground">
                                Selected: {form.data.image.name}
                            </p>
                        )}
                    </div>
                </>
            );
        }

        if (activeType === 'teacher') {
            return (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="teacher_fullname">Full name</Label>
                        <Input
                            id="teacher_fullname"
                            value={form.data.fullname}
                            onChange={(event) =>
                                form.setData('fullname', event.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.fullname} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="teacher_email">Email</Label>
                        <Input
                            id="teacher_email"
                            type="email"
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData('email', event.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.email} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="teacher_subject">Subject</Label>
                        <select
                            id="teacher_subject"
                            value={form.data.subject_id}
                            onChange={(event) =>
                                form.setData('subject_id', event.target.value)
                            }
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            required
                        >
                            <option value="">Select a subject</option>
                            {subjects.map((subject) => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.subject_code} - {subject.subject}
                                </option>
                            ))}
                        </select>
                        <InputError message={form.errors.subject_id} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="teacher_password">Password</Label>
                        <Input
                            id="teacher_password"
                            type="password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.password} />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="teacher_image">Profile Image (Optional)</Label>
                        <Input
                            id="teacher_image"
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                                const file = event.target.files?.[0] || null;
                                form.setData('image', file);
                            }}
                        />
                        <InputError message={form.errors.image} />
                        {form.data.image && (
                            <p className="text-xs text-muted-foreground">
                                Selected: {form.data.image.name}
                            </p>
                        )}
                    </div>
                </>
            );
        }

        return (
            <>
                <div className="grid gap-2">
                    <Label htmlFor="admin_name">Full name</Label>
                    <Input
                        id="admin_name"
                        value={form.data.name}
                        onChange={(event) =>
                            form.setData('name', event.target.value)
                        }
                        required
                    />
                    <InputError message={form.errors.name} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="admin_email">Email</Label>
                    <Input
                        id="admin_email"
                        type="email"
                        value={form.data.email}
                        onChange={(event) =>
                            form.setData('email', event.target.value)
                        }
                        required
                    />
                    <InputError message={form.errors.email} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="admin_password">Password</Label>
                    <Input
                        id="admin_password"
                        type="password"
                        value={form.data.password}
                        onChange={(event) =>
                            form.setData('password', event.target.value)
                        }
                        required
                    />
                    <InputError message={form.errors.password} />
                </div>
                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="admin_image">Profile Image (Optional)</Label>
                    <Input
                        id="admin_image"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                            const file = event.target.files?.[0] || null;
                            form.setData('image', file);
                        }}
                    />
                    <InputError message={form.errors.image} />
                    {form.data.image && (
                        <p className="text-xs text-muted-foreground">
                            Selected: {form.data.image.name}
                        </p>
                    )}
                </div>
            </>
        );
    };

    const renderEditFields = () => {
        if (!editingAccount) return null;

        if (editingAccount.type === 'student') {
            return (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="edit_student_id">Student ID</Label>
                        <Input
                            id="edit_student_id"
                            value={editForm.data.student_id}
                            onChange={(event) =>
                                editForm.setData('student_id', event.target.value)
                            }
                            required
                        />
                        <InputError message={editForm.errors.student_id} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit_fullname">Full name</Label>
                        <Input
                            id="edit_fullname"
                            value={editForm.data.fullname}
                            onChange={(event) =>
                                editForm.setData('fullname', event.target.value)
                            }
                            required
                        />
                        <InputError message={editForm.errors.fullname} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit_year_level">Year level</Label>
                        <select
                            id="edit_year_level"
                            value={editForm.data.year_level}
                            onChange={(event) =>
                                editForm.setData('year_level', event.target.value)
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
                        <InputError message={editForm.errors.year_level} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit_section">Section</Label>
                        <Input
                            id="edit_section"
                            value={editForm.data.section}
                            onChange={(event) =>
                                editForm.setData('section', event.target.value)
                            }
                            required
                        />
                        <InputError message={editForm.errors.section} />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="edit_password">Password (Leave blank to keep current)</Label>
                        <Input
                            id="edit_password"
                            type="password"
                            value={editForm.data.password}
                            onChange={(event) =>
                                editForm.setData('password', event.target.value)
                            }
                        />
                        <InputError message={editForm.errors.password} />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="edit_student_image">Profile Image (Optional)</Label>
                        <Input
                            id="edit_student_image"
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                                const file = event.target.files?.[0] || null;
                                editForm.setData('image', file);
                            }}
                        />
                        <InputError message={editForm.errors.image} />
                        {editForm.data.image && (
                            <p className="text-xs text-muted-foreground">
                                Selected: {editForm.data.image.name}
                            </p>
                        )}
                    </div>
                </>
            );
        }

        if (editingAccount.type === 'teacher') {
            return (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="edit_teacher_fullname">Full name</Label>
                        <Input
                            id="edit_teacher_fullname"
                            value={editForm.data.fullname}
                            onChange={(event) =>
                                editForm.setData('fullname', event.target.value)
                            }
                            required
                        />
                        <InputError message={editForm.errors.fullname} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit_teacher_email">Email</Label>
                        <Input
                            id="edit_teacher_email"
                            type="email"
                            value={editForm.data.email}
                            onChange={(event) =>
                                editForm.setData('email', event.target.value)
                            }
                            required
                        />
                        <InputError message={editForm.errors.email} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit_teacher_subject">Subject</Label>
                        <select
                            id="edit_teacher_subject"
                            value={editForm.data.subject_id}
                            onChange={(event) =>
                                editForm.setData('subject_id', event.target.value)
                            }
                            required
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="">Select a subject</option>
                            {subjects.map((subject) => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.subject_code} - {subject.subject}
                                </option>
                            ))}
                        </select>
                        <InputError message={editForm.errors.subject_id} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit_teacher_password">Password (Leave blank to keep current)</Label>
                        <Input
                            id="edit_teacher_password"
                            type="password"
                            value={editForm.data.password}
                            onChange={(event) =>
                                editForm.setData('password', event.target.value)
                            }
                        />
                        <InputError message={editForm.errors.password} />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="edit_teacher_image">Profile Image (Optional)</Label>
                        <Input
                            id="edit_teacher_image"
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                                const file = event.target.files?.[0] || null;
                                editForm.setData('image', file);
                            }}
                        />
                        <InputError message={editForm.errors.image} />
                        {editForm.data.image && (
                            <p className="text-xs text-muted-foreground">
                                Selected: {editForm.data.image.name}
                            </p>
                        )}
                    </div>
                </>
            );
        }

        return (
            <>
                <div className="grid gap-2">
                    <Label htmlFor="edit_admin_name">Full name</Label>
                    <Input
                        id="edit_admin_name"
                        value={editForm.data.name}
                        onChange={(event) =>
                            editForm.setData('name', event.target.value)
                        }
                        required
                    />
                    <InputError message={editForm.errors.name} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="edit_admin_email">Email</Label>
                    <Input
                        id="edit_admin_email"
                        type="email"
                        value={editForm.data.email}
                        onChange={(event) =>
                            editForm.setData('email', event.target.value)
                        }
                        required
                    />
                    <InputError message={editForm.errors.email} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="edit_admin_password">Password (Leave blank to keep current)</Label>
                    <Input
                        id="edit_admin_password"
                        type="password"
                        value={editForm.data.password}
                        onChange={(event) =>
                            editForm.setData('password', event.target.value)
                        }
                    />
                    <InputError message={editForm.errors.password} />
                </div>
                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="edit_admin_image">Profile Image (Optional)</Label>
                    <Input
                        id="edit_admin_image"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                            const file = event.target.files?.[0] || null;
                            editForm.setData('image', file);
                        }}
                    />
                    <InputError message={editForm.errors.image} />
                    {editForm.data.image && (
                        <p className="text-xs text-muted-foreground">
                            Selected: {editForm.data.image.name}
                        </p>
                    )}
                </div>
            </>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between rounded-xl border border-sidebar-border/70 bg-card px-6 py-4 shadow-sm">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">
                            Accounts directory
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Maintain Lyceum users across students, teachers, and admins.
                        </p>
                    </div>
                    <Button
                        className="bg-[#18417f] hover:bg-[#113261]"
                        onClick={() => setIsSelectModalOpen(true)}
                    >
                        Add new user
                    </Button>
                </div>

                <Dialog open={isSelectModalOpen} onOpenChange={setIsSelectModalOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Select account type</DialogTitle>
                            <DialogDescription>
                                Choose which kind of user you need to create.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 md:grid-cols-3">
                            {typeOptions.map((option) => (
                                <button
                                    type="button"
                                    key={option.type}
                                    onClick={() => handleTypeSelection(option.type)}
                                    className="rounded-xl border border-sidebar-border/60 bg-card p-4 text-left shadow-sm transition hover:border-[#18417f] hover:shadow-md"
                                >
                                    <div className="text-base font-semibold text-foreground">
                                        {option.title}
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {option.blurb}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isFormModalOpen} onOpenChange={handleFormModalChange}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>{typeContent[activeType].title}</DialogTitle>
                            <DialogDescription>
                                {typeContent[activeType].description}
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            {renderFormFields()}
                            <div className="md:col-span-2">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full md:w-auto"
                                >
                                    {form.processing ? 'Saving…' : 'Save account'}
                                </Button>
                    </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>
                                Edit {editingAccount?.type === 'student' ? 'Student' : editingAccount?.type === 'teacher' ? 'Teacher' : 'Admin'} Account
                            </DialogTitle>
                            <DialogDescription>
                                Update the account information below.
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            onSubmit={handleEditSubmit}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            {renderEditFields()}
                            <div className="md:col-span-2">
                                <Button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="w-full md:w-auto"
                                >
                                    {editForm.processing ? 'Updating…' : 'Update account'}
                                </Button>
                </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                Student Accounts
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {students.length} record(s) synced from the database
                            </p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Image
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Student ID
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Full name
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Year & Section
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-card text-foreground">
                                {students.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-8 text-center text-muted-foreground"
                                        >
                                            No students yet. Add the first record above.
                                        </td>
                                    </tr>
                                )}
                                {students.map((student) => (
                                    <tr key={student.id}>
                                        <td className="px-6 py-4">
                                            <Avatar className="size-10">
                                                {student.image_url ? (
                                                    <AvatarImage
                                                        src={student.image_url}
                                                        alt={student.fullname}
                                                    />
                                                ) : null}
                                                <AvatarFallback>
                                                    {student.fullname
                                                        .split(' ')
                                                        .map((n) => n[0])
                                                        .join('')
                                                        .toUpperCase()
                                                        .slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {student.student_id}
                                        </td>
                                        <td className="px-6 py-4">{student.fullname}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span>
                                                    {student.year_level} • {student.section}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleToggleStatus(
                                                        'student',
                                                        student.id,
                                                        student.status,
                                                    )
                                                }
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#18417f] focus:ring-offset-2 ${
                                                    student.status === 'active'
                                                        ? 'bg-[#18417f]'
                                                        : 'bg-gray-300'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        student.status === 'active'
                                                            ? 'translate-x-6'
                                                            : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleEdit('student', student)
                                                    }
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete('student', student.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-card shadow-sm">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-base font-semibold text-foreground">
                                    Teacher Accounts
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {teachers.length} faculty member(s)
                                </p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border text-sm">
                                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium">
                                            Image
                                        </th>
                                        <th className="px-6 py-3 text-left font-medium">
                                            Full name
                                        </th>
                                        <th className="px-6 py-3 text-left font-medium">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left font-medium">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card text-foreground">
                                    {teachers.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-8 text-center text-muted-foreground"
                                            >
                                                No teacher accounts yet.
                                            </td>
                                        </tr>
                                    )}
                                    {teachers.map((teacher) => (
                                        <tr key={teacher.id}>
                                            <td className="px-6 py-4">
                                                <Avatar className="size-10">
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
                                            </td>
                                            <td className="px-6 py-4">
                                                {teacher.fullname}
                                            </td>
                                            <td className="px-6 py-4">{teacher.email}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleToggleStatus(
                                                            'teacher',
                                                            teacher.id,
                                                            teacher.status,
                                                        )
                                                    }
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#18417f] focus:ring-offset-2 ${
                                                        teacher.status === 'active'
                                                            ? 'bg-[#18417f]'
                                                            : 'bg-gray-300'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                            teacher.status === 'active'
                                                                ? 'translate-x-6'
                                                                : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEdit('teacher', teacher)
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                'teacher',
                                                                teacher.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-card shadow-sm">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-base font-semibold text-foreground">
                                    Admin Accounts
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {admins.length} administrator(s)
                                </p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border text-sm">
                                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium">
                                            Image
                                        </th>
                                        <th className="px-6 py-3 text-left font-medium">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left font-medium">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card text-foreground">
                                    {admins.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-8 text-center text-muted-foreground"
                                            >
                                                No admin accounts yet.
                                            </td>
                                        </tr>
                                    )}
                                    {admins.map((admin) => (
                                        <tr key={admin.id}>
                                            <td className="px-6 py-4">
                                                <Avatar className="size-10">
                                                    <AvatarImage
                                                        src={admin.image_url || '/images/lyceum.png'}
                                                        alt={admin.name}
                                                    />
                                                    <AvatarFallback>
                                                        {admin.name
                                                            .split(' ')
                                                            .map((n) => n[0])
                                                            .join('')
                                                            .toUpperCase()
                                                            .slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </td>
                                            <td className="px-6 py-4">{admin.name}</td>
                                            <td className="px-6 py-4">{admin.email}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEdit('admin', admin)
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete('admin', admin.id)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
