"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/firebase/config";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  BookMarked,
  PlusCircle,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  X,
  Edit2,
  ChevronDown,
  FolderUp,
  Send,
  CheckCircle,
} from "lucide-react";
import { format, isFuture } from "date-fns";

// --- HELPER & UI COMPONENTS ---

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
  const nameInputRef = useRef(null);

  useEffect(() => {
    const initialData = {
      title: "",
      batch: "",
      subject: "",
      totalMarks: 100,
      assessmentDate: format(new Date(), "yyyy-MM-dd"),
    };
    if (assessment) {
      setFormData({
        ...assessment,
        assessmentDate: format(
          assessment.assessmentDate.toDate(),
          "yyyy-MM-dd"
        ),
      });
    } else {
      setFormData(initialData);
    }
    if (isOpen) setTimeout(() => nameInputRef.current?.focus(), 100);
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
  const formInputClasses =
    "w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-light-slate placeholder:text-slate-500 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold";

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
          className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-dark-navy/90 p-6 shadow-2xl backdrop-blur-xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}>
          <h2 className="text-xl font-bold text-brand-gold mb-6">
            {assessment ? "Edit Assessment" : "Create New Assessment"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-slate mb-2">
                  Assessment Title
                </label>
                <input
                  ref={nameInputRef}
                  id="title"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  placeholder="e.g., Physics Unit Test II"
                  required
                  className={formInputClasses}
                />
              </div>
              <div>
                <label
                  htmlFor="totalMarks"
                  className="block text-sm font-medium text-slate mb-2">
                  Total Marks
                </label>
                <input
                  id="totalMarks"
                  name="totalMarks"
                  type="number"
                  value={formData.totalMarks || ""}
                  onChange={handleChange}
                  placeholder="e.g., 100"
                  required
                  className={formInputClasses}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative">
                <label
                  htmlFor="batch"
                  className="block text-sm font-medium text-slate mb-2">
                  For Batch
                </label>
                <select
                  id="batch"
                  name="batch"
                  value={formData.batch || ""}
                  onChange={handleChange}
                  required
                  className={`${formInputClasses} appearance-none pr-8`}
                  disabled={!!assessment}>
                  <option value="" disabled>
                    Select Batch...
                  </option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-slate mb-2">
                  For Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject || ""}
                  onChange={handleChange}
                  required
                  className={`${formInputClasses} appearance-none pr-8`}>
                  <option value="" disabled>
                    Select Subject...
                  </option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label
                htmlFor="assessmentDate"
                className="block text-sm font-medium text-slate mb-2">
                Assessment Date
              </label>
              <input
                id="assessmentDate"
                name="assessmentDate"
                type="date"
                value={formData.assessmentDate || ""}
                onChange={handleChange}
                required
                className={formInputClasses}
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
                className="px-6 py-2.5 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400 flex items-center gap-2 disabled:bg-slate-600">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}{" "}
                {assessment ? "Save Changes" : "Create Assessment"}
              </button>
            </div>
          </form>
          <button
            onClick={onClose}
            aria-label="Close modal"
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
  onSaveDraft,
  onPublish,
  students,
  assessment,
  initialGrades,
}) => {
  const [grades, setGrades] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (isOpen) setGrades(initialGrades || {});
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

  const handleSaveDraft = async () => {
    setIsSaving(true);
    await onSaveDraft(assessment.id, grades);
    setIsSaving(false);
    onClose();
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    await onPublish(assessment.id, grades);
    setIsPublishing(false);
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
          className="relative w-full max-w-4xl rounded-2xl border border-white/10 bg-dark-navy/90 p-6 shadow-2xl"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          exit={{ y: 20 }}>
          <h2 className="text-xl font-bold text-brand-gold mb-1">
            Enter Grades
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
                  <div className="col-span-12 sm:col-span-4">
                    <p className="font-medium text-light-slate">
                      {student.name}
                    </p>
                    <p className="text-xs text-slate">
                      Roll No: {student.rollNumber}
                    </p>
                  </div>
                  <div className="col-span-12 sm:col-span-5">
                    <input
                      type="url"
                      value={grades[student.id]?.link ?? ""}
                      onChange={(e) =>
                        handleGradeChange(student.id, "link", e.target.value)
                      }
                      placeholder="Paste answer sheet link (optional)..."
                      className="w-full text-xs rounded-md border border-white/10 bg-dark-navy p-2 text-slate-300 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-3 flex items-center justify-end gap-2">
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
              onClick={handleSaveDraft}
              disabled={isSaving || isPublishing}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-md bg-slate-600 text-white hover:bg-slate-500 disabled:opacity-50">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />} Save as
              Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={isSaving || isPublishing}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400 disabled:opacity-50">
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Save & Publish Results
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  assessmentTitle,
}) => {
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
          className="relative w-full max-w-md rounded-2xl border border-red-500/30 bg-dark-navy p-6 text-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">
            Delete Assessment
          </h3>
          <p className="mt-2 text-sm text-slate">
            Are you sure you want to delete{" "}
            <span className="font-bold text-light-slate">
              "{assessmentTitle}"
            </span>
            ? This is permanent.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="w-full px-4 py-2 text-sm font-bold rounded-md bg-red-600 text-white hover:bg-red-700">
              Confirm Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function GradebookPage() {
  const [assessments, setAssessments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAssessment, setDeletingAssessment] = useState(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [gradingAssessment, setGradingAssessment] = useState(null);

  useEffect(() => {
    const unsubAssessments = onSnapshot(
      query(collection(db, "assessments"), orderBy("assessmentDate", "desc")),
      (snap) => {
        setAssessments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );
    const unsubBatches = onSnapshot(
      query(collection(db, "batches"), orderBy("name")),
      (snap) => setBatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubSubjects = onSnapshot(
      query(collection(db, "subjects"), orderBy("name")),
      (snap) => setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubStudents = onSnapshot(
      query(collection(db, "students")),
      (snap) => setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => {
      unsubAssessments();
      unsubBatches();
      unsubSubjects();
      unsubStudents();
    };
  }, []);

  const groupedAssessments = useMemo(() => {
    if (!selectedBatch) return {};
    return assessments
      .filter((a) => a.batch === selectedBatch)
      .reduce((acc, assessment) => {
        const subject = assessment.subject || "Uncategorized";
        if (!acc[subject]) acc[subject] = [];
        acc[subject].push(assessment);
        return acc;
      }, {});
  }, [assessments, selectedBatch]);

  const handleSaveAssessment = async (formData) => {
    try {
      const dataToSave = {
        ...formData,
        totalMarks: Number(formData.totalMarks),
        assessmentDate: Timestamp.fromDate(
          new Date(`${formData.assessmentDate}T00:00:00`)
        ),
      };
      if (editingAssessment) {
        await updateDoc(doc(db, "assessments", editingAssessment.id), {
          ...dataToSave,
          updatedAt: Timestamp.now(),
        });
      } else {
        await addDoc(collection(db, "assessments"), {
          ...dataToSave,
          createdAt: Timestamp.now(),
          isPublished: false,
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving assessment:", error);
      alert("Failed to save assessment.");
    }
  };

  const handleOpenGradeModal = async (assessment) => {
    const gradesRef = doc(db, "grades", assessment.id);
    const docSnap = await getDoc(gradesRef);
    setGrades(docSnap.exists() ? docSnap.data().studentData || {} : {});
    setGradingAssessment(assessment);
    setIsGradeModalOpen(true);
  };

  const handleSaveGradesAsDraft = async (assessmentId, gradesData) => {
    try {
      const gradesRef = doc(db, "grades", assessmentId);
      await setDoc(
        gradesRef,
        { studentData: gradesData, assessmentId },
        { merge: true }
      );
    } catch (e) {
      console.error("Error saving grades draft: ", e);
      alert("Failed to save draft.");
    }
  };

  const handlePublishResults = async (assessmentId, gradesData) => {
    try {
      await handleSaveGradesAsDraft(assessmentId, gradesData);
      const response = await fetch("/api/publish-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to publish results.");
      alert("Results published successfully!");
    } catch (error) {
      console.error("Error publishing results:", error);
      alert(`Publishing failed: ${error.message}`);
    }
  };

  const handleDelete = (assessment) => {
    setDeletingAssessment(assessment);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (deletingAssessment) {
      try {
        await deleteDoc(doc(db, "assessments", deletingAssessment.id));
        await deleteDoc(doc(db, "grades", deletingAssessment.id));
      } catch (error) {
        console.error("Error deleting assessment:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeletingAssessment(null);
      }
    }
  };

  const handleCreate = () => {
    setEditingAssessment(null);
    setIsModalOpen(true);
  };
  const handleEdit = (assessment) => {
    setEditingAssessment(assessment);
    setIsModalOpen(true);
  };

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
        </div>
      );
    if (!selectedBatch)
      return (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/10">
          <FolderUp className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-xl font-semibold text-white">
            Select a Batch
          </h3>
          <p className="mt-2 text-sm text-slate">
            Choose a batch to view its assessments.
          </p>
        </div>
      );
    if (Object.keys(groupedAssessments).length === 0)
      return (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/10">
          <BookMarked className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-xl font-semibold text-white">
            No Assessments for this Batch
          </h3>
          <p className="mt-2 text-sm text-slate">
            Get started by creating the first assessment for "{selectedBatch}".
          </p>
        </div>
      );
    return (
      <div className="space-y-6">
        {Object.keys(groupedAssessments)
          .sort()
          .map((subjectName) => (
            <motion.div
              key={subjectName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}>
              <h3 className="text-lg font-semibold text-brand-gold mb-3">
                {subjectName}
              </h3>
              <div className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg overflow-hidden">
                <div className="divide-y divide-slate-800">
                  {groupedAssessments[subjectName].map((assessment) => {
                    const isFutureDate = isFuture(
                      assessment.assessmentDate.toDate()
                    );
                    const isPublished = assessment.isPublished;
                    return (
                      <div
                        key={assessment.id}
                        className="grid grid-cols-12 gap-4 items-center p-4 text-sm hover:bg-slate-800/20">
                        <div className="col-span-12 md:col-span-6">
                          <p className="font-medium text-light-slate flex items-center gap-2">
                            {assessment.title}{" "}
                            {isPublished && (
                              <span
                                title="Results are published"
                                className="text-green-400">
                                <CheckCircle size={14} />
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate">
                            Total Marks: {assessment.totalMarks}
                          </p>
                        </div>
                        <div className="col-span-6 md:col-span-3 text-slate-400">
                          {format(
                            assessment.assessmentDate.toDate(),
                            "MMM dd, yyyy"
                          )}
                        </div>
                        <div className="col-span-6 md:col-span-3 flex justify-end gap-1">
                          <button
                            onClick={() => handleEdit(assessment)}
                            disabled={isPublished}
                            className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              isPublished
                                ? "Cannot edit a published assessment"
                                : "Edit"
                            }>
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(assessment)}
                            className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-red-400/10"
                            title="Delete">
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenGradeModal(assessment)}
                            disabled={isFutureDate || isPublished}
                            className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              isFutureDate
                                ? "Grades can be entered on/after assessment date"
                                : isPublished
                                ? "Grades are already published"
                                : "Enter Grades"
                            }>
                            <Edit2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    );
  };

  return (
    <main>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-1">
            Gradebook
          </h1>
          <p className="text-base text-slate">
            Create assessments and manage student results.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Create Assessment</span>
        </button>
      </div>
      <div className="relative w-full md:w-72 mb-6">
        <label htmlFor="batch-filter" className="sr-only">
          Select a Batch
        </label>
        <select
          id="batch-filter"
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-900 p-3 pr-8 text-light-slate focus:border-brand-gold cursor-pointer">
          <option value="" disabled>
            Select a Batch to View...
          </option>
          {batches.map((b) => (
            <option key={b.id} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
      </div>
      {renderContent()}
      <AssessmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAssessment}
        assessment={editingAssessment}
        batches={batches}
        subjects={subjects}
      />
      <GradeEntryModal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        onSaveDraft={handleSaveGradesAsDraft}
        onPublish={handlePublishResults}
        assessment={gradingAssessment}
        students={students.filter((s) => s.batch === gradingAssessment?.batch)}
        initialGrades={grades}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        assessmentTitle={deletingAssessment?.title}
      />
    </main>
  );
}
