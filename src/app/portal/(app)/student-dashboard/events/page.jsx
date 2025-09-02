"use client";

import { motion } from "framer-motion";
import { Users, Sun, FileText, CalendarDays } from "lucide-react";

// --- MOCK DATA ---
// A list of events spanning a few months to demonstrate the grouping.
const mockEvents = [
  {
    id: 1,
    title: "Parent-Teacher Meeting",
    date: new Date("2025-09-20T10:00:00"),
    type: "Meeting",
  },
  {
    id: 2,
    title: "Mid-Term Exams Begin",
    date: new Date("2025-10-06T09:00:00"),
    type: "Exam",
  },
  {
    id: 3,
    title: "Diwali Break",
    date: new Date("2025-10-21T09:00:00"),
    endDate: new Date("2025-10-25T17:00:00"), // Handles date ranges
    type: "Holiday",
  },
  {
    id: 4,
    title: "Science Fair",
    date: new Date("2025-11-08T11:00:00"),
    type: "Event",
  },
  {
    id: 5,
    title: "Last Day of Term",
    date: new Date("2025-12-19T17:00:00"),
    type: "Academic",
  },
];

// Helper object to get the right icon for each event type
const eventTypeDetails = {
  Meeting: { Icon: Users },
  Exam: { Icon: FileText },
  Holiday: { Icon: Sun },
  Event: { Icon: CalendarDays },
  Academic: { Icon: CalendarDays },
};

// Helper function to format dates and date ranges
const formatDate = (start, end) => {
  const options = { month: "short", day: "numeric" };
  if (
    end &&
    start.getMonth() === end.getMonth() &&
    start.getDate() !== end.getDate()
  ) {
    // Range within the same month (e.g., Oct 21 - 25)
    return `${start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${end.toLocaleDateString("en-US", { day: "numeric" })}`;
  }
  return start.toLocaleDateString("en-US", { month: "long", day: "numeric" });
};

export default function EventsPage() {
  // This logic groups all the events by month and year
  const groupedEvents = mockEvents.reduce((acc, event) => {
    const monthYear = event.date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(event);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Upcoming Events
      </h1>
      <p className="text-lg text-slate mb-8">
        The academic calendar, holidays, and important dates for the term.
      </p>

      <div className="space-y-8">
        {Object.keys(groupedEvents).map((monthYear, index) => (
          <motion.div
            key={monthYear}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}>
            <h2 className="text-xl font-semibold text-brand-gold mb-4 pb-2 border-b border-slate-700/50">
              {monthYear}
            </h2>
            <div className="flow-root">
              <ul className="-my-4 divide-y divide-slate-700/50">
                {groupedEvents[monthYear].map((event) => {
                  const { Icon } = eventTypeDetails[event.type] || {
                    Icon: CalendarDays,
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
                          {formatDate(event.date, event.endDate)}
                        </p>
                      </div>
                      <div className="inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-slate-500/20 text-slate-300">
                        {event.type}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
