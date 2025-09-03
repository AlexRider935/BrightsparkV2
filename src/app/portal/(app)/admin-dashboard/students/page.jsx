"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  PlusCircle,
  Edit,
  Trash2,
  ChevronDown,
  Search,
} from "lucide-react";

// --- MOCK DATA ---
const mockStudents = [
  {
    id: "s1",
    name: "Alex Rider",
    rollNumber: "VI-01",
    batch: "Class VI - Foundation",
    parentName: "Ian Rider",
    contact: "+91 98765 43210",
    status: "Active",
  },
  {
    id: "s2",
    name: "Ben Tennyson",
    rollNumber: "VI-02",
    batch: "Class VI - Foundation",
    parentName: "Carl Tennyson",
    contact: "+91 98765 43211",
    status: "Active",
  },
  {
    id: "s3",
    name: "Cindy Vortex",
    rollNumber: "VI-03",
    batch: "Class VI - Foundation",
    parentName: "Judy Vortex",
    contact: "+91 98765 43212",
    status: "Active",
  },
  {
    id: "s4",
    name: "David Johnson",
    rollNumber: "VII-04",
    batch: "Class VII - Olympiad",
    parentName: "Mary Johnson",
    contact: "+91 98765 43213",
    status: "Active",
  },
  {
    id: "s5",
    name: "Eva Williams",
    rollNumber: "VII-05",
    batch: "Class VII - Olympiad",
    parentName: "Robert Williams",
    contact: "+91 98765 43214",
    status: "Inactive",
  },
  // ...imagine more students here to demonstrate pagination
];
const mockBatches = ["Class VI - Foundation", "Class VII - Olympiad"]; // For the filter dropdown

// --- Reusable Components ---
const StatusBadge = ({ status }) => (
  <span
    className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
      status === "Active"
        ? "bg-green-500/20 text-green-300"
        : "bg-slate-600/20 text-slate-400"
    }`}>
    {status}
  </span>
);

export default function ManageStudentsPage() {
  const [students, setStudents] = useState(mockStudents);
  const [filteredStudents, setFilteredStudents] = useState(mockStudents);
  const [batchFilter, setBatchFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Memoize the filtering logic to avoid re-calculating on every render
  useMemo(() => {
    let result = mockStudents;

    if (batchFilter !== "all") {
      result = result.filter((s) => s.batch === batchFilter);
    }

    if (searchTerm) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(result);
  }, [batchFilter, searchTerm]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
            Manage Students
          </h1>
          <p className="text-lg text-slate">
            View, edit, and manage all student records.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 rounded-xl border border-white/10 bg-slate-900/20">
        <div className="relative w-full sm:w-64">
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
            <option value="all">All Batches</option>
            {mockBatches.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative w-full sm:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 p-3 rounded-lg border border-white/10 bg-slate-900/50 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
      </div>

      {/* Student Table */}
      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase tracking-wider">
          <div className="col-span-3">Student</div>
          <div className="col-span-3">Batch</div>
          <div className="col-span-3">Parent Contact</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y divide-slate-700/50">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="grid grid-cols-12 gap-4 items-center p-4 text-sm">
              <div className="col-span-3">
                <p className="font-medium text-light-slate">{student.name}</p>
                <p className="text-xs text-slate">{student.rollNumber}</p>
              </div>
              <div className="col-span-3 text-slate">{student.batch}</div>
              <div className="col-span-3 text-slate">{student.contact}</div>
              <div className="col-span-1">
                <StatusBadge status={student.status} />
              </div>
              <div className="col-span-2 flex justify-end gap-2">
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
