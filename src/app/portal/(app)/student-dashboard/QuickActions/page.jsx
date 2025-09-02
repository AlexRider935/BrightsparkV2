"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, UserSquare, Calendar, Download, X } from "lucide-react";
import Link from "next/link";

// Using the mockEvents from our Events page for consistency
const mockHolidays = [
  { id: 3, title: "Diwali Break", date: "Oct 21 - Oct 25, 2025" },
  { id: 5, title: "Last Day of Term", date: "December 19, 2025" },
];

const ActionButton = ({ Icon, children, href, onClick }) => {
  const Component = href ? Link : "button";
  return (
    <Component
      href={href || ""}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-slate hover:text-light-slate w-full text-center">
      <Icon className="h-8 w-8 text-brand-gold" />
      <span className="text-sm font-semibold">{children}</span>
    </Component>
  );
};

export default function QuickActions() {
  const [showHolidays, setShowHolidays] = useState(false);

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
            href="/path/to/mock-id-card.pdf"
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
              onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the modal
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-dark-navy p-6">
              <h3 className="text-xl font-bold text-brand-gold mb-4">
                Upcoming Holidays
              </h3>
              <ul className="divide-y divide-slate-700/50">
                {mockHolidays.map((holiday) => (
                  <li
                    key={holiday.id}
                    className="flex justify-between items-center py-3">
                    <span className="text-light-slate">{holiday.title}</span>
                    <span className="text-slate">{holiday.date}</span>
                  </li>
                ))}
              </ul>
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
