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
  Megaphone,
  PlusCircle,
  Edit,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  Filter,
  ChevronDown,
  Clock,
  Calendar,
  Users,
} from "lucide-react";
import { format, isPast, formatDistanceToNow } from "date-fns";

// --- HELPER & UI COMPONENTS ---

const StatusBadge = ({ expiryDate }) => {
  const isExpired = isPast(expiryDate);
  const styles = useMemo(
    () => ({
      Active: "bg-green-500/10 text-green-400 border-green-500/20",
      Expired: "bg-slate-600/10 text-slate-400 border-slate-500/20",
    }),
    []
  );
  const status = isExpired ? "Expired" : "Active";
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>
      {status}
    </span>
  );
};

const AnnouncementModal = ({
  isOpen,
  onClose,
  onSave,
  announcement,
  batches,
}) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const titleInputRef = useRef(null);

  const audienceOptions = useMemo(
    () => [
      "All Users",
      "All Students",
      "All Teachers",
      ...batches.map((b) => b.name),
    ],
    [batches]
  );

  useEffect(() => {
    const defaultExpiry = new Date();
    defaultExpiry.setDate(defaultExpiry.getDate() + 7);
    const initialData = {
      title: "",
      content: "",
      target: "All Users",
      expiryDate: defaultExpiry.toISOString().split("T")[0],
    };
    let dataToSet = announcement ? { ...announcement } : initialData;
    if (dataToSet.expiryDate instanceof Timestamp) {
      dataToSet.expiryDate = dataToSet.expiryDate
        .toDate()
        .toISOString()
        .split("T")[0];
    }
    setFormData(dataToSet);
    if (isOpen) setTimeout(() => titleInputRef.current?.focus(), 100);
  }, [announcement, isOpen]);

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
    "w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-light-slate placeholder:text-slate-500 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-200";

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
          className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-dark-navy/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}>
          <h2 className="text-xl font-bold text-brand-gold mb-6">
            {announcement ? "Edit Announcement" : "Create New Announcement"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate mb-2">
                Title
              </label>
              <input
                ref={titleInputRef}
                id="title"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                required
                className={formInputClasses}
              />
            </div>
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-slate mb-2">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content || ""}
                onChange={handleChange}
                rows="5"
                required
                placeholder="Enter the full text of the announcement here..."
                className={formInputClasses}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-700/50 pt-6">
              <div className="relative">
                <label
                  htmlFor="target"
                  className="block text-sm font-medium text-slate mb-2">
                  Target Audience
                </label>
                <select
                  id="target"
                  name="target"
                  value={formData.target || "All Users"}
                  onChange={handleChange}
                  className={`${formInputClasses} appearance-none pr-8`}>
                  {audienceOptions.map((aud) => (
                    <option key={aud} value={aud}>
                      {aud}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
              <div>
                <label
                  htmlFor="expiryDate"
                  className="block text-sm font-medium text-slate mb-2">
                  Visible Until
                </label>
                <input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate || ""}
                  onChange={handleChange}
                  required
                  className={`${formInputClasses} pr-2`}
                />
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
                {announcement ? "Save Changes" : "Publish Announcement"}
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

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title }) => {
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
          <h3 className="mt-4 text-lg font-bold text-white">
            Delete Announcement
          </h3>
          <p className="mt-2 text-sm text-slate">
            Are you sure you want to delete{" "}
            <span className="font-bold text-light-slate">"{title}"</span>? This
            is permanent.
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
  icon: Icon = Megaphone,
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

const AnnouncementCard = ({ item, onEdit, onDelete }) => (
  <motion.div
    className="rounded-2xl border border-white/10 bg-slate-900/30 p-6 backdrop-blur-sm transition-all hover:border-white/20"
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}>
    <div className="flex items-start justify-between gap-4">
      <h3 className="font-bold text-lg text-light-slate">{item.title}</h3>
      <div className="flex gap-2 shrink-0">
        <StatusBadge expiryDate={item.expiryDate?.toDate()} />
        <button
          onClick={() => onEdit(item)}
          className="p-1.5 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10">
          <Edit size={16} />
        </button>
        <button
          onClick={() => onDelete(item)}
          className="p-1.5 text-slate-400 hover:text-red-400 rounded-md hover:bg-red-400/10">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
    <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-prose">
      {item.content}
    </p>
    <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
      <div className="flex items-center gap-2">
        <Users size={14} />
        <span>
          For: <strong className="text-slate-300">{item.target}</strong>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Clock size={14} />
        <span>
          Published:{" "}
          <strong className="text-slate-300">
            {item.createdAt
              ? formatDistanceToNow(item.createdAt.toDate(), {
                  addSuffix: true,
                })
              : "N/A"}
          </strong>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar size={14} />
        <span>
          Expires:{" "}
          <strong className="text-slate-300">
            {item.expiryDate
              ? format(item.expiryDate.toDate(), "MMM dd, yyyy")
              : "N/A"}
          </strong>
        </span>
      </div>
    </div>
  </motion.div>
);

export default function ManageAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);

  useEffect(() => {
    setLoading(true);
    const qAnnouncements = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc")
    );
    const unsubAnnouncements = onSnapshot(qAnnouncements, (snapshot) => {
      setAnnouncements(
        snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((doc) => doc.id !== "--placeholder--")
      );
      setLoading(false);
    });

    const qBatches = query(collection(db, "batches"), orderBy("name"));
    const unsubBatches = onSnapshot(qBatches, (snapshot) =>
      setBatches(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );

    return () => {
      unsubAnnouncements();
      unsubBatches();
    };
  }, []);

  const filteredAnnouncements = useMemo(
    () =>
      announcements.filter((item) => {
        if (statusFilter === "all") return true;
        const isExpired = item.expiryDate
          ? isPast(item.expiryDate.toDate())
          : true;
        return statusFilter === "active" ? !isExpired : isExpired;
      }),
    [announcements, statusFilter]
  );

  const handleSave = async (data) => {
    try {
      const dataToSave = {
        ...data,
        expiryDate: Timestamp.fromDate(new Date(data.expiryDate)),
        updatedAt: Timestamp.now(),
      };
      if (editingAnnouncement) {
        await updateDoc(
          doc(db, "announcements", editingAnnouncement.id),
          dataToSave
        );
      } else {
        await addDoc(collection(db, "announcements"), {
          ...dataToSave,
          createdAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error("Error saving announcement:", error);
    }
  };

  const handleDelete = (announcement) => {
    setDeletingAnnouncement(announcement);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (deletingAnnouncement) {
      await deleteDoc(doc(db, "announcements", deletingAnnouncement.id));
      setIsDeleteModalOpen(false);
      setDeletingAnnouncement(null);
    }
  };
  const handleCreate = () => {
    setEditingAnnouncement(null);
    setIsModalOpen(true);
  };
  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
          <p className="ml-4 text-slate">Loading Announcements...</p>
        </div>
      );
    if (announcements.length === 0)
      return (
        <EmptyState
          onAction={handleCreate}
          title="No Announcements Yet"
          message="Get started by creating the first announcement."
          buttonText="Create New Announcement"
        />
      );
    if (filteredAnnouncements.length === 0)
      return (
        <EmptyState
          title="No Results Found"
          message="Your filter criteria did not match any announcements."
          icon={Filter}
        />
      );
    return (
      <AnimatePresence>
        {filteredAnnouncements.map((item) => (
          <AnnouncementCard
            key={item.id}
            item={item}
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
            Manage Announcements
          </h1>
          <p className="text-base text-slate">
            Create and publish institute-wide notices.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>New Announcement</span>
        </button>
      </div>
      <AnimatePresence>
        {announcements.length > 0 && (
          <motion.div
            className="flex items-center gap-4 mb-8"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}>
            <div className="relative w-full sm:w-64">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-900 p-3 pr-8 text-light-slate focus:border-brand-gold cursor-pointer">
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-6">{renderContent()}</div>
      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        announcement={editingAnnouncement}
        batches={batches}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={deletingAnnouncement?.title}
      />
    </main>
  );
}
