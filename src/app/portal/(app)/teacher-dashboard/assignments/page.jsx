"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  PlusCircle,
  Clock,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  BookText,
} from "lucide-react";

// --- MOCK DATA ---
const mockAssignments = [
  {
    id: 1,
    title: "Chapter 5 Algebra Problems",
    course: "Mathematics VI",
    dueDate: new Date("2025-09-10T23:59:59"),
    status: "Active",
    submissions: 18,
    totalStudents: 22,
  },
  {
    id: 2,
    title: "Photosynthesis Diagram & Report",
    course: "Science VI",
    dueDate: new Date("2025-09-12T23:59:59"),
    status: "Active",
    submissions: 15,
    totalStudents: 23,
  },
  {
    id: 3,
    title: "Physics Lab Report",
    course: "Science VI",
    dueDate: new Date("2025-08-28T23:59:59"),
    status: "Past",
    submissions: 23,
    totalStudents: 23,
  },
  {
    id: 4,
    title: "History Essay Draft",
    course: "Social Studies VI",
    dueDate: new Date("2025-08-25T23:59:59"),
    status: "Past",
    submissions: 20,
    totalStudents: 22,
  },
];

// Helper to format dates
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric" });

// Card component for a single assignment
const AssignmentCard = ({ assignment }) => {
  const submissionPercentage = Math.round(
    (assignment.submissions / assignment.totalStudents) * 100
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-slate">{assignment.course}</p>
          <h3 className="text-lg font-semibold text-light-slate mt-1">
            {assignment.title}
          </h3>
        </div>
        {/* Dropdown for Edit/Delete actions can be added here */}
        <button className="p-2 text-slate-400 hover:text-white rounded-md hover:bg-white/10">
          <MoreVertical size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate mt-2">
        <Clock size={14} />
        <span>Due: {formatDate(assignment.dueDate)}</span>
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center text-sm mb-1">
          <span className="font-semibold text-slate">Submissions</span>
          <span className="text-light-slate">
            {assignment.submissions} / {assignment.totalStudents}
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-brand-gold h-2 rounded-full"
            style={{ width: `${submissionPercentage}%` }}></div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-end">
        <button className="flex items-center gap-2 rounded-lg bg-brand-gold/20 px-4 py-2 text-sm font-bold text-brand-gold transition-colors hover:bg-brand-gold hover:text-dark-navy">
          <BookText size={16} />
          <span>View Submissions & Grade</span>
        </button>
      </div>
    </div>
  );
};

export default function TeacherAssignmentsPage() {
  const [activeTab, setActiveTab] = useState("Active");

  const activeAssignments = mockAssignments.filter(
    (a) => a.status === "Active"
  );
  const pastAssignments = mockAssignments.filter((a) => a.status === "Past");

  const assignmentsToShow =
    activeTab === "Active" ? activeAssignments : pastAssignments;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
            Assignments
          </h1>
          <p className="text-lg text-slate">
            Create, manage, and grade student assignments.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Create New Assignment</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700/50 mb-6">
        <button
          onClick={() => setActiveTab("Active")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "Active"
              ? "border-b-2 border-brand-gold text-brand-gold"
              : "text-slate hover:text-white"
          }`}>
          Active Assignments ({activeAssignments.length})
        </button>
        <button
          onClick={() => setActiveTab("Past")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "Past"
              ? "border-b-2 border-brand-gold text-brand-gold"
              : "text-slate hover:text-white"
          }`}>
          Past Assignments ({pastAssignments.length})
        </button>
      </div>

      {/* Assignments List */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}>
        {assignmentsToShow.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignmentsToShow.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-2xl border border-dashed border-white/10">
            <ClipboardCheck className="mx-auto h-12 w-12 text-slate-500" />
            <h3 className="mt-4 text-xl font-semibold text-white">
              No {activeTab.toLowerCase()} assignments
            </h3>
            <p className="text-slate mt-2">
              Create a new assignment to get started.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
