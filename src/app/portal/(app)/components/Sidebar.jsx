"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// --- ICON IMPORTS ---
import {
  LayoutDashboard,
  BookOpen,
  User,
  Settings,
  LogOut,
  Megaphone,
  CalendarDays,
  ClipboardList,
  CheckSquare,
  Award,
  CreditCard,
  UserCheck,
  ImageIcon,
  Phone,
  Users,
  BookMarked,
  FolderUp,
  School,
  Library,
  UserPlus,
  IndianRupee,
  Banknote,
  Layout,
  PenSquare,
  MessageCircle,
  BarChart2,
  GitBranch,
  UserCircle,
} from "lucide-react";

// --- STUDENT NAV ITEMS ---
const studentNavItems = [
  // ... (no changes here)
  {
    href: "/portal/student-dashboard",
    label: "Dashboard",
    Icon: LayoutDashboard,
  },
  {
    href: "/portal/student-dashboard/attendance",
    label: "Attendance",
    Icon: UserCheck,
  },
  {
    href: "/portal/student-dashboard/announcements",
    label: "Announcements",
    Icon: Megaphone,
  },
  {
    href: "/portal/student-dashboard/events",
    label: "Events",
    Icon: CalendarDays,
  },
  {
    href: "/portal/student-dashboard/gallery",
    label: "Gallery",
    Icon: ImageIcon,
  },
  {
    href: "/portal/student-dashboard/courses",
    label: "My Courses",
    Icon: BookOpen,
  },
  {
    href: "/portal/student-dashboard/assignments",
    label: "Assignments",
    Icon: ClipboardList,
  },
  {
    href: "/portal/student-dashboard/homework",
    label: "Homework",
    Icon: CheckSquare,
  },
  { href: "/portal/student-dashboard/results", label: "Results", Icon: Award },
  {
    href: "/portal/student-dashboard/payments",
    label: "Payments",
    Icon: CreditCard,
  },
  {
    href: "/portal/student-dashboard/contact",
    label: "Contact Us",
    Icon: Phone,
  },
  { type: "divider" },
  { href: "/portal/student-dashboard/profile", label: "Profile", Icon: User },
  {
    href: "/portal/student-dashboard/settings",
    label: "Settings",
    Icon: Settings,
  },
];

// --- TEACHER NAV ITEMS (Updated) ---
const teacherNavItems = [
  {
    href: "/portal/teacher-dashboard",
    label: "Dashboard",
    Icon: LayoutDashboard,
  },
  { type: "divider" },
  {
    href: "/portal/teacher-dashboard/students",
    label: "Student Roster",
    Icon: Users,
  },
  {
    href: "/portal/teacher-dashboard/attendance",
    label: "Mark Attendance",
    Icon: UserCheck,
  },
  {
    href: "/portal/teacher-dashboard/assignments",
    label: "Assignments",
    Icon: ClipboardList,
  },
  {
    href: "/portal/teacher-dashboard/grades",
    label: "Gradebook",
    Icon: BookMarked,
  },
  {
    href: "/portal/teacher-dashboard/materials",
    label: "Study Material",
    Icon: FolderUp,
  },
  { type: "divider" },
  {
    href: "/portal/teacher-dashboard/announcements",
    label: "Announcements",
    Icon: Megaphone,
  },
  {
    href: "/portal/teacher-dashboard/gallery",
    label: "Manage Gallery",
    Icon: ImageIcon,
  },
  // --- ADD THIS LINE FOR TEACHERS ---
  {
    href: "/portal/teacher-dashboard/events",
    label: "Manage Events",
    Icon: CalendarDays,
  },
  { type: "divider" },
  { href: "/portal/teacher-dashboard/profile", label: "Profile", Icon: User },
  {
    href: "/portal/teacher-dashboard/settings",
    label: "Settings",
    Icon: Settings,
  },
];

// --- ADMIN NAV ITEMS (Updated) ---
const adminNavItems = [
  {
    href: "/portal/admin-dashboard",
    label: "Dashboard",
    Icon: LayoutDashboard,
  },
  { type: "divider" },
  {
    href: "/portal/admin-dashboard/batches",
    label: "Manage Batches",
    Icon: School,
  },
  {
    href: "/portal/admin-dashboard/subjects",
    label: "Manage Subjects",
    Icon: Library,
  },
  {
    href: "/portal/admin-dashboard/students",
    label: "Manage Students",
    Icon: Users,
  },
  {
    href: "/portal/admin-dashboard/teachers",
    label: "Manage Teachers",
    Icon: UserCircle,
  },
  {
    href: "/portal/admin-dashboard/admissions",
    label: "Admissions",
    Icon: UserPlus,
  },
  { type: "divider" },
  {
    href: "/portal/admin-dashboard/announcements",
    label: "Announcements",
    Icon: Megaphone,
  },
  {
    href: "/portal/admin-dashboard/materials",
    label: "Study Materials",
    Icon: FolderUp,
  },
  {
    href: "/portal/admin-dashboard/gallery",
    label: "Gallery",
    Icon: ImageIcon,
  },
  // --- ADD THIS LINE FOR ADMINS ---
  {
    href: "/portal/admin-dashboard/events",
    label: "Manage Events",
    Icon: CalendarDays,
  },
  { type: "divider" },
  {
    href: "/portal/admin-dashboard/fees",
    label: "Fee Management",
    Icon: IndianRupee,
  },
  {
    href: "/portal/admin-dashboard/payroll",
    label: "Expenses",
    Icon: Banknote,
  },
  { type: "divider" },
  {
    href: "/portal/admin-dashboard/edit-homepage",
    label: "Edit Homepage",
    Icon: Layout,
  },
  {
    href: "/portal/admin-dashboard/edit-about",
    label: "Edit About Page",
    Icon: PenSquare,
  },
  {
    href: "/portal/admin-dashboard/testimonials",
    label: "Testimonials",
    Icon: MessageCircle,
  },
  { type: "divider" },
  {
    href: "/portal/admin-dashboard/analytics",
    label: "Analytics",
    Icon: BarChart2,
  },
  {
    href: "/portal/admin-dashboard/settings",
    label: "System Settings",
    Icon: Settings,
  },
  {
    href: "/portal/admin-dashboard/logs",
    label: "Activity Logs",
    Icon: GitBranch,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = pathname.startsWith("/portal/admin-dashboard")
    ? adminNavItems
    : pathname.startsWith("/portal/teacher-dashboard")
    ? teacherNavItems
    : studentNavItems;

  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-white/10 bg-dark-navy">
      <div className="flex h-full flex-col p-6">
        <div className="mb-8 px-4">
          <Link href="/">
            <Image
              src="/logo1.svg"
              alt="Brightspark Logo"
              width={200}
              height={40}
              className="w-full h-auto"
            />
          </Link>
        </div>

        <nav className="flex-grow overflow-y-auto pr-2">
          <ul className="space-y-2">
            {navItems.map((item, index) =>
              item.type === "divider" ? (
                <li
                  key={`divider-${index}`}
                  className="pt-2 mt-2 border-t border-white/10"></li>
              ) : (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? "bg-brand-gold text-dark-navy"
                        : "text-slate hover:bg-white/10 hover:text-white"
                    }`}>
                    <item.Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4 shrink-0">
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-9 w-9 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold font-bold shrink-0">
                  {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : user.email.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-slate capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 rounded-md hover:bg-white/10 hover:text-red-400 transition-colors shrink-0"
                title="Sign Out">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
