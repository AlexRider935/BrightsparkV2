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
import {
  AreaChart,
  Area,
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
  School,
  ArrowRight,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import Link from "next/link";
import { startOfMonth, formatDistanceToNow } from "date-fns";

// --- Reusable Components ---
const StatCard = ({ title, value, Icon, prefix = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
    <div className="flex items-center gap-3 mb-2">
      <Icon className="h-5 w-5 text-slate-400" />
      <h3 className="text-md font-medium text-slate">{title}</h3>
    </div>
    <p className="text-3xl font-bold text-light-slate">
      {prefix}
      {value}
    </p>
  </motion.div>
);

const DashboardCard = ({ title, children, className = "" }) => (
  <div
    className={`rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg ${className}`}>
    <h3 className="text-lg font-semibold text-brand-gold mb-4">{title}</h3>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-dark-navy/80 p-3 backdrop-blur-lg shadow-lg">
        <p className="text-sm font-semibold text-light-slate">{label}</p>
        <p className="text-sm text-brand-gold">{`Students: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// --- Full Helper Components (as requested) ---
const EmptyState = ({
  onAction,
  title,
  message,
  buttonText,
  icon: Icon = Users,
}) => (
  <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/10 col-span-full">
    <Icon className="mx-auto h-12 w-12 text-slate-500" />
    <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm text-slate">{message}</p>
    {onAction && buttonText && (
      <button
        onClick={onAction}
        className="mt-6 inline-flex items-center mx-auto gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400">
        <PlusCircle size={18} />
        <span>{buttonText}</span>
      </button>
    )}
  </div>
);

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}>
        <motion.div
          className="relative w-full max-w-md rounded-2xl border border-red-500/30 bg-dark-navy p-6 text-center"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">
            Confirm Deletion
          </h3>
          <p className="mt-2 text-sm text-slate">
            Are you sure you want to delete{" "}
            <span className="font-bold text-light-slate">"{itemName}"</span>?
            This is permanent.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="w-full px-4 py-2 text-sm font-bold rounded-md bg-red-600 text-white hover:bg-red-700">
              Confirm
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const adminName = "Admin";

  useEffect(() => {
    const collections = [
      { q: query(collection(db, "students")), setter: setStudents },
      { q: query(collection(db, "teachers")), setter: setTeachers },
      { q: query(collection(db, "batches")), setter: setBatches },
      { q: query(collection(db, "feeTransactions")), setter: setTransactions },
      {
        q: query(
          collection(db, "activityLogs"),
          orderBy("timestamp", "desc"),
          limit(5)
        ),
        setter: setRecentLogs,
      },
    ];
    const unsubs = collections.map(({ q, setter }) =>
      onSnapshot(q, (snap) =>
        setter(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => d.id !== "--placeholder--")
        )
      )
    );
    setTimeout(() => setLoading(false), 1200);
    return () => unsubs.forEach((unsub) => unsub());
  }, []);

  const dashboardData = useMemo(() => {
    const totalStudents = students.length;
    const totalTeachers = teachers.length;
    const activeBatches = batches.filter((b) => b.status === "Active").length;
    const monthlyRevenue = transactions
      .filter(
        (t) =>
          t.status === "Paid" &&
          t.paymentDate &&
          t.paymentDate.toDate() >= startOfMonth(new Date())
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const studentDistribution = students.reduce((acc, student) => {
      const classLevel = (
        batches.find((b) => b.name === student.batch)?.classLevel ||
        "Unassigned"
      ).replace("Class ", "");
      acc[classLevel] = (acc[classLevel] || 0) + 1;
      return acc;
    }, {});
    const chartData = Object.keys(studentDistribution)
      .map((key) => ({ class: key, students: studentDistribution[key] }))
      .sort((a, b) =>
        a.class.localeCompare(b.class, undefined, { numeric: true })
      );

    return {
      stats: { totalStudents, totalTeachers, activeBatches, monthlyRevenue },
      studentDistribution: chartData,
    };
  }, [students, teachers, batches, transactions]);

  const quickManagementLinks = [
    {
      label: "Add New Student",
      href: "/portal/admin-dashboard/students/new",
      Icon: Users,
    },
    {
      label: "Add New Teacher",
      href: "/portal/admin-dashboard/teachers/new",
      Icon: UserCircle,
    },
    {
      label: "Manage Batches",
      href: "/portal/admin-dashboard/batches",
      Icon: School,
    },
    {
      label: "Fee Management",
      href: "/portal/admin-dashboard/fees",
      Icon: IndianRupee,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  return (
    <main>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-1">
        Admin Dashboard
      </h1>
      <p className="text-base text-slate mb-8">
        Welcome back, <span className="text-brand-gold">{adminName}</span>.
        Here's a real-time overview of the institute.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={dashboardData.stats.totalStudents}
          Icon={Users}
        />
        <StatCard
          title="Total Teachers"
          value={dashboardData.stats.totalTeachers}
          Icon={UserCircle}
        />
        <StatCard
          title="Active Batches"
          value={dashboardData.stats.activeBatches}
          Icon={BookCopy}
        />
        <StatCard
          title="This Month's Revenue"
          value={dashboardData.stats.monthlyRevenue.toLocaleString("en-IN")}
          Icon={IndianRupee}
          prefix="₹"
        />
      </div>
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}>
        <div className="lg:col-span-2">
          <DashboardCard title="Student Distribution by Class">
            <div className="w-full h-[350px]">
              <ResponsiveContainer>
                <AreaChart
                  data={dashboardData.studentDistribution}
                  margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient
                      id="colorStudents"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop offset="5%" stopColor="#ffcc00" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ffcc00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="class"
                    stroke="#8892b0"
                    tick={{ fill: "#8892b0", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#8892b0"
                    tick={{ fill: "#8892b0", fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      stroke: "#ffcc00",
                      strokeWidth: 1,
                      strokeDasharray: "3 3",
                    }}
                  />
                  <Area
                    type="monotone"
                    name="Students"
                    dataKey="students"
                    stroke="#ffcc00"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorStudents)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
        </div>
        <div className="space-y-6">
          <DashboardCard title="Quick Management">
            <div className="space-y-3">
              {quickManagementLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center justify-between p-3 rounded-lg text-slate-300 hover:text-light-slate hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <link.Icon className="h-5 w-5 text-slate-400" />
                    <span className="font-medium">{link.label}</span>
                  </div>
                  <ArrowRight size={16} />
                </Link>
              ))}
            </div>
          </DashboardCard>
          <DashboardCard title="Recent Activity">
            <div className="space-y-3">
              {recentLogs.length > 0 ? (
                recentLogs.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm p-2 border-b border-slate-800/50 last:border-b-0">
                    <p className="text-slate-300 pr-4">{item.action}</p>
                    <p className="text-xs text-slate-500 shrink-0">
                      {item.timestamp
                        ? formatDistanceToNow(item.timestamp.toDate(), {
                            addSuffix: true,
                          })
                        : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  No recent activity.
                </p>
              )}
            </div>
          </DashboardCard>
        </div>
      </motion.div>
    </main>
  );
}
