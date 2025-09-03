"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderUp,
  PlusCircle,
  Edit,
  Trash2,
  X,
  FileText,
  ChevronDown,
  Search,
} from "lucide-react";

// --- MOCK DATA ---
const mockAllMaterials = [
  {
    id: "mat1",
    name: "Algebra Exercise 1.pdf",
    batch: "Class VI - Foundation",
    subject: "Mathematics",
    category: "Assignments",
    uploadedBy: "Mr. A. K. Sharma",
    date: new Date("2025-08-30"),
    size: "1.2 MB",
  },
  {
    id: "mat2",
    name: "Geometry Problems.pdf",
    batch: "Class VI - Foundation",
    subject: "Mathematics",
    category: "Assignments",
    uploadedBy: "Mr. A. K. Sharma",
    date: new Date("2025-08-22"),
    size: "850 KB",
  },
  {
    id: "mat3",
    name: "Photosynthesis Diagram.pdf",
    batch: "Class VII - Olympiad",
    subject: "Science",
    category: "Assignments",
    uploadedBy: "Mrs. S. Gupta",
    date: new Date("2025-08-28"),
    size: "970 KB",
  },
  {
    id: "mat4",
    name: "NCERT Science Class VII.pdf",
    batch: "Class VII - Olympiad",
    subject: "Science",
    category: "Books",
    uploadedBy: "Admin",
    date: new Date("2025-08-01"),
    size: "18.2 MB",
  },
  {
    id: "mat5",
    name: "Chapter 1-3 Summary Notes.pdf",
    batch: "Class VI - Foundation",
    subject: "Mathematics",
    category: "Notes",
    uploadedBy: "Mr. A. K. Sharma",
    date: new Date("2025-08-10"),
    size: "2.1 MB",
  },
];

// Data for filter dropdowns
const mockBatches = ["Class VI - Foundation", "Class VII - Olympiad"];
const mockSubjects = ["Mathematics", "Science", "English"];
const mockTeachers = ["Mr. A. K. Sharma", "Mrs. S. Gupta", "Admin"];
const resourceCategories = ["Assignments", "Worksheets", "Notes", "Books"];

// Modal for uploading new material
const UploadModal = ({ isOpen, onClose }) => {
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
            Upload New Material
          </h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate mb-1">
                File
              </label>
              <input
                type="file"
                className="w-full text-sm text-slate file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-gold/10 file:text-brand-gold hover:file:bg-brand-gold/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
                <option>Select Batch</option>
              </select>
              <select className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
                <option>Select Category</option>
              </select>
            </div>
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
                Upload
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

export default function ManageMaterialsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    batch: "all",
    subject: "all",
    teacher: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const filteredMaterials = useMemo(() => {
    return mockAllMaterials
      .filter((m) => filters.batch === "all" || m.batch === filters.batch)
      .filter((m) => filters.subject === "all" || m.subject === filters.subject)
      .filter(
        (m) => filters.teacher === "all" || m.uploadedBy === filters.teacher
      )
      .filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [filters, searchTerm]);

  return (
    <>
      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
              Manage Study Materials
            </h1>
            <p className="text-lg text-slate">
              Oversee all uploaded resources for the institute.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 shrink-0">
            <PlusCircle size={18} />
            <span>Upload New Material</span>
          </button>
        </div>

        {/* --- FIXED: Filters and Search Bar --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 rounded-xl border border-white/10 bg-slate-900/20">
          <div className="relative">
            <select
              onChange={(e) => handleFilterChange("batch", e.target.value)}
              className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
              <option value="all">Filter by Batch</option>
              {mockBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              onChange={(e) => handleFilterChange("subject", e.target.value)}
              className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
              <option value="all">Filter by Subject</option>
              {mockSubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              onChange={(e) => handleFilterChange("teacher", e.target.value)}
              className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
              <option value="all">Filter by Teacher</option>
              {mockTeachers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by file name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-3 rounded-lg border border-white/10 bg-slate-900/50 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>
        </div>

        {/* Materials Table */}
        <motion.div className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg">
          <div className="grid grid-cols-10 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase tracking-wider">
            <div className="col-span-4">File Name</div>
            <div className="col-span-2">Batch</div>
            <div className="col-span-2">Uploaded By</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          <div className="divide-y divide-slate-700/50">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className="grid grid-cols-10 gap-4 items-center p-4 text-sm">
                <div className="col-span-4 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-400 shrink-0" />
                  <span className="font-medium text-light-slate truncate">
                    {material.name}
                  </span>
                </div>
                <div className="col-span-2 text-slate truncate">
                  {material.batch}
                </div>
                <div className="col-span-2 text-slate truncate">
                  {material.uploadedBy}
                </div>
                <div className="col-span-1 text-slate">
                  {material.date.toLocaleDateString("en-CA")}
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
    </>
  );
}
