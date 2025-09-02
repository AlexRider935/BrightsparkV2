"use client";

import WidgetCard from "./WidgetCard";
import { CalendarDays } from "lucide-react";

// Mock data updated to include a date range for the holiday.
const mockEvents = [
  {
    id: 1,
    title: "Parent-Teacher Meeting",
    date: "September 20, 2025",
    type: "Meeting",
  },
  {
    id: 2,
    title: "Mid-Term Exams Begin",
    date: "October 6, 2025",
    type: "Exam",
  },
  {
    id: 3,
    title: "Diwali Break",
    date: "Oct 21 - Oct 25, 2025", // Date range for the holiday
    type: "Holiday",
  },
];

const EventWidget = () => {
  // Separate the next event from the rest
  const nextEvent = mockEvents[0];
  const upcomingEvents = mockEvents.slice(1, 3);

  return (
    <WidgetCard
      title="Upcoming Events"
      Icon={CalendarDays}
      route="/portal/events">
      <div className="flex flex-col h-full">
        {/* Next Event Section */}
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <p className="font-semibold text-light-slate pr-2">
              {nextEvent.title}
            </p>
            <span className="px-2 py-1 text-xs font-semibold rounded-full shrink-0 bg-slate-500/20 text-slate-300">
              {nextEvent.type}
            </span>
          </div>
          <p className="text-sm text-slate mt-1">{nextEvent.date}</p>
        </div>

        {/* Separator */}
        <hr className="border-slate-700/50 my-2" />

        {/* Upcoming Events List */}
        <div className="flex-grow">
          <ul className="space-y-3">
            {upcomingEvents.map((event) => (
              <li
                key={event.id}
                className="flex justify-between items-start text-sm">
                <div>
                  <p className="font-medium text-slate/90">{event.title}</p>
                  <p className="text-xs text-slate/70">{event.date}</p>
                </div>
                <p className="text-xs font-medium text-slate-400 shrink-0">
                  {event.type}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </WidgetCard>
  );
};

export default EventWidget;
