"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
// --- ICONS IMPORTED ---
import {
  LayoutDashboard,
  BookOpen,
  User,
  Settings,
  LogOut,
  ClipboardCheck,
  Megaphone,
  CalendarDays,
  ClipboardList,
  CheckSquare,
  Award,
  CreditCard,
  UserCheck,
  ImageIcon,
  Phone,Users,BookMarked,FolderUp,MessageSquare,Upload
} from "lucide-react";

// --- STUDENT NAV ITEMS UPDATED ---
const studentNavItems = [
  {
    href: "/portal/student-dashboard",
    label: "Dashboard",
    Icon: LayoutDashboard,
  },
  {
    href: "/portal/student-dashboard/announcements",
    label: "Announcements",
    Icon: Megaphone,
  },
  {
    href: "/portal/student-dashboard/courses",
    label: "My Courses",
    Icon: BookOpen,
  },
  {
    href: "/portal/student-dashboard/homework",
    label: "Homework",
    Icon: CheckSquare,
  },
  {
    href: "/portal/student-dashboard/assignments",
    label: "Assignments",
    Icon: ClipboardList,
  },
  { href: "/portal/student-dashboard/results", label: "Results", Icon: Award },
  {
    href: "/portal/student-dashboard/attendance",
    label: "Attendance",
    Icon: UserCheck,
  },
  {
    href: "/portal/student-dashboard/events",
    label: "Events",
    Icon: CalendarDays,
  },
  {
    href: "/portal/student-dashboard/payments",
    label: "Payments",
    Icon: CreditCard,
  },
  {
    href: "/portal/student-dashboard/gallery",
    label: "Gallery",
    Icon: ImageIcon,
  },
  { type: "divider" }, // Divider separates main app from user settings
  { href: "/portal/student-dashboard/profile", label: "Profile", Icon: User },
  {
    href: "/portal/student-dashboard/settings",
    label: "Settings",
    Icon: Settings,
  },
  {
    // --- NEW ITEM ADDED HERE ---
    href: "/portal/student-dashboard/contact",
    label: "Contact Us",
    Icon: Phone,
  },
];

// Teacher nav items are unchanged for now
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
    Icon: ClipboardCheck,
  },
  {
    href: "/portal/teacher-dashboard/results",
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
    Icon: Upload,
  },
  { type: "divider" },
  { href: "/portal/teacher-dashboard/profile", label: "Profile", Icon: User },
  {
    href: "/portal/teacher-dashboard/settings",
    label: "Settings",
    Icon: Settings,
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = user?.role === "teacher" ? teacherNavItems : studentNavItems;

  return (
    <aside className="sticky top-0 h-screen w-64 flex-shrink-0 border-r border-white/10 bg-dark-navy/50 p-6 backdrop-blur-lg">
      <div className="flex h-full flex-col">
        <div className="mb-8">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Brightspark Logo"
              width={160}
              height={32}
            />
          </Link>
        </div>
        <nav className="flex-grow">
          <ul className="space-y-2">
            {/* --- MAPPING LOGIC UPDATED TO HANDLE DIVIDER --- */}
            {navItems.map((item) =>
              item.type === "divider" ? (
                <li
                  key="divider"
                  className="pt-2 mt-2 border-t border-white/10"></li>
              ) : (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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
        <div className="mt-auto border-t border-white/10 pt-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold font-bold">
                {user.displayName
                  ? user.displayName.charAt(0).toUpperCase()
                  : user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {user.displayName || user.email}
                </p>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-xs text-slate hover:text-brand-gold">
                  <LogOut className="h-3 w-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
