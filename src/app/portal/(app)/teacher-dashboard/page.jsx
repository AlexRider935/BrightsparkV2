"use client";

import { motion } from "framer-motion";
import {
  Users,
  BookCopy,
  ClipboardCheck,
  Clock,
  Megaphone,
  PlusCircle,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// --- MOCK DATA FOR TEACHER DASHBOARD ---
const mockTeacherData = {
  name: "Mr. Sharma",
  stats: {
    activeCourses: 3,
    totalStudents: 45,
    pendingSubmissions: 5,
  },
  upcomingClasses: [
    { id: "c1", course: "Mathematics VI", time: "4:00 PM Today" },
    { id: "c2", course: "Physics VII", time: "5:00 PM Today" },
    { id: "c3", course: "Mathematics VI", time: "4:00 PM Tomorrow" },
  ],
  needsAttention: [
    {
      id: "a1",
      type: "Grading",
      description: 'Grade 5 submissions for "Algebra Problems"',
    },
    {
      id: "h1",
      type: "Review",
      description: 'Review homework for "Science VI"',
    },
    {
      id: "m1",
      type: "Message",
      description: "New message from Alex Rider's parent",
    },
  ],
  myCourses: [
    { id: "math_vi", title: "Mathematics VI" },
    { id: "physics_vii", title: "Physics VII" },
    { id: "chem_vii", title: "Chemistry VII" },
  ],
};

// --- Reusable Components ---
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
  <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-brand-gold">{title}</h3>
      {actionButton}
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

export default function TeacherDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Teacher Dashboard
      </h1>
      <p className="text-lg text-slate mb-8">
        Welcome back,{" "}
        <span className="text-brand-gold">{mockTeacherData.name}</span>
      </p>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Active Courses"
          value={mockTeacherData.stats.activeCourses}
          Icon={BookCopy}
        />
        <StatCard
          title="Total Students"
          value={mockTeacherData.stats.totalStudents}
          Icon={Users}
        />
        <StatCard
          title="Pending Submissions"
          value={mockTeacherData.stats.pendingSubmissions}
          Icon={ClipboardCheck}
        />
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Content) */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <DashboardSection title="Needs Your Attention">
            {mockTeacherData.needsAttention.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50">
                <div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-500/20 text-slate-300">
                    {item.type}
                  </span>
                  <p className="font-medium text-light-slate mt-1">
                    {item.description}
                  </p>
                </div>
                <button className="text-xs font-semibold text-brand-gold hover:underline">
                  View
                </button>
              </div>
            ))}
          </DashboardSection>

          <DashboardSection title="Upcoming Classes">
            {mockTeacherData.upcomingClasses.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800/50">
                <div className="bg-dark-navy p-2 rounded-lg border border-white/10">
                  <Clock className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-light-slate">{item.course}</p>
                  <p className="text-sm text-slate">{item.time}</p>
                </div>
              </div>
            ))}
          </DashboardSection>
        </motion.div>

        {/* Right Column (Quick Actions) */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}>
          <DashboardSection
            title="Announcements"
            actionButton={
              <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md bg-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-dark-navy transition-colors">
                <PlusCircle size={14} />
                <span>New</span>
              </button>
            }>
            <p className="text-sm text-slate text-center py-4">
              No recent announcements posted.
            </p>
          </DashboardSection>

          <DashboardSection title="My Courses">
            {mockTeacherData.myCourses.map((course) => (
              <Link
                key={course.id}
                href={`/portal/teacher-courses/${course.id}`}
                className="flex items-center justify-between p-3 rounded-lg text-slate hover:text-light-slate hover:bg-slate-800/50">
                <span className="font-medium">{course.title}</span>
                <ChevronRight size={16} />
              </Link>
            ))}
          </DashboardSection>
        </motion.div>
      </div>
    </div>
  );
}
