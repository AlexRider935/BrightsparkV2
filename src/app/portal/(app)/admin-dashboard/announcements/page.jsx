"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  PlusCircle,
  Edit,
  Trash2,
  X,
  Users,
  UserCircle,
  School,
} from "lucide-react";

// --- MOCK DATA ---
const mockAnnouncements = [
  {
    id: "ann1",
    title: "Diwali Break Schedule Confirmed",
    content:
      "The institute will be closed for Diwali from October 21st to October 25th. Classes will resume on Monday, October 27th.",
    publishedDate: new Date("2025-09-02"),
    target: "All",
  },
  {
    id: "ann2",
    title: "Extra Class for Mathematics VI",
    content:
      "Mr. Sharma will be conducting an extra class this Friday at 5:00 PM to cover advanced topics. All students from the batch are requested to attend.",
    publishedDate: new Date("2025-08-30"),
    target: "Class VI - Foundation",
  },
  {
    id: "ann3",
    title: "Faculty Meeting Reminder",
    content:
      "A mandatory faculty meeting is scheduled for this Wednesday at 3:00 PM in the main conference room.",
    publishedDate: new Date("2025-08-29"),
    target: "Teachers Only",
  },
];

const mockAudiences = [
  "All",
  "Students Only",
  "Teachers Only",
  "Class VI - Foundation",
  "Class VII - Olympiad",
];

// --- Modal Component for Creating/Editing Announcements ---
const AnnouncementModal = ({ isOpen, onClose, announcement }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState("All");

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setContent(announcement.content);
      setTarget(announcement.target);
    } else {
      setTitle("");
      setContent("");
      setTarget("All");
    }
  }, [announcement, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting:", { title, content, target });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}>
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-dark-navy p-6">
            <h2 className="text-xl font-bold text-brand-gold mb-4">
              {announcement ? "Edit Announcement" : "Create New Announcement"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-slate mb-1">
                  Title
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
                  htmlFor="content"
                  className="block text-sm font-medium text-slate mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  required></textarea>
              </div>
              <div>
                <label
                  htmlFor="target"
                  className="block text-sm font-medium text-slate mb-1">
                  Target Audience
                </label>
                <select
                  id="target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
                  {mockAudiences.map((aud) => (
                    <option key={aud} value={aud}>
                      {aud}
                    </option>
                  ))}
                </select>
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
                  {announcement ? "Save Changes" : "Publish"}
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
      )}
    </AnimatePresence>
  );
};

export default function ManageAnnouncementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const handleCreate = () => {
    setEditingAnnouncement(null);
    setIsModalOpen(true);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const sortedAnnouncements = mockAnnouncements.sort(
    (a, b) => b.publishedDate - a.publishedDate
  );

  return (
    <>
      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        announcement={editingAnnouncement}
      />
      <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
              Manage Announcements
            </h1>
            <p className="text-lg text-slate">
              Create, edit, and publish institute-wide notices.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 shrink-0">
            <PlusCircle size={18} />
            <span>Create New Announcement</span>
          </button>
        </div>

        <motion.div
          className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <div className="divide-y divide-slate-700/50">
            {sortedAnnouncements.map((item) => (
              <div
                key={item.id}
                className="p-4 flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-light-slate">
                    {item.title}
                  </h2>
                  <p className="text-xs text-slate mt-1">
                    {item.publishedDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    • Targeted to:{" "}
                    <span className="font-semibold text-slate-300">
                      {item.target}
                    </span>
                  </p>
                  <p className="text-sm text-slate-400 mt-2 pr-4">
                    {item.content.substring(0, 120)}...
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-white/5">
                    <Edit size={16} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-white/5">
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
