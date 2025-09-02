"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  Check,
  X,
  Clock,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { format, isToday } from "date-fns";

// --- MOCK DATA UPDATED ---
const mockTeacherBatches = [
  { id: "batch_vi_foundation", title: "Class VI - Foundation Batch" },
  { id: "batch_vii_olympiad", title: "Class VII - Olympiad Batch" },
];

const mockStudentRoster = {
  batch_vi_foundation: [
    { id: "s1", name: "Alex Rider", roll: "01" },
    { id: "s2", name: "Ben Tennyson", roll: "02" },
    { id: "s3", name: "Cindy Vortex", roll: "03" },
  ],
  batch_vii_olympiad: [
    { id: "s4", name: "David Johnson", roll: "04" },
    { id: "s5", name: "Eva Williams", roll: "05" },
  ],
};

// Mock data for past attendance records
const mockPastAttendance = {
  "2025-09-01": { s1: "Present", s2: "Present", s3: "Absent" },
  "2025-09-02": { s1: "Present", s2: "Present", s3: "Present" },
};

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
}) => {
  // This is the NEW code
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
        <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-brand-gold">
          {student.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-light-slate">{student.name}</p>
          <p className="text-xs text-slate">Roll No: {student.roll}</p>
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

export default function MarkAttendancePage() {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date());
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isViewMode = !isToday(date);

  useEffect(() => {
    const roster = mockStudentRoster[selectedBatch] || [];
    setStudents(roster);

    if (roster.length > 0) {
      if (isViewMode) {
        // In View Mode, fetch records for the selected past date
        const dateKey = format(date, "yyyy-MM-dd");
        setAttendance(mockPastAttendance[dateKey] || {});
      } else {
        // In Marking Mode (today), default all to 'Present'
        const initialAttendance = roster.reduce((acc, student) => {
          acc[student.id] = "Present";
          return acc;
        }, {});
        setAttendance(initialAttendance);
      }
    } else {
      setAttendance({});
    }
    setIsSubmitted(false);
  }, [selectedBatch, date, isViewMode]);

  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = () => {
    console.log(
      "Submitting Attendance for",
      selectedBatch,
      "on",
      date,
      ":",
      attendance
    );
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Mark Attendance
      </h1>
      <p className="text-lg text-slate mb-8">
        Select a batch and date. You can only mark attendance for today.
      </p>

      {/* Controls Section */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
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
        <input
          type="date"
          value={format(date, "yyyy-MM-dd")}
          onChange={(e) => setDate(new Date(e.target.value))}
          className="w-full sm:w-auto rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
        />
      </div>

      {/* Student Roster Section */}
      <motion.div
        key={selectedBatch}
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="divide-y divide-slate-700/50">
          {students.length > 0 ? (
            students.map((student) => (
              <StudentAttendanceRow
                key={student.id}
                student={student}
                status={attendance[student.id]}
                onStatusChange={handleStatusChange}
                isViewMode={isViewMode}
              />
            ))
          ) : (
            <div className="p-12 text-center text-slate">
              <p>Please select a batch to view the student roster.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Submit Button */}
      {selectedBatch && !isViewMode && (
        <div className="mt-6 flex justify-end">
          {isSubmitted ? (
            <div className="flex items-center gap-2 text-green-400 font-semibold">
              <CheckCircle size={20} />
              <span>Attendance Submitted Successfully!</span>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-lg bg-brand-gold px-6 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400">
              <UserCheck size={18} />
              <span>Submit Attendance</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
