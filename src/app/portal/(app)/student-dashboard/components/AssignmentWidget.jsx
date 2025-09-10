// src/app/portal/(app)/student-dashboard/components/AssignmentWidget.jsx
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
} from "firebase/firestore";
import WidgetCard from "./WidgetCard";
import { ClipboardList, Loader2 } from "lucide-react";
import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isPast,
} from "date-fns";

// --- Helper component for the status badge ---
const StatusBadge = ({ status }) => (
  <span
    className={`px-2 py-1 text-xs font-semibold rounded-full shrink-0 ${
      status === "submitted"
        ? "bg-green-500/20 text-green-300"
        : "bg-amber-500/20 text-amber-300"
    }`}>
    {status === "submitted" ? "Submitted" : "Pending"}
  </span>
);

// --- Helper function to format due dates dynamically ---
const formatDueDate = (dueDate, status) => {
  if (status === "submitted") {
    // In a real app, you would have a submission date. We'll simulate it.
    return `Submitted ${formatDistanceToNow(subDays(new Date(), 2), {
      addSuffix: true,
    })}`;
  }
  if (!dueDate || !(dueDate instanceof Timestamp)) return "No due date";

  const date = dueDate.toDate();
  if (isToday(date)) return "Due: Today";
  if (isTomorrow(date)) return "Due: Tomorrow";
  if (isPast(date)) return `Overdue: ${format(date, "MMM d")}`;
  return `Due: ${format(date, "MMM d")}`;
};

const AssignmentWidget = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait until we have the user and their assigned batch
    if (!user?.uid || !user.batch) {
      setLoading(false);
      return;
    }

    // 1. Listen for assignments assigned to the student's batch
    const assignmentsQuery = query(
      collection(db, "assignments"),
      where("batch", "==", user.batch),
      orderBy("dueDate", "desc")
    );
    const unsubAssignments = onSnapshot(
      assignmentsQuery,
      (snap) => {
        setAssignments(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
        setLoading(false);
      },
      () => setLoading(false)
    );

    // 2. Listen for this specific student's submissions
    const submissionsQuery = query(
      collection(db, "submissions"),
      where("studentId", "==", user.uid)
    );
    const unsubSubmissions = onSnapshot(submissionsQuery, (snap) => {
      setSubmissions(snap.docs.map((d) => d.data()));
    });

    return () => {
      unsubAssignments();
      unsubSubmissions();
    };
  }, [user]);

  // Process the raw data to create a final, display-ready list
  const { latestAssignment, previousAssignments } = useMemo(() => {
    const submittedAssignmentIds = new Set(
      submissions.map((s) => s.assignmentId)
    );

    const allAssignments = assignments.map((assignment) => ({
      ...assignment,
      status: submittedAssignmentIds.has(assignment.id)
        ? "submitted"
        : "pending",
    }));

    // The "latest" is the most recent assignment that is still pending
    const latestPending = allAssignments.find((a) => a.status === "pending");

    // The "previous" are the next 3 most recent assignments, excluding the one we just picked
    const otherAssignments = allAssignments
      .filter((a) => a.id !== latestPending?.id)
      .slice(0, 3);

    return {
      latestAssignment: latestPending,
      previousAssignments: otherAssignments,
    };
  }, [assignments, submissions]);

  if (loading) {
    return (
      <WidgetCard title="Assignments" Icon={ClipboardList}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </WidgetCard>
    );
  }

  if (!latestAssignment && previousAssignments.length === 0) {
    return (
      <WidgetCard title="Assignments" Icon={ClipboardList}>
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-slate-500">No recent assignments.</p>
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
        {/* Latest Assignment Section */}
        {latestAssignment && (
          <>
            <div className="mb-4">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-light-slate pr-2">
                  {latestAssignment.title}
                </p>
                <StatusBadge status={latestAssignment.status} />
              </div>
              <p className="text-xs text-slate mt-1">
                {formatDueDate(
                  latestAssignment.dueDate,
                  latestAssignment.status
                )}
              </p>
            </div>
            <hr className="border-slate-700/50 my-2" />
          </>
        )}

        {/* Previous Assignments List */}
        <div className="flex-grow">
          {previousAssignments.length > 0 ? (
            <ul className="space-y-3">
              {previousAssignments.map((assignment) => (
                <li
                  key={assignment.id}
                  className="flex justify-between items-start text-sm">
                  <div>
                    <p
                      className={`truncate pr-2 ${
                        assignment.status === "submitted"
                          ? "line-through text-slate/60"
                          : ""
                      }`}>
                      {assignment.title}
                    </p>
                    <p className="text-xs text-slate/70 mt-1">
                      {formatDueDate(assignment.dueDate, assignment.status)}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium shrink-0 ${
                      assignment.status === "submitted"
                        ? "text-green-400"
                        : "text-slate-400"
                    }`}>
                    {assignment.status === "submitted" ? "Done" : "Pending"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-slate-500">All caught up!</p>
            </div>
          )}
        </div>
      </div>
    </WidgetCard>
  );
};

export default AssignmentWidget;
