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
  Calendar,
  Check,
} from "lucide-react";
import { format } from "date-fns";

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
  const formInputClasses =
    "w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-light-slate placeholder:text-slate-500 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold";

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
          className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-dark-navy/90 p-6 shadow-2xl backdrop-blur-xl">
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
                className={formInputClasses}
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
                className={formInputClasses}
                placeholder="https://..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                  className={`${formInputClasses} pr-2`}
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
                  className={formInputClasses}
                  required>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
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

const EmptyState = ({
  onAction,
  title,
  message,
  buttonText,
  icon: Icon = ImageIcon,
}) => (
  <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/10 col-span-full">
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

const AlbumCard = ({ album, onEdit, onDelete }) => (
  <motion.div
    className="rounded-2xl border border-white/10 bg-slate-900/30 p-5 flex flex-col justify-between backdrop-blur-sm transition-all hover:border-white/20 hover:bg-slate-900/50"
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}>
    <div>
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-bold text-lg text-light-slate">{album.title}</h3>
        <StatusBadge status={album.status} />
      </div>
      <div className="mt-3 text-sm text-slate-400 flex items-center gap-2">
        <Calendar size={14} />
        <span>
          {album.eventDate
            ? format(album.eventDate.toDate(), "MMM dd, yyyy")
            : "N/A"}
        </span>
      </div>
    </div>
    <div className="mt-5 pt-4 border-t border-slate-700/50 flex justify-between items-center gap-2">
      <a
        href={album.gdriveLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 transition-colors">
        <ExternalLink size={16} /> View Album
      </a>
      <div className="flex gap-1">
        <button
          onClick={() => onEdit(album)}
          className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10">
          <Edit size={16} />
        </button>
        <button
          onClick={() => onDelete(album)}
          className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-red-400/10">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </motion.div>
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
        <div className="flex justify-center items-center py-20 col-span-full">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
        </div>
      );
    if (albums.length === 0)
      return (
        <EmptyState
          onAction={handleCreate}
          title="No Albums Found"
          message="Get started by adding the first photo album link."
          buttonText="Add New Album"
        />
      );
    return (
      <AnimatePresence>
        {albums.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </AnimatePresence>
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
            Add and manage all event photo album links.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Add New Album</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {renderContent()}
      </div>
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
