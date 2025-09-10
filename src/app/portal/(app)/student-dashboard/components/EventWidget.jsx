"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import WidgetCard from "./WidgetCard";
import {
  CalendarDays,
  Loader2,
  Users,
  Sun,
  FileText,
  Briefcase,
} from "lucide-react";
import { format, startOfDay } from "date-fns";

// --- Helper Data and Functions ---

const eventTypeDetails = {
  PTM: { Icon: Users, label: "Meeting" },
  Test: { Icon: FileText, label: "Test" },
  Holiday: { Icon: Sun, label: "Holiday" },
  Event: { Icon: CalendarDays, label: "Event" },
  ExtraClass: { Icon: Briefcase, label: "Extra Class" },
  ExtendedClass: { Icon: CalendarDays, label: "Extended Class" },
};

const formatEventDate = (startDate, endDate) => {
  if (!startDate || !(startDate instanceof Timestamp)) return "Date TBD";
  const start = startDate.toDate();
  if (
    !endDate ||
    !(endDate instanceof Timestamp) ||
    format(start, "yyyy-MM-dd") === format(endDate.toDate(), "yyyy-MM-dd")
  ) {
    return format(start, "MMMM d, yyyy");
  }
  const end = endDate.toDate();
  if (format(start, "yyyy-MM") === format(end, "yyyy-MM")) {
    return `${format(start, "MMM d")} - ${format(end, "d, yyyy")}`;
  } else {
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  }
};

// --- Main Component ---

const EventWidget = () => {
  const { user, initialising } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialising) return;
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    let unsubscribe = () => {};

    const fetchStudentAndEvents = async () => {
      try {
        const studentDocRef = doc(db, "students", user.uid);
        const studentSnap = await getDoc(studentDocRef);
        if (!studentSnap.exists()) {
          throw new Error("Student profile not found.");
        }
        const studentBatch = studentSnap.data().batch;
        if (!studentBatch) {
          throw new Error("You are not assigned to a batch.");
        }

        const startOfToday = startOfDay(new Date());
        const eventsQuery = query(
          collection(db, "events"),
          where("startDate", ">=", Timestamp.fromDate(startOfToday)),
          orderBy("startDate", "asc")
        );

        unsubscribe = onSnapshot(
          eventsQuery,
          (snapshot) => {
            const allUpcomingEvents = snapshot.docs.map((d) => ({
              ...d.data(),
              id: d.id,
            }));

            const relevantEvents = allUpcomingEvents.filter(
              (event) =>
                !event.batches ||
                event.batches.length === 0 ||
                event.batches.includes(studentBatch)
            );

            setEvents(relevantEvents);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching events snapshot:", err);
            setError("Could not load events.");
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error setting up event listener:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStudentAndEvents();

    return () => unsubscribe();
  }, [user, initialising]);

  const { nextEvent, upcomingEvents } = useMemo(() => {
    if (events.length === 0) {
      return { nextEvent: null, upcomingEvents: [] };
    }
    const [first, ...rest] = events;
    return { nextEvent: first, upcomingEvents: rest.slice(0, 3) }; // Total of 4 events
  }, [events]);

  if (loading || initialising) {
    return (
      <WidgetCard title="Upcoming Events" Icon={CalendarDays}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard title="Upcoming Events" Icon={CalendarDays}>
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </WidgetCard>
    );
  }

  if (!nextEvent) {
    return (
      <WidgetCard title="Upcoming Events" Icon={CalendarDays}>
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-slate-500">
            No upcoming events scheduled for your batch.
          </p>
        </div>
      </WidgetCard>
    );
  }

  const { Icon: NextEventIcon, label: nextEventLabel } = eventTypeDetails[
    nextEvent.type
  ] || {
    Icon: CalendarDays,
    label: nextEvent.type,
  };

  return (
    <WidgetCard
      title="Upcoming Events"
      Icon={CalendarDays}
      route="/portal/student-dashboard/events">
      <div className="flex flex-col h-full">
        {/* Next Event Section */}
        <div className="flex items-center space-x-4 mb-4">
          <NextEventIcon className="h-7 w-7 text-brand-gold shrink-0" />
          <div className="flex-grow min-w-0">
            <p className="font-semibold text-light-slate truncate">
              {nextEvent.title}
            </p>
            <p className="text-sm text-slate">
              {formatEventDate(nextEvent.startDate, nextEvent.endDate)}
            </p>
          </div>
          <span className="px-2 py-1 text-xs font-semibold rounded-full shrink-0 bg-slate-500/20 text-slate-300">
            {nextEventLabel}
          </span>
        </div>

        <hr className="border-slate-700/50 my-2" />

        {/* Upcoming Events List */}
        <div className="flex-grow">
          {upcomingEvents.length > 0 ? (
            <ul className="space-y-3">
              {upcomingEvents.map((event) => {
                const { Icon, label } = eventTypeDetails[event.type] || {
                  Icon: CalendarDays,
                  label: event.type,
                };
                return (
                  <li
                    key={event.id}
                    className="flex items-center space-x-3 text-sm">
                    <Icon className="h-5 w-5 text-slate-400 shrink-0" />
                    <div className="flex-grow min-w-0">
                      <p className="font-medium text-slate/90 truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-slate/70">
                        {formatEventDate(event.startDate, event.endDate)}
                      </p>
                    </div>
                    <p className="text-xs font-medium text-slate-400 shrink-0">
                      {label}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full pt-4">
              <p className="text-sm text-slate-500">
                No other events planned soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </WidgetCard>
  );
};

export default EventWidget;
