"use client";

import { motion } from "framer-motion";
import { Upload, PlusCircle, FolderArchive, ExternalLink, Download, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
// Each object represents an album with its management links.
const mockAlbums = [
  {
    id: "science_fair_2025",
    title: "Science Fair 2025",
    date: new Date("2025-08-15"),
    gdriveLink: "https://docs.google.com/...", // Link to view the folder
    downloadLink: "#", // Link to trigger a download
  },
  {
    id: "annual_day_2025",
    title: "Annual Day Function 2025",
    date: new Date("2025-04-20"),
    gdriveLink: "https://docs.google.com/...",
    downloadLink: "#",
  },
  {
    id: "sports_day_2025",
    title: "Sports Day 2025",
    date: new Date("2025-03-10"),
    gdriveLink: "https://docs.google.com/...",
    downloadLink: "#",
  },
];

// Component for a single album row
const AlbumRow = ({ album }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
    <div className="flex items-center gap-4">
      <div className="bg-dark-navy p-3 rounded-lg border border-white/10">
        <FolderArchive className="h-6 w-6 text-brand-gold" />
      </div>
      <div>
        <h2 className="font-semibold text-light-slate">{album.title}</h2>
        <p className="text-xs text-slate">{album.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <Link href={album.gdriveLink} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20 transition-colors">
        <ExternalLink size={14} />
        <span>View</span>
      </Link>
      <Link href={album.downloadLink} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20 transition-colors">
        <Download size={14} />
        <span>Download</span>
      </Link>
      <button className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-white/5"><Edit size={16} /></button>
      <button className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-white/5"><Trash2 size={16} /></button>
    </div>
  </div>
);

export default function ManageGalleryPage() {
  const sortedAlbums = mockAlbums.sort((a, b) => b.date - a.date);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">Manage Gallery</h1>
          <p className="text-lg text-slate">Add, edit, and manage photo albums for institute events.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Add New Album</span>
        </button>
      </div>

      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="divide-y divide-slate-700/50">
          {sortedAlbums.length > 0 ? (
            sortedAlbums.map((album) => <AlbumRow key={album.id} album={album} />)
          ) : (
            <div className="p-12 text-center text-slate">
              <Upload className="mx-auto h-12 w-12 text-slate-500" />
              <h3 className="mt-4 text-xl font-semibold text-white">No Albums Found</h3>
              <p className="mt-1">Click "Add New Album" to get started.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}