"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import WidgetCard from "./WidgetCard";
import {
  HelpCircle,
  Mail,
  UserSquare,
  CalendarDays,
  ExternalLink,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";

const iconMap = {
  "ask a question": Mail,
  "download id card": UserSquare,
  "view full calendar": CalendarDays,
};

const QuickLinksWidget = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, "settings", "quickLinks");
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setLinks(docSnap.data().links || []);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching quick links:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <WidgetCard title="Quick Links" Icon={HelpCircle}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </WidgetCard>
    );
  }

  if (links.length === 0) {
    return (
      <WidgetCard title="Quick Links" Icon={HelpCircle}>
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-slate-500">No links available.</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title="Quick Links" Icon={HelpCircle}>
      <ul className="space-y-3">
        {links.map((link) => {
          const Icon = iconMap[link.label.toLowerCase()] || LinkIcon;
          const isExternal = link.href && !link.href.startsWith("/");

          return (
            <li key={link.label}>
              <Link
                href={link.href || "#"}
                target={isExternal ? "_blank" : "_self"}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="flex items-center gap-3 p-2 rounded-md text-sm text-slate hover:text-light-slate hover:bg-white/5 transition-colors">
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
                {isExternal && <ExternalLink size={14} className="ml-auto" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </WidgetCard>
  );
};

export default QuickLinksWidget;
