"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Circle, CheckCircle2 } from "lucide-react";

// --- MOCK DATA ---
// A list of homework tasks with pending and completed statuses.
const mockHomework = [
  {
    id: 1,
    title: "Read Chapter 7: Photosynthesis",
    course: "Science VI",
    dueDate: new Date("2025-09-02T23:59:59"), // Today
    status: "Pending",
  },
  {
    id: 2,
    title: "Review Notes for Friday Quiz",
    course: "Chemistry VI",
    dueDate: new Date("2025-09-05T23:59:59"),
    status: "Pending",
  },
  {
    id: 3,
    title: "Complete exercises 1-10 on page 54",
    course: "Mathematics VI",
    dueDate: new Date("2025-09-04T23:59:59"),
    status: "Pending",
  },
  {
    id: 4,
    title: "Practice Quadratic Equations",
    course: "Mathematics VI",
    dueDate: new Date("2025-08-30T23:59:59"),
    status: "Completed",
  },
  {
    id: 5,
    title: "Watch History Documentary",
    course: "Social Studies VI",
    dueDate: new Date("2025-08-29T23:59:59"),
    status: "Completed",
  },
];

// Helper to format dates
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric" });

// Component for a single homework item
const HomeworkItem = ({ task }) => {
  const isCompleted = task.status === "Completed";

  return (
    <div className="flex items-center gap-4 p-4">
      {/* Mock Checkbox */}
      <div className="cursor-pointer">
        {isCompleted ? (
          <CheckCircle2 className="h-6 w-6 text-green-400" />
        ) : (
          <Circle className="h-6 w-6 text-slate-500" />
        )}
      </div>

      <div className="flex-grow">
        <p
          className={`font-medium text-light-slate ${
            isCompleted ? "line-through text-slate/60" : ""
          }`}>
          {task.title}
        </p>
        <p
          className={`text-sm text-slate ${
            isCompleted ? "line-through text-slate/60" : ""
          }`}>
          {task.course}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-xs text-slate">Due Date</p>
        <p className="font-semibold text-sm text-slate-300">
          {formatDate(task.dueDate)}
        </p>
      </div>
    </div>
  );
};

export default function HomeworkPage() {
  const [activeTab, setActiveTab] = useState("Pending");

  const pendingHomework = mockHomework
    .filter((t) => t.status === "Pending")
    .sort((a, b) => a.dueDate - b.dueDate);

  const completedHomework = mockHomework
    .filter((t) => t.status === "Completed")
    .sort((a, b) => b.dueDate - a.dueDate);

  const homeworkToShow =
    activeTab === "Pending" ? pendingHomework : completedHomework;

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Homework & Tasks
      </h1>
      <p className="text-lg text-slate mb-8">
        Your daily to-do list for readings and practice exercises.
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
          Pending ({pendingHomework.length})
        </button>
        <button
          onClick={() => setActiveTab("Completed")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "Completed"
              ? "border-b-2 border-brand-gold text-brand-gold"
              : "text-slate hover:text-white"
          }`}>
          Completed ({completedHomework.length})
        </button>
      </div>

      {/* Homework List */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg">
        <div className="divide-y divide-slate-700/50">
          {homeworkToShow.length > 0 ? (
            homeworkToShow.map((task) => (
              <HomeworkItem key={task.id} task={task} />
            ))
          ) : (
            <div className="text-center p-12">
              <CheckSquare className="mx-auto h-12 w-12 text-green-400" />
              <h3 className="mt-4 text-xl font-semibold text-white">
                All tasks completed!
              </h3>
              <p className="text-slate mt-2">
                No {activeTab.toLowerCase()} homework to show.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
