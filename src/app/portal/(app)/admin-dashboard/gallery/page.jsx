"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  ExternalLink,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

// --- Modal for Adding/Editing Albums ---
const AlbumModal = ({ isOpen, onClose, onSave, album }) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const titleInputRef = useRef(null);

  useEffect(() => {
    const initialData = {
      title: "",
      eventDate: new Date().toISOString().split("T")[0],
      gdriveLink: "",
      status: "Published",
    };

    let dataToSet = album ? { ...album } : initialData;
    if (dataToSet.eventDate instanceof Timestamp) {
      dataToSet.eventDate = dataToSet.eventDate
        .toDate()
        .toISOString()
        .split("T")[0];
    }

    setFormData(dataToSet);
    if (isOpen) setTimeout(() => titleInputRef.current?.focus(), 100);
  }, [album, isOpen]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
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
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-dark-navy/80 p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-brand-gold mb-6">
            {album ? "Edit Album" : "Add New Album"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate mb-2">
                Album Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                ref={titleInputRef}
                value={formData.title || ""}
                onChange={handleChange}
                className="w-full form-input"
                required
              />
            </div>
            <div>
              <label
                htmlFor="eventDate"
                className="block text-sm font-medium text-slate mb-2">
                Event Date
              </label>
              <input
                type="date"
                id="eventDate"
                name="eventDate"
                value={formData.eventDate || ""}
                onChange={handleChange}
                className="w-full form-input"
                required
              />
            </div>
            <div>
              <label
                htmlFor="gdriveLink"
                className="block text-sm font-medium text-slate mb-2">
                Google Drive Folder Link
              </label>
              <input
                type="url"
                id="gdriveLink"
                name="gdriveLink"
                value={formData.gdriveLink || ""}
                onChange={handleChange}
                className="w-full form-input"
                placeholder="https://..."
                required
              />
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-slate mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || "Published"}
                onChange={handleChange}
                className="w-full form-input"
                required>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
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
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
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
  // This component remains the same, just connect the onConfirm prop
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
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">Delete Album</h3>
          <p className="mt-2 text-sm text-slate">
            Are you sure you want to delete the album{" "}
            <span className="font-bold text-light-slate">"{albumTitle}"</span>?
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

const EmptyState = ({ onAction }) => (
  <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/10">
    <ImageIcon className="mx-auto h-12 w-12 text-slate-500" />
    <h3 className="mt-4 text-xl font-semibold text-white">No Albums Found</h3>
    <p className="mt-2 text-sm text-slate">
      Get started by adding the first photo album link.
    </p>
    <button
      onClick={onAction}
      className="mt-6 flex items-center mx-auto gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400">
      <PlusCircle size={18} />
      <span>Add New Album</span>
    </button>
  </div>
);

export default function ManageGalleryPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAlbum, setDeletingAlbum] = useState(null);

  useEffect(() => {
    setLoading(true);
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

  const handleSave = async (formData) => {
    try {
      const dataToSave = {
        ...formData,
        eventDate: Timestamp.fromDate(new Date(formData.eventDate)),
      };

      if (editingAlbum) {
        const { id, ...dataToUpdate } = dataToSave;
        await updateDoc(doc(db, "galleryAlbums", id), dataToUpdate);
      } else {
        await addDoc(collection(db, "galleryAlbums"), {
          ...dataToSave,
          createdAt: Timestamp.now(),
          createdBy: "Admin",
        });
      }
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
      try {
        await deleteDoc(doc(db, "galleryAlbums", deletingAlbum.id));
        setIsDeleteModalOpen(false);
        setDeletingAlbum(null);
      } catch (error) {
        console.error("Error deleting album:", error);
      }
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

  return (
    <>
      <style jsx global>{`
        .form-input {
          @apply w-full appearance-none cursor-pointer rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-200;
        }
      `}</style>
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

      <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-1">
              Manage Gallery
            </h1>
            <p className="text-base text-slate">
              Add and manage all event photo album links.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 shrink-0">
            <PlusCircle size={18} />
            <span>Add New Album</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
          </div>
        ) : albums.length > 0 ? (
          <motion.div
            className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase tracking-wider">
                  <div className="col-span-4">Album Title</div>
                  <div className="col-span-2">Event Date</div>
                  <div className="col-span-2">Created By</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>
                <div className="divide-y divide-slate-700/50">
                  {albums.map((album) => (
                    <div
                      key={album.id}
                      className="grid grid-cols-12 gap-4 items-center p-4 text-sm hover:bg-slate-800/20">
                      <div className="col-span-4 font-medium text-light-slate">
                        {album.title}
                      </div>
                      <div className="col-span-2 text-slate">
                        {album.eventDate
                          ? format(album.eventDate.toDate(), "MMM dd, yyyy")
                          : "N/A"}
                      </div>
                      <div className="col-span-2 text-slate">
                        {album.createdBy}
                      </div>
                      <div className="col-span-1">
                        <StatusBadge status={album.status} />
                      </div>
                      <div className="col-span-3 flex justify-end gap-2">
                        <a
                          href={album.gdriveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-white rounded-md hover:bg-white/5"
                          title="View Album">
                          <ExternalLink size={16} />
                        </a>
                        <button
                          onClick={() => handleEdit(album)}
                          className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-white/5"
                          title="Edit Album">
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(album)}
                          className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-white/5"
                          title="Delete Album">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <EmptyState onAction={handleCreate} />
        )}
      </div>
    </>
  );
}
