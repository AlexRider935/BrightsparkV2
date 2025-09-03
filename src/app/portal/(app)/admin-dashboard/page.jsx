"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  UserCircle,
  BookCopy,
  IndianRupee,
  Activity,
  School,
  ClipboardCheck,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// --- MOCK DATA FOR ADMIN DASHBOARD ---
const mockAdminData = {
  stats: {
    totalStudents: 152,
    totalTeachers: 12,
    activeBatches: 8,
    monthlyRevenue: "1,50,000",
  },
  recentActivity: [
    {
      id: 1,
      text: "New student 'Priya Singh' enrolled in Class VII.",
      time: "2h ago",
    },
    {
      id: 2,
      text: "Mr. Sharma posted a new assignment for Mathematics VI.",
      time: "5h ago",
    },
    {
      id: 3,
      text: "Payment of ₹5,000 received from Alex Rider.",
      time: "8h ago",
    },
    {
      id: 4,
      text: "Mrs. Gupta updated the Science VI study materials.",
      time: "Yesterday",
    },
  ],
  atAGlance: {
    pendingSubmissions: 15,
    unreadMessages: 3,
  },
  studentDistribution: [
    { class: "IV", students: 15 },
    { class: "V", students: 20 },
    { class: "VI", students: 35 },
    { class: "VII", students: 32 },
    { class: "VIII", students: 25 },
    { class: "IX", students: 15 },
    { class: "X", students: 10 },
  ],
};

// --- Reusable Components ---
const StatCard = ({ title, value, Icon, prefix = "" }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
    <div className="flex items-center gap-3 mb-2">
      <Icon className="h-5 w-5 text-slate-400" />
      <h3 className="text-md font-medium text-slate">{title}</h3>
    </div>
    <p className="text-3xl font-bold text-light-slate">
      {prefix}
      {value}
    </p>
  </div>
);

const AdminChart = ({ data }) => (
  <div style={{ width: "100%", height: 300 }}>
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
        <XAxis
          dataKey="class"
          stroke="#8892b0"
          tick={{ fill: "#8892b0", fontSize: 12 }}
        />
        <YAxis stroke="#8892b0" tick={{ fill: "#8892b0", fontSize: 12 }} />
        <Tooltip
          cursor={{ fill: "rgba(136, 146, 176, 0.1)" }}
          contentStyle={{
            background: "rgba(0, 10, 22, 0.8)",
            borderColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(4px)",
            borderRadius: "0.75rem",
          }}
        />
        <Bar
          dataKey="students"
          fill="rgba(255, 204, 0, 0.6)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default function AdminDashboardPage() {
  const adminName = "Admin";

  // --- NEW: Links now match the admin sidebar for consistency ---
  const quickManagementLinks = [
    {
      label: "Manage Batches",
      href: "/portal/admin-dashboard/academics/batches",
      Icon: School,
    },
    {
      label: "Manage Students",
      href: "/portal/admin-dashboard/users/students",
      Icon: Users,
    },
    {
      label: "Manage Teachers",
      href: "/portal/admin-dashboard/users/teachers",
      Icon: UserCircle,
    },
    {
      label: "Fee Management",
      href: "/portal/admin-dashboard/financials/fees",
      Icon: IndianRupee,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Admin Dashboard
      </h1>
      <p className="text-lg text-slate mb-8">
        Welcome back, <span className="text-brand-gold">{adminName}</span>.
        Here's an overview of the institute.
      </p>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={mockAdminData.stats.totalStudents}
          Icon={Users}
        />
        <StatCard
          title="Total Teachers"
          value={mockAdminData.stats.totalTeachers}
          Icon={UserCircle}
        />
        <StatCard
          title="Active Batches"
          value={mockAdminData.stats.activeBatches}
          Icon={BookCopy}
        />
        <StatCard
          title="This Month's Revenue"
          value={mockAdminData.stats.monthlyRevenue}
          Icon={IndianRupee}
          prefix="₹"
        />
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
            <h3 className="text-lg font-semibold text-brand-gold mb-4">
              Student Distribution by Class
            </h3>
            <AdminChart data={mockAdminData.studentDistribution} />
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
            <h3 className="text-lg font-semibold text-brand-gold mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {mockAdminData.recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-sm p-2">
                  <p className="text-slate-300">{item.text}</p>
                  <p className="text-xs text-slate shrink-0 ml-4">
                    {item.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
            <h3 className="text-lg font-semibold text-brand-gold mb-4">
              Quick Management
            </h3>
            <div className="space-y-3">
              {/* --- UPDATED LINKS --- */}
              {quickManagementLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center justify-between p-3 rounded-lg text-slate hover:text-light-slate hover:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <link.Icon className="h-5 w-5 text-slate-400" />
                    <span className="font-medium">{link.label}</span>
                  </div>
                  <ArrowRight size={16} />
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
            <h3 className="text-lg font-semibold text-brand-gold mb-4">
              At a Glance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5 text-slate-400" />
                <p>
                  <span className="font-bold text-light-slate">
                    {mockAdminData.atAGlance.pendingSubmissions}
                  </span>{" "}
                  assignments need grading.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-slate-400" />
                <p>
                  <span className="font-bold text-light-slate">
                    {mockAdminData.atAGlance.unreadMessages}
                  </span>{" "}
                  unread support messages.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
