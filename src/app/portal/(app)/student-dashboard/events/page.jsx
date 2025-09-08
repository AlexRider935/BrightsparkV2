"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import {
  Users,
  Sun,
  FileText,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Briefcase, // <-- ADD THIS
} from "lucide-react";

// --- HELPER COMPONENTS ---

const eventTypeDetails = {
  PTM: { Icon: Users, label: "Meeting" },
  Test: { Icon: FileText, label: "Test" },
  Holiday: { Icon: Sun, label: "Holiday" },
  Event: { Icon: CalendarDays, label: "Event" },
  ExtraClass: { Icon: Briefcase, label: "Extra Class" },
  ExtendedClass: { Icon: CalendarDays, label: "Extended Class" },
};

const formatDateRange = (start, end) => {
  if (end && !isSameDay(start, end)) {
    if (start.getMonth() === end.getMonth())
      return `${format(start, "MMM d")} - ${format(end, "d")}`;
    return `${format(start, "MMM d")} - ${format(end, "MMM d")}`;
  }
  return format(start, "MMMM d");
};

const Calendar = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { eventDays, extraClassDays } = useMemo(() => {
    const regularEvents = new Set();
    const classEvents = new Set();
    events.forEach((event) => {
      const interval = {
        start: event.startDate.toDate(),
        end: event.endDate ? event.endDate.toDate() : event.startDate.toDate(),
      };
      const daySet = ["ExtraClass", "ExtendedClass"].includes(event.type)
        ? classEvents
        : regularEvents;
      eachDayOfInterval(interval).forEach((day) =>
        daySet.add(format(day, "yyyy-MM-dd"))
      );
    });
    return { eventDays: regularEvents, extraClassDays: classEvents };
  }, [events]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDayIndex = getDay(monthStart);

  return (
    <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/20 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-1 rounded-full hover:bg-white/10">
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-semibold text-light-slate text-sm">
          {format(currentDate, "MMMM yyyy")}
        </h3>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="p-1 rounded-full hover:bg-white/10">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-slate">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
          <div key={`${day}-${index}`}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 mt-2">
        {Array.from({ length: startingDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {daysInMonth.map((day) => {
          const dayString = format(day, "yyyy-MM-dd");
          const isExtraClass = extraClassDays.has(dayString);
          const isEventDay = eventDays.has(dayString);
          const isCurrentDay = isToday(day);
          let dayStyle = "";
          if (isCurrentDay) dayStyle = "bg-brand-gold text-dark-navy";
          else if (isExtraClass) dayStyle = "bg-blue-500/20 text-blue-300";
          else if (isEventDay) dayStyle = "bg-brand-gold/20 text-brand-gold";

          return (
            <div
              key={dayString}
              className={`flex items-center justify-center h-7 text-xs rounded-full ${dayStyle}`}>
              {format(day, "d")}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      // If user object is not available yet, just wait.
      // A timer can prevent infinite loading if login fails.
      const timer = setTimeout(() => setLoading(false), 2500);
      return () => clearTimeout(timer);
    }

    let unsubscribe = () => {};

    const setupListeners = async () => {
      try {
        // FIX 1: Fetch the student's profile directly inside the component
        const studentDocRef = doc(db, "students", user.uid);
        const studentSnap = await getDoc(studentDocRef);
        if (!studentSnap.exists())
          throw new Error("Your student profile could not be found.");

        const studentBatch = studentSnap.data().batch;
        if (!studentBatch) throw new Error("You are not assigned to a batch.");

        const today = Timestamp.fromDate(
          new Date(new Date().setHours(0, 0, 0, 0))
        );
        const q = query(
          collection(db, "events"),
          where("startDate", ">=", today),
          orderBy("startDate", "asc")
        );

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const filteredEvents = snapshot.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .filter(
                (event) =>
                  !event.batches ||
                  event.batches.length === 0 ||
                  event.batches.includes(studentBatch)
              );

            setEvents(filteredEvents);
            setLoading(false); // We have our data (even if it's an empty list), so stop loading.
          },
          (err) => {
            console.error("Error fetching events:", err);
            setError("Could not load upcoming events.");
            setLoading(false);
          }
        );
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    setupListeners();

    return () => unsubscribe();
  }, [user]);

  const groupedEvents = useMemo(() => {
    return events.reduce((acc, event) => {
      const monthYear = format(event.startDate.toDate(), "MMMM yyyy");
      if (!acc[monthYear]) acc[monthYear] = [];
      acc[monthYear].push(event);
      return acc;
    }, {});
  }, [events]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-light-slate mb-2">
          An Error Occurred
        </h2>
        <p className="text-slate">{error}</p>
      </div>
    );
  if (!user)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="h-10 w-10 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold text-light-slate mb-2">
          Please Log In
        </h2>
        <p className="text-slate">You need to be logged in to see events.</p>
      </div>
    );

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Upcoming Events
      </h1>
      <p className="text-lg text-slate mb-8">
        The academic calendar, holidays, and important dates.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Calendar events={events} />
        </div>
        <div className="lg:col-span-2 space-y-8">
          {Object.keys(groupedEvents).length > 0 ? (
            Object.keys(groupedEvents).map((monthYear, index) => (
              <motion.div
                key={monthYear}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}>
                <h2 className="text-xl font-semibold text-brand-gold mb-4 pb-2 border-b border-slate-700/50">
                  {monthYear}
                </h2>
                <ul className="-my-4 divide-y divide-slate-700/50">
                  {groupedEvents[monthYear].map((event) => {
                    const { Icon, label } = eventTypeDetails[event.type] || {
                      Icon: CalendarDays,
                      label: "Event",
                    };
                    return (
                      <li
                        key={event.id}
                        className="flex items-center space-x-4 py-4">
                        <div className="flex-shrink-0 p-2 border border-white/10 rounded-lg">
                          <Icon className="h-6 w-6 text-slate-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-medium text-light-slate">
                            {event.title}
                          </p>
                          <p className="truncate text-sm text-slate">
                            {formatDateRange(
                              event.startDate.toDate(),
                              event.endDate?.toDate()
                            )}
                          </p>
                        </div>
                        <div className="inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-slate-500/20 text-slate-300">
                          {label}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 rounded-2xl border border-dashed border-white/10">
              <CalendarDays className="mx-auto h-12 w-12 text-slate-500" />
              <h3 className="mt-4 text-xl font-semibold text-white">
                No Upcoming Events
              </h3>
              <p className="mt-1 text-slate">
                The calendar is clear for now. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
