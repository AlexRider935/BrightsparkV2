"use client";

import { motion } from "framer-motion";
import {
  Library,
  PlusCircle,
  Edit,
  Trash2,
  FlaskConical,
  Calculator,
  Languages,
  Globe,
} from "lucide-react";

// --- MOCK DATA ---
const mockSubjects = [
  {
    id: "subj_math",
    name: "Mathematics",
    icon: "Calculator",
    classes: ["VI", "VII", "VIII", "IX", "X"],
    teachers: ["Mr. A. K. Sharma", "Mrs. R. Singh"],
  },
  {
    id: "subj_sci",
    name: "Science",
    icon: "FlaskConical",
    classes: ["VI", "VII", "VIII"],
    teachers: ["Mrs. S. Gupta"],
  },
  {
    id: "subj_eng",
    name: "English",
    icon: "Languages",
    classes: ["VI", "VII", "VIII", "IX", "X"],
    teachers: ["Ms. J. David"],
  },
  {
    id: "subj_sst",
    name: "Social Studies",
    icon: "Globe",
    classes: ["VI", "VII", "VIII"],
    teachers: ["Mr. R. Verma"],
  },
];

// An icon map to dynamically render the correct icon based on the mock data
const iconMap = {
  Calculator: Calculator,
  FlaskConical: FlaskConical,
  Languages: Languages,
  Globe: Globe,
};

// --- Subject Card Component ---
const SubjectCard = ({ subject }) => {
  const Icon = iconMap[subject.icon] || Library;

  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}>
      <div className="p-6 flex-grow">
        <div className="flex items-center gap-3 mb-4">
          <Icon className="h-6 w-6 text-brand-gold" />
          <h3 className="text-xl font-bold text-light-slate">{subject.name}</h3>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-slate mb-2">
              Offered For Classes:
            </p>
            <div className="flex flex-wrap gap-2">
              {subject.classes.map((cls) => (
                <span
                  key={cls}
                  className="text-xs font-medium px-2 py-1 rounded-full bg-slate-500/20 text-slate-300">
                  Class {cls}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate mb-2">
              Assigned Teachers:
            </p>
            <div className="flex flex-wrap gap-2">
              {subject.teachers.map((teacher) => (
                <span
                  key={teacher}
                  className="text-xs font-medium px-2 py-1 rounded-full bg-dark-navy text-slate-300 border border-slate-700">
                  {teacher}
                </span>
              ))}
            </div>
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
};

export default function ManageSubjectsPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
            Manage Subjects
          </h1>
          <p className="text-lg text-slate">
            Add, edit, and manage subjects offered at the institute.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockSubjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </div>
  );
}
