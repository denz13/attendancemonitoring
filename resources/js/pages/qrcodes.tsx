import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type StudentAccount } from '@/types';
import { Head } from '@inertiajs/react';
import { QrCode, Scan, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'QR Codes',
        href: '/qr-codes',
    },
];

interface QRCodesProps {
    students?: StudentAccount[];
}

// Simple QR Code placeholder component
function QRCodePlaceholder({ value, size = 120 }: { value: string; size?: number }) {
    // This is a placeholder - in production, you'd use a QR code library like qrcode.react
    return (
        <div
            className="flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white p-2"
            style={{ width: size, height: size }}
        >
            <div className="flex flex-col items-center gap-1 text-xs text-gray-500">
                <QrCode className="h-8 w-8" />
                <span className="text-center text-[8px]">{value}</span>
            </div>
        </div>
    );
}

export default function QRCodes({ students = [] }: QRCodesProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentAccount | null>(null);

    // Default sample data if none provided
    const defaultStudents: StudentAccount[] = students.length > 0 ? students : [
        {
            id: 1,
            student_id: '2024-001',
            fullname: 'John Doe',
            year_level: '1st Year',
            section: 'A',
            status: 'active',
            image: null,
            image_url: null,
        },
        {
            id: 2,
            student_id: '2024-002',
            fullname: 'Jane Smith',
            year_level: '2nd Year',
            section: 'B',
            status: 'active',
            image: null,
            image_url: null,
        },
        {
            id: 3,
            student_id: '2024-003',
            fullname: 'Michael Johnson',
            year_level: '3rd Year',
            section: 'A',
            status: 'active',
            image: null,
            image_url: null,
        },
    ];

    // Filter students based on search query
    const filteredStudents = defaultStudents.filter((student) =>
        student.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${student.year_level} ${student.section}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleScan = () => {
        setIsScanModalOpen(true);
    };

    const handleDownloadQR = (student: StudentAccount) => {
        // Placeholder for download functionality
        console.log('Download QR for:', student);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="QR Codes" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Student QR Codes</h1>
                        <p className="text-sm text-muted-foreground">
                            View and manage QR codes for student attendance
                        </p>
                    </div>
                    <Button onClick={handleScan} className="bg-blue-600 hover:bg-blue-700">
                        <Scan className="mr-2 h-4 w-4" />
                        Scan QR Code
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search by name, student ID, or class..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Students Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredStudents.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            No students found matching your search.
                        </div>
                    ) : (
                        filteredStudents.map((student) => (
                            <Card
                                key={student.id}
                                className="rounded-xl border border-sidebar-border/70 shadow-sm transition-shadow hover:shadow-md dark:border-sidebar-border"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12">
                                            {student.image_url ? (
                                                <AvatarImage
                                                    src={student.image_url}
                                                    alt={student.fullname}
                                                />
                                            ) : null}
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {getInitials(student.fullname)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="truncate text-base">
                                                {student.fullname}
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground">
                                                {student.student_id}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Student Info */}
                                    <div className="space-y-1 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Year Level:</span>
                                            <span className="font-medium text-foreground">
                                                {student.year_level}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Section:</span>
                                            <span className="font-medium text-foreground">
                                                {student.section}
                                            </span>
                                        </div>
                                    </div>

                                    {/* QR Code Display */}
                                    <div className="flex justify-center border-t border-sidebar-border/70 pt-4">
                                        <QRCodePlaceholder
                                            value={student.student_id}
                                            size={140}
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => handleDownloadQR(student)}
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                        <Button
                                            variant="default"
                                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                                            onClick={() => {
                                                setSelectedStudent(student);
                                                setIsScanModalOpen(true);
                                            }}
                                        >
                                            <Scan className="mr-2 h-4 w-4" />
                                            Scan
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Scan QR Code Modal */}
            <Dialog open={isScanModalOpen} onOpenChange={setIsScanModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Scan QR Code</DialogTitle>
                        <DialogDescription>
                            {selectedStudent
                                ? `Scan QR code for ${selectedStudent.fullname}`
                                : 'Position the QR code within the frame to scan'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {selectedStudent && (
                            <div className="flex flex-col items-center gap-4 rounded-lg border border-sidebar-border/70 bg-gray-50 p-6 dark:bg-gray-900">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        {selectedStudent.image_url ? (
                                            <AvatarImage
                                                src={selectedStudent.image_url}
                                                alt={selectedStudent.fullname}
                                            />
                                        ) : null}
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {getInitials(selectedStudent.fullname)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{selectedStudent.fullname}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedStudent.student_id}
                                        </p>
                                    </div>
                                </div>
                                <QRCodePlaceholder value={selectedStudent.student_id} size={200} />
                            </div>
                        )}
                        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 dark:bg-gray-900">
                            <Scan className="h-12 w-12 text-muted-foreground" />
                            <p className="text-sm font-medium text-foreground">
                                Camera Scanner Placeholder
                            </p>
                            <p className="text-xs text-muted-foreground">
                                QR code scanner will appear here
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setIsScanModalOpen(false);
                                    setSelectedStudent(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                onClick={() => {
                                    // Placeholder for scan action
                                    console.log('Scanning QR code...');
                                }}
                            >
                                Scan Now
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

