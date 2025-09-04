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
} from "lucide-react";
import { format, isPast, formatDistanceToNow } from "date-fns";

// --- HELPER & UI COMPONENTS ---

const StatusBadge = ({ expiryDate }) => {
  if (!expiryDate)
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-600/20 text-slate-400">
        Expired
      </span>
    );

  const isExpired = isPast(expiryDate);
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
        isExpired
          ? "bg-slate-600/20 text-slate-400"
          : "bg-green-500/20 text-green-300"
      }`}>
      {isExpired ? "Expired" : "Active"}
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
          className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-dark-navy/80 p-6 sm:p-8 shadow-2xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}>
          <h2 className="text-xl font-bold text-brand-gold mb-6">
            {announcement ? "Edit Announcement" : "Create New Announcement"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="space-y-4">
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
                  className="form-input"
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
                  className="form-input"
                />
              </div>
            </fieldset>

            <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-700/50 pt-6">
              <div>
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
                  className="form-input">
                  {audienceOptions.map((aud) => (
                    <option key={aud} value={aud}>
                      {aud}
                    </option>
                  ))}
                </select>
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
                  className="form-input"
                />
              </div>
            </fieldset>

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
  // Redacted for brevity
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="relative w-full max-w-md p-6 text-center bg-dark-navy rounded-2xl border border-red-500/30"
        onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">
          Delete Announcement
        </h3>
        <p className="mt-2 text-sm text-slate">
          Are you sure you want to delete "{title}"?
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-md hover:bg-red-700">
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
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

// --- MAIN PAGE COMPONENT ---
export default function TeacherAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);

  const currentTeacher = { name: "Mr. A. K. Sharma" }; // Placeholder

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
    const unsubBatches = onSnapshot(qBatches, (snapshot) => {
      setBatches(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

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
          createdBy: currentTeacher.name,
        });
      }
      setIsModalOpen(false);
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
      try {
        await deleteDoc(doc(db, "announcements", deletingAnnouncement.id));
        setIsDeleteModalOpen(false);
        setDeletingAnnouncement(null);
      } catch (error) {
        console.error("Error deleting announcement:", error);
      }
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
      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase">
              <div className="col-span-4">Title</div>
              <div className="col-span-2">Target</div>
              <div className="col-span-2">Published</div>
              <div className="col-span-2">Expires</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            <div className="divide-y divide-slate-700/50">
              {filteredAnnouncements.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 items-center p-4 text-sm hover:bg-slate-800/20">
                  <div className="col-span-4 font-medium text-light-slate">
                    {item.title}
                  </div>
                  <div className="col-span-2 text-slate">{item.target}</div>
                  <div className="col-span-2 text-slate">
                    {item.createdAt
                      ? formatDistanceToNow(item.createdAt.toDate(), {
                          addSuffix: true,
                        })
                      : "N/A"}
                  </div>
                  <div className="col-span-2 text-slate">
                    {item.expiryDate
                      ? format(item.expiryDate.toDate(), "MMM dd, yyyy")
                      : "N/A"}
                  </div>
                  <div className="col-span-1">
                    <StatusBadge expiryDate={item.expiryDate?.toDate()} />
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-white/10">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-white/10">
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
    <>
      <style jsx global>{`
        .form-input {
          @apply w-full appearance-none cursor-pointer rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-200;
        }
      `}</style>
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
      <main>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-1">
              Announcements
            </h1>
            <p className="text-base text-slate">
              View and publish institute-wide notices.
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
              className="flex items-center gap-4 mb-6"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}>
              <div className="relative w-full sm:w-64">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full form-input">
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {renderContent()}
      </main>
    </>
  );
}
