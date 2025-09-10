// src/app/portal/(app)/admin-dashboard/attendance/page.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/firebase/config";
import {
  collection,
  onSnapshot,
  doc,
  query,
  where,
  Timestamp,
  orderBy,
  updateDoc, // UPDATED: We will use updateDoc directly
} from "firebase/firestore";
import {
  ChevronDown,
  Loader2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sun,
  Briefcase,
  Info,
  Edit,
  Save, // UPDATED: We need a Save icon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  format,
  isToday,
  isPast,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isFuture,
  addMonths,
  subMonths,
} from "date-fns";
import isEqual from "lodash.isequal"; // We use this to check for changes

// --- Reusable UI Components ---

const Calendar = ({
  currentDate,
  onDateChange,
  markedDays,
  holidayDays,
  extraClassDays,
}) => {
  const [displayMonth, setDisplayMonth] = useState(startOfMonth(currentDate));
  useEffect(() => {
    setDisplayMonth(startOfMonth(currentDate));
  }, [currentDate]);

  const monthStart = startOfMonth(displayMonth);
  const monthEnd = endOfMonth(displayMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDayIndex = getDay(monthStart);

  const getDayStyle = (day) => {
    const dayString = format(day, "yyyy-MM-dd");
    const isSelected = format(currentDate, "yyyy-MM-dd") === dayString;
    const isCurrentDay = isToday(day);
    const isMarked = markedDays.has(dayString);
    const isOfficialHoliday = holidayDays.has(dayString);
    const isSunday = getDay(day) === 0;
    const isExtraClass = extraClassDays.has(dayString);

    if (isSelected)
      return "bg-brand-gold text-dark-navy font-bold ring-2 ring-brand-gold/50";
    if (isCurrentDay) return "bg-slate-600 text-white font-semibold";
    if (isExtraClass && isMarked)
      return "bg-blue-500/20 text-blue-300 font-semibold";
    if ((isOfficialHoliday || isSunday) && !extraClassDays.has(dayString))
      return "bg-slate-700/50 text-slate-500";
    if (isMarked) return "bg-green-500/20 text-green-300";
    if (isFuture(day)) return "text-slate-600 cursor-not-allowed";

    return "text-slate-300 hover:bg-slate-800";
  };

  return (
    <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/40">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setDisplayMonth(subMonths(displayMonth, 1))}
          className="p-1 rounded-full hover:bg-white/10">
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-semibold text-light-slate text-sm">
          {format(displayMonth, "MMMM yyyy")}
        </h3>
        <button
          onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}
          className="p-1 rounded-full hover:bg-white/10">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-slate-500">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 mt-2">
        {Array.from({ length: startingDayIndex }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {daysInMonth.map((day) => (
          <button
            key={format(day, "yyyy-MM-dd")}
            onClick={() => onDateChange(day)}
            disabled={isFuture(day) && !isToday(day)}
            className={`flex items-center justify-center h-7 w-7 mx-auto text-xs rounded-full transition-colors ${getDayStyle(
              day
            )}`}>
            {format(day, "d")}
          </button>
        ))}
      </div>
    </div>
  );
};

const StudentRow = ({
  student,
  status,
  onStatusChange,
  isEditable,
  serialNumber,
}) => {
  const getButtonStyle = (buttonStatus) =>
    status === buttonStatus
      ? status === "Present"
        ? "bg-green-500/20 text-green-300"
        : "bg-red-500/20 text-red-400"
      : "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300";

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
      {isEditable ? (
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
      ) : status ? (
        <span
          className={`px-3 py-1 text-xs font-bold rounded-md ${
            status === "Present"
              ? "bg-green-500/20 text-green-300"
              : "bg-red-500/20 text-red-400"
          }`}>
          {status}
        </span>
      ) : (
        <span className="text-xs text-slate-500">Not Marked</span>
      )}
    </div>
  );
};

export default function AdminAttendancePage() {
  const { user } = useAuth();
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [originalAttendance, setOriginalAttendance] = useState({}); // NEW: To track edits
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [markedDays, setMarkedDays] = useState(new Set());
  const [allEventsInMonth, setAllEventsInMonth] = useState([]);
  const [isRecordFound, setIsRecordFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- Derived states ---
  const isDirty = !isEqual(attendance, originalAttendance); // Check if changes have been made
  const activeEvent = useMemo(() => {
    const todayString = format(date, "yyyy-MM-dd");
    return allEventsInMonth.find((e) => {
      const start = e.startDate.toDate();
      const end = e.endDate ? e.endDate.toDate() : start;
      return (
        todayString >= format(start, "yyyy-MM-dd") &&
        todayString <= format(end, "yyyy-MM-dd")
      );
    });
  }, [date, allEventsInMonth]);

  const isSunday = getDay(date) === 0;
  const isHolidayEvent = activeEvent?.type === "Holiday";
  const isExtraClassEvent =
    activeEvent && ["ExtraClass", "ExtendedClass"].includes(activeEvent.type);
  const isHoliday = (isSunday || isHolidayEvent) && !isExtraClassEvent;

  // --- Data Fetching Hooks ---
  useEffect(() => {
    const unsubBatches = onSnapshot(
      query(collection(db, "batches"), orderBy("name")),
      (snap) => setBatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsubBatches();
  }, []);

  useEffect(() => {
    if (!selectedBatchId) {
      setStudents([]);
      return;
    }
    const batchName = batches.find((b) => b.id === selectedBatchId)?.name;
    if (!batchName) return;
    const unsubStudents = onSnapshot(
      query(collection(db, "students"), where("batch", "==", batchName)),
      (snap) => setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsubStudents();
  }, [selectedBatchId, batches]);

  useEffect(() => {
    if (!selectedBatchId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const eventsQuery = query(
      collection(db, "events"),
      where("startDate", "<=", Timestamp.fromDate(monthEnd))
    );
    const unsubEvents = onSnapshot(eventsQuery, (snap) =>
      setAllEventsInMonth(snap.docs.map((d) => ({ ...d.data(), id: d.id })))
    );

    const recordsQuery = query(
      collection(db, "attendanceRecords"),
      where("batchId", "==", selectedBatchId),
      where("date", ">=", Timestamp.fromDate(monthStart)),
      where("date", "<=", Timestamp.fromDate(monthEnd))
    );
    const unsubRecords = onSnapshot(recordsQuery, (snap) =>
      setMarkedDays(
        new Set(
          snap.docs.map((d) => format(d.data().date.toDate(), "yyyy-MM-dd"))
        )
      )
    );

    const attendanceDocId = `${selectedBatchId}_${format(date, "yyyy-MM-dd")}`;
    const attendanceRef = doc(db, "attendanceRecords", attendanceDocId);
    const unsubAttendance = onSnapshot(attendanceRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().studentStatus || {};
        setAttendance(data);
        setOriginalAttendance(data); // Store the initial state for comparison
        setIsRecordFound(true);
      } else {
        setAttendance({});
        setOriginalAttendance({});
        setIsRecordFound(false);
      }
      setLoading(false);
    });

    return () => {
      unsubEvents();
      unsubRecords();
      unsubAttendance();
    };
  }, [selectedBatchId, date]);

  const { holidayDaysSet, extraClassDaysSet } = useMemo(() => {
    const holidays = new Set();
    const extraClasses = new Set();
    allEventsInMonth.forEach((e) => {
      const interval = {
        start: e.startDate.toDate(),
        end: e.endDate ? e.endDate.toDate() : e.startDate.toDate(),
      };
      if (e.type === "Holiday")
        eachDayOfInterval(interval).forEach((day) =>
          holidays.add(format(day, "yyyy-MM-dd"))
        );
      else if (["ExtraClass", "ExtendedClass"].includes(e.type))
        eachDayOfInterval(interval).forEach((day) =>
          extraClasses.add(format(day, "yyyy-MM-dd"))
        );
    });
    return { holidayDaysSet: holidays, extraClassDaysSet: extraClasses };
  }, [allEventsInMonth]);

  // --- Event Handlers ---
  const handleStatusChange = (studentId, status) =>
    setAttendance((prev) => ({ ...prev, [studentId]: status }));

  const handleSaveChanges = async () => {
    if (!isDirty || !isRecordFound) return;
    setIsSaving(true);
    try {
      const attendanceDocId = `${selectedBatchId}_${format(
        date,
        "yyyy-MM-dd"
      )}`;
      const docRef = doc(db, "attendanceRecords", attendanceDocId);
      await updateDoc(docRef, {
        studentStatus: attendance,
        lastEditedBy: user.uid,
        lastEditedAt: Timestamp.now(),
      });
      setOriginalAttendance(attendance); // Update original state to lock changes
      alert("Attendance updated successfully!");
    } catch (error) {
      console.error("Error updating attendance:", error);
      alert("Failed to update attendance. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Review Attendance
      </h1>
      <p className="text-lg text-slate mb-8">
        View or edit previously submitted attendance records.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Calendar
            currentDate={date}
            onDateChange={setDate}
            markedDays={markedDays}
            holidayDays={holidayDaysSet}
            extraClassDays={extraClassDaysSet}
          />
        </div>
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative w-full">
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
            {isRecordFound && (
              <button
                onClick={handleSaveChanges}
                disabled={!isDirty || isSaving}
                className="flex items-center gap-2 rounded-lg bg-brand-gold px-6 py-2.5 text-sm font-bold text-dark-navy hover:bg-yellow-400 disabled:bg-slate-600 disabled:cursor-not-allowed w-full sm:w-auto shrink-0">
                {isSaving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            )}
          </div>

          <motion.div
            key={selectedBatchId + format(date, "yyyy-MM-dd")}
            className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}>
            <div className="p-4 text-center bg-slate-800/80 rounded-t-2xl">
              {isHoliday ? (
                <div className="flex items-center justify-center gap-3">
                  <Sun className="h-6 w-6 text-slate-400" />
                  <p className="font-semibold text-slate-300">
                    {activeEvent ? activeEvent.title : "Sunday Holiday"}
                  </p>
                </div>
              ) : isExtraClassEvent ? (
                <div className="flex items-center justify-center gap-3">
                  <Briefcase className="h-6 w-6 text-blue-400" />
                  <p className="font-semibold text-blue-300">
                    {activeEvent.title}
                  </p>
                </div>
              ) : isRecordFound ? (
                <div className="flex items-center justify-center gap-3">
                  <Edit className="h-5 w-5 text-amber-400" />
                  <p className="font-semibold text-amber-400">
                    Editing attendance for {format(date, "dd MMM yyyy")}
                  </p>
                </div>
              ) : isPast(date) && !isToday(date) ? (
                <div className="flex items-center justify-center gap-3">
                  <Info className="h-5 w-5 text-slate-400" />
                  <p className="font-semibold text-slate-400">
                    Attendance was not marked for this day.
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <CalendarDays className="h-5 w-5 text-slate-400" />
                  <p className="font-semibold text-slate-400">
                    Attendance for today has not been submitted yet.
                  </p>
                </div>
              )}
            </div>
            <div className="divide-y divide-slate-700/50 min-h-[200px]">
              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
                </div>
              ) : students.length > 0 && isRecordFound ? (
                students.map((student, index) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    status={attendance[student.id]}
                    onStatusChange={handleStatusChange}
                    isEditable={true}
                    serialNumber={index + 1}
                  />
                ))
              ) : (
                <div className="p-12 text-center text-slate">
                  <p>
                    {selectedBatchId
                      ? "No attendance record found for this day."
                      : "Please select a batch to view records."}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
