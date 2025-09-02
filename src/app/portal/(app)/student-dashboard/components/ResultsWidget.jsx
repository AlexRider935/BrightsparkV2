"use client";

import WidgetCard from "./WidgetCard";
import { Award } from "lucide-react";

// Mock data for the results, with the requested format.
const mockResults = [
  {
    id: 1,
    subject: "Physics",
    examName: "Unit Test II",
    score: 45,
    totalMarks: 50,
    date: "Result: Sep 1, 2025",
    status: "Excellent",
  },
  {
    id: 2,
    subject: "Mathematics",
    examName: "Mid-Term Exam",
    score: 82,
    totalMarks: 100,
    date: "Result: Aug 22, 2025",
    status: "Good",
  },
  {
    id: 3,
    subject: "Chemistry",
    examName: "Practical Assessment",
    score: 26,
    totalMarks: 30,
    date: "Result: Aug 19, 2025",
    status: "Excellent",
  },
  {
    id: 4,
    subject: "English",
    examName: "Literature Quiz",
    score: 13,
    totalMarks: 20,
    date: "Result: Aug 15, 2025",
    status: "Needs Improvement",
  },
];

// Helper component for the status badge, with different colors for performance
const StatusBadge = ({ status }) => {
  const styles = {
    Excellent: "bg-sky-500/20 text-sky-300",
    Good: "bg-green-500/20 text-green-300",
    "Needs Improvement": "bg-amber-500/20 text-amber-300",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full shrink-0 ${
        styles[status] || "bg-slate-500/20 text-slate-300"
      }`}>
      {status}
    </span>
  );
};

const ResultsWidget = () => {
  const latestResult = mockResults[0];
  const previousResults = mockResults.slice(1, 4);

  return (
    <WidgetCard title="Results" Icon={Award} route="/portal/results">
      <div className="flex flex-col h-full">
        {/* Latest Result Section */}
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <p className="font-semibold text-light-slate pr-2">
              {latestResult.subject}
            </p>
            <StatusBadge status={latestResult.status} />
          </div>
          <p className="text-3xl font-bold text-white tracking-tight">
            {latestResult.score}
            <span className="text-xl text-slate">
              {" "}
              / {latestResult.totalMarks}
            </span>
          </p>
          <p className="text-xs text-slate mt-1">
            {latestResult.examName} • {latestResult.date}
          </p>
        </div>

        {/* Separator */}
        <hr className="border-slate-700/50 my-2" />

        {/* Previous Results List */}
        <div className="flex-grow">
          <ul className="space-y-3">
            {previousResults.map((result) => (
              <li
                key={result.id}
                className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-slate/90">{result.subject}</p>
                  <p className="text-xs text-slate/70">{result.examName}</p>
                </div>
                <p className="font-semibold text-light-slate shrink-0">
                  {result.score} / {result.totalMarks}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </WidgetCard>
  );
};

export default ResultsWidget;
