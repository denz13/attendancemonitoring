import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface ClassListEntry {
    studentName: string;
    date: string;
    status: 'Present' | 'Late' | 'Absent';
    scanTime: string;
}

interface AttendanceSummaryEntry {
    class: string;
    date: string;
    present: number;
    absent: number;
    attendanceRate: number;
}

interface DashboardTeacherProps {
    classList?: ClassListEntry[];
    attendanceSummary?: AttendanceSummaryEntry[];
}

export default function DashboardTeacher({
    classList = [],
    attendanceSummary = [],
}: DashboardTeacherProps) {
    // Use provided data or empty arrays
    const displayClassList = classList.length > 0 ? classList : [];
    const displayAttendanceSummary = attendanceSummary.length > 0 ? attendanceSummary : [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present':
                return 'text-green-600';
            case 'Late':
                return 'text-red-600';
            case 'Absent':
                return 'text-gray-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teacher Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Class List Section */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border">
                        <div className="border-b border-sidebar-border/70 p-4">
                            <h2 className="text-lg font-semibold text-foreground">Class List</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-sidebar-border/70 bg-gray-50 dark:bg-gray-900">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                            Student Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                            Scan Time
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayClassList.length > 0 ? (
                                        displayClassList.map((entry, index) => (
                                            <tr
                                                key={index}
                                                className={`border-b border-sidebar-border/70 ${
                                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50 dark:bg-gray-900'
                                                }`}
                                            >
                                                <td className="px-4 py-3 text-sm text-foreground">
                                                    {entry.studentName}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-foreground">
                                                    {entry.date}
                                                </td>
                                                <td className={`px-4 py-3 text-sm font-medium ${getStatusColor(entry.status)}`}>
                                                    {entry.status}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-foreground">
                                                    {entry.scanTime}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                                                No students enrolled for today's schedule
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-sidebar-border/70 p-4">
                            <Button 
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={() => router.visit('/qr-codes')}
                            >
                                <QrCode className="mr-2 h-4 w-4" />
                                Scan QR Code
                            </Button>
                        </div>
                    </div>

                    {/* Attendance Summary Section */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border">
                        <div className="border-b border-sidebar-border/70 p-4">
                            <h2 className="text-lg font-semibold text-foreground">Attendance Summary</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-sidebar-border/70 bg-gray-50 dark:bg-gray-900">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                            CLASS
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                            DATE
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                            PRESENT
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                            ABSENT
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                            ATTENDANCE RATE
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayAttendanceSummary.length > 0 ? (
                                        displayAttendanceSummary.map((entry, index) => (
                                            <tr
                                                key={index}
                                                className={`border-b border-sidebar-border/70 ${
                                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50 dark:bg-gray-900'
                                                }`}
                                            >
                                                <td className="px-4 py-3 text-sm font-medium text-foreground">
                                                    {entry.class}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-foreground">
                                                    {entry.date}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-foreground">
                                                    {entry.present}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-foreground">
                                                    {entry.absent}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-foreground">
                                                    {entry.attendanceRate}%
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                                                No attendance data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

