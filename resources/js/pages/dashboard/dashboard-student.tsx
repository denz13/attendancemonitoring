import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface RecentAbsence {
    date: string;
    subject: string;
}

interface ClassSchedule {
    date: string;
    time: string;
    subject: string;
}

interface DashboardStudentProps {
    attendanceRate?: number;
    recentAbsences?: RecentAbsence[];
    todaySchedule?: ClassSchedule[];
    tomorrowSchedule?: ClassSchedule[];
}

export default function DashboardStudent({
    attendanceRate = 30,
    recentAbsences = [],
    todaySchedule = [],
    tomorrowSchedule = [],
}: DashboardStudentProps) {
    const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today');

    // Default sample data if none provided
    const defaultRecentAbsences: RecentAbsence[] = recentAbsences.length > 0 ? recentAbsences : [
        { date: 'October 20', subject: 'Math' },
        { date: 'October 20', subject: 'Math' },
        { date: 'October 20', subject: 'Math' },
        { date: 'October 20', subject: 'Math' },
    ];

    const defaultTodaySchedule: ClassSchedule[] = todaySchedule.length > 0 ? todaySchedule : [
        { date: 'October 26', time: '8:00 AM', subject: 'Science' },
        { date: 'October 26', time: '8:00 AM', subject: 'Science' },
        { date: 'October 26', time: '8:00 AM', subject: 'Science' },
    ];

    const defaultTomorrowSchedule: ClassSchedule[] = tomorrowSchedule.length > 0 ? tomorrowSchedule : [
        { date: 'October 27', time: '8:00 AM', subject: 'English' },
        { date: 'October 27', time: '9:00 AM', subject: 'History' },
    ];

    const getAttendanceColor = (rate: number) => {
        if (rate >= 80) return 'text-green-600';
        if (rate >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Attendance Rate Section */}
                    <Card className="rounded-xl border border-sidebar-border/70 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-foreground">
                                Attendance Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Circular Progress Indicator */}
                            <div className="flex justify-center">
                                <div className="relative h-32 w-32">
                                    <svg className="h-32 w-32 -rotate-90 transform">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            className="text-gray-200 dark:text-gray-700"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray={`${2 * Math.PI * 56}`}
                                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - attendanceRate / 100)}`}
                                            className="text-blue-600 transition-all duration-300"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={`text-2xl font-bold ${getAttendanceColor(attendanceRate)}`}>
                                            {attendanceRate}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Absences */}
                            <div>
                                <h3 className="mb-3 text-base font-semibold text-foreground">
                                    Recent Absences
                                </h3>
                                <div className="space-y-2">
                                    {defaultRecentAbsences.map((absence, index) => (
                                        <div
                                            key={index}
                                            className="rounded-md border border-sidebar-border/70 bg-card p-3 text-sm text-foreground"
                                        >
                                            {absence.date}, {absence.subject}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Class Schedule Section */}
                    <Card className="rounded-xl border border-sidebar-border/70 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-foreground">
                                Class Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Tabs */}
                            <div className="mb-4 flex border-b border-sidebar-border/70">
                                <button
                                    onClick={() => setActiveTab('today')}
                                    className={`flex-1 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                                        activeTab === 'today'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => setActiveTab('tomorrow')}
                                    className={`flex-1 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                                        activeTab === 'tomorrow'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Tomorrow
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="space-y-3">
                                {activeTab === 'today' &&
                                    defaultTodaySchedule.map((schedule, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 rounded-lg bg-blue-600 p-4 text-white"
                                        >
                                            <Calendar className="h-5 w-5 shrink-0" />
                                            <div className="flex-1">
                                                <div className="font-medium">
                                                    {schedule.date}, {schedule.time}
                                                </div>
                                                <div className="text-sm opacity-90">
                                                    {schedule.subject}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                {activeTab === 'tomorrow' &&
                                    defaultTomorrowSchedule.map((schedule, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 rounded-lg bg-blue-600 p-4 text-white"
                                        >
                                            <Calendar className="h-5 w-5 shrink-0" />
                                            <div className="flex-1">
                                                <div className="font-medium">
                                                    {schedule.date}, {schedule.time}
                                                </div>
                                                <div className="text-sm opacity-90">
                                                    {schedule.subject}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

