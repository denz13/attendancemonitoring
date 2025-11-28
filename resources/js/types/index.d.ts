import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User | null;
    role?: 'admin' | 'teacher' | 'student' | 'guest';
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface StudentAccount {
    id: number;
    student_id: string;
    fullname: string;
    year_level: string;
    section: string;
    status: string;
    image?: string | null;
    image_url?: string | null;
}

export interface TeacherAccount {
    id: number;
    fullname: string;
    email: string;
    status: string;
    subject_id?: number | null;
    image?: string | null;
    image_url?: string | null;
}

export interface SubjectOption {
    id: number;
    subject_code: string;
    subject: string;
}

export interface AdminAccount {
    id: number;
    name: string;
    email: string;
    image?: string | null;
    image_url?: string | null;
}

export interface Subject {
    id: number;
    subject_code: string;
    subject: string;
    year_level: string;
    section: string;
    status: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
