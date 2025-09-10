"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import WidgetCard from "./WidgetCard";
import { Award, Loader2 } from "lucide-react";
import { format } from "date-fns";

// --- Helper function to determine performance status ---
const calculateStatus = (score, total) => {
  if (total === 0) return "N/A";
  const percentage = (score / total) * 100;
  if (percentage >= 85) return "Excellent";
  if (percentage >= 70) return "Good";
  return "Needs Improvement";
};

// --- Helper component for the status badge ---
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

// --- Main Widget Component ---
const ResultsWidget = () => {
  const { user, initialising } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialising || !user?.uid) {
      if (!initialising) setLoading(false);
      return;
    }

    // Query for assessments, ordered by creation date
    const assessmentsQuery = query(
      collection(db, "assessments"),
      orderBy("createdAt", "desc"),
      limit(20) // Fetch recent 20 assessments to find results from
    );

    const unsubscribeAssessments = onSnapshot(
      assessmentsQuery,
      (assessmentsSnapshot) => {
        const assessmentDocs = assessmentsSnapshot.docs;
        if (assessmentDocs.length === 0) {
          setLoading(false);
          return;
        }

        const assessmentIds = assessmentDocs.map((doc) => doc.id);

        // Now query for grades that match these assessments
        const gradesQuery = query(
          collection(db, "grades"),
          where("assessmentId", "in", assessmentIds)
        );

        const unsubscribeGrades = onSnapshot(
          gradesQuery,
          (gradesSnapshot) => {
            const gradesMap = new Map();
            gradesSnapshot.forEach((doc) => {
              const data = doc.data();
              if (data.studentData && data.studentData[user.uid]) {
                gradesMap.set(
                  data.assessmentId,
                  data.studentData[user.uid].score
                );
              }
            });

            const studentResults = assessmentDocs
              .map((assessmentDoc) => {
                const assessmentData = assessmentDoc.data();
                const score = gradesMap.get(assessmentDoc.id);

                if (score === undefined) return null;

                return {
                  id: assessmentDoc.id,
                  subject: assessmentData.subject,
                  examName: assessmentData.title,
                  score: score,
                  totalMarks: assessmentData.totalMarks,
                  date: assessmentData.createdAt,
                  status: calculateStatus(score, assessmentData.totalMarks),
                };
              })
              .filter(Boolean); // Remove null entries

            setResults(studentResults.slice(0, 4)); // Ensure we only keep the top 4
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching grades: ", err);
            setError("Could not load grades.");
            setLoading(false);
          }
        );

        return () => unsubscribeGrades();
      },
      (err) => {
        console.error("Error fetching assessments: ", err);
        setError("Could not load assessments.");
        setLoading(false);
      }
    );

    return () => unsubscribeAssessments();
  }, [user, initialising]);

  const { latestResult, previousResults } = useMemo(() => {
    if (results.length === 0) {
      return { latestResult: null, previousResults: [] };
    }
    const [first, ...rest] = results;
    return { latestResult: first, previousResults: rest };
  }, [results]);

  if (loading || initialising) {
    return (
      <WidgetCard title="Results" Icon={Award}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard title="Results" Icon={Award}>
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </WidgetCard>
    );
  }

  if (!latestResult) {
    return (
      <WidgetCard title="Results" Icon={Award}>
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-slate-500">No results published yet.</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Latest Results"
      Icon={Award}
      route="/portal/student-dashboard/results">
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
            {latestResult.examName} • Result:{" "}
            {latestResult.date instanceof Timestamp
              ? format(latestResult.date.toDate(), "MMM d, yyyy")
              : "N/A"}
          </p>
        </div>

        <hr className="border-slate-700/50 my-2" />

        {/* Previous Results List */}
        <div className="flex-grow">
          {previousResults.length > 0 ? (
            <ul className="space-y-3">
              {previousResults.map((result) => (
                <li
                  key={result.id}
                  className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-slate/90">
                      {result.subject}
                    </p>
                    <p className="text-xs text-slate/70">{result.examName}</p>
                  </div>
                  <p className="font-semibold text-light-slate shrink-0">
                    {result.score} / {result.totalMarks}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full pt-4">
              <p className="text-sm text-slate-500">No other recent results.</p>
            </div>
          )}
        </div>
      </div>
    </WidgetCard>
  );
};

export default ResultsWidget;
