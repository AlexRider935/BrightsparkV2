"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  User,
  Settings,
  LogOut,
  ClipboardCheck,
} from "lucide-react";

const studentNavItems = [
  {
    href: "/portal/student-dashboard",
    label: "Dashboard",
    Icon: LayoutDashboard,
  },
  { href: "/portal/courses", label: "My Courses", Icon: BookOpen },
  { href: "/portal/profile", label: "Profile", Icon: User },
  { href: "/portal/settings", label: "Settings", Icon: Settings },
];

const teacherNavItems = [
  {
    href: "/portal/teacher-dashboard",
    label: "Dashboard",
    Icon: LayoutDashboard,
  },
  {
    href: "/portal/teacher-courses",
    label: "My Courses",
    Icon: ClipboardCheck,
  },
  { href: "/portal/profile", label: "Profile", Icon: User },
  { href: "/portal/settings", label: "Settings", Icon: Settings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Determine which navigation items to display based on user role
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
            {navItems.map((item) => (
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
            ))}
          </ul>
        </nav>
        <div className="mt-auto border-t border-white/10 pt-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold font-bold">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-white">{user.email}</p>
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
