"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/firebase/config";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import {
  ImageIcon,
  PlusCircle,
  Edit,
  Trash2,
  X,
  ChevronDown,
  Search,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";

// --- HELPER & UI COMPONENTS ---

const StatusBadge = ({ status }) => {
  const styles = useMemo(
    () => ({
      Published: "bg-green-500/10 text-green-400 border-green-500/20",
      Draft: "bg-slate-600/10 text-slate-400 border-slate-500/20",
    }),
    []
  );
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
        styles[status] || styles["Draft"]
      }`}>
      {status}
    </span>
  );
};

const AlbumModal = ({ isOpen, onClose, onSave, album }) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const titleInputRef = useRef(null);

  useEffect(() => {
    const initialData = {
      title: "",
      gdriveLink: "",
      eventDate: format(new Date(), "yyyy-MM-dd"),
      status: "Published",
    };
    if (album) {
      setFormData({
        ...album,
        eventDate: album.eventDate
          ? format(album.eventDate.toDate(), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
      });
    } else {
      setFormData(initialData);
    }
    if (isOpen) setTimeout(() => titleInputRef.current?.focus(), 100);
  }, [album, isOpen]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const dataToSave = {
      ...formData,
      eventDate: Timestamp.fromDate(new Date(formData.eventDate)),
    };
    await onSave(dataToSave);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;
  const formInputClasses =
    "w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-light-slate placeholder:text-slate-500 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}>
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-dark-navy/90 p-6 shadow-2xl backdrop-blur-xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}>
          <h2 className="text-xl font-bold text-brand-gold mb-6">
            {album ? "Edit Album" : "Add New Album"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate mb-2">
                Album Title
              </label>
              <input
                ref={titleInputRef}
                id="title"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                required
                className={formInputClasses}
                placeholder="e.g., Annual Sports Day 2025"
              />
            </div>
            <div>
              <label
                htmlFor="gdriveLink"
                className="block text-sm font-medium text-slate mb-2">
                Google Drive Link
              </label>
              <input
                id="gdriveLink"
                name="gdriveLink"
                type="url"
                value={formData.gdriveLink || ""}
                onChange={handleChange}
                required
                className={formInputClasses}
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-700/50 pt-5">
              <div>
                <label
                  htmlFor="eventDate"
                  className="block text-sm font-medium text-slate mb-2">
                  Event Date
                </label>
                <input
                  id="eventDate"
                  name="eventDate"
                  type="date"
                  value={formData.eventDate || ""}
                  onChange={handleChange}
                  required
                  className={formInputClasses}
                />
              </div>
              <div className="relative">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-slate mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status || ""}
                  onChange={handleChange}
                  required
                  className={`${formInputClasses} appearance-none pr-8`}>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400 disabled:bg-slate-600">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}{" "}
                {album ? "Save Changes" : "Create Album"}
              </button>
            </div>
          </form>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10">
            <X size={20} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, albumTitle }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}>
        <motion.div
          className="relative w-full max-w-md rounded-2xl border border-red-500/30 bg-dark-navy p-6 text-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">Delete Album</h3>
          <p className="mt-2 text-sm text-slate">
            Are you sure you want to delete{" "}
            <span className="font-bold text-light-slate">"{albumTitle}"</span>?
            This action is permanent.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="w-full px-4 py-2 text-sm font-bold rounded-md bg-red-600 text-white hover:bg-red-700">
              Confirm Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const EmptyState = ({
  onAction,
  title,
  message,
  buttonText,
  icon: Icon = ImageIcon,
}) => (
  <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/10">
    <Icon className="mx-auto h-12 w-12 text-slate-500" />
    <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm text-slate">{message}</p>
    {onAction && buttonText && (
      <button
        onClick={onAction}
        className="mt-6 flex items-center mx-auto gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400">
        <PlusCircle size={18} />
        <span>{buttonText}</span>
      </button>
    )}
  </div>
);

export default function ManageGalleryPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "all" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAlbum, setDeletingAlbum] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "galleryAlbums"),
      orderBy("eventDate", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const albumsData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((doc) => doc.id !== "--placeholder--");
      setAlbums(albumsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredAlbums = useMemo(
    () =>
      albums
        .filter((a) => filters.status === "all" || a.status === filters.status)
        .filter((a) =>
          (a.title || "").toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [albums, filters, searchTerm]
  );

  const handleSave = async (formData) => {
    try {
      const dataToSave = {
        ...formData,
        updatedAt: Timestamp.now(),
      };
      if (editingAlbum) {
        await updateDoc(doc(db, "galleryAlbums", editingAlbum.id), dataToSave);
      } else {
        await addDoc(collection(db, "galleryAlbums"), {
          ...dataToSave,
          createdAt: Timestamp.now(),
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving album:", error);
    }
  };

  const handleDelete = (album) => {
    setDeletingAlbum(album);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (deletingAlbum) {
      await deleteDoc(doc(db, "galleryAlbums", deletingAlbum.id));
      setIsDeleteModalOpen(false);
      setDeletingAlbum(null);
    }
  };
  const handleCreate = () => {
    setEditingAlbum(null);
    setIsModalOpen(true);
  };
  const handleEdit = (album) => {
    setEditingAlbum(album);
    setIsModalOpen(true);
  };

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
        </div>
      );
    if (albums.length === 0 && !loading)
      return (
        <EmptyState
          onAction={handleCreate}
          title="No Albums Yet"
          message="Add the first photo album to get started."
          buttonText="Add New Album"
        />
      );
    if (filteredAlbums.length === 0)
      return (
        <EmptyState
          title="No Results Found"
          message="Your search or filters did not match any albums."
          icon={Search}
        />
      );

    return (
      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase tracking-wider">
              <div className="col-span-5">Album Title</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Event Date</div>
              <div className="col-span-2">Last Updated</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            <div className="divide-y divide-slate-800">
              {filteredAlbums.map((album) => (
                <div
                  key={album.id}
                  className="grid grid-cols-12 gap-4 items-center p-4 text-sm hover:bg-slate-800/20 transition-colors">
                  <div className="col-span-5 font-medium text-light-slate truncate">
                    {album.title}
                  </div>
                  <div className="col-span-2">
                    <StatusBadge status={album.status} />
                  </div>
                  <div className="col-span-2 text-slate-400">
                    {album.eventDate
                      ? format(album.eventDate.toDate(), "MMM dd, yyyy")
                      : "N/A"}
                  </div>
                  <div className="col-span-2 text-slate-400">
                    {album.updatedAt
                      ? formatDistanceToNow(album.updatedAt.toDate(), {
                          addSuffix: true,
                        })
                      : "N/A"}
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <a
                      href={album.gdriveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10">
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => handleEdit(album)}
                      className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(album)}
                      className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-red-400/10">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <main>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-1">
            Manage Gallery
          </h1>
          <p className="text-base text-slate">
            Add, edit, and manage all event photo album links.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Add New Album</span>
        </button>
      </div>

      <AnimatePresence>
        {albums.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}>
            <div className="relative">
              <select
                onChange={(e) => setFilters({ status: e.target.value })}
                className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-900 p-3 pr-8 text-light-slate focus:border-brand-gold cursor-pointer">
                <option value="all">All Statuses</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by album title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 p-3 rounded-lg border border-slate-700 bg-slate-900 text-light-slate focus:border-brand-gold"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {renderContent()}

      <AlbumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        album={editingAlbum}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        albumTitle={deletingAlbum?.title}
      />
    </main>
  );
}
