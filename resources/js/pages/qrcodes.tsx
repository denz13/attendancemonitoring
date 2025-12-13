import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type StudentAccount } from '@/types';
import { Head, router } from '@inertiajs/react';
import { QrCode, Scan, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Html5Qrcode } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'QR Codes',
        href: '/qr-codes',
    },
];

interface TeacherSubject {
    id: number;
    subject_id: number;
    subject_code: string;
    subject: string;
    year_level: string;
    section: string;
}

interface QRCodesProps {
    students?: StudentAccount[];
    teacherSubjects?: TeacherSubject[];
}

// Real QR Code component
function QRCodeDisplay({ 
    student, 
    size = 120 
}: { 
    student: StudentAccount; 
    size?: number;
}) {
    // Format QR code value with fullname, year_level, and section
    const qrValue = JSON.stringify({
        fullname: student.fullname,
        year_level: student.year_level,
        section: student.section,
        student_id: student.student_id,
    });
    
    return (
        <div
            className="flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white p-2"
            style={{ width: size, height: size }}
        >
            <QRCodeSVG
                value={qrValue}
                size={size - 16}
                level="M"
                includeMargin={false}
                fgColor="#000000"
                bgColor="#FFFFFF"
            />
        </div>
    );
}

export default function QRCodes({ students = [], teacherSubjects = [] }: QRCodesProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentAccount | null>(null);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [isTimeInModalOpen, setIsTimeInModalOpen] = useState(false);
    const [timeInPeriod, setTimeInPeriod] = useState<'AM' | 'PM' | null>(null);
    const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
    const [enrollmentData, setEnrollmentData] = useState<any>(null);
    const [selectedSubject, setSelectedSubject] = useState<TeacherSubject | null>(null);
    const [isTimeIn, setIsTimeIn] = useState(true); // true for time-in (workstate 0), false for time-out (workstate 1)
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scanContainerRef = useRef<HTMLDivElement>(null);

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
        setScanResult(null);
        setSelectedStudent(null);
        setSelectedSubject(null);
        setScanError(null);
    };

    const retryScan = () => {
        if (scannerRef.current) {
            scannerRef.current.stop().catch(() => {});
            scannerRef.current = null;
        }
        setIsScanning(false);
        setScanError(null);
        setScanResult(null);
        // Trigger re-initialization by toggling modal
        setIsScanModalOpen(false);
        setTimeout(() => setIsScanModalOpen(true), 100);
    };

    // Start QR code scanning when modal opens
    useEffect(() => {
        if (isScanModalOpen && !scannerRef.current) {
            // Wait for DOM to be ready
            const startScanning = async () => {
                // Small delay to ensure modal is fully rendered
                await new Promise(resolve => setTimeout(resolve, 100));
                
                const element = document.getElementById('qr-reader');
                if (!element) {
                    console.error('QR reader element not found');
                    setIsScanning(false);
                    return;
                }

                try {
                    const html5QrCode = new Html5Qrcode('qr-reader');
                    scannerRef.current = html5QrCode;
                    
                    await html5QrCode.start(
                        { facingMode: 'environment' }, // Use back camera
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                        },
                        async (decodedText) => {
                            // QR code scanned successfully
                            setScanResult(decodedText);
                            setIsScanning(false);
                            
                            // Try to parse the JSON data
                            try {
                                const data = JSON.parse(decodedText);
                                // Find student by matching the data
                                const allStudents = students.length > 0 ? students : defaultStudents;
                                const foundStudent = allStudents.find(
                                    (s) => 
                                        s.fullname === data.fullname &&
                                        s.year_level === data.year_level &&
                                        s.section === data.section
                                );
                                
                                if (foundStudent) {
                                    setSelectedStudent(foundStudent);
                                    
                                    // If teacher is logged in and subject is selected, validate enrollment for that subject
                                    if (teacherSubjects.length > 0 && selectedSubject) {
                                        // Validate enrollment for the selected subject
                                        try {
                                            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                                            const response = await fetch('/qr-codes/validate-enrollment', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Accept': 'application/json',
                                                    'X-Requested-With': 'XMLHttpRequest',
                                                    'X-CSRF-TOKEN': csrfToken,
                                                },
                                                body: JSON.stringify({
                                                    student_account_id: foundStudent.id,
                                                    subject_id: selectedSubject.subject_id,
                                                }),
                                            });
                                            
                                            const result = await response.json();
                                            
                                            if (result.enrolled && result.enrollments && result.enrollments.length > 0) {
                                                setEnrollmentData(result);
                                                setIsTimeInModalOpen(true);
                                            } else {
                                                setScanError('Student is not enrolled in the selected subject.');
                                            }
                                        } catch (error) {
                                            console.error('Error validating enrollment:', error);
                                            setScanError('Failed to validate enrollment. Please try again.');
                                        }
                                    } else if (teacherSubjects.length === 0) {
                                        // If not a teacher, use the old validation
                                        try {
                                            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                                            const response = await fetch('/qr-codes/validate-enrollment', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Accept': 'application/json',
                                                    'X-Requested-With': 'XMLHttpRequest',
                                                    'X-CSRF-TOKEN': csrfToken,
                                                },
                                                body: JSON.stringify({
                                                    student_account_id: foundStudent.id,
                                                }),
                                            });
                                            
                                            const result = await response.json();
                                            
                                            if (result.enrolled && result.enrollments && result.enrollments.length > 0) {
                                                setEnrollmentData(result);
                                                setIsTimeInModalOpen(true);
                                            } else {
                                                setScanError('Student is not enrolled in any subject.');
                                            }
                                        } catch (error) {
                                            console.error('Error validating enrollment:', error);
                                            setScanError('Failed to validate enrollment. Please try again.');
                                        }
                                    } else {
                                        setScanError('Please select a subject first.');
                                    }
                                } else {
                                    setScanError('Student not found in the system.');
                                }
                            } catch (e) {
                                // If not JSON, treat as plain text (for backward compatibility)
                                console.log('Scanned text:', decodedText);
                                setScanError('Invalid QR code format.');
                            }
                            
                            // Stop scanning after successful scan
                            if (scannerRef.current) {
                                scannerRef.current.stop().catch(() => {});
                                scannerRef.current = null;
                            }
                        },
                        (errorMessage) => {
                            // Ignore scan errors (they happen continuously while scanning)
                        }
                    );
                    setIsScanning(true);
                } catch (err: any) {
                    console.error('Error starting QR scanner:', err);
                    setIsScanning(false);
                    // Show error message to user
                    const errorMsg = err.message || 'Failed to start camera. Please check your camera permissions.';
                    setScanError(errorMsg);
                }
            };
            
            startScanning();
        }
        
        // Cleanup: stop scanning when modal closes
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
                scannerRef.current = null;
            }
            setIsScanning(false);
        };
    }, [isScanModalOpen, students]);

    const handleDownloadQR = async (student: StudentAccount) => {
        try {
            // Create QR code value
            const qrValue = JSON.stringify({
                fullname: student.fullname,
                year_level: student.year_level,
                section: student.section,
                student_id: student.student_id,
            });

            // Use qrcode library to generate QR code as data URL
            const QRCode = await import('qrcode');
            const dataUrl = await QRCode.default.toDataURL(qrValue, {
                width: 512,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
                errorCorrectionLevel: 'M',
            });

            // Create download link
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${student.student_id}_${student.fullname.replace(/\s+/g, '_')}_QRCode.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading QR code:', error);
            alert('Failed to download QR code. Please try again.');
        }
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
                                        <QRCodeDisplay
                                            student={student}
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
            <Dialog open={isScanModalOpen} onOpenChange={(open) => {
                setIsScanModalOpen(open);
                if (!open) {
                    // Stop scanning when modal closes
                    if (scannerRef.current) {
                        scannerRef.current.stop().catch(() => {});
                        scannerRef.current = null;
                    }
                    setIsScanning(false);
                    setScanResult(null);
                    setSelectedStudent(null);
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Scan QR Code</DialogTitle>
                        <DialogDescription>
                            Position the QR code within the frame to scan
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* QR Code Scanner */}
                        <div className="flex flex-col items-center gap-4">
                            <div
                                id="qr-reader"
                                ref={scanContainerRef}
                                className="w-full rounded-lg overflow-hidden bg-black"
                                style={{ minHeight: '300px' }}
                            ></div>
                            
                            {!isScanning && !scanResult && !scanError && (
                                <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 dark:bg-gray-900 w-full">
                                    <Scan className="h-12 w-12 text-muted-foreground animate-pulse" />
                                    <p className="text-sm font-medium text-foreground">
                                        Initializing Camera...
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Please allow camera access when prompted
                                    </p>
                                </div>
                            )}

                            {scanError && (
                                <div className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20 w-full">
                                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                        Camera Error
                                    </p>
                                    <p className="text-xs text-red-700 dark:text-red-300 text-center">
                                        {scanError}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={retryScan}
                                        className="mt-2"
                                    >
                                        Retry
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Scan Result */}
                        {scanResult && (
                            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                    QR Code Scanned Successfully!
                                </p>
                                {selectedStudent ? (
                                    <div className="mt-3 flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
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
                                            <p className="font-medium text-green-900 dark:text-green-100">
                                                {selectedStudent.fullname}
                                            </p>
                                            <p className="text-xs text-green-700 dark:text-green-300">
                                                {selectedStudent.student_id} • {selectedStudent.year_level} - {selectedStudent.section}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mt-2 text-xs text-green-700 dark:text-green-300">
                                        {scanResult}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    if (scannerRef.current) {
                                        scannerRef.current.stop().catch(() => {});
                                        scannerRef.current = null;
                                    }
                                    setIsScanModalOpen(false);
                                    setIsScanning(false);
                                    setScanResult(null);
                                    setSelectedStudent(null);
                                }}
                            >
                                Close
                            </Button>
                            {scanResult && (
                                <Button
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    onClick={() => {
                                        // Handle the scanned result (e.g., mark attendance)
                                        console.log('Scanned data:', scanResult);
                                        if (selectedStudent) {
                                            console.log('Student found:', selectedStudent);
                                            // You can add attendance marking logic here
                                        }
                                    }}
                                >
                                    Process Scan
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Time-In Modal */}
            <Dialog open={isTimeInModalOpen} onOpenChange={setIsTimeInModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Time In</DialogTitle>
                        <DialogDescription>
                            {enrollmentData?.student ? (
                                <>
                                    Select time period for{' '}
                                    <span className="font-semibold text-foreground">
                                        {enrollmentData.student.fullname}
                                    </span>
                                </>
                            ) : (
                                'Select time period for attendance'
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {enrollmentData?.student && (
                            <div className="flex items-center gap-3 rounded-lg border border-sidebar-border/70 bg-gray-50 p-4 dark:bg-gray-900">
                                <Avatar className="h-10 w-10">
                                    {enrollmentData.student.image_url ? (
                                        <AvatarImage
                                            src={enrollmentData.student.image_url}
                                            alt={enrollmentData.student.fullname}
                                        />
                                    ) : null}
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {getInitials(enrollmentData.student.fullname)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{enrollmentData.student.fullname}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {enrollmentData.student.student_id} • {enrollmentData.student.year_level} - {enrollmentData.student.section}
                                    </p>
                                </div>
                            </div>
                        )}

                        {enrollmentData?.enrollments && enrollmentData.enrollments.length > 0 && (
                            <div className="space-y-2">
                                <Label>Select Subject</Label>
                                <select
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={selectedEnrollment?.schedule_id || ''}
                                    onChange={(e) => {
                                        const enrollment = enrollmentData.enrollments.find(
                                            (enr: any) => enr.schedule_id.toString() === e.target.value
                                        );
                                        setSelectedEnrollment(enrollment);
                                    }}
                                >
                                    <option value="">Select a subject</option>
                                    {enrollmentData.enrollments.map((enrollment: any) => (
                                        <option key={enrollment.id} value={enrollment.schedule_id}>
                                            {enrollment.subject_code} - {enrollment.subject}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Select Time Period</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant={timeInPeriod === 'AM' ? 'default' : 'outline'}
                                    className={timeInPeriod === 'AM' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                    onClick={() => setTimeInPeriod('AM')}
                                >
                                    AM
                                </Button>
                                <Button
                                    type="button"
                                    variant={timeInPeriod === 'PM' ? 'default' : 'outline'}
                                    className={timeInPeriod === 'PM' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                    onClick={() => setTimeInPeriod('PM')}
                                >
                                    PM
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Select Action</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant={isTimeIn ? 'default' : 'outline'}
                                    className={isTimeIn ? 'bg-green-600 hover:bg-green-700' : ''}
                                    onClick={() => setIsTimeIn(true)}
                                >
                                    Time In
                                </Button>
                                <Button
                                    type="button"
                                    variant={!isTimeIn ? 'default' : 'outline'}
                                    className={!isTimeIn ? 'bg-orange-600 hover:bg-orange-700' : ''}
                                    onClick={() => setIsTimeIn(false)}
                                >
                                    Time Out
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setIsTimeInModalOpen(false);
                                    setTimeInPeriod(null);
                                    setSelectedEnrollment(null);
                                    setEnrollmentData(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                disabled={!timeInPeriod || !selectedEnrollment}
                                onClick={() => {
                                    if (!timeInPeriod || !selectedEnrollment || !enrollmentData?.student) return;
                                    
                                    router.post('/qr-codes/time-in', {
                                        student_account_id: enrollmentData.student.id,
                                        schedules_id: selectedEnrollment.schedule_id,
                                        time_period: timeInPeriod,
                                        workstate: isTimeIn ? 0 : 1, // 0 for time-in, 1 for time-out
                                    }, {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setIsTimeInModalOpen(false);
                                            setTimeInPeriod(null);
                                            setSelectedEnrollment(null);
                                            setEnrollmentData(null);
                                            setIsScanModalOpen(false);
                                            setScanResult(null);
                                            setSelectedStudent(null);
                                            setSelectedSubject(null);
                                            setIsTimeIn(true);
                                        },
                                        onError: (errors) => {
                                            console.error('Time-in error:', errors);
                                        },
                                    });
                                }}
                            >
                                Submit {isTimeIn ? 'Time In' : 'Time Out'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

