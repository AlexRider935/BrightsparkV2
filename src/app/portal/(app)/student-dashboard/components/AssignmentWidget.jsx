"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import WidgetCard from "./WidgetCard";
import { ClipboardList, Loader2 } from "lucide-react";
import {
  format,
  isToday,
  isTomorrow,
  isPast,
  formatDistanceToNowStrict,
} from "date-fns";

// --- Helper function to format due dates dynamically ---
const formatDueDate = (dueDate) => {
  if (!dueDate || !(dueDate instanceof Timestamp)) return "No due date";
  const date = dueDate.toDate();
  const now = new Date();

  if (isToday(date)) return "Due Today";
  if (isTomorrow(date)) return "Due Tomorrow";
  if (isPast(date))
    return `Overdue by ${formatDistanceToNowStrict(date, {
      unit: "day",
      addSuffix: true,
    })}`;
  return `Due in ${formatDistanceToNowStrict(date, {
    unit: "day",
    addSuffix: false,
  })}`;
};

const AssignmentWidget = () => {
  const { user, initialising } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialising) return;
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    let unsubAssignments = () => {};
    let unsubSubmissions = () => {};

    const fetchStudentAndAssignments = async () => {
      try {
        const studentDocRef = doc(db, "students", user.uid);
        const studentSnap = await getDoc(studentDocRef);
        if (!studentSnap.exists())
          throw new Error("Student profile not found.");

        const studentBatch = studentSnap.data().batch;
        if (!studentBatch) throw new Error("You are not assigned to a batch.");

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // 1. Listen for upcoming assignments for the student's batch
        const assignmentsQuery = query(
          collection(db, "assignments"),
          where("batch", "==", studentBatch),
          where("dueDate", ">=", Timestamp.fromDate(startOfToday)),
          orderBy("dueDate", "asc")
        );
        unsubAssignments = onSnapshot(
          assignmentsQuery,
          (snap) => {
            setAssignments(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching assignments:", err);
            setError("Could not load assignments.");
            setLoading(false);
          }
        );

        // 2. Listen for this student's submissions
        const submissionsQuery = query(
          collection(db, "submissions"),
          where("studentId", "==", user.uid)
        );
        unsubSubmissions = onSnapshot(submissionsQuery, (snap) => {
          const submittedIds = new Set(
            snap.docs.map((d) => d.data().assignmentId)
          );
          setSubmissions(submittedIds);
        });
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStudentAndAssignments();

    return () => {
      unsubAssignments();
      unsubSubmissions();
    };
  }, [user, initialising]);

  // Process and filter to get the next 4 pending assignments
  const upcomingAssignments = useMemo(() => {
    return assignments
      .filter((assignment) => !submissions.has(assignment.id))
      .slice(0, 4);
  }, [assignments, submissions]);

  if (loading || initialising) {
    return (
      <WidgetCard title="Assignments" Icon={ClipboardList}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard title="Assignments" Icon={ClipboardList}>
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </WidgetCard>
    );
  }

  if (upcomingAssignments.length === 0) {
    return (
      <WidgetCard title="Assignments" Icon={ClipboardList}>
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-slate-500">
            All assignments are done. Great job!
          </p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Assignments"
      Icon={ClipboardList}
      route="/portal/student-dashboard/assignments">
      <div className="flex flex-col h-full">
        <ul className="space-y-3">
          {upcomingAssignments.map((assignment, index) => (
            <li
              key={assignment.id}
              className={`flex justify-between items-start text-sm ${
                index === 0 ? "pb-3 border-b border-slate-700/50" : ""
              }`}>
              <div>
                <p
                  className={`font-medium ${
                    index === 0 ? "text-light-slate" : "text-slate/90"
                  }`}>
                  {assignment.title}
                </p>
                <p className="text-xs text-slate/70 mt-0.5">
                  {assignment.subject}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold text-amber-300">
                  {formatDueDate(assignment.dueDate)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {format(assignment.dueDate.toDate(), "MMM d")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </WidgetCard>
  );
};

export default AssignmentWidget;
