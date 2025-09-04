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
  Users,
  PlusCircle,
  Edit,
  Trash2,
  ChevronDown,
  Search,
  Loader2,
  AlertTriangle,
  X,
  Book,
  ClipboardList,
} from "lucide-react";

// --- HELPER & UI COMPONENTS ---

const StatusBadge = ({ status }) => {
  const styles = useMemo(
    () => ({
      Active: "bg-green-500/20 text-green-300",
      "On Leave": "bg-yellow-500/20 text-yellow-300",
      Inactive: "bg-slate-600/20 text-slate-400",
    }),
    []
  );
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
        styles[status] || styles["Inactive"]
      }`}>
      {status}
    </span>
  );
};

// Custom Multi-select Dropdown Component
const MultiSelectDropdown = ({ options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
  };

  const handleRemove = (option) => {
    onChange(option); // Same function toggles it off
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-200">
        <div className="flex flex-wrap gap-1">
          {selected.length === 0 ? (
            <span className="text-slate">{placeholder}</span>
          ) : (
            selected.map((item) => (
              <span
                key={item}
                className="bg-brand-gold/20 text-brand-gold text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                {item}
                <X
                  size={12}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item);
                  }}
                />
              </span>
            ))
          )}
        </div>
        <ChevronDown
          size={18}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 rounded-lg border border-white/10 bg-dark-navy shadow-lg max-h-48 overflow-y-auto">
            {options.length > 0 ? (
              options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(option.name)}
                    onChange={() => handleSelect(option.name)}
                    className="form-checkbox h-4 w-4 bg-slate-700 border-slate-600 text-brand-gold focus:ring-brand-gold cursor-pointer"
                  />
                  <span className="text-light-slate">{option.name}</span>
                </label>
              ))
            ) : (
              <div className="p-3 text-sm text-slate text-center">
                No subjects available.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TeacherModal = ({
  isOpen,
  onClose,
  onSave,
  teacher,
  subjects,
  batches,
}) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    const initialData = {
      name: "",
      employeeId: "",
      contact: "",
      subjects: [],
      batches: [],
      status: "Active",
    };
    setFormData(teacher ? { ...initialData, ...teacher } : initialData);

    if (isOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [teacher, isOpen]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleArrayChange = (field, value) =>
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field]?.includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...(prev[field] || []), value],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({ ...formData, contact: `+91${formData.contact}` });
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
          className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-dark-navy/80 p-6 shadow-2xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}>
          <h2 className="text-xl font-bold text-brand-gold mb-6">
            {teacher ? "Edit Teacher Details" : "Add New Teacher"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate mb-2">
                  Full Name
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
                  htmlFor="employeeId"
                  className="block text-sm font-medium text-slate mb-2">
                  Employee ID
                </label>
                <input
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId || ""}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="contact"
                className="block text-sm font-medium text-slate mb-2">
                Contact Number
              </label>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-white/10 bg-slate-900/50 text-slate">
                  +91
                </span>
                <input
                  id="contact"
                  name="contact"
                  type="tel"
                  maxLength="10"
                  value={formData.contact?.replace("+91", "") || ""}
                  onChange={handleChange}
                  required
                  className="w-full rounded-r-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate mb-2">
                Subjects Taught
              </label>
              <MultiSelectDropdown
                options={subjects}
                selected={formData.subjects || []}
                onChange={(subjectName) =>
                  handleArrayChange("subjects", subjectName)
                }
                placeholder="Select Subjects"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate mb-2">
                Batches Assigned
              </label>
              <div className="p-3 rounded-lg border border-white/10 bg-slate-900/50 max-h-32 overflow-y-auto">
                {batches.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {batches.map((b) => (
                      <label
                        key={b.id}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.batches?.includes(b.name) || false}
                          onChange={() => handleArrayChange("batches", b.name)}
                          className="form-checkbox bg-slate-700 border-slate-600 text-brand-gold focus:ring-brand-gold"
                        />
                        <span className="text-light-slate">{b.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate text-center">
                    No batches available to assign.
                  </p>
                )}
              </div>
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
                value={formData.status || "Active"}
                onChange={handleChange}
                required
                className="w-full appearance-none cursor-pointer rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold">
                <option value="Active">Active</option>{" "}
                <option value="On Leave">On Leave</option>{" "}
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400 flex items-center gap-2 disabled:bg-slate-600">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {teacher ? "Save Changes" : "Add Teacher"}
              </button>
            </div>
          </form>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-white/10 p-1 rounded-full transition-all">
            <X size={20} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, teacherName }) => {
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
            Delete Teacher Record
          </h3>
          <p className="mt-2 text-sm text-slate">
            Are you sure you want to delete{" "}
            <span className="font-bold text-light-slate">"{teacherName}"</span>?
            This is permanent.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20 transition-colors">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="w-full px-4 py-2 text-sm font-bold rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors">
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
  icon: Icon = Users,
}) => (
  <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/10">
    <Icon className="mx-auto h-12 w-12 text-slate-500" />
    <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm text-slate">{message}</p>
    {onAction && buttonText && (
      <button
        onClick={onAction}
        className="mt-6 flex items-center mx-auto gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400">
        <PlusCircle size={18} />
        <span>{buttonText}</span>
      </button>
    )}
  </div>
);

// --- MAIN PAGE COMPONENT ---
export default function ManageTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]); // State for batches
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTeacher, setDeletingTeacher] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubTeachers = onSnapshot(
      query(collection(db, "teachers"), orderBy("name")),
      (snap) => {
        setTeachers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );
    const unsubSubjects = onSnapshot(
      query(collection(db, "subjects"), orderBy("name")),
      (snap) => {
        setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );
    // Fetch batches, even if the collection is empty. This prepares for the next step.
    const unsubBatches = onSnapshot(
      query(collection(db, "batches"), orderBy("name")),
      (snap) => {
        setBatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    return () => {
      unsubTeachers();
      unsubSubjects();
      unsubBatches();
    };
  }, []);

  const filteredTeachers = useMemo(
    () =>
      teachers
        .filter(
          (t) => subjectFilter === "all" || t.subjects?.includes(subjectFilter)
        )
        .filter(
          (t) =>
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [teachers, subjectFilter, searchTerm]
  );

  const handleSave = async (teacherData) => {
    try {
      if (editingTeacher) {
        const { id, ...dataToUpdate } = teacherData;
        await updateDoc(doc(db, "teachers", editingTeacher.id), dataToUpdate);
      } else {
        await addDoc(collection(db, "teachers"), {
          ...teacherData,
          createdAt: Timestamp.now(),
        });
      }
      setIsModalOpen(false);
      setEditingTeacher(null);
    } catch (error) {
      console.error("Error saving teacher:", error);
    }
  };

  const handleDelete = (teacher) => {
    setDeletingTeacher(teacher);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (deletingTeacher) {
      try {
        await deleteDoc(doc(db, "teachers", deletingTeacher.id));
        setIsDeleteModalOpen(false);
        setDeletingTeacher(null);
      } catch (error) {
        console.error("Error deleting teacher:", error);
      }
    }
  };
  const handleCreate = () => {
    setEditingTeacher(null);
    setIsModalOpen(true);
  };
  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setIsModalOpen(true);
  };

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
          <p className="ml-4 text-slate">Loading Teacher Data...</p>
        </div>
      );
    if (teachers.length === 0)
      return (
        <EmptyState
          onAction={handleCreate}
          title="No Teachers Found"
          message="Get started by adding the first teacher."
          buttonText="Add New Teacher"
        />
      );
    if (filteredTeachers.length === 0)
      return (
        <EmptyState
          title="No Results Found"
          message="Your search or filter did not match any teacher records."
          icon={Search}
        />
      );
    return (
      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase">
              <div className="col-span-3">Teacher</div>
              <div className="col-span-3">Subjects</div>
              <div className="col-span-2">Batches</div>
              <div className="col-span-2">Contact</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            <div className="divide-y divide-slate-700/50">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="grid grid-cols-12 gap-4 items-center p-4 text-sm hover:bg-slate-800/20 transition-colors">
                  <div className="col-span-3">
                    <p className="font-medium text-light-slate">
                      {teacher.name}
                    </p>
                    <p className="text-xs text-slate">{teacher.employeeId}</p>
                  </div>
                  <div className="col-span-3 flex flex-wrap gap-1">
                    {teacher.subjects?.length > 0 ? (
                      teacher.subjects.map((s) => (
                        <span
                          key={s}
                          className="text-xs bg-slate-700/50 px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">N/A</span>
                    )}
                  </div>
                  <div className="col-span-2 flex flex-wrap gap-1">
                    {teacher.batches?.length > 0 ? (
                      teacher.batches.map((b) => (
                        <span
                          key={b}
                          className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">
                          {b}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">N/A</span>
                    )}
                  </div>
                  <div className="col-span-2 text-slate">{teacher.contact}</div>
                  <div className="col-span-1">
                    <StatusBadge status={teacher.status} />
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <button
                      onClick={() => handleEdit(teacher)}
                      aria-label={`Edit ${teacher.name}`}
                      className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-white/10 transition-all">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(teacher)}
                      aria-label={`Delete ${teacher.name}`}
                      className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-white/10 transition-all">
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
      <TeacherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        teacher={editingTeacher}
        subjects={subjects}
        batches={batches}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        teacherName={deletingTeacher?.name}
      />
      <main>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-1">
              Manage Teachers
            </h1>
            <p className="text-base text-slate">
              Add, edit, and manage all faculty records.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 shrink-0">
            <PlusCircle size={18} />
            <span>Add New Teacher</span>
          </button>
        </div>
        <AnimatePresence>
          {teachers.length > 0 && (
            <motion.div
              className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 rounded-xl border border-white/10 bg-slate-900/20"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}>
              <div className="relative w-full sm:w-64">
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold cursor-pointer transition-all">
                  <option value="all">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative w-full sm:flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 p-3 rounded-lg border border-white/10 bg-slate-900/50 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all"
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
