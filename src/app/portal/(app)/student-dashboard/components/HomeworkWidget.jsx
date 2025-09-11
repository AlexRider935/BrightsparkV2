"use client";

import WidgetCard from "./WidgetCard";
import { CheckSquare } from "lucide-react";

// Mock data updated to include dates for all tasks.
const mockHomework = [
  {
    id: 1,
    title: "Read Chapter 7: Photosynthesis",
    subject: "Biology",
    date: "Due: Today, Sep 2",
    status: "pending",
  },
  {
    id: 2,
    title: "Practice Quadratic Equations",
    subject: "Maths",
    date: "Completed: Aug 30",
    status: "completed",
  },
  {
    id: 3,
    title: "Review Notes for Friday Quiz",
    subject: "Chemistry",
    date: "Due: Sep 5",
    status: "pending",
  },
  {
    id: 4,
    title: "Watch History Documentary",
    subject: "History",
    date: "Completed: Aug 29",
    status: "completed",
  },
];

// Helper component for the status badge
const StatusBadge = ({ status }) => (
  <span
    className={`px-2 py-1 text-xs font-semibold rounded-full shrink-0 ${
      status === "completed"
        ? "bg-green-500/20 text-green-300"
        : "bg-slate-500/20 text-slate-300"
    }`}>
    {status === "completed" ? "Done" : "To-Do"}
  </span>
);

const HomeworkWidget = () => {
  // Separate the next task from the rest
  const nextTask = mockHomework[0];
  const otherTasks = mockHomework.slice(1, 4);

  return (
    <WidgetCard
      title="Homework/Tasks"
      Icon={CheckSquare}
      route="/portal/homework">
      <div className="flex flex-col h-full">
        {/* Next Task Section - Now with Date */}
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <p className="font-semibold text-light-slate pr-2">
              {nextTask.title}
            </p>
            <StatusBadge status={nextTask.status} />
          </div>
          <p className="text-xs text-slate mt-1">
            {nextTask.subject} • {nextTask.date}
          </p>
        </div>

        {/* Separator */}
        <hr className="border-slate-700/50 my-2" />

        {/* Other Tasks List - Now with Dates */}
        <div className="flex-grow">
          <ul className="space-y-3">
            {otherTasks.map((task) => (
              <li
                key={task.id}
                className="flex justify-between items-start text-sm">
                <div>
                  <p
                    className={`truncate pr-2 ${
                      task.status === "completed"
                        ? "line-through text-slate/60"
                        : ""
                    }`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-slate/70 mt-1">{task.date}</p>
                </div>
                <span
                  className={`text-xs font-medium shrink-0 ${
                    task.status === "completed"
                      ? "text-green-400"
                      : "text-slate-400"
                  }`}>
                  {task.status === "completed" ? "Done" : "Pending"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </WidgetCard>
  );
};

export default HomeworkWidget;
