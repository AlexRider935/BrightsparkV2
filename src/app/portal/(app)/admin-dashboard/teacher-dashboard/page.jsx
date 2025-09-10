"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { db } from "@/firebase/config";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext"; // Import the useAuth hook
import {
  Users,
  BookCopy,
  ClipboardCheck,
  Clock,
  PlusCircle,
  ChevronRight,
  Loader2,
  Home,
  UserCheck,
  BookMarked,
  FolderUp,
  UserSquare,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// --- Reusable Components (No changes needed here) ---
const StatCard = ({ title, value, Icon }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
    <div className="flex items-center gap-3 mb-2">
      <Icon className="h-5 w-5 text-slate-400" />
      <h3 className="text-md font-medium text-slate">{title}</h3>
    </div>
    <p className="text-3xl font-bold text-light-slate">{value}</p>
  </div>
);
const DashboardSection = ({ title, children, actionButton }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg h-full flex flex-col">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-brand-gold">{title}</h3>
      {actionButton}
    </div>
    <div className="space-y-3 flex-grow">{children}</div>
  </div>
);

export default function TeacherDashboardPage() {
  // Use the loading state from AuthContext as the primary loader
  const { user, loading: authLoading } = useAuth();

  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // This useEffect now depends on the `user` object.
  // It will only run AFTER the user is confirmed to be logged in.
  useEffect(() => {
    if (user) {
      // <-- THE FIX: Only fetch data if a user exists
      const qStudents = query(collection(db, "students"));
      const unsubStudents = onSnapshot(qStudents, (snap) =>
        setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      );

      const qBatches = query(collection(db, "batches"), orderBy("name"));
      const unsubBatches = onSnapshot(qBatches, (snap) =>
        setBatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      );

      const qAnnouncements = query(
        collection(db, "announcements"),
        orderBy("createdAt", "desc"),
        limit(3)
      );
      const unsubAnnouncements = onSnapshot(qAnnouncements, (snap) =>
        setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      );

      return () => {
        unsubStudents();
        unsubBatches();
        unsubAnnouncements();
      };
    }
  }, [user]); // <-- THE FIX: Add `user` as a dependency

  const dashboardData = useMemo(() => {
    if (!user) return { stats: {}, announcements: [] }; // Return empty data if no user

    const activeBatchesCount = batches.filter(
      (b) => b.status === "Active"
    ).length;
    const totalStudentsCount = students.length;

    const relevantAnnouncements = announcements.filter(
      (ann) => ann.id !== "--placeholder--"
    );

    return {
      stats: {
        activeBatches: activeBatchesCount,
        totalStudents: totalStudentsCount,
      },
      announcements: relevantAnnouncements,
    };
  }, [user, batches, students, announcements]);

  const quickLinks = [
    {
      label: "My Profile",
      href: "/portal/teacher-dashboard/profile",
      Icon: UserSquare,
    },
    {
      label: "Student Roster",
      href: "/portal/teacher-dashboard/students",
      Icon: Users,
    },
    {
      label: "Attendance",
      href: "/portal/teacher-dashboard/attendance",
      Icon: UserCheck,
    },
    {
      label: "Assignments",
      href: "/portal/teacher-dashboard/assignments",
      Icon: ClipboardCheck,
    },
    {
      label: "Gradebook",
      href: "/portal/teacher-dashboard/results",
      Icon: BookMarked,
    },
    {
      label: "Study Material",
      href: "/portal/teacher-dashboard/materials",
      Icon: FolderUp,
    },
  ];

  // Use the loading state from AuthContext
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Teacher Dashboard
      </h1>
      {/* Use the real user's name from the context */}
      <p className="text-lg text-slate mb-8">
        Welcome back,{" "}
        <span className="text-brand-gold">{user?.name || user?.email}</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Batches"
          value={dashboardData.stats.activeBatches}
          Icon={BookCopy}
        />
        <StatCard
          title="Total Students"
          value={dashboardData.stats.totalStudents}
          Icon={Users}
        />
        <StatCard title="Pending Submissions" value={0} Icon={ClipboardCheck} />
        <StatCard title="Upcoming Classes" value={0} Icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
          <DashboardSection title="Quick Links">
            <div className="grid grid-cols-2 gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-3 p-4 rounded-lg text-slate-300 hover:text-light-slate hover:bg-slate-800/50 transition-colors">
                  <link.Icon className="h-6 w-6 text-slate-400" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>
          </DashboardSection>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <DashboardSection
            title="Recent Announcements"
            actionButton={
              <Link
                href="/portal/teacher-dashboard/announcements"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md bg-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-dark-navy transition-colors">
                <PlusCircle size={14} />
                <span>New</span>
              </Link>
            }>
            {dashboardData.announcements.length > 0 ? (
              dashboardData.announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-2 border-b border-slate-800/50 last:border-b-0">
                  <p className="font-medium text-light-slate text-sm truncate">
                    {ann.title}
                  </p>
                  <p className="text-xs text-slate">
                    {ann.createdAt
                      ? formatDistanceToNow(ann.createdAt.toDate(), {
                          addSuffix: true,
                        })
                      : ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate text-center py-4">
                No recent announcements.
              </p>
            )}
          </DashboardSection>

          <DashboardSection title="All Batches">
            {batches.length > 0 ? (
              batches.map((batch) => (
                <Link
                  key={batch.id}
                  href="/portal/teacher-dashboard/students"
                  className="flex items-center justify-between p-3 rounded-lg text-slate hover:text-light-slate hover:bg-slate-800/50">
                  <span className="font-medium">{batch.name}</span>
                  <ChevronRight size={16} />
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate text-center py-4">
                No batches found.
              </p>
            )}
          </DashboardSection>
        </motion.div>
      </div>
    </div>
  );
}
