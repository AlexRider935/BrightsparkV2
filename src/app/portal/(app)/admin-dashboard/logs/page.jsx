"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "@/firebase/config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
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
  Loader2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const filters = {
  userType: ["All", "Admin", "Teacher", "Student"],
  actionType: ["All", "Create", "Update", "Delete", "Login", "View"],
};

const logTypeDetails = {
  Update: { Icon: Edit, color: "text-sky-400" },
  Create: { Icon: PlusCircle, color: "text-green-400" },
  Delete: { Icon: Trash2, color: "text-red-400" },
  Login: { Icon: LogIn, color: "text-brand-gold" },
  View: { Icon: Eye, color: "text-slate-400" },
};

// --- Main Page Component ---
export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    userType: "All",
    actionType: "All",
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "activityLogs"),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((doc) => doc.id !== "--placeholder--");
      setLogs(logsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleFilterChange = (type, value) => {
    setActiveFilters((prev) => ({ ...prev, [type]: value }));
  };

  const filteredLogs = useMemo(() => {
    return logs
      .filter(
        (log) =>
          activeFilters.userType === "All" ||
          log.actorRole === activeFilters.userType
      )
      .filter(
        (log) =>
          activeFilters.actionType === "All" ||
          log.type === activeFilters.actionType
      )
      .filter(
        (log) =>
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.actorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [logs, activeFilters, searchTerm]);

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Activity Logs
      </h1>
      <p className="text-lg text-slate mb-8">
        A chronological record of all significant actions within the system.
      </p>

      <div className="p-4 rounded-xl border border-white/10 bg-slate-900/20 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            onChange={(e) => handleFilterChange("userType", e.target.value)}
            className="w-full form-input">
            <option value="All">All User Types</option>
            {filters.userType.slice(1).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <select
            onChange={(e) => handleFilterChange("actionType", e.target.value)}
            className="w-full form-input">
            <option value="All">All Action Types</option>
            {filters.actionType.slice(1).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <input
            type="text"
            value="All Time"
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

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
        </div>
      ) : (
        <motion.div
          className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}>
          <div className="divide-y divide-slate-700/50">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => {
                const details = logTypeDetails[log.type] || {
                  Icon: GitBranch,
                  color: "text-slate-400",
                };
                const ActorIcon =
                  log.actorRole === "Admin"
                    ? Shield
                    : log.actorRole === "Teacher"
                    ? UserCircle
                    : User;
                return (
                  <div key={log.id} className="p-4 flex items-start gap-4">
                    <div className={`mt-1 ${details.color}`}>
                      <details.Icon size={18} />
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium text-light-slate">
                        {log.action}
                      </p>
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate mt-1">
                        <span className="flex items-center gap-1.5">
                          <ActorIcon size={12} /> {log.actorName} (
                          {log.actorRole})
                        </span>
                        <span>
                          {formatDistanceToNow(log.timestamp.toDate(), {
                            addSuffix: true,
                          })}
                        </span>
                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-8 text-slate">
                No logs found matching your criteria.
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
