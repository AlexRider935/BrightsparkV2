"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Book, Clock, Megaphone } from "lucide-react";
import { db } from "@/firebase/config"; // Import the db instance
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

// A simple card component for the dashboard
const DashboardCard = ({ title, children, Icon }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
    <div className="flex items-center gap-3 mb-4">
      <Icon className="h-6 w-6 text-brand-gold" />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    <div>{children}</div>
  </div>
);

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // NEW: State for our Firestore data and its loading status
  const [upcomingClass, setUpcomingClass] = useState(null);
  const [announcement, setAnnouncement] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  // This effect handles redirection based on auth status
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/portal/login");
    }
  }, [user, authLoading, router]);

  // NEW: This effect fetches data from Firestore once the user is logged in
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          // Fetch the most recent announcement
          const announcementsQuery = query(
            collection(db, "announcements"),
            orderBy("createdAt", "desc"),
            limit(1)
          );
          const announcementSnapshot = await getDocs(announcementsQuery);
          if (!announcementSnapshot.empty) {
            setAnnouncement(announcementSnapshot.docs[0].data());
          }

          // Fetch the first available course (as a placeholder for upcoming)
          const coursesQuery = query(collection(db, "courses"), limit(1));
          const courseSnapshot = await getDocs(coursesQuery);
          if (!courseSnapshot.empty) {
            setUpcomingClass(courseSnapshot.docs[0].data());
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setDataLoading(false);
        }
      };
      fetchData();
    }
  }, [user]); // Rerun this effect when the user object becomes available

  if (authLoading || !user) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-lg text-slate mb-8">
        Welcome back, <span className="text-brand-gold">{user.email}</span>
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Upcoming Class Widget - Now displays live data */}
        <DashboardCard title="Upcoming Class" Icon={Clock}>
          {dataLoading ? (
            <p className="text-sm text-slate">Loading...</p>
          ) : upcomingClass ? (
            <div className="space-y-3 text-slate">
              <p className="font-semibold text-white">{upcomingClass.title}</p>
              <p className="text-sm">{upcomingClass.schedule}</p>
              <button className="w-full rounded-lg bg-brand-gold/20 py-2 text-sm font-bold text-brand-gold transition-colors hover:bg-brand-gold hover:text-dark-navy">
                Join Now
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate">No upcoming classes.</p>
          )}
        </DashboardCard>

        {/* Recent Announcement Widget - Now displays live data */}
        <DashboardCard title="Recent Announcement" Icon={Megaphone}>
          {dataLoading ? (
            <p className="text-sm text-slate">Loading...</p>
          ) : announcement ? (
            <div className="space-y-2 text-slate">
              <p className="font-semibold text-white">{announcement.title}</p>
              <p className="text-sm">{announcement.content}</p>
            </div>
          ) : (
            <p className="text-sm text-slate">No recent announcements.</p>
          )}
        </DashboardCard>

        {/* My Progress Widget - Placeholder remains for now */}
        <DashboardCard title="My Progress" Icon={Book}>
          <div className="space-y-3 text-slate">
            <p className="text-sm">
              You have completed <strong>4 out of 5</strong> recent assignments.
            </p>
            <div className="w-full bg-slate/20 rounded-full h-2.5">
              <div
                className="bg-brand-gold h-2.5 rounded-full"
                style={{ width: "80%" }}></div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
