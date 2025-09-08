"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase/config";
// --- FIX #1: Added the missing 'doc' and 'getDoc' imports ---
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  isFuture,
  isPast,
  addMonths,
  subMonths,
  isWithinInterval,
} from "date-fns";
import {
  UserCheck,
  Check,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Percent,
  Briefcase,
  Sun,
} from "lucide-react";

// --- UI COMPONENTS ---
const StatCard = ({ title, value, Icon }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
    <div className="flex items-center gap-3 mb-2">
      <Icon className="h-5 w-5 text-slate-400" />
      <h3 className="text-md font-medium text-slate">{title}</h3>
    </div>
    <p className="text-3xl font-bold text-light-slate">{value}</p>
  </div>
);

const DayCell = ({ day, status }) => {
  const styles = {
    Present: "bg-green-500/20 text-green-300 border-green-500/30",
    Absent: "bg-red-500/20 text-red-400 border-red-500/30",
    Holiday: "bg-slate-800/50 text-slate-500 border-transparent",
    ExtraClass: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    Future: "bg-transparent text-slate-600 border-transparent",
    NoData: "bg-transparent text-slate-400 border-transparent",
  };
  let finalStyle = `h-20 flex flex-col justify-center items-center rounded-lg text-sm transition-colors border ${
    styles[status] || styles.NoData
  }`;
  if (isToday(day))
    finalStyle += " ring-2 ring-offset-2 ring-offset-dark-navy ring-brand-gold";
  return (
    <div className={finalStyle}>
      <span className="text-xs mb-1 opacity-80">{format(day, "E")}</span>
      <span className="font-bold text-lg">{format(day, "d")}</span>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function AttendancePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  // --- FIX #2: Added the missing 'error' state variable ---
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      if (user) return;
      const timer = setTimeout(() => {
        if (!user) {
          setLoading(false);
          setError("Please log in to view your attendance.");
        }
      }, 2500);
      return () => clearTimeout(timer);
    }

    let unsubAttendance = () => {};
    let unsubEvents = () => {};

    const setupListeners = async () => {
      try {
        const studentDocRef = doc(db, "students", user.uid);
        const studentSnap = await getDoc(studentDocRef);
        if (!studentSnap.exists())
          throw new Error("Your student profile could not be found.");

        const studentBatch = studentSnap.data().batch;
        if (!studentBatch) throw new Error("You are not assigned to a batch.");

        const monthEnd = endOfMonth(currentDate);

        const eventsQuery = query(
          collection(db, "events"),
          where("startDate", "<=", Timestamp.fromDate(monthEnd))
        );
        unsubEvents = onSnapshot(eventsQuery, (snapshot) => {
          const relevantEvents = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter(
              (event) =>
                !event.batches ||
                event.batches.length === 0 ||
                event.batches.includes(studentBatch)
            );
          setAllEvents(relevantEvents);
        });

        const attendanceRef = collection(
          db,
          "students",
          user.uid,
          "attendance"
        );
        const qAttendance = query(attendanceRef, orderBy("date", "desc"));
        unsubAttendance = onSnapshot(
          qAttendance,
          (snapshot) => {
            setAttendanceHistory(
              snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
            setLoading(false);
          },
          (err) => {
            console.error("Attendance listener error:", err);
            setError("Could not load attendance history.");
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error setting up page:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      unsubAttendance();
      unsubEvents();
    };
  }, [user, currentDate]);

  const { stats, attendanceMap, holidayDays, extraClassDays } = useMemo(() => {
    const records = attendanceHistory.filter(
      (record) =>
        format(record.date.toDate(), "yyyy-MM") ===
        format(currentDate, "yyyy-MM")
    );
    const holidays = new Set();
    const extraClasses = new Set();

    allEvents.forEach((event) => {
      const interval = {
        start: event.startDate.toDate(),
        end: event.endDate ? event.endDate.toDate() : event.startDate.toDate(),
      };
      if (event.type === "Holiday") {
        eachDayOfInterval(interval).forEach((day) =>
          holidays.add(format(day, "yyyy-MM-dd"))
        );
      } else if (["ExtraClass", "ExtendedClass"].includes(event.type)) {
        eachDayOfInterval(interval).forEach((day) =>
          extraClasses.add(format(day, "yyyy-MM-dd"))
        );
      }
    });

    const attendanceMap = new Map(records.map((d) => [d.id, d.status]));
    const presentDays = records.filter((d) => d.status === "Present").length;
    const absentDays = records.filter((d) => d.status === "Absent").length;
    const totalClasses = presentDays + absentDays;
    const percentage =
      totalClasses > 0 ? Math.round((presentDays / totalClasses) * 100) : 100;

    return {
      stats: { presentDays, absentDays, totalClasses, percentage },
      attendanceMap,
      holidayDays: holidays,
      extraClassDays: extraClasses,
    };
  }, [attendanceHistory, currentDate, allEvents]);

  const firstDayOfMonth = startOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: endOfMonth(currentDate),
  });
  const startingDayIndex = getDay(firstDayOfMonth);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  if (error)
    return (
      <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/10">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-xl font-semibold text-white">
          An Error Occurred
        </h3>
        <p className="mt-2 text-sm text-slate">{error}</p>
      </div>
    );

  return (
    <main>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Attendance Record
      </h1>
      <p className="text-lg text-slate mb-8">
        Your monthly summary for {format(currentDate, "MMMM yyyy")}.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Classes"
          value={stats.totalClasses}
          Icon={UserCheck}
        />
        <StatCard title="Days Present" value={stats.presentDays} Icon={Check} />
        <StatCard title="Days Absent" value={stats.absentDays} Icon={X} />
        <StatCard
          title="Percentage"
          value={`${stats.percentage}%`}
          Icon={Percent}
        />
      </div>
      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white">
            <ChevronLeft />
          </button>
          <h3 className="font-semibold text-light-slate text-lg">
            {format(currentDate, "MMMM yyyy")}
          </h3>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white">
            <ChevronRight />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day, index) => (
              <div
                key={`${day}-${index}`}
                className="text-center text-xs font-bold text-slate-500 uppercase">
                {day}
              </div>
            )
          )}
          {Array.from({ length: startingDayIndex }).map((_, i) => (
            <div key={`pad-${i}`}></div>
          ))}
          {daysInMonth.map((day) => {
            const dayStr = format(day, "yyyy-MM-dd");
            let status = "NoData"; // Default to a plain day
            const isSunday = getDay(day) === 0;

            // This is the new, more precise logic
            if (attendanceMap.has(dayStr)) {
              // Only color red or green if a record explicitly exists
              status = attendanceMap.get(dayStr);
            } else if (extraClassDays.has(dayStr)) {
              // Show it's an extra class, but don't mark it absent if no record exists
              status = "ExtraClass";
            } else if (holidayDays.has(dayStr) || isSunday) {
              status = "Holiday";
            } else if (isFuture(day) && !isToday(day)) {
              status = "Future";
            }
            // A past day with no record will now correctly default to "NoData" (plain)

            return <DayCell key={day.toString()} day={day} status={status} />;
          })}
        </div>
      </motion.div>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-sm text-slate">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-green-500/20 border border-green-500/30"></div>
          <span>Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-red-500/20 border-red-500/30"></div>
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-blue-500/20 border border-blue-500/30"></div>
          <span>Extra Class</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-slate-800/50 border-transparent"></div>
          <span>Holiday</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md ring-2 ring-offset-2 ring-offset-dark-navy ring-brand-gold"></div>
          <span>Today</span>
        </div>
      </div>
    </main>
  );
}
