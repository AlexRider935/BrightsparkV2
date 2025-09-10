"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Import the new, separated widget components
import FeaturedAnnouncement from "./components/FeaturedAnnouncements";
import AssignmentWidget from "./components/AssignmentWidget";
import ResultsWidget from "./components/ResultsWidget";
import PaymentsWidget from "./components/PaymentsWidget";
import EventWidget from "./components/EventWidget";
import QuickActions from "./QuickActions/page";
import QuickLinksWidget from "./components/QuickLinksWidget";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/portal/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate border-t-brand-gold"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Dashboard
      </h1>
      <p className="text-lg text-slate mb-8">
        Welcome back,{" "}
        <span className="text-brand-gold">
          {user.displayName || user.email}
        </span>
      </p>

      <FeaturedAnnouncement />

      {/* The grid has been reordered as requested */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        <EventWidget /> {/* <-- MOVED TO FIRST POSITION */}
        <AssignmentWidget />
        <ResultsWidget />
        <PaymentsWidget />
        <QuickLinksWidget/>
      </div>
    </div>
  );
}