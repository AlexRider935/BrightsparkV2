"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { db } from "@/firebase/config";
import { collection, onSnapshot, query, Timestamp } from "firebase/firestore";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users, IndianRupee, Percent, Loader2 } from "lucide-react";
import {
  subDays,
  startOfDay,
  endOfDay,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

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

const ChartCard = ({ title, children }) => (
  <motion.div
    className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg h-[350px]"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}>
    <h3 className="text-lg font-semibold text-brand-gold mb-4">{title}</h3>
    {children}
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-dark-navy/80 p-3 backdrop-blur-lg">
        <p className="text-sm font-semibold text-light-slate">{label}</p>
        <p className="text-sm text-brand-gold">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const PIE_COLORS = [
  "#ffcc00",
  "#ffb700",
  "#ffa200",
  "#ff8c00",
  "#8892b0",
  "#64748b",
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [students, setStudents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubStudents = onSnapshot(
      query(collection(db, "students")),
      (snap) => {
        setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );
    const unsubTransactions = onSnapshot(
      query(collection(db, "feeTransactions")),
      (snap) => {
        setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    // Let both fetches complete
    Promise.all([unsubStudents, unsubTransactions]).then(() => {
      setTimeout(() => setLoading(false), 500); // Small delay to prevent flash of content
    });

    return () => {
      unsubStudents();
      unsubTransactions();
    };
  }, []);

  const analyticsData = useMemo(() => {
    const now = new Date();
    let startDate;
    if (timeRange === "7d") startDate = subDays(now, 7);
    if (timeRange === "30d") startDate = subDays(now, 30);
    if (timeRange === "90d") startDate = subDays(now, 90);
    if (timeRange === "1y") startDate = subDays(now, 365);

    // --- KPI Calculations ---
    const newEnrollments = students.filter(
      (s) => s.admissionDate && s.admissionDate.toDate() >= startDate
    ).length;
    const totalRevenue = transactions
      .filter(
        (t) =>
          t.status === "Paid" &&
          t.paymentDate &&
          t.paymentDate.toDate() >= startDate
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // --- Enrollment Trend Chart ---
    const enrolledInRange = students.filter(
      (s) => s.admissionDate && s.admissionDate.toDate() >= startDate
    );
    let enrollmentTrend = [];
    if (timeRange === "7d" || timeRange === "30d") {
      const days = eachDayOfInterval({ start: startDate, end: now });
      enrollmentTrend = days.map((day) => ({
        name: format(day, "MMM d"),
        enrollments: enrolledInRange.filter(
          (s) =>
            format(s.admissionDate.toDate(), "yyyy-MM-dd") ===
            format(day, "yyyy-MM-dd")
        ).length,
      }));
    } else if (timeRange === "90d") {
      const weeks = eachWeekOfInterval({ start: startDate, end: now });
      enrollmentTrend = weeks.map((week) => ({
        name: `Wk ${format(week, "w")}`,
        enrollments: enrolledInRange.filter(
          (s) =>
            s.admissionDate.toDate() >= startOfWeek(week) &&
            s.admissionDate.toDate() <= endOfWeek(week)
        ).length,
      }));
    } else if (timeRange === "1y") {
      const months = eachMonthOfInterval({ start: startDate, end: now });
      enrollmentTrend = months.map((month) => ({
        name: format(month, "MMM yy"),
        enrollments: enrolledInRange.filter(
          (s) =>
            s.admissionDate.toDate() >= startOfMonth(month) &&
            s.admissionDate.toDate() <= endOfMonth(month)
        ).length,
      }));
    }

    // --- Batch Distribution Chart ---
    const batchCounts = students.reduce((acc, student) => {
      const batchName = student.batch || "Unassigned";
      acc[batchName] = (acc[batchName] || 0) + 1;
      return acc;
    }, {});
    const batchDistribution = Object.keys(batchCounts).map((name, index) => ({
      name,
      value: batchCounts[name],
      fill: PIE_COLORS[index % PIE_COLORS.length],
    }));

    return {
      kpis: { newEnrollments, totalRevenue, avgAttendance: "92%" }, // Attendance is a placeholder
      enrollmentTrend,
      batchDistribution,
    };
  }, [timeRange, students, transactions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Analytics & Reports
      </h1>
      <p className="text-lg text-slate mb-8">
        An overview of the institute's performance and growth trends.
      </p>

      <div className="flex items-center gap-2 mb-8">
        {["7d", "30d", "90d", "1y"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
              timeRange === range
                ? "bg-brand-gold text-dark-navy"
                : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
            }`}>
            {range === "7d" && "Last 7 Days"}{" "}
            {range === "30d" && "Last 30 Days"}
            {range === "90d" && "Last 90 Days"} {range === "1y" && "Last Year"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="New Enrollments"
          value={analyticsData.kpis.newEnrollments}
          Icon={Users}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${analyticsData.kpis.totalRevenue.toLocaleString("en-IN")}`}
          Icon={IndianRupee}
        />
        <StatCard
          title="Average Attendance"
          value={analyticsData.kpis.avgAttendance}
          Icon={Percent}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={`Enrollment Trend (${timeRange})`}>
          <ResponsiveContainer>
            <LineChart
              data={analyticsData.enrollmentTrend}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis
                dataKey="name"
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
              <Line
                type="monotone"
                name="Enrollments"
                dataKey="enrollments"
                stroke="#ffcc00"
                strokeWidth={2}
                dot={{ r: 4, fill: "#ffcc00" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Student Distribution by Batch">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={analyticsData.batchDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }>
                {analyticsData.batchDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    stroke={entry.fill}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
