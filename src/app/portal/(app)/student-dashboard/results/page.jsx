"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Award, TrendingUp, Star, Percent } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";

// --- MOCK DATA ---
const mockResultsData = [
  {
    id: 5,
    examType: "Unit Test I",
    subject: "Mathematics VI",
    date: new Date("2025-07-15"),
    score: 38,
    totalMarks: 50,
  },
  {
    id: 6,
    examType: "Unit Test I",
    subject: "Science VI",
    date: new Date("2025-07-17"),
    score: 41,
    totalMarks: 50,
  },
  {
    id: 1,
    examType: "Mid-Term Exam",
    subject: "Mathematics VI",
    date: new Date("2025-08-22"),
    score: 82,
    totalMarks: 100,
  },
  {
    id: 2,
    examType: "Mid-Term Exam",
    subject: "Science VI",
    date: new Date("2025-08-24"),
    score: 75,
    totalMarks: 100,
  },
  {
    id: 3,
    examType: "Unit Test II",
    subject: "Science VI",
    date: new Date("2025-09-01"),
    score: 45,
    totalMarks: 50,
  },
  {
    id: 4,
    examType: "Unit Test II",
    subject: "English VI",
    date: new Date("2025-09-02"),
    score: 18,
    totalMarks: 20,
  },
];

// --- PAGE-SPECIFIC COMPONENTS (Defined only once) ---

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-dark-navy/80 p-3 backdrop-blur-lg">
        <p className="text-sm font-semibold text-light-slate">{`Date: ${format(
          new Date(label),
          "MMM d, yyyy"
        )}`}</p>
        <p className="text-sm text-brand-gold">{`Score: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

const ProgressChart = ({ data }) => (
  <div style={{ width: "100%", height: 250 }}>
    <ResponsiveContainer>
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(136, 146, 176, 0.1)"
        />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => format(new Date(date), "MMM d")}
          stroke="#8892b0"
          tick={{ fill: "#8892b0", fontSize: 12 }}
        />
        <YAxis
          stroke="#8892b0"
          tick={{ fill: "#8892b0", fontSize: 12 }}
          domain={[50, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="percentage"
          stroke="#ffcc00"
          strokeWidth={2}
          dot={{ r: 4, fill: "#ffcc00" }}
          activeDot={{ r: 8, stroke: "rgba(255, 204, 0, 0.2)", strokeWidth: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const StatCard = ({ title, value, Icon }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
    <div className="flex items-center gap-3 mb-2">
      <Icon className="h-5 w-5 text-slate-400" />
      <h3 className="text-md font-medium text-slate">{title}</h3>
    </div>
    <p className="text-3xl font-bold text-light-slate">{value}</p>
  </div>
);

// This is the NEW code
// This is the NEW code
const ResultRow = ({ result }) => {
  const percentage = Math.round((result.score / result.totalMarks) * 100);
  let grade, gradeColor;
  // --- CHANGE: gradeColor now only contains the text color ---
  if (percentage >= 90) { grade = "Excellent"; gradeColor = "text-sky-400"; }
  else if (percentage >= 75) { grade = "Good"; gradeColor = "text-green-400"; }
  else if (percentage >= 60) { grade = "Fair"; gradeColor = "text-yellow-400"; }
  else { grade = "Needs Improvement"; gradeColor = "text-red-400"; }
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-slate-800/50 rounded-lg">
      <div className="mb-4 sm:mb-0">
        <p className="font-semibold text-light-slate">{result.examType}</p>
        <p className="text-xs text-slate">Result Date: {result.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
      </div>
      <div className="flex items-center gap-6 w-full sm:w-auto">
        <div className="flex-grow min-w-40">
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-brand-gold h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            {/* --- CHANGE: Removed padding, background, and rounded classes --- */}
            <span className={`text-sm font-bold ${gradeColor}`}>{grade}</span>
            <span className="text-sm font-medium text-slate">{percentage}%</span>
          </div>
        </div>
        <p className="font-bold text-lg text-white shrink-0">{result.score}/{result.totalMarks}</p>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function ResultsPage() {
  const uniqueSubjects = [
    ...new Set(mockResultsData.map((result) => result.subject)),
  ];
  const [activeTab, setActiveTab] = useState(uniqueSubjects[0]);

  const subjectResults = mockResultsData
    .filter((result) => result.subject === activeTab)
    .sort((a, b) => a.date - b.date);

  const chartData = subjectResults.map((result) => ({
    date: result.date.getTime(),
    percentage: Math.round((result.score / result.totalMarks) * 100),
  }));

  const totalScore = subjectResults.reduce((sum, r) => sum + r.score, 0);
  const totalMarks = subjectResults.reduce((sum, r) => sum + r.totalMarks, 0);
  const averagePercentage =
    totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Results
      </h1>
      <p className="text-lg text-slate mb-8">
        Track your academic performance by subject.
      </p>

      <div className="flex border-b border-slate-700/50 mb-6">
        {uniqueSubjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setActiveTab(subject)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === subject
                ? "border-b-2 border-brand-gold text-brand-gold"
                : "text-slate hover:text-white"
            }`}>
            {subject}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
            <h2 className="text-xl font-semibold text-brand-gold mb-4">
              Performance Timeline
            </h2>
            <ProgressChart data={chartData} />
          </div>
          <div className="flex flex-col gap-6">
            <StatCard
              title="Subject Average"
              value={`${averagePercentage}%`}
              Icon={Percent}
            />
            <StatCard
              title="Exams Taken"
              value={subjectResults.length}
              Icon={TrendingUp}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-brand-gold mb-4">
            All Assessments for {activeTab}
          </h2>
          <div className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg divide-y divide-slate-700/50">
            {subjectResults
              .sort((a, b) => b.date - a.date)
              .map((result) => (
                <ResultRow key={result.id} result={result} />
              ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
