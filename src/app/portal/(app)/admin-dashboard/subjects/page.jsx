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
  Library,
  PlusCircle,
  Edit,
  Trash2,
  Search,
  Loader2,
  AlertTriangle,
  X,
  BookOpen,
  Check,
  User,
  GraduationCap,
} from "lucide-react";

// --- STATIC DATA ---
const classLevels = ["IV", "V", "VI", "VII", "VIII", "IX", "X"];

// --- HELPER & UI COMPONENTS ---

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

const SubjectModal = ({ isOpen, onClose, onSave, subject, teachers }) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    const initialData = {
      name: "",
      description: "",
      classes: [],
      teachers: [],
    };
    setFormData(subject ? { ...initialData, ...subject } : initialData);
    if (isOpen) setTimeout(() => nameInputRef.current?.focus(), 100);
  }, [subject, isOpen]);

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
            {subject ? "Edit Subject" : "Add New Subject"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate mb-2">
                Subject Name
              </label>
              <input
                ref={nameInputRef}
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder="e.g., Physics"
                required
                className={formInputClasses}
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows="2"
                placeholder="A brief description of the subject"
                className={formInputClasses}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate mb-2">
                Offered For Classes
              </label>
              <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 grid grid-cols-3 sm:grid-cols-4 max-h-40 overflow-y-auto">
                {classLevels.map((level) => (
                  <CustomCheckbox
                    key={level}
                    id={`class-${level}`}
                    label={`Class ${level}`}
                    value={level}
                    checked={(formData.classes || []).includes(level)}
                    onChange={(e) =>
                      handleArrayChange(
                        "classes",
                        e.target.value,
                        e.target.checked
                      )
                    }
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate mb-2">
                Assigned Teachers
              </label>
              <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 grid grid-cols-1 sm:grid-cols-2 max-h-40 overflow-y-auto">
                {teachers.length > 0 ? (
                  teachers.map((t) => (
                    <CustomCheckbox
                      key={t.id}
                      id={`teacher-${t.id}`}
                      label={t.name}
                      value={t.name}
                      checked={(formData.teachers || []).includes(t.name)}
                      onChange={(e) =>
                        handleArrayChange(
                          "teachers",
                          e.target.value,
                          e.target.checked
                        )
                      }
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center col-span-full py-4">
                    No teachers available.
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
                {subject ? "Save Changes" : "Create Subject"}
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

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, subjectName }) => {
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
          <h3 className="mt-4 text-lg font-bold text-white">Delete Subject</h3>
          <p className="mt-2 text-sm text-slate">
            Are you sure you want to delete{" "}
            <span className="font-bold text-light-slate">"{subjectName}"</span>?
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
  icon: Icon = Library,
}) => {
  /* ... JSX from previous responses ... */
};

// --- MAIN PAGE COMPONENT ---
export default function ManageSubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubSubjects = onSnapshot(
      query(collection(db, "subjects"), orderBy("name")),
      (snap) => {
        setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );
    const unsubTeachers = onSnapshot(
      query(collection(db, "teachers"), orderBy("name")),
      (snap) => setTeachers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => {
      unsubSubjects();
      unsubTeachers();
    };
  }, []);

  const filteredSubjects = useMemo(
    () =>
      subjects.filter((s) =>
        (s.name || "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [subjects, searchTerm]
  );

  const handleSave = async (subjectData) => {
    try {
      const dataToSave = { ...subjectData, updatedAt: Timestamp.now() };
      if (editingSubject) {
        await updateDoc(doc(db, "subjects", editingSubject.id), dataToSave);
      } else {
        await addDoc(collection(db, "subjects"), {
          ...dataToSave,
          createdAt: Timestamp.now(),
        });
      }
    } catch (e) {
      console.error("Error saving subject:", e);
    }
  };

  const handleDelete = (subject) => {
    setDeletingSubject(subject);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (deletingSubject) {
      await deleteDoc(doc(db, "subjects", deletingSubject.id));
      setIsDeleteModalOpen(false);
      setDeletingSubject(null);
    }
  };
  const handleCreate = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };
  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
          <p className="ml-4 text-slate">Loading Subjects...</p>
        </div>
      );
    if (subjects.length === 0)
      return (
        <EmptyState
          onAction={handleCreate}
          title="No Subjects Found"
          message="Get started by creating the first subject."
          buttonText="Add New Subject"
        />
      );
    if (filteredSubjects.length === 0)
      return (
        <EmptyState
          title="No Results Found"
          message="Your search did not match any subjects."
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
              <div className="col-span-3">Subject Name</div>
              <div className="col-span-4">Assigned Teachers</div>
              <div className="col-span-4">Classes Offered</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            <div className="divide-y divide-slate-800">
              {filteredSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="grid grid-cols-12 gap-4 items-center p-4 text-sm hover:bg-slate-800/20 transition-colors">
                  <div className="col-span-3">
                    <p className="font-medium text-light-slate flex items-center gap-3">
                      <BookOpen
                        size={18}
                        className="text-brand-gold/60 shrink-0"
                      />
                      {subject.name}
                    </p>
                  </div>
                  <div className="col-span-4 flex flex-wrap gap-2">
                    {(subject.teachers || []).length > 0 ? (
                      subject.teachers.map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-1.5 bg-slate-700/50 text-slate-300 text-xs font-medium px-2 py-1 rounded-full">
                          <User size={12} />
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">N/A</span>
                    )}
                  </div>
                  <div className="col-span-4 flex flex-wrap gap-2">
                    {(subject.classes || []).length > 0 ? (
                      subject.classes.map((c) => (
                        <span
                          key={c}
                          className="flex items-center gap-1.5 bg-blue-900/50 text-blue-300 text-xs font-medium px-2 py-1 rounded-full">
                          <GraduationCap size={12} />
                          Cl. {c}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">N/A</span>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <button
                      onClick={() => handleEdit(subject)}
                      className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(subject)}
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
            Manage Subjects
          </h1>
          <p className="text-base text-slate">
            Define the academic subjects offered at the institute.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Add New Subject</span>
        </button>
      </div>
      <AnimatePresence>
        {subjects.length > 0 && (
          <motion.div
            className="flex items-center gap-4 mb-6"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by subject name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 p-3 rounded-lg border border-slate-700 bg-slate-900 text-light-slate focus:border-brand-gold"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {renderContent()}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        subject={editingSubject}
        teachers={teachers}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        subjectName={deletingSubject?.name}
      />
    </main>
  );
}
