"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookMarked,
  ChevronDown,
  CheckCircle,
  Edit,
  Save,
  Send,
} from "lucide-react";

// --- MOCK DATA ---
const mockTeacherBatches = [
  { id: "batch_vi_foundation", title: "Class VI - Foundation Batch" },
  { id: "batch_vii_olympiad", title: "Class VII - Olympiad Batch" },
];

const mockAssessments = {
  batch_vi_foundation: [
    { id: "as1_math", title: "Algebra Assignment", totalMarks: 20 },
    { id: "ut2_sci", title: "Unit Test II - Science", totalMarks: 50 },
  ],
  batch_vii_olympiad: [
    { id: "as1_phy", title: "Physics Worksheet 1", totalMarks: 25 },
  ],
};

const mockStudentRoster = {
  batch_vi_foundation: [
    { id: "s1", name: "Alex Rider", roll: "VI-01" },
    { id: "s2", name: "Ben Tennyson", roll: "VI-02" },
    { id: "s3", name: "Cindy Vortex", roll: "VI-03" },
  ],
  batch_vii_olympiad: [{ id: "s4", name: "David Johnson", roll: "VII-04" }],
};

// Initial grades data
const mockGrades = {
  as1_math: {
    s1: { score: 18, status: "Graded" },
    s2: { score: null, status: "Submitted" },
    s3: { score: 15, status: "Graded" },
  },
  ut2_sci: {
    /* ... */
  },
};

export default function GradebookPage() {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setStudents(mockStudentRoster[selectedBatch] || []);
    setSelectedAssessment(""); // Reset assessment when batch changes
  }, [selectedBatch]);

  useEffect(() => {
    setGrades(mockGrades[selectedAssessment] || {});
    setIsEditMode(false); // Exit edit mode when assessment changes
  }, [selectedAssessment]);

  const handleGradeChange = (studentId, score) => {
    const totalMarks =
      mockAssessments[selectedBatch]?.find((a) => a.id === selectedAssessment)
        ?.totalMarks || 0;
    const newScore = Math.max(0, Math.min(totalMarks, Number(score))); // Clamp score

    setGrades((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], score: newScore },
    }));
  };

  const handleSaveChanges = () => {
    setIsEditMode(false);
    setStatusMessage("Grades saved successfully!");
    // In a real app, you'd save `grades` to your database here
    console.log("Saving Grades:", grades);
    setTimeout(() => setStatusMessage(""), 5000);
  };

  const availableAssessments = mockAssessments[selectedBatch] || [];

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Gradebook
      </h1>
      <p className="text-lg text-slate mb-8">
        View, enter, and publish student results for assessments.
      </p>

      {/* Controls: Selectors */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 rounded-xl border border-white/10 bg-slate-900/20">
        <div className="relative w-full sm:w-64">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
            <option value="">Select a Batch</option>
            {mockTeacherBatches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.title}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative w-full sm:flex-grow">
          <select
            value={selectedAssessment}
            onChange={(e) => setSelectedAssessment(e.target.value)}
            disabled={!selectedBatch}
            className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold disabled:opacity-50">
            <option value="">Select an Assessment</option>
            {availableAssessments.map((asm) => (
              <option key={asm.id} value={asm.id}>
                {asm.title}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {selectedAssessment ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Action Bar */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              {isEditMode ? (
                <button
                  onClick={handleSaveChanges}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-green-500/20 text-green-300 hover:bg-green-500/30">
                  <Save size={16} /> Save Changes
                </button>
              ) : (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20">
                  <Edit size={16} /> Enter Grades
                </button>
              )}
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-dark-navy">
                <Send size={16} /> Publish Results
              </button>
            </div>
            {statusMessage && (
              <p className="text-sm text-green-400 flex items-center gap-2">
                <CheckCircle size={16} />
                {statusMessage}
              </p>
            )}
          </div>

          {/* Grade Table */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg">
            <div className="grid grid-cols-5 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate">
              <div className="col-span-2">Student Name</div>
              <div>Status</div>
              <div>Score</div>
            </div>
            <div className="divide-y divide-slate-700/50">
              {students.map((student) => {
                const gradeInfo = grades[student.id] || {
                  score: null,
                  status: "Not Submitted",
                };
                const totalMarks = availableAssessments.find(
                  (a) => a.id === selectedAssessment
                )?.totalMarks;
                return (
                  <div
                    key={student.id}
                    className="grid grid-cols-5 gap-4 items-center p-4">
                    <div className="col-span-2">
                      <p className="font-medium text-light-slate">
                        {student.name}
                      </p>
                      <p className="text-xs text-slate">
                        Roll No: {student.roll}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          gradeInfo.status === "Graded"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-slate-500/20 text-slate-300"
                        }`}>
                        {gradeInfo.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditMode ? (
                        <input
                          type="number"
                          value={gradeInfo.score ?? ""}
                          onChange={(e) =>
                            handleGradeChange(student.id, e.target.value)
                          }
                          className="w-20 rounded-md border border-white/10 bg-dark-navy p-2 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                        />
                      ) : (
                        <p className="font-semibold text-white w-20">
                          {gradeInfo.score ?? "–"}
                        </p>
                      )}
                      <span className="text-slate">/ {totalMarks}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-12 rounded-2xl border border-dashed border-white/10">
          <BookMarked className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-xl font-semibold text-white">
            Select a Batch & Assessment
          </h3>
          <p className="mt-1 text-slate">
            Choose from the dropdowns above to view or enter grades.
          </p>
        </div>
      )}
    </div>
  );
}
