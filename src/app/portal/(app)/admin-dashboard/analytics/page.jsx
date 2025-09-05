"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/firebase/config";
import { collection, onSnapshot, query } from "firebase/firestore";
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
  Area,
  AreaChart,
} from "recharts";
import { Users, IndianRupee, Percent, Loader2, BookOpen } from "lucide-react";
import {
  subDays,
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
} from "date-fns";

// --- Reusable Components ---
const StatCard = ({ title, value, Icon, main = false }) => (
  <div
    className={`rounded-2xl border border-white/10 ${
      main ? "bg-slate-800/40" : "bg-slate-900/20"
    } p-6 backdrop-blur-lg`}>
    <div className="flex items-center gap-3 mb-2">
      <Icon className="h-5 w-5 text-slate-400" />
      <h3 className="text-md font-medium text-slate">{title}</h3>
    </div>
    <p className="text-3xl font-bold text-light-slate">{value}</p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <motion.div
    className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg h-[400px]"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}>
    <h3 className="text-lg font-semibold text-brand-gold mb-4">{title}</h3>
    {children}
  </motion.div>
);

const CustomTooltip = ({ active, payload, label, valueFormatter }) => {
  if (active && payload && payload.length) {
    const value = valueFormatter
      ? valueFormatter(payload[0].value)
      : payload[0].value;
    return (
      <div className="rounded-lg border border-white/10 bg-dark-navy/80 p-3 shadow-lg backdrop-blur-lg">
        <p className="text-sm font-semibold text-light-slate">{label}</p>
        <p className="text-sm text-brand-gold">{`${payload[0].name}: ${value}`}</p>
      </div>
    );
  }
  return null;
};

const EmptyState = () => (
  <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/10 col-span-full">
    <BookOpen className="mx-auto h-12 w-12 text-slate-500" />
    <h3 className="mt-4 text-xl font-semibold text-white">Not Enough Data</h3>
    <p className="mt-2 text-sm text-slate">
      Analytics will be shown here once you have more student and fee records.
    </p>
  </div>
);

const PIE_COLORS = [
  "#ffcc00",
  "#ffb700",
  "#ffa200",
  "#ff8c00",
  "#8892b0",
  "#64748b",
];

