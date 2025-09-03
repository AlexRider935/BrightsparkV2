"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon,
  PlusCircle,
  Edit,
  Trash2,
  X,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
const mockAllAlbums = [
  {
    id: "album1",
    title: "Science Fair 2025",
    eventDate: new Date("2025-08-15"),
    createdBy: "Mrs. S. Gupta",
    gdriveLink: "https://docs.google.com/...",
    status: "Published",
  },
  {
    id: "album2",
    title: "Annual Day Function 2025",
    eventDate: new Date("2025-04-20"),
    createdBy: "Admin",
    gdriveLink: "https://docs.google.com/...",
    status: "Published",
  },
  {
    id: "album3",
    title: "Sports Day 2025",
    eventDate: new Date("2025-03-10"),
    createdBy: "Mr. R. Verma",
    gdriveLink: "https://docs.google.com/...",
    status: "Published",
  },
  {
    id: "album4",
    title: "Independence Day Celebration",
    eventDate: new Date("2025-08-14"),
    createdBy: "Admin",
    gdriveLink: "#",
    status: "Draft",
  },
];

// --- Modal for Adding/Editing Albums ---
const AlbumModal = ({ isOpen, onClose, album }) => {
  const [title, setTitle] = useState("");
  const [gdriveLink, setGdriveLink] = useState("");

  useEffect(() => {
    if (album) {
      setTitle(album.title);
      setGdriveLink(album.gdriveLink);
    } else {
      setTitle("");
      setGdriveLink("");
    }
  }, [album, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Album:", { title, gdriveLink });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-dark-navy p-6">
          <h2 className="text-xl font-bold text-brand-gold mb-4">
            {album ? "Edit Album" : "Add New Album"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate mb-1">
                Album Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                required
              />
            </div>
            <div>
              <label
                htmlFor="gdriveLink"
                className="block text-sm font-medium text-slate mb-1">
                Google Drive Folder Link
              </label>
              <input
                type="url"
                id="gdriveLink"
                value={gdriveLink}
                onChange={(e) => setGdriveLink(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20">
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400">
                {album ? "Save Changes" : "Create Album"}
              </button>
            </div>
          </form>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate hover:text-white">
            <X size={24} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const StatusBadge = ({ status }) => (
  <span
    className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
      status === "Published"
        ? "bg-green-500/20 text-green-300"
        : "bg-slate-600/20 text-slate-400"
    }`}>
    {status}
  </span>
);

export default function ManageGalleryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);

  const handleCreate = () => {
    setEditingAlbum(null);
    setIsModalOpen(true);
  };

  const handleEdit = (album) => {
    setEditingAlbum(album);
    setIsModalOpen(true);
  };

  const sortedAlbums = mockAllAlbums.sort((a, b) => b.eventDate - a.eventDate);

  return (
    <>
      <AlbumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        album={editingAlbum}
      />
      <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
              Manage Gallery
            </h1>
            <p className="text-lg text-slate">
              Add, edit, and manage all event photo albums.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 shrink-0">
            <PlusCircle size={18} />
            <span>Add New Album</span>
          </button>
        </div>

        <motion.div
          className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase tracking-wider">
            <div className="col-span-4">Album Title</div>
            <div className="col-span-2">Event Date</div>
            <div className="col-span-2">Created By</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>
          <div className="divide-y divide-slate-700/50">
            {sortedAlbums.map((album) => (
              <div
                key={album.id}
                className="grid grid-cols-12 gap-4 items-center p-4 text-sm">
                <div className="col-span-4 font-medium text-light-slate">
                  {album.title}
                </div>
                <div className="col-span-2 text-slate">
                  {album.eventDate.toLocaleDateString("en-CA")}
                </div>
                <div className="col-span-2 text-slate">{album.createdBy}</div>
                <div className="col-span-1">
                  <StatusBadge status={album.status} />
                </div>
                <div className="col-span-3 flex justify-end gap-2">
                  <Link
                    href={album.gdriveLink}
                    target="_blank"
                    className="p-2 text-slate-400 hover:text-white rounded-md hover:bg-white/5"
                    title="View on Drive">
                    <ExternalLink size={16} />
                  </Link>
                  <button
                    onClick={() => handleEdit(album)}
                    className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-white/5"
                    title="Edit Album">
                    <Edit size={16} />
                  </button>
                  <button
                    className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-white/5"
                    title="Delete Album">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
