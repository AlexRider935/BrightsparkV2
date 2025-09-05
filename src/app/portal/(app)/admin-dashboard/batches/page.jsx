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
  where,
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
  Check,
  GraduationCap,
  ChevronDown
} from "lucide-react";

// --- STATIC DATA ---
const classLevels = ["IV", "V", "VI", "VII", "VIII", "IX", "X"];
const statusOptions = ["Upcoming", "Active", "Full", "Completed"];

// --- HELPER & UI COMPONENTS ---

const StatusBadge = ({ status }) => {
  const styles = useMemo(
    () => ({
      Active: "bg-green-500/10 text-green-400 border-green-500/20",
      Upcoming: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      Full: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      Completed: "bg-slate-600/10 text-slate-400 border-slate-500/20",
    }),
    []
  );
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
        styles[status] || styles["Completed"]
      }`}>
      {status}
    </span>
  );
};

const UserAvatar = ({ name, imageUrl, size = "md" }) => {
  const sizeClasses = { sm: "w-8 h-8", md: "w-12 h-12" };
  const fontClasses = { sm: "text-xs", md: "text-lg" };
  if (imageUrl)
    return (
      <img
        src={imageUrl}
        alt={name || "User"}
        className={`rounded-full object-cover shrink-0 ${sizeClasses[size]}`}
      />
    );
  const getInitials = (n) => {
    if (!n) return "?";
    const parts = n.split(" ");
    if (parts.length > 1 && parts[0] && parts[parts.length - 1])
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    if (n) return n.substring(0, 2).toUpperCase();
    return "?";
  };
  const getColor = (n) => {
    const colors = [
      "bg-red-500/20 text-red-300",
      "bg-green-500/20 text-green-300",
      "bg-blue-500/20 text-blue-300",
      "bg-yellow-500/20 text-yellow-300",
      "bg-indigo-500/20 text-indigo-300",
      "bg-purple-500/20 text-purple-300",
      "bg-pink-500/20 text-pink-300",
    ];
    if (!n) return colors[0];
    const charCodeSum = n
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold shrink-0 ${
        sizeClasses[size]
      } ${fontClasses[size]} ${getColor(name || "")}`}>
      {getInitials(name || "")}
    </div>
  );
};

