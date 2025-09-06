"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/firebase/config";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import {
  UserCheck,
  CheckCircle,
  ChevronDown,
  Loader2,
  X,
  AlertTriangle,
  ArrowUpDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // <-- ADD THIS IMPORT
import { format, isToday, isPast } from "date-fns";

// --- COMPONENTS ---
const StatusBadge = ({ status }) => {
  const styles = {
    Present: "bg-green-500/20 text-green-300",
    Absent: "bg-red-500/20 text-red-400",
  };
  return (
    <span
      className={`px-3 py-1 text-xs font-bold rounded-md ${styles[status]}`}>
      {status}
    </span>
  );
};

const StudentAttendanceRow = ({
  student,
  status,
  onStatusChange,
  isViewMode,
  serialNumber,
}) => {
  const getButtonStyle = (buttonStatus) => {
    if (status === buttonStatus) {
      if (status === "Present") return "bg-green-500/20 text-green-300";
      if (status === "Absent") return "bg-red-500/20 text-red-400";
    }
    return "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300";
  };

  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center gap-4">
        <span className="text-sm font-mono text-slate-500 w-6 text-center">
          {serialNumber}.
        </span>
        <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-brand-gold shrink-0">
          {student.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-light-slate">{student.name}</p>
          <p className="text-xs text-slate">Roll No: {student.rollNumber}</p>
        </div>
      </div>
      {isViewMode ? (
        status ? (
          <StatusBadge status={status} />
        ) : (
          <span className="text-xs text-slate-500">No Record</span>
        )
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStatusChange(student.id, "Present")}
            className={`w-20 h-9 text-xs font-bold rounded-md transition-colors ${getButtonStyle(
              "Present"
            )}`}>
            Present
          </button>
          <button
            onClick={() => onStatusChange(student.id, "Absent")}
            className={`w-20 h-9 text-xs font-bold rounded-md transition-colors ${getButtonStyle(
              "Absent"
            )}`}>
            Absent
          </button>
        </div>
      )}
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, absentStudents }) => {
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
          className="relative w-full max-w-md rounded-2xl border border-white/10 bg-dark-navy/80 p-6 shadow-2xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}>
          <div className="flex items-center gap-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-900/50 shrink-0">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-gold">
                Confirm Submission
              </h2>
              <p className="text-sm text-slate mt-1">
                Please confirm the list of absent students before submitting.
              </p>
            </div>
          </div>

          <div className="my-6 max-h-48 overflow-y-auto rounded-lg border border-slate-700/50 bg-slate-900/50 p-3 text-sm">
            <h3 className="font-semibold text-light-slate mb-2">
              Absent Students ({absentStudents.length}):
            </h3>
            {absentStudents.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {absentStudents.map((s) => (
                  <li key={s.id}>{s.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400">
                All students are marked as present.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20">
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-6 py-2 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400">
              Confirm & Submit
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function MarkAttendancePage() {
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [sortBy, setSortBy] = useState("rollNumber"); // 'rollNumber' or 'name'
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState(""); // Add this new state variable at the top
  const [isLocked, setIsLocked] = useState(false); // <-- ADD THIS NEW LINE

  const isMarkingAllowed = isToday(date);
  const isViewMode = !isToday(date) || isLocked;

  const { user } = useAuth(); // Get the currently logged-in user
  const teacherName = user?.name || "Teacher"; // Use the user's name, with a fallback

  useEffect(() => {
    const qBatches = query(collection(db, "batches"), orderBy("name"));
    const unsubBatches = onSnapshot(qBatches, (snap) =>
      setBatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsubBatches();
  }, []);

  // --- REPLACE THIS ENTIRE useEffect HOOK ---
  // --- NEW, SEPARATED useEffect HOOKS ---

  // Effect 1: Fetches the list of students when the batch changes.
  useEffect(() => {
    if (!selectedBatchId) {
      setStudents([]);
      return;
    }
    setLoadingRoster(true);
    const selectedBatchName = batches.find(
      (b) => b.id === selectedBatchId
    )?.name;
    if (!selectedBatchName) {
      setStudents([]);
      setLoadingRoster(false);
      return;
    }
    const qStudents = query(
      collection(db, "students"),
      where("batch", "==", selectedBatchName)
    );
    const unsubStudents = onSnapshot(qStudents, (snap) => {
      setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoadingRoster(false);
    });
    return () => unsubStudents();
  }, [selectedBatchId, batches]);

  // Effect 2: Listens for the attendance record in real-time.
  useEffect(() => {
    if (!selectedBatchId) {
      setIsLocked(false);
      setAttendance({});
      return;
    }
    const dateKey = format(date, "yyyy-MM-dd");
    const attendanceDocId = `${selectedBatchId}_${dateKey}`;
    const attendanceRef = doc(db, "attendanceRecords", attendanceDocId);

    // Use onSnapshot for real-time updates
    const unsubAttendance = onSnapshot(attendanceRef, (docSnap) => {
      if (docSnap.exists()) {
        // Record found, so lock the page and show the saved data
        setAttendance(docSnap.data().studentStatus || {});
        setIsLocked(true);
      } else {
        // No record found, unlock the page and allow marking
        setAttendance({});
        setIsLocked(false);
      }
      setSubmitError("");
      setIsSubmitted(false);
    });

    return () => unsubAttendance();
  }, [selectedBatchId, date]);

  const { sortedStudents, summary, allMarked } = useMemo(() => {
    const sorted = [...students].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return a.rollNumber.localeCompare(b.rollNumber, undefined, {
        numeric: true,
      });
    });

    const presentCount = Object.values(attendance).filter(
      (s) => s === "Present"
    ).length;
    const absentCount = Object.values(attendance).filter(
      (s) => s === "Absent"
    ).length;
    const allMarked =
      sorted.length > 0 && Object.keys(attendance).length === sorted.length;

    return {
      sortedStudents: sorted,
      summary: {
        present: presentCount,
        absent: absentCount,
        total: sorted.length,
      },
      allMarked,
    };
  }, [students, attendance, sortBy]);

  const absentStudentsForModal = useMemo(
    () => sortedStudents.filter((s) => attendance[s.id] === "Absent"),
    [sortedStudents, attendance]
  );

  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleOpenConfirm = () => {
    if (allMarked) setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false);
    setLoading(true);
    setSubmitError(""); // Clear previous errors

    try {
      const response = await fetch("/api/submit-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: selectedBatchId,
          batchName: batches.find((b) => b.id === selectedBatchId)?.name,
          date: date.toISOString(),
          studentStatus: attendance,
          teacherName: teacherName, // Pass the teacher's name
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit attendance.");
      }

      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error("Error submitting attendance:", error);
      setSubmitError(error.message); // Set the error to display to the user
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        absentStudents={absentStudentsForModal}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Manage Attendance
      </h1>
      <p className="text-lg text-slate mb-8">
        Select a batch and date. Attendance can only be marked for the current
        day.
      </p>

      {/* --- Filters Section (No Changes) --- */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <div className="relative w-full sm:w-64">
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold">
            <option value="">Select a Batch</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
        <input
          type="date"
          value={format(date, "yyyy-MM-dd")}
          onChange={(e) => setDate(new Date(e.target.value))}
          className="w-full sm:w-auto rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold"
        />
        <div className="relative w-full sm:w-48">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold">
            <option value="rollNumber">Sort by Roll No.</option>
            <option value="name">Sort by Name</option>
          </select>
          <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* --- Student List Section --- */}
      <motion.div
        key={selectedBatchId}
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}>
        {/* --- ADD THIS NEW STATUS INDICATOR --- */}
        {isLocked && (
          <div className="p-3 text-center bg-slate-800/50 border-b border-slate-700/50">
            <p className="text-sm font-semibold text-amber-400">
              Attendance for {format(date, "dd MMM yyyy")} has already been
              submitted and is now locked.
            </p>
          </div>
        )}
        {/* --- END OF NEW INDICATOR --- */}

        <div className="divide-y divide-slate-700/50 min-h-[100px]">
          {loadingRoster ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
            </div>
          ) : sortedStudents.length > 0 ? (
            sortedStudents.map((student, index) => (
              <StudentAttendanceRow
                key={student.id}
                student={student}
                status={attendance[student.id]}
                onStatusChange={handleStatusChange}
                isViewMode={isViewMode} // This now correctly controls the view/edit state
                serialNumber={index + 1}
              />
            ))
          ) : (
            <div className="p-12 text-center text-slate">
              <p>
                {selectedBatchId
                  ? "No students found in this batch."
                  : "Please select a batch to view the roster."}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* --- Bottom Summary & Submit Button --- */}
      {selectedBatchId && students.length > 0 && !isViewMode && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate flex gap-4">
            <span>
              Total:{" "}
              <span className="font-bold text-light-slate">
                {summary.total}
              </span>
            </span>
            <span>
              Present:{" "}
              <span className="font-bold text-green-400">
                {summary.present}
              </span>
            </span>
            <span>
              Absent:{" "}
              <span className="font-bold text-red-400">{summary.absent}</span>
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            {/* --- ADD THIS ERROR DISPLAY --- */}
            {submitError && (
              <div className="text-center text-sm text-red-400 p-2 bg-red-500/10 rounded-md">
                {submitError}
              </div>
            )}
            {/* --- END OF ERROR DISPLAY --- */}

            {isSubmitted ? (
              <div className="flex items-center gap-2 text-green-400 font-semibold">
                <CheckCircle size={20} />
                <span>Attendance Submitted!</span>
              </div>
            ) : (
              <button
                onClick={handleOpenConfirm}
                disabled={loading || !allMarked}
                className="flex items-center gap-2 rounded-lg bg-brand-gold px-6 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400 disabled:bg-slate-600 disabled:cursor-not-allowed">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <UserCheck size={18} />
                )}
                <span>
                  {allMarked
                    ? "Submit Attendance"
                    : `Mark All (${
                        summary.total - (summary.present + summary.absent)
                      } left)`}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
