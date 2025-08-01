"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRedirector() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Once we have the user and their role, redirect them
      if (user.role === "teacher") {
        router.push("/portal/teacher-dashboard");
      } else if (user.role === "student") {
        router.push("/portal/student-dashboard");
      } else {
        // Handle users with no role or other roles
        router.push("/portal/login");
      }
    } else if (!loading && !user) {
      // If there's no user after loading, send to login
      router.push("/portal/login");
    }
  }, [user, loading, router]);

  // Display a generic loading state while we determine the user's role
  return (
    <div className="flex min-h-full items-center justify-center">
      <p className="text-white">Loading Portal...</p>
    </div>
  );
}
