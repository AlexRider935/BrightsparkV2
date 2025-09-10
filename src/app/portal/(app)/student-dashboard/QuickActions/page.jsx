// src/app/portal/(app)/student-dashboard/components/QuickActions.jsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/firebase/config";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { HelpCircle, UserSquare, Calendar, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

// --- Helper function to format event dates dynamically ---
const formatHolidayDate = (startDate, endDate) => {
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

// --- UPDATED ActionButton Component ---
const ActionButton = ({ Icon, children, href, onClick, target }) => {
  const Component = href ? Link : "button";

  // This object holds props that are common to both <Link> and <button>
  const commonProps = {
    onClick: onClick,
    className:
      "flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-slate hover:text-light-slate w-full text-center",
  };

  // Conditionally create the props object to avoid passing href="" to a button
  const componentProps = { ...commonProps };
  if (href) {
    componentProps.href = href;
    if (target) {
      componentProps.target = target;
      componentProps.rel = "noopener noreferrer"; // Good practice for security
    }
  }

  return (
    <Component {...componentProps}>
      <Icon className="h-8 w-8 text-brand-gold" />
      <span className="text-sm font-semibold">{children}</span>
    </Component>
  );
};

export default function QuickActions() {
  const [showHolidays, setShowHolidays] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);

  // Fetch upcoming holidays from Firestore
  useEffect(() => {
    const holidaysQuery = query(
      collection(db, "events"),
      where("type", "==", "Holiday"),
      where("startDate", ">=", Timestamp.now()),
      orderBy("startDate", "asc")
    );

    const unsubscribe = onSnapshot(
      holidaysQuery,
      (snapshot) => {
        setHolidays(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setLoadingHolidays(false);
      },
      (error) => {
        console.error("Failed to fetch holidays:", error);
        setLoadingHolidays(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <>
      <motion.div
        className="mt-8 rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}>
        <h3 className="text-lg font-semibold text-light-slate mb-4">
          Quick Actions & Support
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ActionButton
            Icon={HelpCircle}
            href="mailto:support@brightspark.space">
            Ask a Question
          </ActionButton>
          <ActionButton
            Icon={UserSquare}
            href="/path/to/mock-id-card.pdf" // This remains a mock link as per the original code
            target="_blank">
            Download ID Card
          </ActionButton>
          <ActionButton Icon={Calendar} onClick={() => setShowHolidays(true)}>
            View Holiday List
          </ActionButton>
        </div>
      </motion.div>

      {/* Holiday List Modal */}
      <AnimatePresence>
        {showHolidays && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowHolidays(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-dark-navy p-6">
              <h3 className="text-xl font-bold text-brand-gold mb-4">
                Upcoming Holidays
              </h3>
              {loadingHolidays ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-slate-400" />
                </div>
              ) : holidays.length > 0 ? (
                <ul className="divide-y divide-slate-700/50">
                  {holidays.map((holiday) => (
                    <li
                      key={holiday.id}
                      className="flex justify-between items-center py-3">
                      <span className="text-light-slate">{holiday.title}</span>
                      <span className="text-slate text-xs">
                        {formatHolidayDate(holiday.startDate, holiday.endDate)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-center text-slate-500">
                  No upcoming holidays scheduled.
                </p>
              )}
              <button
                className="absolute top-4 right-4 text-slate hover:text-white transition-colors"
                onClick={() => setShowHolidays(false)}>
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
