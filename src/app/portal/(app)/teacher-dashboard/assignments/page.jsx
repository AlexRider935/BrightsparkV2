"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
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
  where,
  collectionGroup,
} from "firebase/firestore";
import {
  ClipboardCheck,
  PlusCircle,
  Clock,
  Edit,
  Trash2,
  BookText,
  Loader2,
  X,
  AlertTriangle,
  ChevronDown,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  Send,
} from "lucide-react";
import { format, isPast } from "date-fns";

// --- HELPER & UI COMPONENTS ---

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
    // This guard clause is the key fix. It checks for the fully loaded user profile.
    if (!user?.profile?.name) {
      // If the user object exists but the profile isn't attached yet, we just wait.
      // The useEffect will re-run automatically when the user object is updated by the context.
      if (user) return;

      // If after a short delay the user object is still null, they are likely not logged in.
      // We can safely stop the loader.
      const timer = setTimeout(() => {
        if (!user) setLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }

    // If we get here, it means user.profile.name is guaranteed to exist.
    // Now we can safely set up all our listeners.
    setLoading(true);
    const teacherName = user.profile.name;

    const qAssignments = query(
      collection(db, "assignments"),
      where("teacherName", "==", teacherName),
      orderBy("dueDate", "desc")
    );

    // All listeners can now be set up safely.
    const unsubAssignments = onSnapshot(
      qAssignments,
      (snap) => {
        setAssignments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        // This setLoading(false) is crucial. It stops the spinner even if the teacher has 0 assignments.
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching assignments:", err);
        setLoading(false); // Also called on error.
      }
    );

    const unsubSubmissions = onSnapshot(
      query(collectionGroup(db, "submissions")),
      (snap) =>
        setSubmissions(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            assignmentId: d.ref.parent.parent.id,
          }))
        )
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
      unsubAssignments();
      unsubBatches();
      unsubSubjects();
      unsubStudents();
      unsubSubmissions();
    };
  }, [user]); // The dependency on `user` will correctly re-run this when the profile is loaded.

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
            {assignment ? "Edit Assignment" : "Create New Assignment"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate mb-2">
                Assignment Title
              </label>
              <input
                ref={titleInputRef}
                id="title"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                required
                className={formInputClasses}
                placeholder="e.g., Chapter 5 Algebra Problems"
              />
            </div>
            <div>
              <label
                htmlFor="instructionsLink"
                className="block text-sm font-medium text-slate mb-2">
                Instructions Link (Optional)
              </label>
              <input
                id="instructionsLink"
                name="instructionsLink"
                type="url"
                value={formData.instructionsLink || ""}
                onChange={handleChange}
                className={formInputClasses}
                placeholder="https://docs.google.com/document/..."
              />
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
                  className={`${formInputClasses} appearance-none pr-8`}>
                  <option value="" disabled>
                    Select Batch...
                  </option>
                  {allBatches.map((b) => (
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
                  {allSubjects.map((s) => (
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
                htmlFor="dueDate"
                className="block text-sm font-medium text-slate mb-2">
                Submission Deadline
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate || ""}
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
                {assignment ? "Save Changes" : "Create Assignment"}
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

const ViewSubmissionsModal = ({
  isOpen,
  onClose,
  assignment,
  studentsInBatch,
}) => {
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  useEffect(() => {
    if (!isOpen || !assignment) return;
    setLoadingSubmissions(true);
    const submissionsRef = collection(
      db,
      "assignments",
      assignment.id,
      "submissions"
    );
    const q = query(submissionsRef, orderBy("submittedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSubmissions(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoadingSubmissions(false);
    });
    return () => unsubscribe();
  }, [isOpen, assignment]);

  const submissionsMap = useMemo(
    () => new Map(submissions.map((s) => [s.studentId, s])),
    [submissions]
  );

  const handleApprove = async (submissionId) => {
    const subRef = doc(
      db,
      "assignments",
      assignment.id,
      "submissions",
      submissionId
    );
    await updateDoc(subRef, { status: "Approved" });
  };

  const handleResubmit = async (submissionId) => {
    if (
      confirm(
        "Are you sure? This will delete the student's current submission and ask them to resubmit."
      )
    ) {
      const subRef = doc(
        db,
        "assignments",
        assignment.id,
        "submissions",
        submissionId
      );
      await deleteDoc(subRef);
    }
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
            View Submissions
          </h2>
          <p className="text-slate mb-6">
            {assignment.title} - {assignment.batch}
          </p>
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            {loadingSubmissions ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
              </div>
            ) : (
              <div className="divide-y divide-slate-700/50">
                {studentsInBatch.map((student) => {
                  const submission = submissionsMap.get(student.id);
                  const status = submission
                    ? submission.status || "Submitted"
                    : "Not Submitted";
                  return (
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
                      <div className="col-span-12 sm:col-span-4">
                        {status === "Approved" && (
                          <span className="flex items-center gap-2 text-xs font-semibold text-green-400">
                            <CheckCircle size={14} /> Approved
                          </span>
                        )}
                        {status === "Submitted" && (
                          <span className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                            <Send size={14} /> Submitted
                          </span>
                        )}
                        {status === "Not Submitted" && (
                          <span className="text-xs text-slate-500">
                            No submission yet
                          </span>
                        )}
                      </div>
                      <div className="col-span-12 sm:col-span-4 flex justify-end gap-2">
                        {submission?.submissionLink && (
                          <a
                            href={submission.submissionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10"
                            title="View Submission">
                            <LinkIcon size={16} />
                          </a>
                        )}
                        {status === "Submitted" && (
                          <button
                            onClick={() => handleApprove(submission.id)}
                            className="p-2 text-slate-400 hover:text-green-400 rounded-md hover:bg-green-400/10"
                            title="Approve">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {status !== "Not Submitted" && (
                          <button
                            onClick={() => handleResubmit(submission.id)}
                            className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-red-400/10"
                            title="Ask to Resubmit">
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20">
              Close
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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">
            Delete Assignment
          </h3>
          <p className="mt-2 text-sm text-slate">
            Are you sure you want to delete{" "}
            <span className="font-bold text-light-slate">
              "{assignmentTitle}"
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

export default function TeacherAssignmentsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Active");
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState(null);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState(null);

  useEffect(() => {
    // --- FIX: Correctly wait for the user profile to load ---
    if (!user?.profile?.name) {
      if (user) return; // Profile is still loading, wait for the next run
      const timer = setTimeout(() => {
        if (!user) setLoading(false);
      }, 2500);
      return () => clearTimeout(timer);
    }

    setLoading(true);
    const teacherName = user.profile.name;

    // --- FIX: Query now correctly uses the real teacher's name ---
    const qAssignments = query(
      collection(db, "assignments"),
      where("teacherName", "==", teacherName),
      orderBy("dueDate", "desc")
    );
    const unsubAssignments = onSnapshot(
      qAssignments,
      (snap) => {
        setAssignments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false); // Stop loading once assignments are fetched
      },
      (err) => {
        console.error("Error fetching assignments:", err);
        setLoading(false);
      }
    );

    const unsubSubmissions = onSnapshot(
      query(collectionGroup(db, "submissions")),
      (snap) =>
        setSubmissions(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            assignmentId: d.ref.parent.parent.id,
          }))
        )
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
      unsubAssignments();
      unsubBatches();
      unsubSubjects();
      unsubStudents();
      unsubSubmissions();
    };
  }, [user]);

  const { activeAssignments, pastAssignments } = useMemo(() => {
    const assignmentsWithCounts = assignments.map((assignment) => {
      const totalStudents = students.filter(
        (s) => s.batch === assignment.batch
      ).length;
      const submissionCount = submissions.filter(
        (s) => s.assignmentId === assignment.id
      ).length;
      return { ...assignment, totalStudents, submissionCount };
    });
    const now = new Date();
    const active = assignmentsWithCounts.filter(
      (a) =>
        a.dueDate.toDate() >= now ||
        format(a.dueDate.toDate(), "yyyy-MM-dd") === format(now, "yyyy-MM-dd")
    );
    const past = assignmentsWithCounts.filter(
      (a) =>
        isPast(a.dueDate.toDate()) &&
        format(a.dueDate.toDate(), "yyyy-MM-dd") !== format(now, "yyyy-MM-dd")
    );
    return { activeAssignments: active, pastAssignments: past };
  }, [assignments, students, submissions]);

  const assignmentsToShow =
    activeTab === "Active" ? activeAssignments : pastAssignments;

  const handleSave = async (formData) => {
    try {
      const dataToSave = {
        ...formData,
        dueDate: Timestamp.fromDate(new Date(`${formData.dueDate}T23:59:59`)),
        teacherName: user.profile.name,
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
      setIsModalOpen(false);
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
      // For production, a Cloud Function is better for deleting subcollections.
      await deleteDoc(doc(db, "assignments", deletingAssignment.id));
      setIsDeleteModalOpen(false);
      setDeletingAssignment(null);
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
  const handleViewSubmissions = (assignment) => {
    setViewingAssignment(assignment);
    setIsSubmissionsModalOpen(true);
  };

  const studentsForViewing = useMemo(
    () => students.filter((s) => s.batch === viewingAssignment?.batch),
    [students, viewingAssignment]
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );

  return (
    <main>
      <AssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        assignment={editingAssignment}
        allBatches={batches}
        allSubjects={subjects}
      />
      <ViewSubmissionsModal
        isOpen={isSubmissionsModalOpen}
        onClose={() => setIsSubmissionsModalOpen(false)}
        assignment={viewingAssignment}
        studentsInBatch={studentsForViewing}
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
          Past Due ({pastAssignments.length})
        </button>
      </div>

      <AnimatePresence>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
          {assignmentsToShow.length > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase tracking-wider">
                    <div className="col-span-12 md:col-span-4">Assignment</div>
                    <div className="col-span-6 md:col-span-2">
                      Batch & Subject
                    </div>
                    <div className="col-span-6 md:col-span-2">Due Date</div>
                    <div className="col-span-6 md:col-span-2">Submissions</div>
                    <div className="col-span-6 md:col-span-2 text-right">
                      Actions
                    </div>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {assignmentsToShow.map((assignment) => {
                      const submissionPercentage =
                        assignment.totalStudents > 0
                          ? Math.round(
                              (assignment.submissionCount /
                                assignment.totalStudents) *
                                100
                            )
                          : 0;
                      return (
                        <div
                          key={assignment.id}
                          className="grid grid-cols-12 gap-4 items-center p-4 text-sm hover:bg-slate-800/20">
                          <div className="col-span-12 md:col-span-4 font-medium text-light-slate">
                            {assignment.title}
                          </div>
                          <div className="col-span-6 md:col-span-2">
                            <p className="text-xs bg-slate-700/50 px-2 py-0.5 rounded inline-block">
                              {assignment.batch}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {assignment.subject}
                            </p>
                          </div>
                          <div className="col-span-6 md:col-span-2 text-slate-400">
                            {format(
                              assignment.dueDate.toDate(),
                              "MMM dd, yyyy"
                            )}
                          </div>
                          <div className="col-span-12 md:col-span-2">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-slate-700 rounded-full h-1.5">
                                <div
                                  className="bg-brand-gold h-1.5 rounded-full"
                                  style={{
                                    width: `${submissionPercentage}%`,
                                  }}></div>
                              </div>
                              <span className="text-xs font-mono text-slate-400">
                                {submissionPercentage}%
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {assignment.submissionCount} of{" "}
                              {assignment.totalStudents} submitted
                            </p>
                          </div>
                          <div className="col-span-12 md:col-span-2 flex justify-end gap-1">
                            <button
                              onClick={() => handleEdit(assignment)}
                              className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10"
                              title="Edit">
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(assignment)}
                              className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-red-400/10"
                              title="Delete">
                              <Trash2 size={16} />
                            </button>
                            <button
                              onClick={() => handleViewSubmissions(assignment)}
                              className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10"
                              title="View Submissions">
                              <BookText size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl border border-dashed border-white/10">
              <ClipboardCheck className="mx-auto h-12 w-12 text-slate-500" />
              <h3 className="mt-4 text-xl font-semibold text-white">
                No {activeTab.toLowerCase()} assignments
              </h3>
              <p className="text-slate mt-2">
                {activeTab === "Active"
                  ? "Create a new assignment to get started."
                  : "There are no past due assignments."}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
