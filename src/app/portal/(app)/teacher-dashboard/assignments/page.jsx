"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import {
  ClipboardCheck,
  PlusCircle,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  BookText,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";
import { format, isPast } from "date-fns";

// --- HELPER COMPONENTS ---

const AssignmentModal = ({
  isOpen,
  onClose,
  onSave,
  assignment,
  allBatches,
  allSubjects,
}) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const titleInputRef = useRef(null);

  useEffect(() => {
    const initialData = {
      title: "",
      batch: allBatches.length > 0 ? allBatches[0].name : "",
      subject: allSubjects.length > 0 ? allSubjects[0].name : "",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7))
        .toISOString()
        .split("T")[0],
    };

    let dataToSet = assignment ? { ...assignment } : initialData;
    if (dataToSet.dueDate instanceof Timestamp) {
      dataToSet.dueDate = dataToSet.dueDate
        .toDate()
        .toISOString()
        .split("T")[0];
    }
    setFormData(dataToSet);

    if (isOpen) setTimeout(() => titleInputRef.current?.focus(), 100);
  }, [assignment, isOpen, allBatches, allSubjects]);

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
          className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-dark-navy/80 p-6 shadow-2xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}>
          <h2 className="text-xl font-bold text-brand-gold mb-6">
            {assignment ? "Edit Assignment" : "Create New Assignment"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate mb-2">
                Title
              </label>
              <input
                ref={titleInputRef}
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate mb-2">
                  Batch
                </label>
                <select
                  name="batch"
                  value={formData.batch || ""}
                  onChange={handleChange}
                  required
                  className="form-input">
                  <option value="" disabled>
                    Select a Batch
                  </option>
                  {allBatches.map((b) => (
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
                  {allSubjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate mb-2">
                Due Date
              </label>
              <input
                name="dueDate"
                type="date"
                value={formData.dueDate || ""}
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
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {assignment ? "Save Changes" : "Create Assignment"}
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

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  assignmentTitle,
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
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">
            Delete Assignment
          </h3>
          <p className="mt-2 text-sm text-slate">
            Are you sure you want to delete the assignment{" "}
            <span className="font-bold text-light-slate">
              "{assignmentTitle}"
            </span>
            ?
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

const AssignmentCard = ({ assignment, onEdit, onDelete }) => {
  const submissionPercentage =
    Math.round((assignment.submissions / assignment.totalStudents) * 100) || 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-slate">
            {assignment.subject} - {assignment.batch}
          </p>
          <h3 className="text-lg font-semibold text-light-slate mt-1">
            {assignment.title}
          </h3>
        </div>
        <div className="relative group">
          <button className="p-2 text-slate-400 hover:text-white rounded-md hover:bg-white/10">
            <MoreVertical size={18} />
          </button>
          <div className="absolute right-0 mt-1 w-32 bg-dark-navy border border-white/10 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={onEdit}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
              <Edit size={14} /> Edit
            </button>
            <button
              onClick={onDelete}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate mt-2">
        <Clock size={14} />
        <span>Due: {format(assignment.dueDate.toDate(), "MMM dd, yyyy")}</span>
      </div>
      <div className="mt-4 flex-grow">
        <div className="flex justify-between items-center text-sm mb-1">
          <span className="font-semibold text-slate">Submissions</span>
          <span className="text-light-slate">
            {assignment.submissions} / {assignment.totalStudents}
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-brand-gold h-2 rounded-full"
            style={{ width: `${submissionPercentage}%` }}></div>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-end">
        <button className="flex items-center gap-2 rounded-lg bg-brand-gold/20 px-4 py-2 text-sm font-bold text-brand-gold transition-colors hover:bg-brand-gold hover:text-dark-navy">
          <BookText size={16} />
          <span>View Submissions</span>
        </button>
      </div>
    </div>
  );
};

export default function TeacherAssignmentsPage() {
  const [activeTab, setActiveTab] = useState("Active");
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState(null);

  const currentTeacher = { name: "Mr. A. K. Sharma", id: "some-teacher-id" };

  useEffect(() => {
    setLoading(true);
    const qAssignments = query(
      collection(db, "assignments"),
      where("teacherName", "==", currentTeacher.name)
    );
    const unsubAssignments = onSnapshot(qAssignments, (snap) => {
      const sorted = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => b.dueDate.toDate() - a.dueDate.toDate());
      setAssignments(sorted);
      setLoading(false);
    });

    const unsubBatches = onSnapshot(query(collection(db, "batches")), (snap) =>
      setBatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubSubjects = onSnapshot(
      query(collection(db, "subjects")),
      (snap) => setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubStudents = onSnapshot(
      query(collection(db, "students")),
      (snap) => setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubAssignments();
      unsubBatches();
      unsubSubjects();
      unsubStudents();
    };
  }, [currentTeacher.name]);

  const { activeAssignments, pastAssignments } = useMemo(() => {
    const assignmentsWithCounts = assignments.map((assignment) => {
      const totalStudents = students.filter(
        (s) => s.batch === assignment.batch
      ).length;
      return { ...assignment, totalStudents, submissions: 0 };
    });

    const active = assignmentsWithCounts.filter(
      (a) => !isPast(a.dueDate.toDate())
    );
    const past = assignmentsWithCounts.filter((a) =>
      isPast(a.dueDate.toDate())
    );

    return { activeAssignments: active, pastAssignments: past };
  }, [assignments, students]);

  const assignmentsToShow =
    activeTab === "Active" ? activeAssignments : pastAssignments;

  const handleSave = async (formData) => {
    try {
      const dataToSave = {
        ...formData,
        dueDate: Timestamp.fromDate(new Date(formData.dueDate)),
        teacherName: currentTeacher.name,
      };
      if (editingAssignment) {
        await updateDoc(
          doc(db, "assignments", editingAssignment.id),
          dataToSave
        );
      } else {
        await addDoc(collection(db, "assignments"), {
          ...dataToSave,
          createdAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error("Error saving assignment", error);
    }
  };

  const handleDelete = (assignment) => {
    setDeletingAssignment(assignment);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (deletingAssignment) {
      try {
        await deleteDoc(doc(db, "assignments", deletingAssignment.id));
        setIsDeleteModalOpen(false);
        setDeletingAssignment(null);
      } catch (error) {
        console.error("Error deleting assignment", error);
      }
    }
  };

  const handleCreate = () => {
    setEditingAssignment(null);
    setIsModalOpen(true);
  };
  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setIsModalOpen(true);
  };

  return (
    <div>
      <style jsx global>{`
        .form-input {
          @apply w-full appearance-none cursor-pointer rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-200;
        }
      `}</style>
      <AssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        assignment={editingAssignment}
        allBatches={batches}
        allSubjects={subjects}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        assignmentTitle={deletingAssignment?.title}
      />

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
            Assignments
          </h1>
          <p className="text-lg text-slate">
            Create, manage, and grade your student assignments.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Create New Assignment</span>
        </button>
      </div>

      <div className="flex border-b border-slate-700/50 mb-6">
        <button
          onClick={() => setActiveTab("Active")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "Active"
              ? "border-b-2 border-brand-gold text-brand-gold"
              : "text-slate hover:text-white"
          }`}>
          Active ({activeAssignments.length})
        </button>
        <button
          onClick={() => setActiveTab("Past")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "Past"
              ? "border-b-2 border-brand-gold text-brand-gold"
              : "text-slate hover:text-white"
          }`}>
          Past ({pastAssignments.length})
        </button>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
          </div>
        ) : assignmentsToShow.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignmentsToShow.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onEdit={() => handleEdit(assignment)}
                onDelete={() => handleDelete(assignment)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-2xl border border-dashed border-white/10">
            <ClipboardCheck className="mx-auto h-12 w-12 text-slate-500" />
            <h3 className="mt-4 text-xl font-semibold text-white">
              No {activeTab.toLowerCase()} assignments
            </h3>
            <p className="text-slate mt-2">
              Create a new assignment to get started.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
