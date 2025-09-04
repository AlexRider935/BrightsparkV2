"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/firebase/config";
// --- THE FIX IS HERE: Added Timestamp to the import list ---
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import {
  BookMarked,
  PlusCircle,
  ChevronDown,
  CheckCircle,
  Edit,
  Save,
  Trash2,
  Edit2,
  Loader2,
  X,
  AlertTriangle,
  Link as LinkIcon,
} from "lucide-react";
import { format } from "date-fns";

// --- Assessment Modal (for creating/editing the test entry) ---
const AssessmentModal = ({
  isOpen,
  onClose,
  onSave,
  assessment,
  batches,
  subjects,
}) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initialData = {
      title: "",
      batch: "",
      subject: "",
      totalMarks: 100,
      assessmentDate: new Date().toISOString().split("T")[0],
      answerSheetLink: "",
    };
    let dataToSet = assessment ? { ...assessment } : initialData;
    if (dataToSet.assessmentDate?.toDate) {
      dataToSet.assessmentDate = dataToSet.assessmentDate
        .toDate()
        .toISOString()
        .split("T")[0];
    }
    setFormData(dataToSet);
  }, [assessment, isOpen]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}>
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-dark-navy/80 p-6 shadow-2xl"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          exit={{ y: 20 }}>
          <h2 className="text-xl font-bold text-brand-gold mb-6">
            {assessment ? "Edit Assessment" : "Create New Assessment"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate mb-2">
                  Assessment Title
                </label>
                <input
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="e.g., Unit Test II"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate mb-2">
                  Total Marks
                </label>
                <input
                  name="totalMarks"
                  type="number"
                  value={formData.totalMarks || ""}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate mb-2">
                  Batch
                </label>
                <select
                  name="batch"
                  value={formData.batch || ""}
                  onChange={handleChange}
                  required
                  className="form-input"
                  disabled={!!assessment}>
                  <option value="" disabled>
                    Select a Batch
                  </option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate mb-2">
                  Subject
                </label>
                <select
                  name="subject"
                  value={formData.subject || ""}
                  onChange={handleChange}
                  required
                  className="form-input">
                  <option value="" disabled>
                    Select a Subject
                  </option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate mb-2">
                Assessment Date
              </label>
              <input
                name="assessmentDate"
                type="date"
                value={formData.assessmentDate || ""}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400 disabled:bg-slate-600">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}{" "}
                {assessment ? "Save Changes" : "Create Assessment"}
              </button>
            </div>
          </form>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10">
            <X size={20} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const GradeEntryModal = ({
  isOpen,
  onClose,
  onSave,
  students,
  assessment,
  initialGrades,
}) => {
  const [grades, setGrades] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGrades(initialGrades || {});
    }
  }, [isOpen, initialGrades]);

  const handleGradeChange = (studentId, field, value) => {
    const newScore =
      field === "score"
        ? Math.max(0, Math.min(assessment.totalMarks, Number(value)))
        : value;
    setGrades((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: newScore },
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    await onSave(assessment.id, grades);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}>
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl rounded-2xl border border-white/10 bg-dark-navy/80 p-6 shadow-2xl"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          exit={{ y: 20 }}>
          <h2 className="text-xl font-bold text-brand-gold mb-1">
            Enter Grades & Links
          </h2>
          <p className="text-slate mb-6">
            {assessment.title} - {assessment.batch}
          </p>
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <div className="divide-y divide-slate-700/50">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="grid grid-cols-12 gap-4 items-center p-3">
                  <div className="col-span-4">
                    <p className="font-medium text-light-slate">
                      {student.name}
                    </p>
                    <p className="text-xs text-slate">
                      Roll No: {student.rollNumber}
                    </p>
                  </div>
                  <div className="col-span-4">
                    <input
                      type="url"
                      value={grades[student.id]?.link ?? ""}
                      onChange={(e) =>
                        handleGradeChange(student.id, "link", e.target.value)
                      }
                      placeholder="Paste answer sheet link..."
                      className="w-full text-xs rounded-md border border-white/10 bg-dark-navy p-2 text-slate-300 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    />
                  </div>
                  <div className="col-span-4 flex items-center justify-end gap-2">
                    <input
                      type="number"
                      value={grades[student.id]?.score ?? ""}
                      onChange={(e) =>
                        handleGradeChange(student.id, "score", e.target.value)
                      }
                      className="w-24 rounded-md border border-white/10 bg-dark-navy p-2 text-center text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    />
                    <span className="text-slate">
                      / {assessment.totalMarks}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20">
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400 disabled:bg-slate-600">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />} Save
              Grades
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function GradebookPage() {
  const [assessments, setAssessments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [gradingAssessment, setGradingAssessment] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubA = onSnapshot(
      query(collection(db, "assessments"), orderBy("assessmentDate", "desc")),
      (snap) =>
        setAssessments(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubB = onSnapshot(
      query(collection(db, "batches"), orderBy("name")),
      (snap) => setBatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubS = onSnapshot(
      query(collection(db, "subjects"), orderBy("name")),
      (snap) => setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubSt = onSnapshot(query(collection(db, "students")), (snap) =>
      setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    setTimeout(() => setLoading(false), 1500);
    return () => {
      unsubA();
      unsubB();
      unsubS();
      unsubSt();
    };
  }, []);

  const handleSaveAssessment = async (formData) => {
    try {
      const dataToSave = {
        ...formData,
        totalMarks: Number(formData.totalMarks),
        assessmentDate: Timestamp.fromDate(new Date(formData.assessmentDate)),
      };
      if (editingAssessment) {
        await updateDoc(
          doc(db, "assessments", editingAssessment.id),
          dataToSave
        );
      } else {
        await addDoc(collection(db, "assessments"), {
          ...dataToSave,
          createdAt: Timestamp.now(),
        });
      }
    } catch (e) {
      console.error("Error saving assessment:", e);
    }
  };

  const handleOpenGradeModal = async (assessment) => {
    const gradesRef = doc(db, "grades", assessment.id);
    const docSnap = await getDoc(gradesRef);
    if (docSnap.exists()) {
      setGrades(docSnap.data().studentData || {});
    } else {
      setGrades({});
    }
    setGradingAssessment(assessment);
    setIsGradeModalOpen(true);
  };

  const handleSaveGrades = async (assessmentId, gradesData) => {
    try {
      const gradesRef = doc(db, "grades", assessmentId);
      await setDoc(gradesRef, { studentData: gradesData }, { merge: true });
    } catch (e) {
      console.error("Error saving grades: ", e);
    }
  };

  return (
    <div>
      <style jsx global>{`
        .form-input {
          @apply w-full appearance-none cursor-pointer rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-200;
        }
      `}</style>
      <AssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        onSave={handleSaveAssessment}
        assessment={editingAssessment}
        batches={batches}
        subjects={subjects}
      />
      <GradeEntryModal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        onSave={handleSaveGrades}
        assessment={gradingAssessment}
        students={students.filter((s) => s.batch === gradingAssessment?.batch)}
        initialGrades={grades}
      />

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-1">
            Gradebook
          </h1>
          <p className="text-base text-slate">
            Manage student results for all assessments.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAssessment(null);
            setIsAssessmentModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Create Assessment</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
        </div>
      ) : assessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessments.map((assessment) => (
            <motion.div
              key={assessment.id}
              className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 flex flex-col gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}>
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold bg-slate-700/50 px-2 py-1 rounded">
                    {assessment.subject}
                  </span>
                  <span className="text-xs text-slate">
                    {format(assessment.assessmentDate.toDate(), "MMM dd, yyyy")}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-light-slate mt-2">
                  {assessment.title}
                </h3>
                <p className="text-sm text-slate">{assessment.batch}</p>
              </div>
              <div className="flex-grow"></div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
                <p className="text-sm text-slate">
                  Total Marks:{" "}
                  <span className="font-bold text-white">
                    {assessment.totalMarks}
                  </span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingAssessment(assessment);
                      setIsAssessmentModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-white/10">
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleOpenGradeModal(assessment)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-brand-gold hover:text-dark-navy">
                    <Edit2 size={14} /> Enter Grades
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-2xl border border-dashed border-white/10">
          <BookMarked className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-xl font-semibold text-white">
            No Assessments Created
          </h3>
          <p className="mt-1 text-slate">
            Click "Create Assessment" to add the first gradebook entry.
          </p>
        </div>
      )}
    </div>
  );
}
