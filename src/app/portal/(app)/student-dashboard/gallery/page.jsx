"use client";

import { motion } from "framer-motion";
import { FolderArchive, Download, ExternalLink } from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
// Simplified to just include the album details and GDrive link, no photos.
const mockAlbums = [
  {
    id: "science_fair_2025",
    title: "Science Fair 2025",
    date: new Date("2025-08-15"),
    description:
      "All photos from the showcase of our students' innovative projects.",
    gdriveLink: "https://docs.google.com/...", // Placeholder GDrive link to view the folder
    downloadLink: "#", // Placeholder for a direct download trigger
  },
  {
    id: "annual_day_2025",
    title: "Annual Day Function 2025",
    date: new Date("2025-04-20"),
    description:
      "Photos celebrating a year of achievements with performances and awards.",
    gdriveLink: "https://docs.google.com/...",
    downloadLink: "#",
  },
  {
    id: "sports_day_2025",
    title: "Sports Day 2025",
    date: new Date("2025-03-10"),
    description: "Action shots from our annual track and field events.",
    gdriveLink: "https://docs.google.com/...",
    downloadLink: "#",
  },
];

export default function GalleryPage() {
  const sortedAlbums = mockAlbums.sort((a, b) => b.date - a.date);

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Event Gallery
      </h1>
      <p className="text-lg text-slate mb-8">
        View and download photo albums from institute events.
      </p>

      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="divide-y divide-slate-700/50">
          {sortedAlbums.map((album) => (
            <div
              key={album.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-dark-navy p-3 rounded-lg border border-white/10">
                  <FolderArchive className="h-6 w-6 text-brand-gold" />
                </div>
                <div>
                  <h2 className="font-semibold text-light-slate">
                    {album.title}
                  </h2>
                  <p className="text-xs text-slate">
                    {album.date.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href={album.gdriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20 transition-colors">
                  <ExternalLink size={14} />
                  <span>View</span>
                </Link>
                <Link
                  href={album.downloadLink}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-md bg-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-dark-navy transition-colors">
                  <Download size={14} />
                  <span>Download</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
