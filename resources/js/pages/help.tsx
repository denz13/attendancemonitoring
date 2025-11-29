import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    BookOpen,
    ChevronDown,
    HelpCircle,
    Mail,
    MessageCircle,
    Phone,
    Search,
    Shield,
    User,
    Users,
    QrCode,
    Calendar,
    BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Help',
        href: '/help',
    },
];

interface FAQItem {
    question: string;
    answer: string;
    category: 'general' | 'attendance' | 'account' | 'technical';
}

const faqData: FAQItem[] = [
    {
        question: 'How do I log in to the system?',
        answer: 'You can log in using your email address (for admin/teacher) or student ID (for students) along with your password. Select your account type (Admin, Teacher, or Student) from the login page before entering your credentials.',
        category: 'general',
    },
    {
        question: 'How do I scan a QR code for attendance?',
        answer: 'Click on the "Scan QR Code" button in your dashboard or the QR Codes page. Position the student\'s QR code within the camera frame and the system will automatically record the attendance.',
        category: 'attendance',
    },
    {
        question: 'How do I generate QR codes for students?',
        answer: 'Go to the QR Codes page from the navigation menu. All students will have their QR codes automatically generated and displayed. You can download individual QR codes or scan them directly.',
        category: 'attendance',
    },
    {
        question: 'How do I view attendance reports?',
        answer: 'Navigate to the Reports page from the sidebar. You can view attendance by subject, most absent students, and punctuality trends. Reports can be exported for further analysis.',
        category: 'attendance',
    },
    {
        question: 'How do I update my account information?',
        answer: 'Go to the Account section in the navigation menu. You can update your profile information, change your password, and manage your account settings from there.',
        category: 'account',
    },
    {
        question: 'What should I do if I forgot my password?',
        answer: 'Click on "Forgot password?" link on the login page. Enter your email address and you will receive instructions to reset your password.',
        category: 'account',
    },
    {
        question: 'How do I add a new student?',
        answer: 'Go to the Users page, select "Student" as the account type, and click "Add New". Fill in the student information including Student ID, Full Name, Year Level, and Section, then save.',
        category: 'general',
    },
    {
        question: 'How do I manage class schedules?',
        answer: 'Navigate to the Schedules page. You can add, edit, or remove class schedules. Select a teacher and subject, then set the day and time for each class session.',
        category: 'general',
    },
    {
        question: 'Why is my QR code not scanning?',
        answer: 'Ensure that the QR code is clearly visible, well-lit, and not damaged. Make sure your camera has permission to access and that you are scanning the correct QR code for the student.',
        category: 'technical',
    },
    {
        question: 'How do I export attendance data?',
        answer: 'Go to the Reports page and use the export functionality. You can export attendance data in various formats for analysis or record-keeping purposes.',
        category: 'attendance',
    },
];

const quickLinks = [
    {
        title: 'Getting Started Guide',
        description: 'Learn the basics of using the attendance monitoring system',
        icon: BookOpen,
        href: '#',
    },
    {
        title: 'Attendance Management',
        description: 'How to manage and track student attendance',
        icon: Calendar,
        href: '#',
    },
    {
        title: 'QR Code Guide',
        description: 'Everything about generating and scanning QR codes',
        icon: QrCode,
        href: '#',
    },
    {
        title: 'Reports & Analytics',
        description: 'Understanding attendance reports and analytics',
        icon: BarChart3,
        href: '#',
    },
];

export default function Help() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openItems, setOpenItems] = useState<Set<number>>(new Set());

    const toggleItem = (index: number) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(index)) {
            newOpenItems.delete(index);
        } else {
            newOpenItems.add(index);
        }
        setOpenItems(newOpenItems);
    };

    const filteredFAQs = faqData.filter((faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'attendance':
                return Calendar;
            case 'account':
                return User;
            case 'technical':
                return Shield;
            default:
                return HelpCircle;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Help & Support" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Hero Section */}
                <div className="rounded-xl border border-sidebar-border/70 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-sidebar-border">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-blue-600 p-3">
                            <HelpCircle className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Help & Support Center
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                Find answers to common questions and get help using the system
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search for help topics, questions, or guides..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Quick Links */}
                <div>
                    <h2 className="mb-4 text-xl font-semibold text-foreground">Quick Links</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {quickLinks.map((link, index) => {
                            const Icon = link.icon;
                            return (
                                <Card
                                    key={index}
                                    className="cursor-pointer transition-all hover:shadow-md"
                                >
                                    <CardHeader>
                                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <CardTitle className="text-base">{link.title}</CardTitle>
                                        <CardDescription className="text-sm">
                                            {link.description}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* FAQ Section */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-foreground">
                            Frequently Asked Questions
                        </h2>
                        <span className="text-sm text-muted-foreground">
                            {filteredFAQs.length} questions
                        </span>
                    </div>

                    <div className="space-y-2">
                        {filteredFAQs.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    No questions found matching your search.
                                </CardContent>
                            </Card>
                        ) : (
                            filteredFAQs.map((faq, index) => {
                                const Icon = getCategoryIcon(faq.category);
                                const isOpen = openItems.has(index);

                                return (
                                    <Collapsible
                                        key={index}
                                        open={isOpen}
                                        onOpenChange={() => toggleItem(index)}
                                    >
                                        <Card className="overflow-hidden">
                                            <CollapsibleTrigger className="w-full">
                                                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-start gap-4">
                                                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                            <Icon className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <CardTitle className="text-base font-medium">
                                                                {faq.question}
                                                            </CardTitle>
                                                        </div>
                                                        <ChevronDown
                                                            className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                                                                isOpen ? 'rotate-180' : ''
                                                            }`}
                                                        />
                                                    </div>
                                                </CardHeader>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <CardContent className="pt-0">
                                                    <div className="ml-12 border-l-2 border-primary/20 pl-4">
                                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                                            {faq.answer}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </CollapsibleContent>
                                        </Card>
                                    </Collapsible>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Contact Support Section */}
                <Card className="rounded-xl border border-sidebar-border/70 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Still Need Help?
                        </CardTitle>
                        <CardDescription>
                            Can't find what you're looking for? Contact our support team
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="flex items-center gap-3 rounded-lg border border-sidebar-border/70 bg-card p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Email</p>
                                    <p className="text-xs text-muted-foreground">
                                        support@example.com
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border border-sidebar-border/70 bg-card p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                    <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Phone</p>
                                    <p className="text-xs text-muted-foreground">
                                        +1 (555) 123-4567
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border border-sidebar-border/70 bg-card p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                                    <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Live Chat</p>
                                    <p className="text-xs text-muted-foreground">
                                        Available 24/7
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Button className="w-full sm:w-auto">
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Contact Support
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

