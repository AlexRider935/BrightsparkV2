"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, CheckCircle2, Clock, Upload, Eye } from "lucide-react";

// --- MOCK DATA ---
// A comprehensive list of assignments with different statuses.
const mockAssignments = [
  {
    id: 1,
    title: "Chapter 5 Algebra Problems",
    course: "Mathematics VI",
    dueDate: new Date("2025-09-10T23:59:59"),
    status: "Pending",
  },
  {
    id: 2,
    title: "Photosynthesis Diagram & Report",
    course: "Science VI",
    dueDate: new Date("2025-09-08T23:59:59"),
    status: "Pending",
  },
  {
    id: 3,
    title: "Physics Lab Report",
    course: "Science VI",
    dueDate: new Date("2025-08-28T23:59:59"),
    submittedDate: new Date("2025-08-27T14:00:00"),
    status: "Graded",
    score: 18,
    totalMarks: 20,
  },
  {
    id: 4,
    title: "History Essay Draft",
    course: "Social Studies VI",
    dueDate: new Date("2025-08-25T23:59:59"),
    submittedDate: new Date("2025-08-25T10:00:00"),
    status: "Submitted",
  },
];

// Helper to format dates
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-amber-500/20 text-amber-400",
    Submitted: "bg-sky-500/20 text-sky-400",
    Graded: "bg-green-500/20 text-green-400",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full shrink-0 ${styles[status]}`}>
      {status}
    </span>
  );
};

// Card component for a single assignment
const AssignmentCard = ({ assignment }) => {
  const isPending = assignment.status === "Pending";

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
          <p className="text-sm text-slate">{assignment.course}</p>
          <h3 className="text-lg font-semibold text-light-slate mt-1">
            {assignment.title}
          </h3>
          {assignment.status === "Graded" && (
            <p className="text-xl font-bold text-white mt-2">
              Score: {assignment.score} / {assignment.totalMarks}
            </p>
          )}
        </div>
        <div className="flex sm:flex-col items-end gap-4 sm:gap-2 shrink-0">
          <StatusBadge status={assignment.status} />
          <p className="flex items-center gap-2 text-xs text-slate">
            <Clock size={14} />
            {isPending
              ? `Due: ${formatDate(assignment.dueDate)}`
              : `Submitted: ${formatDate(assignment.submittedDate)}`}
          </p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <button
          className={`flex items-center justify-center w-full sm:w-auto sm:ml-auto gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            isPending
              ? "bg-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-dark-navy"
              : "bg-white/10 text-slate-300 hover:bg-white/20"
          }`}>
          {isPending ? <Upload size={16} /> : <Eye size={16} />}
          <span>{isPending ? "Submit Now" : "View Submission"}</span>
        </button>
      </div>
    </div>
  );
};

export default function AssignmentsPage() {
  const [activeTab, setActiveTab] = useState("Pending");

  const pendingAssignments = mockAssignments
    .filter((a) => a.status === "Pending")
    .sort((a, b) => a.dueDate - b.dueDate); // Sort by soonest due date

  const completedAssignments = mockAssignments
    .filter((a) => a.status === "Submitted" || a.status === "Graded")
    .sort((a, b) => b.submittedDate - a.submittedDate); // Sort by most recent submission

  const assignmentsToShow =
    activeTab === "Pending" ? pendingAssignments : completedAssignments;

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Assignments
      </h1>
      <p className="text-lg text-slate mb-8">
        Track your pending and completed assignments.
      </p>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700/50 mb-6">
        <button
          onClick={() => setActiveTab("Pending")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "Pending"
              ? "border-b-2 border-brand-gold text-brand-gold"
              : "text-slate hover:text-white"
          }`}>
          Pending ({pendingAssignments.length})
        </button>
        <button
          onClick={() => setActiveTab("Completed")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "Completed"
              ? "border-b-2 border-brand-gold text-brand-gold"
              : "text-slate hover:text-white"
          }`}>
          Completed ({completedAssignments.length})
        </button>
      </div>

      {/* Assignments List */}
      <motion.div
        key={activeTab} // Animate when tab changes
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6">
        {assignmentsToShow.length > 0 ? (
          assignmentsToShow.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))
        ) : (
          <div className="text-center py-12 rounded-2xl border border-dashed border-white/10">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-400" />
            <h3 className="mt-4 text-xl font-semibold text-white">
              You're all caught up!
            </h3>
            <p className="text-slate mt-2">
              No {activeTab.toLowerCase()} assignments found.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
