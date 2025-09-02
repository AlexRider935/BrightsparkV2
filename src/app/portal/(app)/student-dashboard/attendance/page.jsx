"use client";

import { motion } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
} from "date-fns";
import { UserCheck, Check, X } from "lucide-react";

// --- MOCK DATA SYNCED ---
// Data now only exists up to the current date (Sep 2) to perfectly match the summary cards.
// Stats will be: 2 Present, 0 Absent -> 2 Total Classes -> 100%
const mockAttendanceData = [
  { date: new Date("2025-09-01"), status: "present" },
  { date: new Date("2025-09-02"), status: "present" },
];

const StatCard = ({ title, value, Icon }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
    <div className="flex items-center gap-3 mb-2">
      <Icon className="h-5 w-5 text-slate-400" />
      <h3 className="text-md font-medium text-slate">{title}</h3>
    </div>
    <p className="text-3xl font-bold text-light-slate">{value}</p>
  </div>
);

// --- REFINED DayCell COMPONENT WITH NEW COLORS ---
const DayCell = ({ day, status }) => {
  const styles = {
    present: "bg-green-500/20 text-green-300 border-green-500/30",
    absent: "bg-red-500/20 text-red-400 border-red-500/30",
    holiday: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
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

export default function AttendancePage() {
  const currentDate = new Date(); // This will be Sep 2, 2025
  const today = new Date();

  // Calendar logic is unchanged
  const firstDayOfMonth = startOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: endOfMonth(currentDate),
  });
  const startingDayIndex = getDay(firstDayOfMonth);

  const attendanceMap = new Map(
    mockAttendanceData.map((d) => [format(d.date, "yyyy-MM-dd"), d.status])
  );

  // Stats are now calculated from the synced mock data
  const presentDays = mockAttendanceData.filter(
    (d) => d.status === "present"
  ).length;
  const absentDays = mockAttendanceData.filter(
    (d) => d.status === "absent"
  ).length;
  const totalClasses = presentDays + absentDays;
  const attendancePercentage =
    totalClasses > 0 ? Math.round((presentDays / totalClasses) * 100) : 100;

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Attendance Record
      </h1>
      <p className="text-lg text-slate mb-8">
        Your monthly attendance summary for {format(currentDate, "MMMM yyyy")}.
      </p>

      {/* These stats now perfectly match the calendar below */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Classes" value={totalClasses} Icon={UserCheck} />
        <StatCard title="Days Present" value={presentDays} Icon={Check} />
        <StatCard title="Days Absent" value={absentDays} Icon={X} />
        <StatCard
          title="Percentage"
          value={`${attendancePercentage}%`}
          Icon={UserCheck}
        />
      </div>

      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startingDayIndex }).map((_, index) => (
            <div key={`pad-${index}`}></div>
          ))}
          {daysInMonth.map((day) => {
            const dayStr = format(day, "yyyy-MM-dd");
            let status = "nodata";
            if (day > today) status = "future";
            else if (attendanceMap.has(dayStr))
              status = attendanceMap.get(dayStr);
            else if (day.getDay() === 0 || day.getDay() === 6)
              status = "holiday";

            return <DayCell key={day.toString()} day={day} status={status} />;
          })}
        </div>
      </motion.div>

      {/* --- LEGEND UPDATED WITH NEW COLORS --- */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-sm text-slate">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-green-500/20 border border-green-500/30"></div>
          <span>Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-red-500/20 border border-red-500/30"></div>
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-yellow-500/10 border border-yellow-500/20"></div>
          <span>Holiday</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md ring-2 ring-offset-2 ring-offset-dark-navy ring-brand-gold"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
