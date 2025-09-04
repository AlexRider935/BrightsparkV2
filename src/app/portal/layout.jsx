"use client";

import { AuthProvider } from "@/context/AuthContext";

export default function PortalLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
