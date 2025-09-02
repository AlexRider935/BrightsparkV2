"use client";

import WidgetCard from "./WidgetCard";
import {
  HelpCircle,
  Mail,
  UserSquare,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

// A simple list of links to display in the widget
const links = [
  {
    href: "mailto:support@brightspark.space",
    label: "Ask a Question",
    Icon: Mail,
  },
  {
    href: "/path/to/mock-id-card.pdf",
    label: "Download ID Card",
    Icon: UserSquare,
  },
  {
    href: "/portal/student-dashboard/events",
    label: "View Full Calendar",
    Icon: CalendarDays,
  },
];

const QuickLinksWidget = () => {
  return (
    <WidgetCard title="Quick Links" Icon={HelpCircle} route="#">
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              target={link.href.startsWith("/") ? "_self" : "_blank"}
              className="flex items-center gap-3 p-2 rounded-md text-sm text-slate hover:text-light-slate hover:bg-white/5 transition-colors">
              <link.Icon className="h-5 w-5" />
              <span>{link.label}</span>
              {!link.href.startsWith("/") && (
                <ExternalLink size={14} className="ml-auto" />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
};

export default QuickLinksWidget;
