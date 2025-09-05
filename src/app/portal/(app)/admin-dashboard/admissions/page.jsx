"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
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
  UserPlus,
  PlusCircle,
  Check,
  Phone,
  Loader2,
  X,
  AlertTriangle,
  Edit,
  Trash2,
  ChevronDown,
  Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// --- HELPER & UI COMPONENTS ---

const StatusBadge = ({ status }) => {
  const styles = useMemo(
    () => ({
      "New Inquiry": "bg-sky-500/10 text-sky-400 border-sky-500/20",
      Contacted: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      Enrolled: "bg-green-500/10 text-green-400 border-green-500/20",
      Rejected: "bg-red-900/10 text-red-400 border-red-500/20",
    }),
    []
  );
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
        styles[status] || "bg-slate-600/10 text-slate-400"
      }`}>
      {status}
    </span>
  );
};

const InquiryModal = ({ isOpen, onClose, onSave, inquiry }) => {
  const [formData, setFormData] = useState({});
  useEffect(() => {
    const initialData = {
      studentName: "",
      classApplied: "",
      parentName: "",
      contact: "",
      inquiryDate: new Date().toISOString().split("T")[0],
      status: "New Inquiry",
    };
    setFormData(
      inquiry
        ? {
            ...inquiry,
            inquiryDate: new Date(inquiry.inquiryDate)
              .toISOString()
              .split("T")[0],
          }
        : initialData
    );
  }, [inquiry, isOpen]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
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
          className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-dark-navy/90 p-6 backdrop-blur-xl"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}>
          <h2 className="text-xl font-bold text-brand-gold mb-6">
            {inquiry ? "Edit Inquiry" : "Add New Inquiry"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                placeholder="Student Full Name"
                className={formInputClasses}
                required
              />
              <input
                name="classApplied"
                value={formData.classApplied}
                onChange={handleChange}
                placeholder="Class Applied For"
                className={formInputClasses}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                placeholder="Parent Name"
                className={formInputClasses}
                required
              />
              <input
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Parent Contact"
                className={formInputClasses}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                name="inquiryDate"
                type="date"
                value={formData.inquiryDate}
                onChange={handleChange}
                className={`${formInputClasses} pr-2`}
                required
              />
              <div className="relative">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`${formInputClasses} appearance-none pr-8`}>
                  {["New Inquiry", "Contacted", "Enrolled", "Rejected"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    )
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
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
                {inquiry ? "Save Changes" : "Add Inquiry"}
              </button>
            </div>
          </form>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, studentName }) => {
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
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">Delete Inquiry</h3>
          <p className="mt-2 text-sm text-slate">
            Are you sure you want to delete the inquiry for{" "}
            <span className="font-bold text-light-slate">"{studentName}"</span>?
            This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20 w-full">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-bold rounded-md bg-red-600 text-white hover:bg-red-700 w-full">
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
  icon: Icon = UserPlus,
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

const InquiryCard = ({ item, onEdit, onDelete, onEnroll }) => (
  <motion.div
    className="rounded-2xl border border-white/10 bg-slate-900/30 p-5 flex flex-col justify-between backdrop-blur-sm transition-all hover:border-white/20"
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}>
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-light-slate">
            {item.studentName}
          </h3>
          <p className="text-sm text-slate-400">
            Applying for: {item.classApplied}
          </p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-col gap-2 text-sm text-slate-300">
        <p>
          <strong>Parent:</strong> {item.parentName}
        </p>
        <p>
          <strong>Contact:</strong> {item.contact}
        </p>
        <p className="text-xs text-slate-500">
          Inquiry received{" "}
          {formatDistanceToNow(item.inquiryDate, { addSuffix: true })}
        </p>
      </div>
    </div>
    <div className="mt-5 flex justify-between items-center gap-2">
      <div>
        {item.status !== "Enrolled" && item.status !== "Rejected" && (
          <button
            onClick={() => onEnroll(item)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400 disabled:bg-slate-600 transition-colors">
            <Check size={16} /> Enroll Student
          </button>
        )}
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onEdit(item)}
          className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10">
          <Edit size={16} />
        </button>
        <button
          onClick={() => onDelete(item)}
          className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-red-400/10">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </motion.div>
);

export default function AdmissionsPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingInquiry, setDeletingInquiry] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const q = query(
      collection(db, "admissions"),
      orderBy("inquiryDate", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const inquiriesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        inquiryDate: doc.data().inquiryDate.toDate(),
      }));
      setInquiries(inquiriesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredInquiries = useMemo(() => {
    if (activeFilter === "All") return inquiries;
    return inquiries.filter((i) => i.status === activeFilter);
  }, [inquiries, activeFilter]);

  const handleSave = async (inquiryData) => {
    const dataToSave = {
      ...inquiryData,
      inquiryDate: Timestamp.fromDate(new Date(inquiryData.inquiryDate)),
      updatedAt: Timestamp.now(),
    };
    try {
      if (editingInquiry) {
        await updateDoc(doc(db, "admissions", editingInquiry.id), dataToSave);
      } else {
        await addDoc(collection(db, "admissions"), {
          ...dataToSave,
          createdAt: Timestamp.now(),
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving inquiry:", error);
    }
  };

  const handleDelete = (inquiry) => {
    setDeletingInquiry(inquiry);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (deletingInquiry) {
      await deleteDoc(doc(db, "admissions", deletingInquiry.id));
      setIsDeleteModalOpen(false);
      setDeletingInquiry(null);
    }
  };
  const handleCreate = () => {
    setEditingInquiry(null);
    setIsModalOpen(true);
  };
  const handleEdit = (inquiry) => {
    setEditingInquiry(inquiry);
    setIsModalOpen(true);
  };

  const handleEnroll = (inquiry) => {
    const queryParams = new URLSearchParams({
      firstName: inquiry.studentName.split(" ")[0] || "",
      lastName: inquiry.studentName.split(" ").slice(1).join(" ") || "",
      classApplied: inquiry.classApplied || "",
      fatherName: inquiry.parentName || "",
      fatherContact: inquiry.contact || "",
    }).toString();
    router.push(`/portal/admin-dashboard/students/new?${queryParams}`);
  };

  const filters = ["All", "New Inquiry", "Contacted", "Enrolled", "Rejected"];

  return (
    <main>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-1">
            Admissions Pipeline
          </h1>
          <p className="text-base text-slate">
            Manage new student inquiries and enrollments.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Add New Inquiry</span>
        </button>
      </div>

      <div className="flex items-center gap-2 mb-8 bg-slate-900/30 border border-slate-700/50 p-1 rounded-lg">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeFilter === filter
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}>
            {filter}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
        </div>
      ) : filteredInquiries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredInquiries.map((item) => (
              <InquiryCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onEnroll={handleEnroll}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState
          onAction={handleCreate}
          title="No Inquiries Found"
          message="Get started by adding the first admission inquiry."
          buttonText="Add New Inquiry"
        />
      )}

      <InquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        inquiry={editingInquiry}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        studentName={deletingInquiry?.studentName}
      />
    </main>
  );
}
