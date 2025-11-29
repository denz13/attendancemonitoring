import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
    type ChartData,
    type ChartOptions,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { useEffect } from 'react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/reports',
    },
];

interface ReportsProps {
    attendanceBySubject?: { subject: string; attendance: number }[];
    mostAbsentStudents?: { name: string; days: number }[];
    punctualityTrend?: { month: string; rate: number }[];
}

export default function Reports({
    attendanceBySubject = [],
    mostAbsentStudents = [],
    punctualityTrend = [],
}: ReportsProps) {
    const { warning, success } = useToast();

    // Show toast notifications on component mount
    useEffect(() => {
        warning('Low Attendance Warning', 'Below 75%');
        success('Success', 'Reports has been exported successfully');
    }, [warning, success]);

    // Default sample data
    const defaultAttendanceBySubject = attendanceBySubject.length > 0 ? attendanceBySubject : [
        { subject: 'Math', attendance: 8 },
        { subject: 'Science', attendance: 12 },
        { subject: 'English', attendance: 16 },
        { subject: 'Filipino', attendance: 20 },
    ];

    const defaultMostAbsentStudents = mostAbsentStudents.length > 0 ? mostAbsentStudents : [
        { name: 'John Doe', days: 15 },
        { name: 'Jane Doe', days: 8 },
        { name: 'Wayne Doe', days: 5 },
    ];

    const defaultPunctualityTrend = punctualityTrend.length > 0 ? punctualityTrend : [
        { month: 'Jan', rate: 0 },
        { month: 'Feb', rate: 15 },
        { month: 'Mar', rate: 40 },
        { month: 'Apr', rate: 35 },
        { month: 'May', rate: 35 },
    ];

    // Attendance by Subject - Bar Chart
    const attendanceBySubjectData: ChartData<'bar'> = {
        labels: defaultAttendanceBySubject.map((item) => item.subject),
        datasets: [
            {
                label: 'Attendance %',
                data: defaultAttendanceBySubject.map((item) => item.attendance),
                backgroundColor: ['#ef4444', '#a855f7', '#3b82f6', '#1e40af'],
                borderColor: ['#ef4444', '#a855f7', '#3b82f6', '#1e40af'],
                borderWidth: 1,
            },
        ],
    };

    const attendanceBySubjectOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12,
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 20,
                    callback: (value) => `${value}%`,
                },
            },
        },
    };

    // Most Absent Students - Doughnut Chart
    const mostAbsentStudentsData: ChartData<'doughnut'> = {
        labels: defaultMostAbsentStudents.map((item) => item.name),
        datasets: [
            {
                label: 'Days Absent',
                data: defaultMostAbsentStudents.map((item) => item.days),
                backgroundColor: ['#a855f7', '#22c55e', '#3b82f6'],
                borderWidth: 0,
            },
        ],
    };

    const mostAbsentStudentsOptions: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12,
                    },
                },
            },
        },
    };

    // Punctuality Trend - Line Chart
    const punctualityTrendData: ChartData<'line'> = {
        labels: defaultPunctualityTrend.map((item) => item.month),
        datasets: [
            {
                label: 'Punctuality %',
                data: defaultPunctualityTrend.map((item) => item.rate),
                borderColor: '#111827',
                backgroundColor: 'rgba(17, 24, 39, 0.08)',
                pointBackgroundColor: '#111827',
                pointBorderColor: '#111827',
                pointRadius: 4,
                pointHoverRadius: 5,
                tension: 0.35,
                fill: {
                    target: 'origin',
                    above: 'rgba(17, 24, 39, 0.08)',
                },
            },
        ],
    };

    const punctualityTrendOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 20,
                    callback: (value) => `${value}%`,
                },
            },
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Charts Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Attendance by Subject */}
                    <Card className="rounded-xl border border-sidebar-border/70 bg-gray-50 shadow-sm dark:border-sidebar-border dark:bg-gray-900">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-foreground">
                                Attendance by Subject
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <Bar data={attendanceBySubjectData} options={attendanceBySubjectOptions} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Most Absent Students */}
                    <Card className="rounded-xl border border-sidebar-border/70 bg-gray-50 shadow-sm dark:border-sidebar-border dark:bg-gray-900">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-foreground">
                                Most Absent Students
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                <div className="h-48 w-48">
                                    <Doughnut
                                        data={mostAbsentStudentsData}
                                        options={mostAbsentStudentsOptions}
                                    />
                                </div>
                                <div className="flex-1 space-y-3">
                                    {defaultMostAbsentStudents.map((student, index) => {
                                        const colors = ['#a855f7', '#22c55e', '#3b82f6'];
                                        return (
                                            <div key={index} className="flex items-center gap-3">
                                                <div
                                                    className="h-4 w-4 rounded"
                                                    style={{ backgroundColor: colors[index] }}
                                                />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-foreground">
                                                        {student.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {student.days} days absent
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Punctuality Trend - Full Width */}
                <Card className="rounded-xl border border-sidebar-border/70 bg-gray-50 shadow-sm dark:border-sidebar-border dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">
                            Punctuality Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <Line data={punctualityTrendData} options={punctualityTrendOptions} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

