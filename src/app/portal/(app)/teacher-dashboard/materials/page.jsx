"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext"; // For getting the logged-in teacher's name
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
  FolderUp,
  PlusCircle,
  Edit,
  Trash2,
  X,
  ChevronDown,
  Search,
  Loader2,
  AlertTriangle,
  Link as LinkIcon,
  NotebookText,
  ClipboardCheck,
  FileQuestion,
  FileText,
  Book,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const resourceCategories = [
  "Notes",
  "Worksheet",
  "Assignment",
  "Book (PDF)",
  "Question Paper",
  "Other",
];

// --- HELPER & UI COMPONENTS (Identical to Admin Page) ---

const CategoryIcon = ({ category, className = "h-8 w-8" }) => {
  const iconMap = {
    Notes: <NotebookText className={className} />,
    Worksheet: <ClipboardCheck className={className} />,
    Assignment: <ClipboardCheck className={className} />,
    "Book (PDF)": <Book className={className} />,
    "Question Paper": <FileQuestion className={className} />,
    Other: <FileText className={className} />,
  };
  return iconMap[category] || <FileText className={className} />;
};

const MaterialModal = ({
  isOpen,
  onClose,
  onSave,
  material,
  batches,
  subjects,
}) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    const initialData = {
      name: "",
      fileURL: "",
      batch: "",
      subject: "",
      category: "Notes",
    };
    setFormData(material ? { ...material } : initialData);
    if (isOpen) setTimeout(() => nameInputRef.current?.focus(), 100);
  }, [material, isOpen]);

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
            {material ? "Edit Material" : "Add New Material Link"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate mb-2">
                Display Name
              </label>
              <input
                ref={nameInputRef}
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                required
                className={formInputClasses}
                placeholder="e.g., Chapter 5 Algebra Notes"
              />
            </div>
            <div>
              <label
                htmlFor="fileURL"
                className="block text-sm font-medium text-slate mb-2">
                File URL
              </label>
              <input
                id="fileURL"
                name="fileURL"
                type="url"
                value={formData.fileURL || ""}
                onChange={handleChange}
                required
                className={formInputClasses}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-slate-700/50 pt-6">
              <div className="relative">
                <label
                  htmlFor="batch"
                  className="block text-sm font-medium text-slate mb-2">
                  For Batch
                </label>
                <select
                  id="batch"
                  name="batch"
                  value={formData.batch || ""}
                  onChange={handleChange}
                  required
                  className={`${formInputClasses} appearance-none pr-8`}>
                  <option value="" disabled>
                    Select Batch...
                  </option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-slate mb-2">
                  For Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject || ""}
                  onChange={handleChange}
                  required
                  className={`${formInputClasses} appearance-none pr-8`}>
                  <option value="" disabled>
                    Select Subject...
                  </option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-slate mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                  required
                  className={`${formInputClasses} appearance-none pr-8`}>
                  {resourceCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
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
                {material ? "Save Changes" : "Add Material"}
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

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, materialName }) => {
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
          <h3 className="mt-4 text-lg font-bold text-white">Delete Material</h3>
          <p className="mt-2 text-sm text-slate">
            Are you sure you want to delete{" "}
            <span className="font-bold text-light-slate">"{materialName}"</span>
            ? This action is permanent.
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
  icon: Icon = FolderUp,
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

export default function ManageTeacherMaterialsPage() {
  const { user } = useAuth(); // Get the logged-in teacher
  const [materials, setMaterials] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ batch: "all", subject: "all" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingMaterial, setDeletingMaterial] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubMaterials = onSnapshot(
      query(collection(db, "materials"), orderBy("addedAt", "desc")),
      (snap) => {
        setMaterials(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => d.id !== "--placeholder--")
        );
        setLoading(false);
      }
    );
    const unsubBatches = onSnapshot(
      query(collection(db, "batches"), orderBy("name")),
      (snap) => setBatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubSubjects = onSnapshot(
      query(collection(db, "subjects"), orderBy("name")),
      (snap) => setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubMaterials();
      unsubBatches();
      unsubSubjects();
    };
  }, []);

  const filteredMaterials = useMemo(
    () =>
      materials
        .filter((m) => filters.batch === "all" || m.batch === filters.batch)
        .filter(
          (m) => filters.subject === "all" || m.subject === filters.subject
        )
        .filter((m) =>
          (m.name || "").toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [materials, filters, searchTerm]
  );

  const handleSave = async (formData) => {
    try {
      const teacherName = user?.profile?.name || "Unknown Teacher"; // Get teacher's name from context
      const dataToSave = {
        ...formData,
        updatedAt: Timestamp.now(),
        uploadedBy: teacherName, // Automatically add teacher's name
      };
      if (editingMaterial) {
        await updateDoc(doc(db, "materials", editingMaterial.id), dataToSave);
      } else {
        await addDoc(collection(db, "materials"), {
          ...dataToSave,
          addedAt: Timestamp.now(),
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving material:", error);
    }
  };

  const handleDelete = (material) => {
    setDeletingMaterial(material);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (deletingMaterial) {
      await deleteDoc(doc(db, "materials", deletingMaterial.id));
      setIsDeleteModalOpen(false);
      setDeletingMaterial(null);
    }
  };
  const handleCreate = () => {
    setEditingMaterial(null);
    setIsModalOpen(true);
  };
  const handleEdit = (material) => {
    setEditingMaterial(material);
    setIsModalOpen(true);
  };
  const handleFilterChange = (name, value) =>
    setFilters((prev) => ({ ...prev, [name]: value }));

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
        </div>
      );
    if (materials.length === 0 && !loading)
      return (
        <EmptyState
          onAction={handleCreate}
          title="No Materials Added"
          message="Get started by adding the first study material link."
          buttonText="Add Material Link"
        />
      );
    if (filteredMaterials.length === 0)
      return (
        <EmptyState
          title="No Results Found"
          message="Your search or filters did not match any records."
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
              <div className="col-span-5">Name & Category</div>
              <div className="col-span-2">Batch</div>
              <div className="col-span-2">Subject</div>
              <div className="col-span-2">Added</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            <div className="divide-y divide-slate-800">
              {filteredMaterials.map((material) => (
                <div
                  key={material.id}
                  className="grid grid-cols-12 gap-4 items-center p-4 text-sm hover:bg-slate-800/20">
                  <div className="col-span-5 flex items-center gap-4">
                    <div className="p-2 bg-slate-700/50 rounded-lg text-brand-gold">
                      <CategoryIcon
                        category={material.category}
                        className="h-6 w-6"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-light-slate truncate">
                        {material.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {material.category}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs bg-slate-700/50 px-2 py-0.5 rounded">
                      {material.batch}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs bg-slate-700/50 px-2 py-0.5 rounded">
                      {material.subject}
                    </span>
                  </div>
                  <div className="col-span-2 text-slate-400">
                    {material.addedAt
                      ? formatDistanceToNow(material.addedAt.toDate(), {
                          addSuffix: true,
                        })
                      : "N/A"}
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <a
                      href={material.fileURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10">
                      <LinkIcon size={16} />
                    </a>
                    <button
                      onClick={() => handleEdit(material)}
                      className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(material)}
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
            Study Materials
          </h1>
          <p className="text-base text-slate">
            Manage all educational resource links.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Add Material Link</span>
        </button>
      </div>
      <AnimatePresence>
        {materials.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}>
            <div className="relative">
              <select
                onChange={(e) => handleFilterChange("batch", e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-900 p-3 pr-8 text-light-slate focus:border-brand-gold cursor-pointer">
                <option value="all">All Batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                onChange={(e) => handleFilterChange("subject", e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-900 p-3 pr-8 text-light-slate focus:border-brand-gold cursor-pointer">
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 p-3 rounded-lg border border-slate-700 bg-slate-900 text-light-slate focus:border-brand-gold"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {renderContent()}
      <MaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        material={editingMaterial}
        batches={batches}
        subjects={subjects}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        materialName={deletingMaterial?.name}
      />
    </main>
  );
}
