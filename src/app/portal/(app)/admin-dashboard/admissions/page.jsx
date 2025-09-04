"use client";

import { useState, useEffect, useMemo } from "react";
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
  UserPlus,
  PlusCircle,
  Check,
  Phone,
  Eye,
  Loader2,
  X,
  AlertTriangle,
  Edit,
  Trash2,
} from "lucide-react";


export default function AdmissionsPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingInquiry, setDeletingInquiry] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "admissions"),
      orderBy("inquiryDate", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const inquiriesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore Timestamp to JS Date object
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
    // Convert JS Date string back to Firestore Timestamp before saving
    const dataToSave = {
      ...inquiryData,
      inquiryDate: Timestamp.fromDate(new Date(inquiryData.inquiryDate)),
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
      try {
        await deleteDoc(doc(db, "admissions", deletingInquiry.id));
        setIsDeleteModalOpen(false);
        setDeletingInquiry(null);
      } catch (error) {
        console.error("Error deleting inquiry:", error);
      }
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

  const filters = ["All", "New Inquiry", "Contacted", "Enrolled", "Rejected"];

  return (
    <>
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
      <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
              Admissions Pipeline
            </h1>
            <p className="text-lg text-slate">
              Manage new student inquiries and enrollments.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 shrink-0">
            <PlusCircle size={18} />
            <span>Add New Inquiry</span>
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6 border-b border-slate-700/50">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? "border-b-2 border-brand-gold text-brand-gold"
                  : "text-slate hover:text-white"
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
          <motion.div className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase">
              <div className="col-span-3">Student Name</div>
              <div className="col-span-2">Class Applied</div>
              <div className="col-span-3">Parent Contact</div>
              <div className="col-span-2">Inquiry Date</div>
              <div className="col-span-2 text-center">Status</div>
            </div>
            <div className="divide-y divide-slate-700/50">
              {filteredInquiries.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 items-center p-4 text-sm group cursor-pointer hover:bg-slate-800/50"
                  onClick={() => handleEdit(item)}>
                  <div className="col-span-3 font-medium text-light-slate">
                    {item.studentName}
                  </div>
                  <div className="col-span-2 text-slate">
                    {item.classApplied}
                  </div>
                  <div className="col-span-3">
                    <p className="text-slate">{item.parentName}</p>
                    <p className="text-xs text-slate/70">{item.contact}</p>
                  </div>
                  <div className="col-span-2 text-slate">
                    {item.inquiryDate.toLocaleDateString("en-CA")}
                  </div>
                  <div className="col-span-2 text-center">
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <EmptyState onAction={handleCreate} />
        )}
      </div>
    </>
  );
}

// --- HELPER COMPONENTS (Full code for copy-paste) ---

const StatusBadge = ({ status }) => {
  const styles = {
    "New Inquiry": "bg-sky-500/20 text-sky-400",
    Contacted: "bg-amber-500/20 text-amber-400",
    Enrolled: "bg-green-500/20 text-green-300",
    Rejected: "bg-red-900/40 text-red-400",
  };
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
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
          className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-dark-navy p-6"
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
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate"
                required
              />
              <input
                name="classApplied"
                value={formData.classApplied}
                onChange={handleChange}
                placeholder="Class Applied For"
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                placeholder="Parent Name"
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate"
                required
              />
              <input
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Parent Contact"
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                name="inquiryDate"
                type="date"
                value={formData.inquiryDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate"
                required
              />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate">
                {["New Inquiry", "Contacted", "Enrolled", "Rejected"].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  )
                )}
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
                {inquiry ? "Save Changes" : "Add Inquiry"}
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

const EmptyState = ({ onAction }) => (
  <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50">
    <UserPlus className="mx-auto h-12 w-12 text-slate-500" />
    <h3 className="mt-4 text-xl font-semibold text-white">
      No Inquiries Found
    </h3>
    <p className="mt-2 text-sm text-slate">
      Get started by adding the first admission inquiry.
    </p>
    <button
      onClick={onAction}
      className="mt-6 flex items-center mx-auto gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400">
      <PlusCircle size={18} />
      <span>Add New Inquiry</span>
    </button>
  </div>
);
