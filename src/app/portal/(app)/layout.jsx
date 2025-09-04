"use client"; // This must be a client component to use hooks

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/app/portal/(app)/components/Sidebar";
import { Loader2 } from "lucide-react";

export default function ProtectedPortalLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This is the security guard. It only runs for pages inside (app).
    if (!loading && !user) {
      router.push("/portal/login"); // If no user, kick them out.
    }
  }, [user, loading, router]);

  // Show a loader while we check who is logged in.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-dark-navy">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  // If there's a user, show the dashboard with the sidebar.
  if (user) {
    return (
      <div className="flex h-screen text-light-slate">
        <div className="w-64 shrink-0">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto p-8 min-w-0">{children}</main>
      </div>
    );
  }

  // If no user after loading, show nothing while we redirect.
  return null;
}
