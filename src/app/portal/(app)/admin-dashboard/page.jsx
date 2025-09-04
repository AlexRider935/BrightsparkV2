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
  School,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { startOfMonth, endOfMonth, formatDistanceToNow } from "date-fns";

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
        <YAxis
          stroke="#8892b0"
          tick={{ fill: "#8892b0", fontSize: 12 }}
          allowDecimals={false}
        />
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
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const adminName = "Admin"; // This can be replaced with auth user name later

  useEffect(() => {
    const collectionsToFetch = [
      { setter: setStudents, q: query(collection(db, "students")) },
      { setter: setTeachers, q: query(collection(db, "teachers")) },
      { setter: setBatches, q: query(collection(db, "batches")) },
      { setter: setTransactions, q: query(collection(db, "feeTransactions")) },
      {
        setter: setRecentLogs,
        q: query(
          collection(db, "activityLogs"),
          orderBy("timestamp", "desc"),
          limit(5)
        ),
      },
    ];

    const unsubs = collectionsToFetch.map(({ q, setter }) =>
      onSnapshot(q, (snapshot) => {
        setter(
          snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((doc) => doc.id !== "--placeholder--")
        );
      })
    );

    setTimeout(() => setLoading(false), 1500);

    return () => unsubs.forEach((unsub) => unsub());
  }, []);

  const dashboardData = useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(today);

    const totalStudents = students.length;
    const totalTeachers = teachers.length;
    const activeBatches = batches.filter((b) => b.status === "Active").length;
    const monthlyRevenue = transactions
      .filter(
        (t) =>
          t.status === "Paid" &&
          t.paymentDate &&
          t.paymentDate.toDate() >= monthStart
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const studentDistribution = students.reduce((acc, student) => {
      const batch = batches.find((b) => b.name === student.batch);
      const classLevel = batch?.classLevel || "Unassigned";
      acc[classLevel] = (acc[classLevel] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.keys(studentDistribution)
      .map((key) => ({
        class: key.replace("Class ", ""),
        students: studentDistribution[key],
      }))
      .sort((a, b) => a.class.localeCompare(b.class));

    return {
      stats: { totalStudents, totalTeachers, activeBatches, monthlyRevenue },
      studentDistribution: chartData,
    };
  }, [students, teachers, batches, transactions]);

  const quickManagementLinks = [
    {
      label: "Manage Batches",
      href: "/portal/admin-dashboard/batches",
      Icon: School,
    },
    {
      label: "Manage Students",
      href: "/portal/admin-dashboard/students",
      Icon: Users,
    },
    {
      label: "Manage Teachers",
      href: "/portal/admin-dashboard/teachers",
      Icon: UserCircle,
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
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Admin Dashboard
      </h1>
      <p className="text-lg text-slate mb-8">
        Welcome back, <span className="text-brand-gold">{adminName}</span>.
        Here's a real-time overview of the institute.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
            <h3 className="text-lg font-semibold text-brand-gold mb-4">
              Student Distribution
            </h3>
            <AdminChart data={dashboardData.studentDistribution} />
          </div>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
            <h3 className="text-lg font-semibold text-brand-gold mb-4">
              Quick Management
            </h3>
            <div className="space-y-3">
              {quickManagementLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center justify-between p-3 rounded-lg text-slate hover:text-light-slate hover:bg-slate-800/50 transition-colors">
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
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentLogs.length > 0 ? (
                recentLogs.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm p-2 border-b border-slate-800/50 last:border-b-0">
                    <p className="text-slate-300 pr-4">{item.action}</p>
                    <p className="text-xs text-slate shrink-0">
                      {item.timestamp
                        ? formatDistanceToNow(item.timestamp.toDate(), {
                            addSuffix: true,
                          })
                        : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate text-center py-4">
                  No recent activity to display.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
