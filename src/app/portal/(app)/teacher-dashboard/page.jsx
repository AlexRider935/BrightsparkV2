"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TeacherDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if loading is done and user is not a teacher
    if (!loading && (!user || user.role !== "teacher")) {
      router.push("/portal/login"); // Or a dedicated "access denied" page
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  // Only render if the user is a teacher
  if (user.role === "teacher") {
    return (
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Teacher Dashboard
        </h1>
        <p className="text-lg text-slate mb-8">
          Welcome, <span className="text-brand-gold">{user.email}</span>
        </p>
        {/* Teacher-specific widgets will go here */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <p className="text-slate rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
            Manage Courses
          </p>
          <p className="text-slate rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
            View Student Progress
          </p>
          <p className="text-slate rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
            Create Announcements
          </p>
        </div>
      </div>
    );
  }

  // Fallback for non-teachers who might briefly land here before redirect
  return null;
}
