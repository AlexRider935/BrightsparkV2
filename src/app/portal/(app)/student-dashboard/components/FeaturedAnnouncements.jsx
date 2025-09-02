"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/firebase/config";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { Megaphone } from "lucide-react";

const FeaturedAnnouncement = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "announcements"),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(q);
        setAnnouncement(snapshot.empty ? null : snapshot.docs[0].data());
      } catch (error) {
        console.error("Failed to fetch announcement:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // The component's UI from the previous version
  return (
    <div className="rounded-2xl border border-brand-gold/30 bg-gradient-to-br from-brand-gold/10 to-dark-navy/20 p-6 backdrop-blur-lg">
      <div className="flex items-center gap-3 mb-3">
        <Megaphone className="h-5 w-5 text-brand-gold" />
        <h3 className="font-semibold text-light-slate">Latest Announcement</h3>
      </div>
      {loading ? (
        <div className="h-20 animate-pulse bg-slate/10 rounded-md"></div>
      ) : announcement ? (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xl font-bold text-white">{announcement.title}</p>
            <p className="text-slate text-sm mt-1">
              {announcement.content.substring(0, 100)}...
            </p>
          </div>
          <button
            onClick={() => router.push("/portal/announcements")}
            className="w-full md:w-auto shrink-0 rounded-lg bg-brand-gold px-6 py-2 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400">
            Read More
          </button>
        </div>
      ) : (
        <p className="text-slate">No new announcements at the moment.</p>
      )}
    </div>
  );
};

export default FeaturedAnnouncement;
