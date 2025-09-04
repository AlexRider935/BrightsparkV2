"use client"; // This must be a client component to use hooks

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/app/portal/(app)/components/Sidebar";
import { Loader2 } from "lucide-react";

export default function ProtectedPortalLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // This is the upgraded security guard.
    if (!loading) {
      if (!user) {
        // 1. If no one is logged in at all, kick them out.
        router.push("/portal/login");
        return;
      }

      // 2. If they ARE logged in, check if they have the right role for the page they're trying to visit.
      if (
        pathname.startsWith("/portal/admin-dashboard") &&
        user.role !== "admin"
      ) {
        // If they're on an admin page but aren't an admin, kick them out.
        console.error(
          "Access Denied: Non-admin user tried to access admin route."
        );
        router.push("/portal/login");
      } else if (
        pathname.startsWith("/portal/teacher-dashboard") &&
        user.role !== "teacher"
      ) {
        // If they're on a teacher page but aren't a teacher, kick them out.
        console.error(
          "Access Denied: Non-teacher user tried to access teacher route."
        );
        router.push("/portal/login");
      }
      // (We can add a similar rule for students later)
    }
  }, [user, loading, router, pathname]);

  // Show a loader while we check who is logged in.
  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-dark-navy">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  // If the user is logged in AND has the correct role, show the page.
  return (
    <div className="flex h-screen text-light-slate">
      <div className="w-64 shrink-0">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto p-8 min-w-0">{children}</main>
    </div>
  );
}
