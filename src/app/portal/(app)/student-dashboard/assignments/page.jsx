"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  Timestamp,
  collectionGroup,
} from "firebase/firestore";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Upload,
  Eye,
  X,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { format, isPast } from "date-fns";

// --- HELPER & UI COMPONENTS (No changes here) ---

const formatDate = (date) => format(date, "MMM dd, yyyy");

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-amber-500/20 text-amber-400",
    Submitted: "bg-sky-500/20 text-sky-400",
    Approved: "bg-green-500/20 text-green-400",
  };
  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full shrink-0 ${
        styles[status] || "bg-slate-700 text-slate-300"
      }`}>
      {status}
    </span>
  );
};

const SubmissionModal = ({ isOpen, onClose, assignment, onSubmit }) => {
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!link) {
      setError("Please enter a link.");
      return;
    }
    try {
      new URL(link);
    } catch (_) {
      setError("Please enter a valid URL (e.g., https://...).");
      return;
    }

    setIsSubmitting(true);
    await onSubmit(assignment.id, link);
    setIsSubmitting(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setLink("");
      setError("");
    }
  }, [isOpen]);

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
          className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-dark-navy/90 p-6 shadow-2xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}>
          <h2 className="text-xl font-bold text-brand-gold mb-2">
            Submit Assignment
          </h2>
          <p className="text-slate mb-6">{assignment.title}</p>
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="submissionLink"
              className="block text-sm font-medium text-slate mb-2">
              Submission Link (e.g., Google Drive, GitHub)
            </label>
            <div className="relative">
              <LinkIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500"
                size={18}
              />
              <input
                id="submissionLink"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://docs.google.com/..."
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 pl-10 text-light-slate placeholder:text-slate-500 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
              />
            </div>
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400 flex items-center gap-2 disabled:bg-slate-600">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit
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

const AssignmentCard = ({ assignment, onOpenModal }) => {
  const isPending = assignment.status === "Pending";
  const isPastDue = isPast(assignment.dueDate.toDate());

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
          <p className="text-sm text-slate">{assignment.subject}</p>
          <h3 className="text-lg font-semibold text-light-slate mt-1">
            {assignment.title}
          </h3>
          {assignment.instructionsLink && (
            <a
              href={assignment.instructionsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-brand-gold hover:underline mt-2">
              <LinkIcon size={14} />
              View Instructions
            </a>
          )}
        </div>
        <div className="flex sm:flex-col items-end gap-4 sm:gap-2 shrink-0">
          <StatusBadge status={assignment.status} />
          <p className="flex items-center gap-2 text-xs text-slate">
            <Clock size={14} />
            Due: {formatDate(assignment.dueDate.toDate())}
          </p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-end">
        {isPending ? (
          <button
            onClick={() => onOpenModal(assignment)}
            disabled={isPastDue}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-dark-navy disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed">
            <Upload size={16} />
            <span>{isPastDue ? "Past Due" : "Submit Now"}</span>
          </button>
        ) : (
          <a
            href={assignment.submission?.submissionLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-white/10 text-slate-300 hover:bg-white/20">
            <Eye size={16} />
            <span>View Submission</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default function StudentAssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    // DEBUG: Check the user object and profile.
    console.log("--- useEffect Triggered ---", { user });
    if (!user?.profile?.batch) {
      console.log(
        "DEBUG: Exiting useEffect because user or user.profile.batch is missing."
      );
      if (!user) setLoading(false);
      return;
    }

    console.log(
      `%cDEBUG: Fetching data for batch: ${user.profile.batch}`,
      "color: lightblue"
    );
    setLoading(true);
    const studentBatch = user.profile.batch;
    const studentId = user.uid;

    const qAssignments = query(
      collection(db, "assignments"),
      where("batch", "==", studentBatch)
    );

    const unsubAssignments = onSnapshot(
      qAssignments,
      (snap) => {
        const assignmentsData = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // DEBUG: Log the raw assignments fetched from Firestore.
        console.log("DEBUG: Fetched Assignments:", assignmentsData);
        setAssignments(assignmentsData);
        setLoading(false);
      },
      (error) => {
        console.error("DEBUG: Error fetching assignments:", error);
        setLoading(false);
      }
    );

    const qSubmissions = query(
      collectionGroup(db, "submissions"),
      where("studentId", "==", studentId)
    );

    const unsubSubmissions = onSnapshot(
      qSubmissions,
      (snap) => {
        const subs = {};
        snap.forEach((doc) => {
          const parentAssignmentId = doc.ref.parent.parent.id;
          subs[parentAssignmentId] = { id: doc.id, ...doc.data() };
        });
        // DEBUG: Log the raw submissions fetched from Firestore.
        console.log("DEBUG: Fetched Submissions:", subs);
        setSubmissions(subs);
      },
      (error) => {
        console.error("DEBUG: Error fetching submissions:", error);
      }
    );

    return () => {
      console.log("--- useEffect Cleanup ---");
      unsubAssignments();
      unsubSubmissions();
    };
  }, [user]);

  const mergedAssignments = useMemo(() => {
    console.log("DEBUG: Re-calculating mergedAssignments...");
    return assignments.map((assignment) => {
      const submission = submissions[assignment.id];
      return {
        ...assignment,
        status: submission ? submission.status || "Submitted" : "Pending",
        submission: submission || null,
      };
    });
  }, [assignments, submissions]);

  const pendingAssignments = useMemo(() => {
    console.log("DEBUG: Re-calculating pendingAssignments...");
    return mergedAssignments
      .filter((a) => a.status === "Pending")
      .sort((a, b) => a.dueDate.toDate() - b.dueDate.toDate());
  }, [mergedAssignments]);

  const completedAssignments = useMemo(() => {
    console.log("DEBUG: Re-calculating completedAssignments...");
    try {
      const filtered = mergedAssignments.filter((a) => a.status !== "Pending");

      // DEBUG: Log the assignments that are about to be sorted.
      console.log("DEBUG: Items to sort for 'Completed':", filtered);

      return filtered.sort((a, b) => {
        // This is a potential crash point if submission or submittedAt is missing.
        const dateA = a.submission?.submittedAt?.toDate();
        const dateB = b.submission?.submittedAt?.toDate();

        if (!dateB) return -1; // Put items without a date last.
        if (!dateA) return 1;

        return dateB - dateA;
      });
    } catch (error) {
      console.error(
        "!!! CRASH !!! Error while sorting completed assignments:",
        error
      );
      // Return an unsorted list to prevent the page from crashing.
      return mergedAssignments.filter((a) => a.status !== "Pending");
    }
  }, [mergedAssignments]);

  const assignmentsToShow =
    activeTab === "Pending" ? pendingAssignments : completedAssignments;

  const handleOpenModal = (assignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAssignment(null);
  };

  const handleSubmit = async (assignmentId, submissionLink) => {
    if (!user) return;
    const submissionRef = doc(
      db,
      "assignments",
      assignmentId,
      "submissions",
      user.uid
    );
    try {
      await setDoc(submissionRef, {
        studentId: user.uid,
        studentName: user.profile.name,
        submissionLink: submissionLink,
        submittedAt: Timestamp.now(),
        status: "Submitted",
      });
    } catch (error) {
      console.error("Error submitting assignment:", error);
    }
  };

  // DEBUG: Log the final loading state before rendering.
  console.log(
    `%cComponent Rendering. Loading State: ${loading}`,
    "color: yellow"
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  return (
    <div>
      <SubmissionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        assignment={selectedAssignment}
        onSubmit={handleSubmit}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Assignments
      </h1>
      <p className="text-lg text-slate mb-8">
        Track your pending and completed assignments.
      </p>

      <div className="flex border-b border-slate-700/50 mb-6">
        <button
          onClick={() => setActiveTab("Pending")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "Pending"
              ? "border-b-2 border-brand-gold text-brand-gold"
              : "text-slate hover:text-white"
          }`}>
          Pending ({pendingAssignments.length})
        </button>
        <button
          onClick={() => setActiveTab("Completed")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "Completed"
              ? "border-b-2 border-brand-gold text-brand-gold"
              : "text-slate hover:text-white"
          }`}>
          Completed ({completedAssignments.length})
        </button>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6">
        {assignmentsToShow.length > 0 ? (
          assignmentsToShow.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onOpenModal={handleOpenModal}
            />
          ))
        ) : (
          <div className="text-center py-12 rounded-2xl border border-dashed border-white/10">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-400" />
            <h3 className="mt-4 text-xl font-semibold text-white">
              You're all caught up!
            </h3>
            <p className="text-slate mt-2">
              No {activeTab.toLowerCase()} assignments found.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
