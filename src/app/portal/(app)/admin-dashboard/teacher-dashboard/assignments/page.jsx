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
  RefreshCw,
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
    const initialData = {
      title: "",
      batch: "",
      subject: "",
      dueDate: format(
        new Date(new Date().setDate(new Date().getDate() + 7)),
        "yyyy-MM-dd"
      ),
      instructionsLink: "",
    };
    if (assignment) {
      setFormData({
        ...assignment,
        dueDate: format(assignment.dueDate.toDate(), "yyyy-MM-dd"),
      });
    } else {
      setFormData(initialData);
    }
    if (isOpen) setTimeout(() => titleInputRef.current?.focus(), 100);
  }, [assignment, isOpen]);

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

// --- UPDATED RESUBMIT MODAL ---
const RequestResubmitModal = ({ isOpen, onClose, onConfirm, studentName }) => {
  const [comments, setComments] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleConfirm = async () => {
    if (!comments.trim()) return;
    setIsSending(true);
    await onConfirm(comments);
    setIsSending(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) setComments("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* FIX #2: Changed z-index to 60 to appear on top */}
      <motion.div
        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}>
        <motion.div
          className="relative w-full max-w-lg rounded-2xl border border-red-500/30 bg-dark-navy p-6"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start gap-4">
            {/* FIX #2: Using red theme */}
            <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-900/50">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div className="w-full">
              <h3 className="text-lg font-bold text-white">
                Request Resubmission for {studentName}
              </h3>
              <p className="mt-2 text-sm text-slate">
                Provide required comments for the student. An email notification
                will be sent.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <label
              htmlFor="comments"
              className="text-sm font-medium text-slate">
              Comments (Required)
            </label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              placeholder="e.g., Please re-check question 3 and provide more detail."
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-light-slate placeholder:text-slate-500 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"></textarea>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!comments.trim() || isSending}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-md bg-red-600 text-white hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed">
              {isSending && <Loader2 className="h-4 w-4 animate-spin" />}
              Send & Request Resubmission
            </button>
          </div>
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
  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [resubmittingSubmission, setResubmittingSubmission] = useState(null);

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

  const handleResubmit = (submission) => {
    setResubmittingSubmission(submission);
    setIsResubmitModalOpen(true);
  };

  // FIX #1: This function now handles both the email and the deletion.
  const confirmResubmitAndEmail = async (comments) => {
    if (!resubmittingSubmission) return;

    try {
      const response = await fetch("/api/request-resubmission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: resubmittingSubmission.studentId,
          studentName: resubmittingSubmission.studentName,
          assignmentTitle: assignment.title,
          teacherComments: comments,
          dueDate: assignment.dueDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to send email notification."
        );
      }

      const subRef = doc(
        db,
        "assignments",
        assignment.id,
        "submissions",
        resubmittingSubmission.id
      );
      await deleteDoc(subRef);
    } catch (error) {
      console.error("Error in resubmission process:", error);
      alert("Error: " + error.message);
    } finally {
      setIsResubmitModalOpen(false);
      setResubmittingSubmission(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <RequestResubmitModal
        isOpen={isResubmitModalOpen}
        onClose={() => setIsResubmitModalOpen(false)}
        onConfirm={confirmResubmitAndEmail}
        studentName={resubmittingSubmission?.studentName}
      />
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}>
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl rounded-2xl border border-white/10 bg-dark-navy/90 p-6 shadow-2xl"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            exit={{ y: 20 }}>
            <h2 className="text-xl font-bold text-brand-gold mb-1">
              Submissions for: {assignment.title}
            </h2>
            <p className="text-slate mb-6">Batch: {assignment.batch}</p>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {loadingSubmissions ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
                </div>
              ) : (
                <div className="border border-slate-700/50 rounded-lg">
                  <div className="grid grid-cols-12 gap-4 p-3 bg-slate-800/50 rounded-t-lg font-semibold text-xs text-slate-300 uppercase">
                    <div className="col-span-4">Student</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Submitted At</div>
                    <div className="col-span-4 text-right">Actions</div>
                  </div>
                  <div className="divide-y divide-slate-700/50">
                    {studentsInBatch.map((student) => {
                      const submission = submissionsMap.get(student.id);
                      const status = submission
                        ? submission.status || "Submitted"
                        : "Not Submitted";
                      return (
                        <div
                          key={student.id}
                          className="grid grid-cols-12 gap-4 items-center p-3 text-sm">
                          <div className="col-span-4">
                            <p className="font-medium text-light-slate">
                              {student.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              Roll: {student.rollNumber}
                            </p>
                          </div>
                          <div className="col-span-2">
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
                              <span className="text-xs text-slate-500">—</span>
                            )}
                          </div>
                          <div className="col-span-2 text-xs text-slate-400">
                            {submission?.submittedAt
                              ? format(
                                  submission.submittedAt.toDate(),
                                  "dd MMM, hh:mm a"
                                )
                              : "—"}
                          </div>
                          <div className="col-span-4 flex justify-end gap-2">
                            {submission ? (
                              <>
                                <a
                                  href={submission.submissionLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-slate-700/80 text-slate-300 hover:bg-slate-700">
                                  <LinkIcon size={14} /> View Link
                                </a>
                                {status === "Submitted" && (
                                  <button
                                    onClick={() => handleApprove(submission.id)}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-green-500/20 text-green-300 hover:bg-green-500/30">
                                    <CheckCircle size={14} /> Approve
                                  </button>
                                )}
                                <button
                                  onClick={() => handleResubmit(submission)}
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30">
                                  <RefreshCw size={14} /> Resubmit
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-slate-600 pr-2">
                                No actions available
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-700/50">
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
    </>
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
    if (user === null) {
      setLoading(false);
      setAssignments([]);
      setSubmissions([]);
      return;
    }
    if (user?.profile?.name) {
      const teacherName = user.profile.name;
      const qAssignments = query(
        collection(db, "assignments"),
        where("teacherName", "==", teacherName),
        orderBy("dueDate", "desc")
      );
      const unsubAssignments = onSnapshot(
        qAssignments,
        (snap) => {
          setAssignments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
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
    }
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
    () =>
      students
        .filter((s) => s.batch === viewingAssignment?.batch)
        .sort((a, b) => a.rollNumber - b.rollNumber),
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
                  {/* --- FIX #3: UPDATED TABLE HEADER --- */}
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase tracking-wider">
                    <div className="col-span-12 md:col-span-4">Assignment</div>
                    <div className="col-span-6 md:col-span-2">Batch</div>
                    <div className="col-span-6 md:col-span-2">Subject</div>
                    <div className="col-span-6 md:col-span-1">Due Date</div>
                    <div className="col-span-6 md:col-span-1">Submissions</div>
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
                        // --- FIX #3: UPDATED TABLE ROW ---
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
                          </div>
                          <div className="col-span-6 md:col-span-2 text-slate-400">
                            {assignment.subject}
                          </div>
                          <div className="col-span-6 md:col-span-1 text-slate-400">
                            {format(
                              assignment.dueDate.toDate(),
                              "MMM dd, yyyy"
                            )}
                          </div>
                          <div className="col-span-6 md:col-span-1">
                            <span className="text-xs font-mono text-slate-400">
                              {assignment.submissionCount} /{" "}
                              {assignment.totalStudents}
                            </span>
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