const CustomCheckbox = ({ id, label, value, checked, onChange }) => (
  <label
    htmlFor={id}
    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
    <div className="relative w-5 h-5">
      <input
        id={id}
        type="checkbox"
        value={value}
        checked={checked}
        onChange={onChange}
        className="absolute opacity-0 w-full h-full cursor-pointer"
      />
      <div
        className={`w-5 h-5 rounded border-2 ${
          checked ? "border-brand-gold bg-brand-gold/20" : "border-slate-600"
        } flex items-center justify-center transition-all`}>
        {checked && <Check className="h-3.5 w-3.5 text-brand-gold" />}
      </div>
    </div>
    <span className="text-light-slate select-none">{label}</span>
  </label>
);

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
    setFormData(
      batch
        ? { ...initialData, ...batch, subjects: batch.subjects || [] }
        : initialData
    );
    if (isOpen) setTimeout(() => nameInputRef.current?.focus(), 100);
  }, [batch, isOpen]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleArrayChange = (field, value, isChecked) => {
    setFormData((prev) => ({
      ...prev,
      [field]: isChecked
        ? [...(prev[field] || []), value]
        : (prev[field] || []).filter((item) => item !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({ ...formData, capacity: Number(formData.capacity) });
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
          className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-dark-navy/90 p-6 shadow-2xl backdrop-blur-xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}>
          <h2 className="text-xl font-bold text-brand-gold mb-6">
            {batch ? "Edit Batch" : "Add New Batch"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                  className={formInputClasses}
                />
              </div>
              <div className="relative">
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
                  className={`${formInputClasses} appearance-none pr-8`}>
                  <option value="" disabled>
                    Select a teacher
                  </option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="relative">
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
                  className={`${formInputClasses} appearance-none pr-8`}>
                  <option value="" disabled>
                    Select a class
                  </option>
                  {classLevels.map((c) => (
                    <option key={c} value={`Class ${c}`}>
                      Class {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
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
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate mb-2">
                Subjects Included
              </label>
              <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 grid grid-cols-2 sm:grid-cols-3 max-h-40 overflow-y-auto">
                {subjects.length > 0 ? (
                  subjects.map((s) => (
                    <CustomCheckbox
                      key={s.id}
                      id={`sub-${s.id}`}
                      label={s.name}
                      value={s.name}
                      checked={(formData.subjects || []).includes(s.name)}
                      onChange={(e) =>
                        handleArrayChange(
                          "subjects",
                          e.target.value,
                          e.target.checked
                        )
                      }
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center col-span-full py-4">
                    No subjects available.
                  </p>
                )}
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
                className="px-6 py-2.5 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400 flex items-center gap-2 disabled:bg-slate-600">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}{" "}
                {batch ? "Save Changes" : "Create Batch"}
              </button>
            </div>
          </form>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10">
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
}) => {
  /* ... Full JSX from previous responses ... */
};

const BatchCard = ({ batch, teacher, onEdit, onDelete }) => (
  <motion.div
    className="rounded-2xl border border-white/10 bg-slate-900/30 p-5 flex flex-col justify-between backdrop-blur-sm transition-all hover:border-white/20 hover:bg-slate-900/50"
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}>
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-light-slate">{batch.name}</h3>
          <p className="text-sm text-slate-400">{batch.classLevel}</p>
        </div>
        <StatusBadge status={batch.status} />
      </div>
      <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-col gap-4">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <UserAvatar
            name={teacher?.name}
            imageUrl={teacher?.photoURL}
            size="sm"
          />
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">Teacher</span>
            <span>{batch.teacher}</span>
          </div>
        </div>
        <div className="text-sm text-slate-300">
          <p className="flex items-center gap-2 mb-2 text-xs text-slate-500">
            <Users size={14} /> Enrollment
          </p>
          <div className="flex items-center gap-2">
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-brand-gold h-2 rounded-full"
                style={{
                  width: `${
                    ((batch.studentCount || 0) / batch.capacity) * 100
                  }%`,
                }}></div>
            </div>
            <span className="text-xs font-medium text-slate-400">
              {batch.studentCount || 0}/{batch.capacity}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div className="mt-5 flex justify-end items-center gap-2">
      <button
        onClick={() => onEdit(batch)}
        className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10 transition-colors">
        <Edit size={16} />
      </button>
      <button
        onClick={() => onDelete(batch)}
        className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-red-400/10 transition-colors">
        <Trash2 size={16} />
      </button>
    </div>
  </motion.div>
);

export default function ManageBatchesPage() {
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [studentCounts, setStudentCounts] = useState({});
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
      (snap) => setTeachers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubSubjects = onSnapshot(
      query(collection(db, "subjects"), orderBy("name")),
      (snap) => setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    // Live listener for student enrollments
    const unsubStudents = onSnapshot(
      query(collection(db, "students")),
      (snap) => {
        const counts = {};
        snap.forEach((doc) => {
          const batchName = doc.data().batch;
          if (batchName) {
            counts[batchName] = (counts[batchName] || 0) + 1;
          }
        });
        setStudentCounts(counts);
      }
    );

    return () => {
      unsubBatches();
      unsubTeachers();
      unsubSubjects();
      unsubStudents();
    };
  }, []);

  const batchesWithCounts = useMemo(
    () =>
      batches.map((batch) => ({
        ...batch,
        studentCount: studentCounts[batch.name] || 0,
      })),
    [batches, studentCounts]
  );

  const filteredBatches = useMemo(
    () =>
      batchesWithCounts.filter(
        (b) =>
          (b.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.teacher || "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [batchesWithCounts, searchTerm]
  );

  const handleSave = async (batchData) => {
    try {
      const dataToSave = { ...batchData, updatedAt: Timestamp.now() };
      if (editingBatch) {
        await updateDoc(doc(db, "batches", editingBatch.id), dataToSave);
      } else {
        await addDoc(collection(db, "batches"), {
          ...dataToSave,
          createdAt: Timestamp.now(),
        });
      }
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
      await deleteDoc(doc(db, "batches", deletingBatch.id));
      setIsDeleteModalOpen(false);
      setDeletingBatch(null);
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
        <div className="col-span-full flex justify-center items-center py-20">
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
      <AnimatePresence>
        {filteredBatches.map((batch) => {
          const teacherInfo = teachers.find((t) => t.name === batch.teacher);
          return (
            <BatchCard
              key={batch.id}
              batch={batch}
              teacher={teacherInfo}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          );
        })}
      </AnimatePresence>
    );
  };

  return (
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
            className="flex items-center gap-4 mb-6"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by batch name or teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 p-3 rounded-lg border border-slate-700 bg-slate-900 text-light-slate focus:border-brand-gold"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {renderContent()}
      </div>
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
    </main>
  );
}
