"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs, query } from "firebase/firestore";
import {
  Award,
  TrendingUp,
  Percent,
  Loader2,
  AlertTriangle,
  BookMarked,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";

// --- PAGE-SPECIFIC COMPONENTS ---

// --- FIX: The tooltip is now smarter and shows the exam title ---
// --- REPLACE THIS COMPONENT ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Access the full data point from the payload
    const dataPoint = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-700 bg-dark-navy/90 p-3 shadow-lg backdrop-blur-sm">
        <p className="text-sm font-bold text-light-slate">{dataPoint.examType}</p>
        <p className="text-xs text-slate">{`Date: ${format(new Date(dataPoint.date), "MMM d, yyyy")}`}</p>
        <p className="text-sm text-brand-gold mt-1">{`Score: ${dataPoint.percentage}%`}</p>
      </div>
    );
  }
  return null;
};

// --- REPLACE THIS COMPONENT ---
const ProgressChart = ({ data, average }) => (
  <div style={{ width: "100%", height: 250 }}>
    <ResponsiveContainer>
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(136, 146, 176, 0.1)" />
        {/* --- THIS IS THE FIX: Use examType for the X-axis --- */}
        <XAxis dataKey="examType" stroke="#8892b0" tick={{ fill: "#8892b0", fontSize: 10 }} interval={0} />
        <YAxis stroke="#8892b0" tick={{ fill: "#8892b0", fontSize: 12 }} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={average} label={{ value: 'Avg', position: 'insideTopLeft', fill: '#8892b0', fontSize: 12 }} stroke="#8892b0" strokeDasharray="4 4" />
        <Line type="monotone" dataKey="percentage" stroke="#ffcc00" strokeWidth={2} dot={{ r: 4, fill: "#ffcc00" }} activeDot={{ r: 8, stroke: "rgba(255, 204, 0, 0.2)", strokeWidth: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const StatCard = ({ title, value, Icon }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6">
    <div className="flex items-center gap-4">
      <Icon className="h-7 w-7 text-slate-400" />
      <div>
        <h3 className="text-md font-medium text-slate">{title}</h3>
        <p className="text-2xl font-bold text-light-slate">{value}</p>
      </div>
    </div>
  </div>
);

const ResultRow = ({ result }) => {
  const percentage = Math.round((result.score / result.totalMarks) * 100);
  let grade, gradeColor;
  if (percentage >= 90) {
    grade = "Excellent";
    gradeColor = "text-sky-400";
  } else if (percentage >= 75) {
    grade = "Good";
    gradeColor = "text-green-400";
  } else if (percentage >= 60) {
    grade = "Fair";
    gradeColor = "text-yellow-400";
  } else {
    grade = "Needs Improvement";
    gradeColor = "text-red-400";
  }
  return (
    <div className="grid grid-cols-12 gap-4 items-center p-4">
      <div className="col-span-12 md:col-span-5">
        <p className="font-semibold text-light-slate">{result.examType}</p>
        <p className="text-xs text-slate">
          Date: {format(result.date, "MMMM d, yyyy")}
        </p>
      </div>
      <div className="col-span-6 md:col-span-3">
        <p className={`font-bold ${gradeColor}`}>{grade}</p>
      </div>
      <div className="col-span-6 md:col-span-2 text-left md:text-center">
        <p className="font-medium text-slate">{percentage}%</p>
      </div>
      <div className="col-span-12 md:col-span-2 text-left md:text-right">
        <p className="font-bold text-lg text-white">
          {result.score}
          <span className="text-sm text-slate">/{result.totalMarks}</span>
        </p>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function ResultsPage() {
  const { user } = useAuth();
  const [resultsData, setResultsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uniqueSubjects, setUniqueSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      if (user) return;
      const timer = setTimeout(() => {
        if (!user) setLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
    const fetchResults = async () => {
      try {
        const [assessmentsSnapshot, gradesSnapshot] = await Promise.all([
          getDocs(query(collection(db, "assessments"))),
          getDocs(query(collection(db, "grades"))),
        ]);
        const gradesMap = new Map();
        gradesSnapshot.forEach((doc) =>
          gradesMap.set(doc.id, doc.data().studentData)
        );
        const studentResults = [];
        assessmentsSnapshot.forEach((doc) => {
          const assessment = { id: doc.id, ...doc.data() };
          const assessmentGrades = gradesMap.get(assessment.id);
          if (assessmentGrades && assessmentGrades[user.uid]) {
            studentResults.push({
              id: assessment.id,
              examType: assessment.title,
              subject: assessment.subject,
              date: assessment.assessmentDate.toDate(),
              score: assessmentGrades[user.uid].score,
              totalMarks: assessment.totalMarks,
            });
          }
        });
        setResultsData(studentResults);
        const subjects = [...new Set(studentResults.map((r) => r.subject))];
        setUniqueSubjects(subjects);
        if (subjects.length > 0) setActiveTab(subjects[0]);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("Could not load your results.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [user]);

  const subjectResults = useMemo(
    () =>
      resultsData
        .filter((result) => result.subject === activeTab)
        .sort((a, b) => a.date - b.date),
    [resultsData, activeTab]
  );

  // --- REPLACE THIS HOOK ---
  const { chartData, averagePercentage } = useMemo(() => {
    // --- THIS IS THE FIX: The data for the chart now includes the examType ---
    const dataForChart = subjectResults.map((result) => ({
      examType: result.examType,
      date: result.date.getTime(), // Keep the original date for sorting and tooltips
      percentage: Math.round((result.score / result.totalMarks) * 100),
    }));
    const totalScore = subjectResults.reduce((sum, r) => sum + r.score, 0);
    const totalMarks = subjectResults.reduce((sum, r) => sum + r.totalMarks, 0);
    const avg =
      totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;
    return { chartData: dataForChart, averagePercentage: avg };
  }, [subjectResults]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-light-slate mb-2">
          An Error Occurred
        </h2>
        <p className="text-slate">{error}</p>
      </div>
    );
  if (resultsData.length === 0)
    return (
      <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/10">
        <BookMarked className="mx-auto h-12 w-12 text-slate-500" />
        <h3 className="mt-4 text-xl font-semibold text-white">
          No Results Found
        </h3>
        <p className="mt-2 text-sm text-slate">
          Your results will appear here once they are published.
        </p>
      </div>
    );

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
            <ProgressChart data={chartData} average={averagePercentage} />
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
          <div className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase tracking-wider">
              <div className="col-span-12 md:col-span-5">Assessment</div>
              <div className="col-span-6 md:col-span-3">Performance</div>
              <div className="col-span-6 md:col-span-2 text-left md:text-center">
                Percentage
              </div>
              <div className="col-span-12 md:col-span-2 text-left md:text-right">
                Score
              </div>
            </div>
            <div className="divide-y divide-slate-800">
              {subjectResults
                .sort((a, b) => b.date - a.date)
                .map((result) => (
                  <ResultRow key={result.id} result={result} />
                ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
