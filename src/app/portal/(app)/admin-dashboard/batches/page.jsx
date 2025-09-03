"use client";

import { motion } from "framer-motion";
import {
  School,
  PlusCircle,
  Edit,
  Trash2,
  Users,
  UserCircle as TeacherIcon,
} from "lucide-react";

// --- MOCK DATA (Unchanged) ---
const mockBatches = [
  {
    id: "b1",
    name: "Foundation Batch",
    classLevel: "Class VI",
    teacher: "Mr. A. K. Sharma",
    studentCount: 22,
    capacity: 25,
    status: "Active",
  },
  {
    id: "b2",
    name: "Olympiad Batch",
    classLevel: "Class VII",
    teacher: "Mrs. S. Gupta",
    studentCount: 18,
    capacity: 20,
    status: "Active",
  },
  {
    id: "b3",
    name: "Evening Batch",
    classLevel: "Class VI",
    teacher: "Mr. R. Verma",
    studentCount: 15,
    capacity: 15,
    status: "Full",
  },
  {
    id: "b4",
    name: "Summer Camp Batch",
    classLevel: "Class IV-V",
    teacher: "Ms. P. Singh",
    studentCount: 0,
    capacity: 20,
    status: "Upcoming",
  },
  {
    id: "b5",
    name: "Revision Batch 2024",
    classLevel: "Class X",
    teacher: "Mr. A. K. Sharma",
    studentCount: 12,
    capacity: 12,
    status: "Completed",
  },
];

// Reusable component for the status badge
const StatusBadge = ({ status }) => {
  const styles = {
    Active:
      "bg-green-500/20 text-green-300 ring-1 ring-inset ring-green-500/30",
    Upcoming: "bg-sky-500/20 text-sky-400 ring-1 ring-inset ring-sky-500/30",
    Full: "bg-amber-500/20 text-amber-400 ring-1 ring-inset ring-amber-500/30",
    Completed:
      "bg-slate-600/20 text-slate-400 ring-1 ring-inset ring-slate-500/30",
  };
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

// --- NEW Batch Card Component ---
const BatchCard = ({ batch }) => (
  <motion.div
    className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg flex flex-col"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}>
    <div className="p-6 flex-grow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-brand-gold font-semibold">{batch.classLevel}</p>
          <h3 className="text-xl font-bold text-light-slate -mt-1">
            {batch.name}
          </h3>
        </div>
        <StatusBadge status={batch.status} />
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-slate">
          <TeacherIcon size={16} />
          <span>Assigned Teacher:</span>
          <span className="font-semibold text-light-slate">
            {batch.teacher}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate">
          <Users size={16} />
          <span>Students:</span>
          <span className="font-semibold text-light-slate">
            {batch.studentCount} / {batch.capacity}
          </span>
        </div>
      </div>
    </div>

    <div className="p-4 mt-auto flex justify-end items-center gap-2 border-t border-slate-700/50 bg-white/5">
      <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-brand-gold hover:text-dark-navy transition-colors">
        <Edit size={14} /> Edit
      </button>
      <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md bg-red-900/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
        <Trash2 size={14} /> Delete
      </button>
    </div>
  </motion.div>
);

export default function ManageBatchesPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
            Manage Batches
          </h1>
          <p className="text-lg text-slate">
            Create, view, and edit all student batches.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Add New Batch</span>
        </button>
      </div>

      {/* --- NEW Grid Layout --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockBatches.map((batch) => (
          <BatchCard key={batch.id} batch={batch} />
        ))}
      </div>
    </div>
  );
}
