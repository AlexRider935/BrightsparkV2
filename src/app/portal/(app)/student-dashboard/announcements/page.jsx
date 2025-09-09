"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { Megaphone, Star, Loader2, Info } from "lucide-react";
import { format, isPast } from "date-fns";

// Helper function to format dates
const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// Component for a single announcement card
const AnnouncementCard = ({ item, isPinned = false }) => {
  return (
    <motion.div
      className={`rounded-2xl border ${
        isPinned
          ? "border-yellow-400/30 bg-yellow-400/5"
          : "border-white/10 bg-slate-900/20"
      } p-6 backdrop-blur-lg`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}>
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
        <div
          className={`p-3 rounded-lg border ${
            isPinned
              ? "bg-yellow-400/10 border-yellow-400/20"
              : "bg-dark-navy border-white/10"
          }`}>
          <Megaphone
            className={`h-6 w-6 ${
              isPinned ? "text-yellow-400" : "text-brand-gold"
            }`}
          />
        </div>
        <div className="flex-grow">
          <h2 className="text-xl font-bold text-light-slate">{item.title}</h2>
          <p className="text-sm text-slate">
            {formatDate(item.createdAt.toDate())}
          </p>
        </div>
        {isPinned && (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full bg-yellow-400/20 text-yellow-300 shrink-0">
            <Star size={12} /> Pinned
          </span>
        )}
      </div>
      <p className="text-slate leading-relaxed whitespace-pre-wrap">
        {item.content}
      </p>
    </motion.div>
  );
};

export default function StudentAnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // If user is null (still loading auth state or logged out), wait.
      const timer = setTimeout(() => {
        if (!user) setLoading(false);
      }, 1500); // Give auth a moment to initialize
      return () => clearTimeout(timer);
    }

    const now = new Date();

    // Query for all announcements that haven't expired yet
    const q = query(
      collection(db, "announcements"),
      where("expiryDate", ">", Timestamp.fromDate(now)),
      orderBy("expiryDate", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allActiveAnnouncements = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter announcements on the client-side based on the student's batch
        const studentBatch = user.profile?.batch;
        const relevantAnnouncements = allActiveAnnouncements.filter((ann) => {
          return (
            ann.target === "All Users" ||
            ann.target === "All Students" ||
            (studentBatch && ann.target === studentBatch)
          );
        });

        setAnnouncements(relevantAnnouncements);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching announcements:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Memoized calculation to find the single pinned announcement
  const pinnedAnnouncement = useMemo(() => {
    const now = new Date();
    return announcements
      .filter(
        (ann) =>
          ann.showOnDashboard &&
          ann.showOnDashboardUntil &&
          !isPast(ann.showOnDashboardUntil.toDate())
      )
      .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())[0]; // Sort by newest first // Get only the most recent one
  }, [announcements]);

  // Memoized calculation for the regular feed (sorted and excludes the pinned one)
  const regularFeed = useMemo(() => {
    return announcements
      .filter((ann) => !pinnedAnnouncement || ann.id !== pinnedAnnouncement.id) // Exclude the pinned one if it exists
      .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
  }, [announcements, pinnedAnnouncement]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Announcements & Updates
      </h1>
      <p className="text-lg text-slate mb-8">
        The latest news and updates all in one place.
      </p>

      <div className="space-y-8">
        {/* Pinned Announcement Section */}
        {pinnedAnnouncement && (
          <AnnouncementCard item={pinnedAnnouncement} isPinned={true} />
        )}

        {/* Regular Feed Section */}
        {regularFeed.map((item) => (
          <AnnouncementCard key={item.id} item={item} />
        ))}

        {/* Empty State */}
        {!pinnedAnnouncement && regularFeed.length === 0 && (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/10">
            <Info className="mx-auto h-12 w-12 text-slate-500" />
            <h3 className="mt-4 text-xl font-semibold text-white">
              No Active Announcements
            </h3>
            <p className="mt-2 text-sm text-slate">
              There are no new announcements for you at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
