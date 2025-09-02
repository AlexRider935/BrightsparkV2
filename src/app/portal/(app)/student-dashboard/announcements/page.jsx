"use client";

import { motion } from "framer-motion";
import { Megaphone, ClipboardList, Award, CreditCard } from "lucide-react";

// Mock data remains the same
const mockFeedItems = [
  {
    id: 1,
    type: "announcement",
    title: "Diwali Break Schedule Confirmed",
    content:
      "The institute will be closed for Diwali from October 21st to October 25th. Classes will resume on Monday, October 27th.",
    date: new Date("2025-09-02T09:00:00"),
  },
  {
    id: 2,
    type: "result",
    title: "Physics Unit Test II Results Published",
    content:
      "You scored 45 / 50. Please check the results page for a detailed report.",
    date: new Date("2025-09-01T15:30:00"),
  },
  {
    id: 3,
    type: "assignment",
    title: "New Assignment: Chapter 5 Algebra",
    content:
      "A new assignment has been posted. The due date is September 10th.",
    date: new Date("2025-08-30T11:00:00"),
  },
  {
    id: 4,
    type: "payment",
    title: "Fee Reminder for September",
    content:
      "The monthly fee of ₹5000 is due by September 15th. Please pay on time to avoid late charges.",
    date: new Date("2025-08-28T10:00:00"),
  },
  {
    id: 5,
    type: "announcement",
    title: "Parent-Teacher Meeting Scheduled",
    content:
      "The quarterly PTM will be held on Saturday, September 20th. Slots for booking will open next week.",
    date: new Date("2025-08-27T16:00:00"),
  },
];

// Helper object updated to remove the multi-color properties
const itemTypeDetails = {
  announcement: { Icon: Megaphone, tag: "Announcement" },
  assignment: { Icon: ClipboardList, tag: "Assignment" },
  result: { Icon: Award, tag: "Result" },
  payment: { Icon: CreditCard, tag: "Payment" },
};

// Helper function to format dates
const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export default function AnnouncementsPage() {
  // Sort the feed by date, newest first
  const sortedFeed = mockFeedItems.sort((a, b) => b.date - a.date);

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Announcements & Updates
      </h1>
      <p className="text-lg text-slate mb-8">
        The latest news, results, and updates all in one place.
      </p>

      <div className="space-y-6">
        {sortedFeed.map((item, index) => {
          const details = itemTypeDetails[item.type];
          return (
            <motion.div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}>
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <div className="bg-dark-navy p-3 rounded-lg border border-white/10">
                  {/* --- CHANGE: Icon color is now consistently brand-gold --- */}
                  <details.Icon className="h-6 w-6 text-brand-gold" />
                </div>
                <div className="flex-grow">
                  <h2 className="text-xl font-bold text-light-slate">
                    {item.title}
                  </h2>
                  <p className="text-sm text-slate">{formatDate(item.date)}</p>
                </div>
                {/* --- CHANGE: Tag now has a consistent, subtle style --- */}
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-500/20 text-slate-300 shrink-0">
                  {details.tag}
                </span>
              </div>
              <p className="text-slate leading-relaxed">{item.content}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