const truncateLegendText = (value) => {
  return value.length > 20 ? `${value.substring(0, 18)}...` : value;
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [students, setStudents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubStudents = onSnapshot(
      query(collection(db, "students")),
      (snap) => setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubTransactions = onSnapshot(
      query(collection(db, "feeTransactions")),
      (snap) =>
        setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const timeout = setTimeout(() => setLoading(false), 700);
    return () => {
      unsubStudents();
      unsubTransactions();
      clearTimeout(timeout);
    };
  }, []);

  const analyticsData = useMemo(() => {
    const now = new Date();
    let startDate;
    if (timeRange === "7d") startDate = subDays(now, 7);
    if (timeRange === "30d") startDate = subDays(now, 30);
    if (timeRange === "1y") startDate = subDays(now, 365);

    const studentsInRange = students.filter(
      (s) => s.admissionDate && s.admissionDate.toDate() >= startDate
    );
    const paidTransactionsInRange = transactions.filter(
      (t) =>
        t.status === "Paid" &&
        t.paymentDate &&
        t.paymentDate.toDate() >= startDate
    );

    const newEnrollments = studentsInRange.length;
    const totalRevenue = paidTransactionsInRange.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );

    let interval = eachDayOfInterval({ start: startDate, end: now });
    let dateFormat = "MMM d";
    if (timeRange === "1y") {
      interval = eachMonthOfInterval({ start: startDate, end: now });
      dateFormat = "MMM yy";
    }

    const enrollmentTrend = interval.map((date) => ({
      name: format(date, dateFormat),
      Enrollments: studentsInRange.filter(
        (s) =>
          format(s.admissionDate.toDate(), "yyyy-MM-dd") ===
            format(date, "yyyy-MM-dd") ||
          (timeRange === "1y" &&
            s.admissionDate.toDate() >= startOfMonth(date) &&
            s.admissionDate.toDate() <= endOfMonth(date))
      ).length,
    }));

    const revenueTrend = interval.map((date) => ({
      name: format(date, dateFormat),
      Revenue: paidTransactionsInRange
        .filter(
          (t) =>
            format(t.paymentDate.toDate(), "yyyy-MM-dd") ===
              format(date, "yyyy-MM-dd") ||
            (timeRange === "1y" &&
              t.paymentDate.toDate() >= startOfMonth(date) &&
              t.paymentDate.toDate() <= endOfMonth(date))
        )
        .reduce((sum, t) => sum + Number(t.amount), 0),
    }));

    const batchCounts = students.reduce((acc, student) => {
      const batchName = student.batch || "Unassigned";
      acc[batchName] = (acc[batchName] || 0) + 1;
      return acc;
    }, {});
    const batchDistribution = Object.keys(batchCounts).map((name) => ({
      name,
      value: batchCounts[name],
    }));

    return {
      kpis: { totalStudents: students.length, newEnrollments, totalRevenue },
      enrollmentTrend,
      revenueTrend,
      batchDistribution,
    };
  }, [timeRange, students, transactions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  return (
    <main>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-1">
        Analytics & Reports
      </h1>
      <p className="text-base text-slate mb-8">
        An overview of the institute's performance and growth trends.
      </p>

      {students.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="flex items-center gap-2 mb-8 border-b border-slate-800 pb-4">
            {[
              { val: "7d", label: "7 Days" },
              { val: "30d", label: "30 Days" },
              { val: "1y", label: "1 Year" },
            ].map((range) => (
              <button
                key={range.val}
                onClick={() => setTimeRange(range.val)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                  timeRange === range.val
                    ? "bg-brand-gold text-dark-navy"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
                }`}>
                {range.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Students"
              value={analyticsData.kpis.totalStudents}
              Icon={Users}
              main={true}
            />
            <StatCard
              title="New Enrollments"
              value={analyticsData.kpis.newEnrollments}
              Icon={Users}
            />
            <StatCard
              title="Total Revenue"
              value={`₹${analyticsData.kpis.totalRevenue.toLocaleString(
                "en-IN"
              )}`}
              Icon={IndianRupee}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <ChartCard title="Enrollment Trend">
                {/* CHANGED: Increased bottom margin for more vertical space and adjusted others. */}
                <ResponsiveContainer>
                  <AreaChart
                    data={analyticsData.enrollmentTrend}
                    margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                    <defs>
                      <linearGradient
                        id="colorEnroll"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1">
                        <stop
                          offset="5%"
                          stopColor="#ffcc00"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ffcc00"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    {/* CHANGED: Added dy to push text further down from the axis line. */}
                    <XAxis
                      dataKey="name"
                      stroke="#8892b0"
                      tick={{ fill: "#8892b0", fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      dy={10}
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
                      name="Enrollments"
                      dataKey="Enrollments"
                      stroke="#ffcc00"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorEnroll)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
            <div className="lg:col-span-2">
              <ChartCard title="Student Distribution by Batch">
                <ResponsiveContainer>
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    {/* CHANGED: Moved pie center further left (cx="35%") for a wider gap. */}
                    <Pie
                      data={analyticsData.batchDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="35%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      isAnimationActive={true}>
                      {analyticsData.batchDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          stroke={"#000A16"}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    {/* CHANGED: Added paddingLeft and increased lineHeight for more spacing. */}
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{
                        fontSize: "12px",
                        lineHeight: "2",
                        paddingLeft: "20px",
                      }}
                      formatter={truncateLegendText}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
            <div className="lg:col-span-5">
              <ChartCard title="Revenue Trend">
                {/* CHANGED: Increased bottom margin for more vertical space and adjusted others. */}
                <ResponsiveContainer>
                  <AreaChart
                    data={analyticsData.revenueTrend}
                    margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1">
                        <stop
                          offset="5%"
                          stopColor="#22c55e"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#22c55e"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    {/* CHANGED: Added dy to push text further down from the axis line. */}
                    <XAxis
                      dataKey="name"
                      stroke="#8892b0"
                      tick={{ fill: "#8892b0", fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      dy={10}
                    />
                    <YAxis
                      stroke="#8892b0"
                      tick={{ fill: "#8892b0", fontSize: 12 }}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <Tooltip
                      content={
                        <CustomTooltip
                          valueFormatter={(value) =>
                            `₹${value.toLocaleString("en-IN")}`
                          }
                        />
                      }
                      cursor={{
                        stroke: "#22c55e",
                        strokeWidth: 1,
                        strokeDasharray: "3 3",
                      }}
                    />
                    <Area
                      type="monotone"
                      name="Revenue"
                      dataKey="Revenue"
                      stroke="#22c55e"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
