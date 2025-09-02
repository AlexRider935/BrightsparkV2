"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, ChevronDown, Search, Phone, Eye } from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
const mockTeacherBatches = [
  { id: "batch_vi_foundation", title: "Class VI - Foundation Batch" },
  { id: "batch_vii_olympiad", title: "Class VII - Olympiad Batch" },
];

const mockStudentRoster = {
  batch_vi_foundation: [
    {
      id: "s1",
      name: "Alex Rider",
      roll: "VI-01",
      parentContact: "+91 98765 43210",
    },
    {
      id: "s2",
      name: "Ben Tennyson",
      roll: "VI-02",
      parentContact: "+91 98765 43211",
    },
    {
      id: "s3",
      name: "Cindy Vortex",
      roll: "VI-03",
      parentContact: "+91 98765 43212",
    },
  ],
  batch_vii_olympiad: [
    {
      id: "s4",
      name: "David Johnson",
      roll: "VII-04",
      parentContact: "+91 98765 43213",
    },
    {
      id: "s5",
      name: "Eva Williams",
      roll: "VII-05",
      parentContact: "+91 98765 43214",
    },
    {
      id: "s6",
      name: "Frank Green",
      roll: "VII-06",
      parentContact: "+91 98765 43215",
    },
  ],
};

// Component for a single student row
const StudentRow = ({ student, index }) => (
  <motion.div
    className="grid grid-cols-6 gap-4 items-center p-4"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}>
    <div className="col-span-3 flex items-center gap-4">
      <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-brand-gold shrink-0">
        {student.name.charAt(0)}
      </div>
      <div>
        <p className="font-semibold text-light-slate">{student.name}</p>
        <p className="text-xs text-slate">Roll No: {student.roll}</p>
      </div>
    </div>
    <div className="col-span-2">
      <div className="flex items-center gap-2 text-sm text-slate">
        <Phone size={14} />
        <span>{student.parentContact}</span>
      </div>
    </div>
    <div className="col-span-1 text-right">
      <Link
        href={`#`}
        className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-brand-gold hover:text-dark-navy transition-colors">
        <Eye size={14} />
        <span>View</span>
      </Link>
    </div>
  </motion.div>
);

export default function StudentRosterPage() {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    if (selectedBatch) {
      const roster = mockStudentRoster[selectedBatch] || [];
      const results = roster.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.roll.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(results);
    } else {
      setFilteredStudents([]);
    }
  }, [selectedBatch, searchTerm]);

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Student Roster
      </h1>
      <p className="text-lg text-slate mb-8">
        View and manage student details for your batches.
      </p>

      {/* Controls: Batch Selector and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 p-4 rounded-xl border border-white/10 bg-slate-900/20">
        <div className="relative w-full sm:w-64">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
            <option value="">Select a Batch to View Roster</option>
            {mockTeacherBatches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.title}
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
            disabled={!selectedBatch}
          />
        </div>
      </div>

      {/* Roster List */}
      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg"
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}>
        {selectedBatch ? (
          <>
            <div className="grid grid-cols-6 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate">
              <div className="col-span-3">Student Name</div>
              <div className="col-span-2">Parent Contact</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            <div className="divide-y divide-slate-700/50">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    index={index}
                  />
                ))
              ) : (
                <p className="p-12 text-center text-slate">
                  No students found matching your search.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-slate">
            <Users className="mx-auto h-12 w-12 text-slate-500" />
            <h3 className="mt-4 text-xl font-semibold text-white">
              Select a Batch
            </h3>
            <p className="mt-1">
              Choose a batch from the dropdown above to see the list of
              students.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
