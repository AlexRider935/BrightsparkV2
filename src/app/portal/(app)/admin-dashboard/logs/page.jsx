"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  GitBranch,
  Search,
  User,
  UserCircle,
  Shield,
  LogIn,
  Edit,
  PlusCircle,
  Trash2,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

// --- MOCK DATA ---
const mockLogs = [
  {
    id: "log1",
    timestamp: new Date(),
    actor: { name: "Admin", role: "Admin" },
    action: "Accessed the Activity Logs page.",
    ip: "103.22.201.135",
    type: "View",
  },
  {
    id: "log2",
    timestamp: new Date(new Date().setHours(new Date().getHours() - 1)),
    actor: { name: "Mr. A. K. Sharma", role: "Teacher" },
    action: "Updated grades for 'Algebra Assignment'.",
    ip: "115.241.224.18",
    type: "Update",
  },
  {
    id: "log3",
    timestamp: new Date(new Date().setHours(new Date().getHours() - 2)),
    actor: { name: "Alex Rider", role: "Student" },
    action: "Submitted assignment 'Photosynthesis Diagram'.",
    ip: "122.177.15.201",
    type: "Create",
  },
  {
    id: "log4",
    timestamp: new Date(new Date().setHours(new Date().getHours() - 5)),
    actor: { name: "Admin", role: "Admin" },
    action: "Deleted batch 'Trial Batch 2024'.",
    ip: "103.22.201.135",
    type: "Delete",
  },
  {
    id: "log5",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
    actor: { name: "Mrs. S. Gupta", role: "Teacher" },
    action: "Logged in successfully.",
    ip: "152.58.125.10",
    type: "Login",
  },
  {
    id: "log6",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 2)),
    actor: { name: "Ben Tennyson", role: "Student" },
    action: "Viewed the 'My Courses' page.",
    ip: "223.187.34.112",
    type: "View",
  },
];

const filters = {
  userType: ["All", "Admin", "Teacher", "Student"],
  actionType: ["All", "Create", "Update", "Delete", "Login", "View"],
};

// Helper object for log item icons and colors
const logTypeDetails = {
  Update: { Icon: Edit, color: "text-sky-400" },
  Create: { Icon: PlusCircle, color: "text-green-400" },
  Delete: { Icon: Trash2, color: "text-red-400" },
  Login: { Icon: LogIn, color: "text-brand-gold" },
  View: { Icon: Eye, color: "text-slate-400" }, // Assuming you add Eye to imports if needed
};

// --- Main Page Component ---
export default function ActivityLogsPage() {
  const [activeFilters, setActiveFilters] = useState({
    userType: "All",
    actionType: "All",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const handleFilterChange = (type, value) => {
    setActiveFilters((prev) => ({ ...prev, [type]: value }));
  };

  const filteredLogs = useMemo(() => {
    return mockLogs
      .filter(
        (log) =>
          activeFilters.userType === "All" ||
          log.actor.role === activeFilters.userType
      )
      .filter(
        (log) =>
          activeFilters.actionType === "All" ||
          log.type === activeFilters.actionType
      )
      .filter(
        (log) =>
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.actor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [activeFilters, searchTerm]);

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Activity Logs
      </h1>
      <p className="text-lg text-slate mb-8">
        A chronological record of all significant actions within the system.
      </p>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-xl border border-white/10 bg-slate-900/20 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            onChange={(e) => handleFilterChange("userType", e.target.value)}
            className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
            <option value="All">All User Types</option>
            {filters.userType.slice(1).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <select
            onChange={(e) => handleFilterChange("actionType", e.target.value)}
            className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
            <option value="All">All Action Types</option>
            {filters.actionType.slice(1).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          {/* Add a date range picker here in a real app */}
          <input
            type="text"
            value="Last 7 Days"
            readOnly
            className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-slate-900/50 p-3 text-slate-400"
          />
        </div>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs by user or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 p-3 rounded-lg border border-white/10 bg-slate-900/50 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
      </div>

      {/* Log List */}
      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}>
        <div className="divide-y divide-slate-700/50">
          {filteredLogs.map((log) => {
            const details = logTypeDetails[log.type] || {
              Icon: GitBranch,
              color: "text-slate-400",
            };
            const ActorIcon =
              log.actor.role === "Admin"
                ? Shield
                : log.actor.role === "Teacher"
                ? UserCircle
                : User;
            return (
              <div key={log.id} className="p-4 flex items-start gap-4">
                <div className={`mt-1 ${details.color}`}>
                  <details.Icon size={18} />
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-light-slate">{log.action}</p>
                  <div className="flex items-center gap-4 text-xs text-slate mt-1">
                    <span className="flex items-center gap-1.5">
                      <ActorIcon size={12} /> {log.actor.name} ({log.actor.role}
                      )
                    </span>
                    <span>
                      {format(log.timestamp, "MMM d, yyyy, h:mm:ss a")}
                    </span>
                    <span>IP: {log.ip}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
