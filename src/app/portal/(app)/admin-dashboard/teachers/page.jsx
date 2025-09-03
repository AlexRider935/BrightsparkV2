"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  UserCircle,
  PlusCircle,
  Edit,
  Trash2,
  ChevronDown,
  Search,
} from "lucide-react";

// --- MOCK DATA ---
const mockTeachers = [
  {
    id: "t1",
    name: "Mr. A. K. Sharma",
    employeeId: "BS-T001",
    subjects: ["Mathematics", "Physics"],
    batches: 2,
    contact: "+91 91234 56789",
    status: "Active",
  },
  {
    id: "t2",
    name: "Mrs. S. Gupta",
    employeeId: "BS-T002",
    subjects: ["Science"],
    batches: 1,
    contact: "+91 91234 56780",
    status: "Active",
  },
  {
    id: "t3",
    name: "Mr. R. Verma",
    employeeId: "BS-T003",
    subjects: ["Social Studies"],
    batches: 1,
    contact: "+91 91234 56781",
    status: "Active",
  },
  {
    id: "t4",
    name: "Ms. J. David",
    employeeId: "BS-T004",
    subjects: ["English"],
    batches: 3,
    contact: "+91 91234 56782",
    status: "On Leave",
  },
  {
    id: "t5",
    name: "Mrs. R. Singh",
    employeeId: "BS-T005",
    subjects: ["Mathematics"],
    batches: 2,
    contact: "+91 91234 56783",
    status: "Active",
  },
];
const mockSubjects = [
  "Mathematics",
  "Physics",
  "Science",
  "English",
  "Social Studies",
];

// --- Reusable Components ---
const StatusBadge = ({ status }) => {
  const styles = {
    Active: "bg-green-500/20 text-green-300",
    "On Leave": "bg-yellow-500/20 text-yellow-300",
    Inactive: "bg-slate-600/20 text-slate-400",
  };
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

export default function ManageTeachersPage() {
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTeachers = useMemo(() => {
    let result = mockTeachers;
    if (subjectFilter !== "all") {
      result = result.filter((t) => t.subjects.includes(subjectFilter));
    }
    if (searchTerm) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [subjectFilter, searchTerm]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
            Manage Teachers
          </h1>
          <p className="text-lg text-slate">
            Add, edit, and manage all faculty records.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 rounded-xl border border-white/10 bg-slate-900/20">
        <div className="relative w-full sm:w-64">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
            <option value="all">Filter by Subject</option>
            {mockSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative w-full sm:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 p-3 rounded-lg border border-white/10 bg-slate-900/50 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
      </div>

      {/* Teacher Table */}
      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase tracking-wider">
          <div className="col-span-3">Teacher</div>
          <div className="col-span-3">Subjects Taught</div>
          <div className="col-span-2">Batches</div>
          <div className="col-span-2">Contact</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        <div className="divide-y divide-slate-700/50">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="grid grid-cols-12 gap-4 items-center p-4 text-sm">
              <div className="col-span-3">
                <p className="font-medium text-light-slate">{teacher.name}</p>
                <p className="text-xs text-slate">{teacher.employeeId}</p>
              </div>
              <div className="col-span-3 text-slate flex flex-wrap gap-1">
                {teacher.subjects.map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-slate-700/50 px-2 py-0.5 rounded">
                    {s}
                  </span>
                ))}
              </div>
              <div className="col-span-2 text-slate">{teacher.batches}</div>
              <div className="col-span-2 text-slate">{teacher.contact}</div>
              <div className="col-span-1">
                <StatusBadge status={teacher.status} />
              </div>
              <div className="col-span-1 flex justify-end gap-2">
                <button className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-white/5">
                  <Edit size={16} />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-white/5">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
