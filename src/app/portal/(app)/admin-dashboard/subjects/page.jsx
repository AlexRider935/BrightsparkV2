"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Library,
  PlusCircle,
  Edit,
  Trash2,
  FlaskConical,
  Calculator,
  Languages,
  Globe,
  X,
} from "lucide-react";

// --- MOCK DATA ---
const initialSubjects = [
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

const iconMap = { Calculator, FlaskConical, Languages, Globe };
const mockTeachers = [
  "Mr. A. K. Sharma",
  "Mrs. R. Singh",
  "Mrs. S. Gupta",
  "Ms. J. David",
  "Mr. R. Verma",
];

// --- Modal for Adding/Editing Subjects ---
const SubjectModal = ({ isOpen, onClose, onSave, subject }) => {
  const [formData, setFormData] = useState({
    name: "",
    classes: "",
    teachers: "",
  });

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name || "",
        classes: subject.classes.join(", ") || "",
        teachers: subject.teachers.join(", ") || "",
      });
    } else {
      setFormData({ name: "", classes: "", teachers: "" });
    }
  }, [subject, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      classes: formData.classes.split(",").map((s) => s.trim()),
      teachers: formData.teachers.split(",").map((s) => s.trim()),
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-dark-navy p-6">
          <h2 className="text-xl font-bold text-brand-gold mb-4">
            {subject ? "Edit Subject" : "Add New Subject"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Subject Name (e.g., Physics)"
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
              required
            />
            <textarea
              name="classes"
              value={formData.classes}
              onChange={handleChange}
              placeholder="Offered for Classes (comma separated, e.g., VI, VII, VIII)"
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
            <textarea
              name="teachers"
              value={formData.teachers}
              onChange={handleChange}
              placeholder="Assigned Teachers (comma separated)"
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20">
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400">
                {subject ? "Save Changes" : "Create Subject"}
              </button>
            </div>
          </form>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate hover:text-white">
            <X size={24} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- Subject Card Component (Updated) ---
const SubjectCard = ({ subject, onEdit, onDelete }) => {
  const Icon = iconMap[subject.icon] || Library;
  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg flex flex-col"
      layout>
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
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-brand-gold hover:text-dark-navy transition-colors">
          <Edit size={14} /> Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md bg-red-900/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </motion.div>
  );
};

export default function ManageSubjectsPage() {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const handleCreate = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleDelete = (subjectId) => {
    setSubjects(subjects.filter((s) => s.id !== subjectId));
  };

  const handleSave = (subjectData) => {
    if (editingSubject) {
      setSubjects(
        subjects.map((s) =>
          s.id === editingSubject.id ? { ...s, ...subjectData } : s
        )
      );
    } else {
      const newSubject = {
        ...subjectData,
        id: `subj_${Date.now()}`,
        icon: "Library",
      }; // Default icon for new subjects
      setSubjects([newSubject, ...subjects]);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        subject={editingSubject}
      />
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
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 shrink-0">
            <PlusCircle size={18} />
            <span>Add New Subject</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onEdit={() => handleEdit(subject)}
                onDelete={() => handleDelete(subject.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
