"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase/config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  isFuture,
  addMonths,
  subMonths,
} from "date-fns";
import {
  UserCheck,
  Check,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Percent,
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
    holiday: "bg-slate-800/50 text-slate-500 border-transparent",
    future: "bg-transparent text-slate-600 border-transparent",
    nodata: "bg-transparent text-slate-400 border-transparent",
  };
  let finalStyle = `h-20 flex flex-col justify-center items-center rounded-lg text-sm transition-colors border ${
    styles[status] || styles.nodata
  }`;
  if (isToday(day)) {
    finalStyle += " ring-2 ring-offset-2 ring-offset-slate-900 ring-brand-gold";
  }
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
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    const attendanceRef = collection(db, "students", user.uid, "attendance");
    const q = query(attendanceRef, orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAttendanceHistory(history);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // --- MEMOIZED CALCULATIONS ---
  const { monthlyRecords, stats, attendanceMap } = useMemo(() => {
    const records = attendanceHistory.filter(
      (record) =>
        format(record.date.toDate(), "yyyy-MM") ===
        format(currentDate, "yyyy-MM")
    );
    const presentDays = records.filter((d) => d.status === "Present").length;
    const absentDays = records.filter((d) => d.status === "Absent").length;
    const totalClasses = presentDays + absentDays;
    const percentage =
      totalClasses > 0 ? Math.round((presentDays / totalClasses) * 100) : 100;

    const map = new Map(records.map((d) => [d.id, d.status]));

    return {
      monthlyRecords: records,
      stats: { presentDays, absentDays, totalClasses, percentage },
      attendanceMap: map,
    };
  }, [attendanceHistory, currentDate]);

  // --- CALENDAR LOGIC ---
  const firstDayOfMonth = startOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: endOfMonth(currentDate),
  });
  const startingDayIndex = getDay(firstDayOfMonth); // 0=Sun, 1=Mon...

  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );

  return (
    <main>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Attendance Record
      </h1>
      <p className="text-lg text-slate mb-8">
        Your monthly attendance summary for {format(currentDate, "MMMM yyyy")}.
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
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white">
            <ChevronLeft />
          </button>
          <h3 className="font-semibold text-light-slate text-lg">
            {format(currentDate, "MMMM yyyy")}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white">
            <ChevronRight />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-slate-500 uppercase">
              {day}
            </div>
          ))}
          {Array.from({ length: startingDayIndex }).map((_, i) => (
            <div key={`pad-${i}`}></div>
          ))}
          {daysInMonth.map((day) => {
            const dayStr = format(day, "yyyy-MM-dd");
            let status = "nodata";
            if (isFuture(day) && !isToday(day)) status = "future";
            else if (attendanceMap.has(dayStr))
              status = attendanceMap.get(dayStr);
            else if (getDay(day) === 0) status = "holiday"; // Mark Sunday as holiday

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
