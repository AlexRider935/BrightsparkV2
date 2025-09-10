// src/app/portal/(app)/admin-dashboard/analytics/page.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { db } from "@/firebase/config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import {
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
  ComposedChart,
  Line,
} from "recharts";
import { Users, IndianRupee, Loader2, BookOpen } from "lucide-react";
import {
  subDays,
  subYears,
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
} from "date-fns";

// --- Reusable Components ---
const StatCard = ({
  title,
  value,
  Icon,
  main = false,
  colorClass = "text-light-slate",
}) => (
  <div
    className={`rounded-2xl border border-white/10 ${
      main ? "bg-slate-800/40" : "bg-slate-900/20"
    } p-6 backdrop-blur-lg`}>
    <div className="flex items-center gap-3 mb-2">
      <Icon className="h-5 w-5 text-slate-400" />
      <h3 className="text-md font-medium text-slate">{title}</h3>
    </div>
    <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
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

const CustomTooltip = ({ active, payload, label, formatters }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-dark-navy/80 p-3 shadow-lg backdrop-blur-lg">
        <p className="text-sm font-semibold text-light-slate">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm" style={{ color: p.color }}>
            {`${p.name}: ${
              formatters?.[p.dataKey] ? formatters[p.dataKey](p.value) : p.value
            }`}
          </p>
        ))}
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

const truncateLegendText = (value) =>
  value.length > 20 ? `${value.substring(0, 18)}...` : value;

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [students, setStudents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubStudents = onSnapshot(
      query(collection(db, "students")),
      (snap) => setStudents(snap.docs.map((d) => ({ ...d.data(), id: d.id })))
    );
    const unsubTransactions = onSnapshot(
      query(collection(db, "feeTransactions"), orderBy("paymentDate", "desc")),
      (snap) =>
        setTransactions(snap.docs.map((d) => ({ ...d.data(), id: d.id })))
    );
    const unsubExpenses = onSnapshot(
      query(collection(db, "expenses"), orderBy("expenseDate", "desc")),
      (snap) => setExpenses(snap.docs.map((d) => ({ ...d.data(), id: d.id })))
    );

    const timeout = setTimeout(() => setLoading(false), 800);
    return () => {
      unsubStudents();
      unsubTransactions();
      unsubExpenses();
      clearTimeout(timeout);
    };
  }, []);

  const financialData = useMemo(() => {
    const now = new Date();
    const startDate =
      timeRange === "7d"
        ? subDays(now, 7)
        : timeRange === "30d"
        ? subDays(now, 30)
        : subYears(now, 1);

    const studentsInRange = students.filter(
      (s) => s.admissionDate && s.admissionDate.toDate() >= startDate
    );
    const transactionsInRange = transactions.filter(
      (t) => t.paymentDate && t.paymentDate.toDate() >= startDate
    );
    const expensesInRange = expenses.filter(
      (e) => e.expenseDate && e.expenseDate.toDate() >= startDate
    );

    const totalRevenue = transactionsInRange.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );
    const totalExpenses = expensesInRange.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    );

    const kpis = {
      totalStudents: students.length,
      newEnrollments: studentsInRange.length,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
    };

    const interval =
      timeRange === "1y"
        ? eachMonthOfInterval({ start: startDate, end: now })
        : eachDayOfInterval({ start: startDate, end: now });
    const dateFormat = timeRange === "1y" ? "MMM yy" : "MMM d";

    const trendData = interval.map((date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      const monthKey = format(date, "yyyy-MM");
      const filter =
        timeRange === "1y"
          ? (item, dateField) =>
              format(item[dateField].toDate(), "yyyy-MM") === monthKey
          : (item, dateField) =>
              format(item[dateField].toDate(), "yyyy-MM-dd") === dateKey;
      const revenue = transactionsInRange
        .filter((t) => filter(t, "paymentDate"))
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = expensesInRange
        .filter((e) => filter(e, "expenseDate"))
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        name: format(date, dateFormat),
        Enrollments: studentsInRange.filter((s) => filter(s, "admissionDate"))
          .length,
        Revenue: revenue,
        Expenses: expense,
        Profit: revenue - expense,
      };
    });

    const batchDistribution = students.reduce((acc, student) => {
      const batchName = student.batch || "Unassigned";
      acc[batchName] = (acc[batchName] || 0) + 1;
      return acc;
    }, {});

    return {
      kpis,
      trendData,
      batchDistribution: Object.keys(batchDistribution).map((name) => ({
        name,
        value: batchDistribution[name],
      })),
    };
  }, [timeRange, students, transactions, expenses]);

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
        Financial Analytics
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Students"
              value={financialData.kpis.totalStudents}
              Icon={Users}
              main={true}
            />
            <StatCard
              title="New Enrollments"
              value={financialData.kpis.newEnrollments}
              Icon={Users}
            />
            <StatCard
              title="Net Profit"
              value={`₹${financialData.kpis.netProfit.toLocaleString("en-IN")}`}
              Icon={IndianRupee}
              colorClass={
                financialData.kpis.netProfit >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <ChartCard title="Enrollment Trend">
                <ResponsiveContainer>
                  <AreaChart
                    data={financialData.trendData}
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
                      content={<CustomTooltip formatters={{}} />}
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
                    <Pie
                      data={financialData.batchDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="35%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}>
                      {financialData.batchDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          stroke={"#000A16"}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
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
              <ChartCard title="Financial Overview">
                <ResponsiveContainer>
                  <ComposedChart
                    data={financialData.trendData}
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
                          formatters={{
                            Revenue: (v) => `₹${v.toLocaleString()}`,
                            Expenses: (v) => `₹${v.toLocaleString()}`,
                            Profit: (v) => `₹${v.toLocaleString()}`,
                          }}
                        />
                      }
                      cursor={{
                        stroke: "#8892b0",
                        strokeWidth: 1,
                        strokeDasharray: "3 3",
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "60px" }} />
                    <Area
                      type="monotone"
                      name="Revenue"
                      dataKey="Revenue"
                      stroke="#22c55e"
                      fill="url(#colorRevenue)"
                    />
                    <Line
                      type="monotone"
                      name="Expenses"
                      dataKey="Expenses"
                      stroke="#ef4444"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      name="Profit"
                      dataKey="Profit"
                      stroke="#3b82f6"
                      strokeWidth={3}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
