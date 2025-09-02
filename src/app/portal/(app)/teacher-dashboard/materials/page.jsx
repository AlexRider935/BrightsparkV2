"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FolderUp,
  ChevronDown,
  PlusCircle,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";

// --- MOCK DATA ---
// This is the same data structure from the student's 'My Courses' page.
// Added 'fileSize' for more detail.
const mockCourseMaterials = [
  {
    id: "math_vi",
    title: "Mathematics VI",
    resources: {
      assignments: [
        {
          id: "a1",
          name: "Algebra Exercise 1.pdf",
          date: "2025-08-30",
          type: "pdf",
          size: "1.2 MB",
        },
        {
          id: "a2",
          name: "Geometry Problems.pdf",
          date: "2025-08-22",
          type: "pdf",
          size: "850 KB",
        },
      ],
      worksheets: [
        {
          id: "w1",
          name: "Chapter 4 Practice Sheet.pdf",
          date: "2025-08-15",
          type: "pdf",
          size: "970 KB",
        },
      ],
      books: [
        {
          id: "b1",
          name: "NCERT Mathematics Class VI.pdf",
          date: "2025-08-01",
          type: "pdf",
          size: "15.4 MB",
        },
      ],
      notes: [
        {
          id: "n1",
          name: "Chapter 1-3 Summary Notes.pdf",
          date: "2025-08-10",
          type: "pdf",
          size: "2.1 MB",
        },
      ],
    },
  },
  {
    id: "science_vi",
    title: "Science VI",
    resources: {
      /* ... similar resource structure ... */
    },
  },
];

const resourceCategories = [
  { key: "assignments", label: "Assignments" },
  { key: "worksheets", label: "Worksheets" },
  { key: "notes", label: "Notes" },
  { key: "books", label: "Books" },
];

// Component for a single material row
const MaterialRow = ({ material }) => (
  <div className="grid grid-cols-10 gap-4 items-center p-3 text-sm hover:bg-slate-800/50 rounded-lg">
    <div className="col-span-5 flex items-center gap-3">
      <FileText className="h-5 w-5 text-slate-400 shrink-0" />
      <span className="font-medium text-light-slate truncate">
        {material.name}
      </span>
    </div>
    <div className="col-span-2 text-slate">
      {new Date(material.date).toLocaleDateString("en-CA")}
    </div>
    <div className="col-span-1 text-slate">{material.size}</div>
    <div className="col-span-2 flex justify-end gap-2">
      <button className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-white/5">
        <Edit size={16} />
      </button>
      <button className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-white/5">
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);

export default function StudyMaterialPage() {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [activeCategory, setActiveCategory] = useState("assignments");

  const courseData = mockCourseMaterials.find((c) => c.id === selectedBatch);
  const materialsToShow = courseData
    ? courseData.resources[activeCategory]
    : [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
            Study Material
          </h1>
          <p className="text-lg text-slate">
            Manage and upload resources for your batches.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Upload New Material</span>
        </button>
      </div>

      {/* Batch Selector */}
      <div className="relative w-full sm:w-72 mb-6">
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
          <option value="">Select a Batch to Manage</option>
          {mockCourseMaterials.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
      </div>

      {selectedBatch ? (
        <motion.div
          key={selectedBatch}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}>
          {/* Category Tabs */}
          <div className="flex border-b border-slate-700/50 mb-4">
            {resourceCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat.key
                    ? "border-b-2 border-brand-gold text-brand-gold"
                    : "text-slate hover:text-white"
                }`}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Materials List */}
          <motion.div
            key={activeCategory}
            className="rounded-2xl border border-white/10 bg-slate-900/20 p-4 backdrop-blur-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-10 gap-4 p-3 text-xs font-semibold text-slate border-b border-slate-700/50">
              <div className="col-span-5">File Name</div>
              <div className="col-span-2">Date Uploaded</div>
              <div className="col-span-1">Size</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <div className="divide-y divide-slate-800/50">
              {materialsToShow.length > 0 ? (
                materialsToShow.map((material) => (
                  <MaterialRow key={material.id} material={material} />
                ))
              ) : (
                <p className="p-8 text-center text-slate">
                  No materials found in this category.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <div className="text-center py-12 rounded-2xl border border-dashed border-white/10">
          <FolderUp className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-xl font-semibold text-white">
            Select a Batch
          </h3>
          <p className="mt-1 text-slate">
            Choose a batch from the dropdown to manage its study materials.
          </p>
        </div>
      )}
    </div>
  );
}
