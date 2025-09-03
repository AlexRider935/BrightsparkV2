"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BarChart2, Users, IndianRupee, Percent } from "lucide-react";

// --- MOCK DATA ---
const mockAnalytics = {
  kpis: { newEnrollments: 12, totalRevenue: "₹85,500", avgAttendance: "92%" },
  enrollmentTrend: [
    { name: "Week 1", enrollments: 2 },
    { name: "Week 2", enrollments: 5 },
    { name: "Week 3", enrollments: 3 },
    { name: "Week 4", enrollments: 2 },
  ],
  batchDistribution: [
    { name: "Class VI", value: 35, fill: "#ffcc00" }, // brand-gold
    { name: "Class VII", value: 32, fill: "#ffb700" },
    { name: "Class VIII", value: 25, fill: "#ffa200" },
    { name: "Others", value: 60, fill: "#8892b0" }, // slate
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

const ChartCard = ({ title, children }) => (
  <motion.div
    className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}>
    <h3 className="text-lg font-semibold text-brand-gold mb-4">{title}</h3>
    <div style={{ width: "100%", height: 250 }}>{children}</div>
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

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Analytics & Reports
      </h1>
      <p className="text-lg text-slate mb-8">
        An overview of the institute's performance and growth trends.
      </p>

      {/* Date Range Filters */}
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
            {range === "7d" && "Last 7 Days"}
            {range === "30d" && "Last 30 Days"}
            {range === "90d" && "Last 90 Days"}
            {range === "1y" && "Last Year"}
          </button>
        ))}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="New Enrollments"
          value={mockAnalytics.kpis.newEnrollments}
          Icon={Users}
        />
        <StatCard
          title="Total Revenue"
          value={mockAnalytics.kpis.totalRevenue}
          Icon={IndianRupee}
        />
        <StatCard
          title="Average Attendance"
          value={mockAnalytics.kpis.avgAttendance}
          Icon={Percent}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Enrollment Trend (Last 30 Days)">
          <ResponsiveContainer>
            <LineChart
              data={mockAnalytics.enrollmentTrend}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis
                dataKey="name"
                stroke="#8892b0"
                tick={{ fill: "#8892b0", fontSize: 12 }}
              />
              <YAxis
                stroke="#8892b0"
                tick={{ fill: "#8892b0", fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="enrollments"
                stroke="#ffcc00"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Student Distribution by Class">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={mockAnalytics.batchDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }>
                {mockAnalytics.batchDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
