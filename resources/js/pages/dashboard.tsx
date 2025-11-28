import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
    type ChartData,
    type ChartOptions,
    type TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    totalStudents: number;
    totalUsers: number;
}

export default function Dashboard({ totalStudents, totalUsers }: DashboardProps) {
    const attendanceData = [
        { label: 'Jan', rate: 92 },
        { label: 'Feb', rate: 94 },
        { label: 'Mar', rate: 95 },
        { label: 'Apr', rate: 93 },
        { label: 'May', rate: 97 },
        { label: 'Jun', rate: 96 },
        { label: 'Jul', rate: 98 },
        { label: 'Aug', rate: 95 },
        { label: 'Sep', rate: 96 },
        { label: 'Oct', rate: 97 },
        { label: 'Nov', rate: 96.5 },
        { label: 'Dec', rate: 97.2 },
    ];

    const chartData: ChartData<'line'> = {
        labels: attendanceData.map((item) => item.label),
        datasets: [
            {
                label: 'Attendance',
                data: attendanceData.map((item) => item.rate),
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

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                displayColors: false,
                callbacks: {
                    label: (ctx: TooltipItem<'line'>) => `${ctx.parsed.y}%`,
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 11,
                        family: 'Inter, system-ui, sans-serif',
                    },
                    color: '#6b7280',
                },
            },
            y: {
                beginAtZero: true,
                suggestedMax: 100,
                ticks: {
                    stepSize: 20,
                    callback: (value) => {
                        const numericValue =
                            typeof value === 'string' ? parseFloat(value) : value;
                        return `${numericValue}%`;
                    },
                    font: {
                        size: 11,
                        family: 'Inter, system-ui, sans-serif',
                    },
                    color: '#6b7280',
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.4)',
                },
                border: {
                    display: false,
                },
            },
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                        <p className="text-sm font-medium text-muted-foreground">
                            Total Students
                        </p>
                        <div className="mt-3 text-3xl font-semibold text-foreground">
                            {totalStudents.toLocaleString()}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Active student accounts
                        </p>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                        <p className="text-sm font-medium text-muted-foreground">
                            Attendance Rate
                        </p>
                        <div className="mt-3 text-3xl font-semibold text-foreground">
                            96.3%
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Consistent with weekly average
                        </p>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                        <p className="text-sm font-medium text-muted-foreground">
                            Total Users
                        </p>
                        <div className="mt-3 text-3xl font-semibold text-foreground">
                            {totalUsers.toLocaleString()}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Includes faculty and admins
                        </p>
                    </div>
                    {/* <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div> */}
                </div>
                <div className="flex-1 rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                Attendance Overview
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Monthly attendance rate for 2025
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            Sort by
                            <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1 text-foreground"
                            >
                                Month
                                <svg
                                    className="size-3"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M3 4.5L6 7.5L9 4.5"
                                        stroke="currentColor"
                                        strokeWidth="1.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 h-64 w-full">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
