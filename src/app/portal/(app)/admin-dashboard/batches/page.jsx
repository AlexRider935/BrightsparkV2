"use client";

import { useState, useEffect } from "react";
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
} from "firebase/firestore";
import {
  School,
  PlusCircle,
  Edit,
  Trash2,
  Users,
  UserCircle as TeacherIcon,
  X,
  Loader2,
} from "lucide-react";

// --- Reusable Components (StatusBadge, BatchCard, BatchModal) ---
// Note: These components are now fully wired up with props for live data and actions.

export default function ManageBatchesPage() {
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);

  // --- Fetch Batches and Teachers from Firestore ---
  useEffect(() => {
    // Fetch Batches in real-time
    const qBatches = query(collection(db, "batches"), orderBy("name"));
    const unsubscribeBatches = onSnapshot(qBatches, (snapshot) => {
      const batchesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBatches(batchesData);
      setLoading(false);
    });

    // Fetch Teachers (for the dropdown)
    const qTeachers = query(collection(db, "teachers"), orderBy("name"));
    const unsubscribeTeachers = onSnapshot(qTeachers, (snapshot) => {
      const teachersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeachers(teachersData);
    });

    return () => {
      unsubscribeBatches();
      unsubscribeTeachers();
    };
  }, []);

  // --- CRUD Operations ---
  const handleSave = async (batchData) => {
    try {
      if (editingBatch) {
        // Update existing batch
        const batchRef = doc(db, "batches", editingBatch.id);
        await updateDoc(batchRef, batchData);
      } else {
        // Create new batch
        await addDoc(collection(db, "batches"), {
          ...batchData,
          studentCount: 0,
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving batch:", error);
    }
  };

  const handleDelete = async (batchId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this batch? This action cannot be undone."
      )
    ) {
      try {
        await deleteDoc(doc(db, "batches", batchId));
      } catch (error) {
        console.error("Error deleting batch:", error);
      }
    }
  };

  const handleCreate = () => {
    setEditingBatch(null);
    setIsModalOpen(true);
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setIsModalOpen(true);
  };

  return (
    <>
      <BatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        batch={editingBatch}
        teachers={teachers}
      />
      <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
              Manage Batches
            </h1>
            <p className="text-lg text-slate">
              Create, view, and edit all student batches.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 shrink-0">
            <PlusCircle size={18} />
            <span>Add New Batch</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => (
              <BatchCard
                key={batch.id}
                batch={batch}
                onEdit={() => handleEdit(batch)}
                onDelete={() => handleDelete(batch.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// --- HELPER COMPONENTS (Full code for copy-paste) ---

// --- HELPER COMPONENTS (Full code for copy-paste) ---

const StatusBadge = ({ status }) => {
  const styles = {
    Active:
      "bg-green-500/20 text-green-300 ring-1 ring-inset ring-green-500/30",
    Upcoming: "bg-sky-500/20 text-sky-400 ring-1 ring-inset ring-sky-500/30",
    Full: "bg-amber-500/20 text-amber-400 ring-1 ring-inset ring-amber-500/30",
    Completed:
      "bg-slate-600/20 text-slate-400 ring-1 ring-inset ring-slate-500/30",
  };
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

const BatchCard = ({ batch, onEdit, onDelete }) => (
  <motion.div
    className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg flex flex-col"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    layout>
    <div className="p-6 flex-grow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-brand-gold font-semibold">{batch.classLevel}</p>
          <h3 className="text-xl font-bold text-light-slate -mt-1">
            {batch.name}
          </h3>
        </div>
        <StatusBadge status={batch.status} />
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-slate">
          <TeacherIcon size={16} />
          <span>Assigned Teacher:</span>
          <span className="font-semibold text-light-slate">
            {batch.teacher}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate">
          <Users size={16} />
          <span>Students:</span>
          <span className="font-semibold text-light-slate">
            {batch.studentCount || 0} / {batch.capacity}
          </span>
        </div>
      </div>
    </div>
    <div className="p-4 mt-auto flex justify-end items-center gap-2 border-t border-slate-700/50 bg-white/5">
      <button
        onClick={onEdit}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-brand-gold hover:text-dark-navy transition-colors">
        <Edit size={14} /> Edit
      </button>
      <button
        onClick={onDelete}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md bg-red-900/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
        <Trash2 size={14} /> Delete
      </button>
    </div>
  </motion.div>
);

const BatchModal = ({ isOpen, onClose, onSave, batch, teachers }) => {
  const [formData, setFormData] = useState({
    name: "",
    classLevel: "",
    teacher: "",
    capacity: "",
    status: "Upcoming",
  });
  const classLevels = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
  ];
  const statusOptions = ["Active", "Upcoming", "Full", "Completed"];

  useEffect(() => {
    if (batch) {
      setFormData({
        name: batch.name || "",
        classLevel: batch.classLevel || "",
        teacher: batch.teacher || "",
        capacity: batch.capacity || "",
        status: batch.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        classLevel: "",
        teacher: "",
        capacity: "",
        status: "Upcoming",
      });
    }
  }, [batch, isOpen]);

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
            {batch ? "Edit Batch" : "Add New Batch"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Batch Name"
                className="col-span-2 w-full rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold"
                required
              />
              <select
                name="classLevel"
                value={formData.classLevel}
                onChange={handleChange}
                className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold"
                required>
                <option value="" disabled>
                  Select Class Level
                </option>
                {classLevels.map((level) => (
                  <option key={level} value={`Class ${level}`}>
                    Class {level}
                  </option>
                ))}
              </select>
              <input
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Capacity"
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold"
                required
              />
            </div>
            <select
              name="teacher"
              value={formData.teacher}
              onChange={handleChange}
              className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold"
              required>
              <option value="">Assign a Teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold"
              required>
              <option value="">Set Status</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
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
                {batch ? "Save Changes" : "Create Batch"}
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
