import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    CalendarDays,
    CircleHelp,
    Folder,
    LayoutGrid,
    QrCode,
    UserCog,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

// Admin navigation items
const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users,
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: BarChart3,
    },
    {
        title: 'QR Codes',
        href: '/qr-codes',
        icon: QrCode,
    },
    {
        title: 'Schedules',
        href: '/schedules',
        icon: CalendarDays,
    },
    {
        title: 'Subject',
        href: '/subject',
        icon: BookOpen,
    },
    {
        title: 'Account',
        href: '/account',
        icon: UserCog,
    },
    {
        title: 'Help',
        href: '/help',
        icon: CircleHelp,
    },
];

// Teacher navigation items (limited to Dashboard only)
const teacherNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

export function AppSidebar() {
    const page = usePage<SharedData>();
    const userRole = page.props.auth?.role || 'guest';
    
    // Filter navigation items based on user role
    const mainNavItems = userRole === 'teacher' ? teacherNavItems : adminNavItems;

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r border-[#18417f]/40 bg-[#18417f] text-white"
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="text-white"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
              
                <NavUser className="text-white" />
            </SidebarFooter>
        </Sidebar>
    );
}
