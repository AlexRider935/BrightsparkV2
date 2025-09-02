"use client";

import WidgetCard from "./WidgetCard";
import { ClipboardList } from "lucide-react";

// Mock data updated with dates for all items
const mockAssignments = [
  {
    id: 1,
    title: "Complete Chapter 5 Algebra Problems",
    dueDate: "Due: Today, Sep 2",
    status: "pending",
  },
  {
    id: 2,
    title: "Physics Lab Report",
    dueDate: "Submitted: Aug 28",
    status: "completed",
  },
  {
    id: 3,
    title: "History Essay Draft",
    dueDate: "Submitted: Aug 25",
    status: "completed",
  },
  {
    id: 4,
    title: "Chemistry Worksheet",
    dueDate: "Due: Sep 4",
    status: "pending",
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
    {status === "completed" ? "Completed" : "Pending"}
  </span>
);

const AssignmentWidget = () => {
  const latestAssignment = mockAssignments[0];
  const previousAssignments = mockAssignments.slice(1, 4);

  return (
    <WidgetCard
      title="Assignments"
      Icon={ClipboardList}
      route="/portal/assignments">
      <div className="flex flex-col h-full">
        {/* Latest Assignment Section */}
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <p className="font-semibold text-light-slate pr-2">
              {latestAssignment.title}
            </p>
            <StatusBadge status={latestAssignment.status} />
          </div>
          <p className="text-xs text-slate mt-1">{latestAssignment.dueDate}</p>
        </div>

        <hr className="border-slate-700/50 my-2" />

        {/* Previous Assignments List - NOW WITH DATES */}
        <div className="flex-grow">
          <ul className="space-y-3">
            {previousAssignments.map((assignment) => (
              <li
                key={assignment.id}
                className="flex justify-between items-start text-sm">
                <div>
                  <p
                    className={`truncate pr-2 ${
                      assignment.status === "completed"
                        ? "line-through text-slate/60"
                        : ""
                    }`}>
                    {assignment.title}
                  </p>
                  <p className="text-xs text-slate/70 mt-1">
                    {assignment.dueDate}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium shrink-0 ${
                    assignment.status === "completed"
                      ? "text-green-400"
                      : "text-slate-400"
                  }`}>
                  {assignment.status === "completed" ? "Done" : "Pending"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </WidgetCard>
  );
};

export default AssignmentWidget;
