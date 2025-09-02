"use client";

import { DayPicker, useDayPicker, useNavigation } from "react-day-picker";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Custom Header Component
function CustomCaption(props) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();
  return (
    <div className="flex items-center justify-between px-2 pt-2 pb-4">
      <h2 className="text-lg font-semibold text-light-slate">
        {format(props.displayMonth, "MMMM yyyy")}
      </h2>
      <div className="flex items-center gap-1">
        <button
          disabled={!previousMonth}
          onClick={() => previousMonth && goToMonth(previousMonth)}
          className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50">
          <ChevronLeft className="h-5 w-5 text-slate" />
        </button>
        <button
          disabled={!nextMonth}
          onClick={() => nextMonth && goToMonth(nextMonth)}
          className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50">
          <ChevronRight className="h-5 w-5 text-slate" />
        </button>
      </div>
    </div>
  );
}

// The main Calendar component, now simplified and more robust
export function Calendar({ selected, onSelect, eventDays }) {
  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={onSelect}
      modifiers={{ event: eventDays }}
      modifiersClassNames={{ event: "day-with-event" }}
      showOutsideDays
      fixedWeeks
      classNames={{
        // These classes are now simpler and work with the base styles
        root: "text-light-slate",
        day_today: "font-bold text-brand-gold",
        day_selected: "bg-brand-gold text-dark-navy font-bold",
        day_outside: "text-slate/50",
      }}
      components={{
        Caption: CustomCaption,
      }}
    />
  );
}
