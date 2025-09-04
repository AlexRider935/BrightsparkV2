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
  School,
  PlusCircle,
  Edit,
  Trash2,
  Users,
  Search,
  Loader2,
  AlertTriangle,
  X,
  BookOpen,
} from "lucide-react";

// --- STATIC DATA ---
const classLevels = ["IV", "V", "VI", "VII", "VIII", "IX", "X"];
const statusOptions = ["Upcoming", "Active", "Full", "Completed"];

// --- HELPER & UI COMPONENTS ---

const StatusBadge = ({ status }) => {
  const styles = useMemo(
    () => ({
      Active: "bg-green-500/20 text-green-300",
      Upcoming: "bg-sky-500/20 text-sky-400",
      Full: "bg-amber-500/20 text-amber-400",
      Completed: "bg-slate-600/20 text-slate-400",
    }),
    []
  );
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
        styles[status] || styles["Completed"]
      }`}>
      {status}
    </span>
  );
};

const BatchModal = ({ isOpen, onClose, onSave, batch, teachers, subjects }) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    const initialData = {
      name: "",
      classLevel: "",
      teacher: "",
      subjects: [],
      capacity: 12,
      status: "Upcoming",
    };
    setFormData(batch ? { ...initialData, ...batch } : initialData);

    if (isOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [batch, isOpen]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleArrayChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field]?.includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...(prev[field] || []), value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Ensure capacity is a number
    await onSave({ ...formData, capacity: Number(formData.capacity) });
    setIsSaving(false);
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
          className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-dark-navy/80 p-6 shadow-2xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}>
          <h2 className="text-xl font-bold text-brand-gold mb-6">
            {batch ? "Edit Batch" : "Add New Batch"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate mb-2">
                  Batch Name
                </label>
                <input
                  ref={nameInputRef}
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                />
              </div>
              <div>
                <label
                  htmlFor="teacher"
                  className="block text-sm font-medium text-slate mb-2">
                  Primary Teacher
                </label>
                <select
                  id="teacher"
                  name="teacher"
                  value={formData.teacher || ""}
                  onChange={handleChange}
                  required
                  className="w-full appearance-none cursor-pointer rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold">
                  <option value="" disabled>
                    Select a teacher
                  </option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="classLevel"
                  className="block text-sm font-medium text-slate mb-2">
                  Class Level
                </label>
                <select
                  id="classLevel"
                  name="classLevel"
                  value={formData.classLevel || ""}
                  onChange={handleChange}
                  required
                  className="w-full appearance-none cursor-pointer rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold">
                  <option value="" disabled>
                    Select a class
                  </option>
                  {classLevels.map((c) => (
                    <option key={c} value={`Class ${c}`}>
                      Class {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="capacity"
                  className="block text-sm font-medium text-slate mb-2">
                  Capacity
                </label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity || ""}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
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
                  value={formData.status || ""}
                  onChange={handleChange}
                  required
                  className="w-full appearance-none cursor-pointer rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold">
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate mb-2">
                Subjects Included
              </label>
              <div className="p-3 rounded-lg border border-white/10 bg-slate-900/50 max-h-32 overflow-y-auto">
                {subjects.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {subjects.map((s) => (
                      <label
                        key={s.id}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.subjects?.includes(s.name) || false}
                          onChange={() => handleArrayChange("subjects", s.name)}
                          className="form-checkbox bg-slate-700 border-slate-600 text-brand-gold focus:ring-brand-gold"
                        />
                        <span className="text-light-slate">{s.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate text-center">
                    No subjects available. Please add subjects first.
                  </p>
                )}
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
                disabled={isSaving}
                className="px-4 py-2 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400 flex items-center gap-2 disabled:bg-slate-600">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {batch ? "Save Changes" : "Create Batch"}
              </button>
            </div>
          </form>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-white/10 p-1 rounded-full">
            <X size={20} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, batchName }) => {
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
          <h3 className="mt-4 text-lg font-bold text-white">Delete Batch</h3>
          <p className="mt-2 text-sm text-slate">
            Are you sure you want to delete{" "}
            <span className="font-bold text-light-slate">"{batchName}"</span>?
            This is permanent.
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
  icon: Icon = School,
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
export default function ManageBatchesPage() {
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingBatch, setDeletingBatch] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubBatches = onSnapshot(
      query(collection(db, "batches"), orderBy("name")),
      (snap) => {
        setBatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );
    const unsubTeachers = onSnapshot(
      query(collection(db, "teachers"), orderBy("name")),
      (snap) => {
        setTeachers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );
    const unsubSubjects = onSnapshot(
      query(collection(db, "subjects"), orderBy("name")),
      (snap) => {
        setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );
    return () => {
      unsubBatches();
      unsubTeachers();
      unsubSubjects();
    };
  }, []);

  const filteredBatches = useMemo(
    () =>
      batches.filter(
        (b) =>
          b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.teacher?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [batches, searchTerm]
  );
  const handleSave = async (batchData) => {
    try {
      if (editingBatch) {
        await updateDoc(doc(db, "batches", editingBatch.id), batchData);
      } else {
        await addDoc(collection(db, "batches"), {
          ...batchData,
          studentCount: 0,
          createdAt: Timestamp.now(),
        });
      }
      setIsModalOpen(false);
      setEditingBatch(null);
    } catch (e) {
      console.error("Error saving batch:", e);
    }
  };
  const handleDelete = (batch) => {
    setDeletingBatch(batch);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (deletingBatch) {
      try {
        await deleteDoc(doc(db, "batches", deletingBatch.id));
        setIsDeleteModalOpen(false);
        setDeletingBatch(null);
      } catch (e) {
        console.error("Error deleting batch:", e);
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

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
          <p className="ml-4 text-slate">Loading Batches...</p>
        </div>
      );
    if (batches.length === 0)
      return (
        <EmptyState
          onAction={handleCreate}
          title="No Batches Found"
          message="Get started by creating the first batch."
          buttonText="Add New Batch"
        />
      );
    if (filteredBatches.length === 0)
      return (
        <EmptyState
          title="No Results Found"
          message="Your search did not match any batches."
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
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase">
              <div className="col-span-3">Batch Name</div>
              <div className="col-span-2">Teacher</div>
              <div className="col-span-3">Subjects</div>
              <div className="col-span-2">Enrollment</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            <div className="divide-y divide-slate-700/50">
              {filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="grid grid-cols-12 gap-4 items-center p-4 text-sm hover:bg-slate-800/20 transition-colors">
                  <div className="col-span-3">
                    <p className="font-medium text-light-slate">{batch.name}</p>
                    <p className="text-xs text-slate">{batch.classLevel}</p>
                  </div>
                  <div className="col-span-2 text-slate">{batch.teacher}</div>
                  <div className="col-span-3 flex flex-wrap gap-1">
                    {batch.subjects?.length > 0 ? (
                      batch.subjects.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="text-xs bg-slate-700/50 px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">N/A</span>
                    )}
                    {batch.subjects?.length > 3 && (
                      <span className="text-xs bg-slate-700/50 px-2 py-0.5 rounded">
                        +{batch.subjects.length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 text-slate">
                    {batch.studentCount || 0} / {batch.capacity}
                  </div>
                  <div className="col-span-1">
                    <StatusBadge status={batch.status} />
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <button
                      onClick={() => handleEdit(batch)}
                      className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-white/10">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(batch)}
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
      <BatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        batch={editingBatch}
        teachers={teachers}
        subjects={subjects}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        batchName={deletingBatch?.name}
      />
      <main>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-1">
              Manage Batches
            </h1>
            <p className="text-base text-slate">
              Create, view, and assign teachers to batches.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400 shrink-0">
            <PlusCircle size={18} />
            <span>Add New Batch</span>
          </button>
        </div>
        <AnimatePresence>
          {batches.length > 0 && (
            <motion.div
              className="flex items-center gap-4 mb-6 p-4 rounded-xl border border-white/10 bg-slate-900/20"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by batch name or teacher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 p-3 rounded-lg border border-white/10 bg-slate-900/50 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {renderContent()}
      </main>
    </>
  );
}
