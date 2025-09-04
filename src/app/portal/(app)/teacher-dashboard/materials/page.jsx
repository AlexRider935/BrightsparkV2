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
  FolderUp,
  PlusCircle,
  FileText,
  ChevronDown,
  Edit,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  Download,
} from "lucide-react";
import { format } from "date-fns";

const resourceCategories = [
  { key: "notes", label: "Notes" },
  { key: "worksheets", label: "Worksheets" },
  { key: "books", label: "Books (PDF)" },
  { key: "questionPapers", label: "Question Papers" },
];

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

  useEffect(() => {
    const initialData = {
      name: "",
      fileURL: "",
      batch: "",
      subject: "",
      category: "notes",
    };
    setFormData(material ? { ...material } : initialData);
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
          className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-dark-navy/80 p-6 shadow-2xl"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          exit={{ y: 20 }}>
          <h2 className="text-xl font-bold text-brand-gold mb-6">
            {material ? "Edit Material" : "Add New Material"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Display Name (e.g., Chapter 5 Algebra Notes)"
            />
            <input
              name="fileURL"
              type="url"
              value={formData.fileURL || ""}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Paste File URL (e.g., from Google Drive)"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                name="batch"
                value={formData.batch || ""}
                onChange={handleChange}
                required
                className="form-input">
                <option value="" disabled>
                  Select a Batch
                </option>
                {batches.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              <select
                name="subject"
                value={formData.subject || ""}
                onChange={handleChange}
                required
                className="form-input">
                <option value="" disabled>
                  Select a Subject
                </option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <select
              name="category"
              value={formData.category || "notes"}
              onChange={handleChange}
              required
              className="form-input">
              {resourceCategories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="relative w-full max-w-md p-6 text-center bg-dark-navy rounded-2xl border border-red-500/30"
        onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">Delete Material</h3>
        <p className="mt-2 text-sm text-slate">
          Are you sure you want to delete "{materialName}"?
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

// --- MAIN PAGE COMPONENT ---
export default function StudyMaterialPage() {
  const [materials, setMaterials] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [activeCategory, setActiveCategory] = useState("notes");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingMaterial, setDeletingMaterial] = useState(null);

  const teacherName = "Mr. A. K. Sharma"; // Placeholder

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
      }
    );
    const unsubBatches = onSnapshot(
      query(collection(db, "batches"), orderBy("name")),
      (snap) => setBatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubSubjects = onSnapshot(
      query(collection(db, "subjects"), orderBy("name")),
      (snap) => {
        setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );
    return () => {
      unsubMaterials();
      unsubBatches();
      unsubSubjects();
    };
  }, []);

  const subjectsInBatch = useMemo(() => {
    if (!selectedBatch) return [];
    const batch = batches.find((b) => b.id === selectedBatch);
    return batch?.subjects || [];
  }, [selectedBatch, batches]);

  const materialsToShow = useMemo(() => {
    if (!selectedBatch || !selectedSubject) return [];
    const selectedBatchName = batches.find((b) => b.id === selectedBatch)?.name;
    return materials
      .filter((m) => m.batch === selectedBatchName)
      .filter((m) => m.subject === selectedSubject)
      .filter((m) => m.category === activeCategory);
  }, [selectedBatch, selectedSubject, activeCategory, materials, batches]);

  const handleSave = async (formData) => {
    try {
      const dataToSave = { ...formData, uploadedBy: teacherName };
      if (editingMaterial) {
        await updateDoc(doc(db, "materials", editingMaterial.id), dataToSave);
      } else {
        await addDoc(collection(db, "materials"), {
          ...dataToSave,
          addedAt: Timestamp.now(),
        });
      }
    } catch (e) {
      console.error("Error saving material:", e);
    }
  };

  const handleDelete = (material) => {
    setDeletingMaterial(material);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (deletingMaterial) {
      try {
        await deleteDoc(doc(db, "materials", deletingMaterial.id));
        setIsDeleteModalOpen(false);
        setDeletingMaterial(null);
      } catch (e) {
        console.error("Error deleting material:", e);
      }
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

  return (
    <div>
      <style jsx global>{`
        .form-input {
          @apply w-full appearance-none cursor-pointer rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-200;
        }
      `}</style>
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

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-1">
            Study Material
          </h1>
          <p className="text-base text-slate">
            Manage and upload resources for your batches.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Add New Material</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 rounded-xl border border-white/10 bg-slate-900/20">
        <div className="relative w-full sm:w-72">
          <select
            value={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              setSelectedSubject("");
            }}
            className="w-full form-input">
            <option value="">Step 1: Select a Batch</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative w-full sm:w-72">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!selectedBatch}
            className="w-full form-input disabled:opacity-50">
            <option value="">Step 2: Select a Subject</option>
            {subjectsInBatch.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
        </div>
      ) : selectedBatch && selectedSubject ? (
        <motion.div
          key={`${selectedBatch}-${selectedSubject}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}>
          <div className="flex border-b border-slate-700/50 mb-4">
            {resourceCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat.key
                    ? "border-b-2 border-brand-gold text-brand-gold"
                    : "text-slate hover:text-white"
                }`}>
                {cat.label}
              </button>
            ))}
          </div>
          <motion.div
            key={activeCategory}
            className="rounded-2xl border border-white/10 bg-slate-900/20 p-4 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}>
            <div className="grid grid-cols-12 gap-4 p-3 text-xs font-semibold text-slate border-b border-slate-700/50">
              <div className="col-span-5">File Name</div>
              <div className="col-span-3">Subject</div>
              <div className="col-span-2">Date Added</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <div className="divide-y divide-slate-800/50 min-h-[100px]">
              {materialsToShow.length > 0 ? (
                materialsToShow.map((material) => (
                  <div
                    key={material.id}
                    className="grid grid-cols-12 gap-4 items-center p-3 text-sm">
                    <div className="col-span-5 flex items-center gap-3">
                      <FileText className="h-5 w-5 text-slate-400 shrink-0" />
                      <span className="font-medium text-light-slate truncate">
                        {material.name}
                      </span>
                    </div>
                    <div className="col-span-3 text-slate">
                      {material.subject}
                    </div>
                    <div className="col-span-2 text-slate">
                      {material.addedAt
                        ? format(material.addedAt.toDate(), "MMM dd, yyyy")
                        : "N/A"}
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                      <a
                        href={material.fileURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-white/5">
                        <Download size={16} />
                      </a>
                      <button
                        onClick={() => handleEdit(material)}
                        className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-white/5">
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(material)}
                        className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-white/5">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-8 text-center text-slate">
                  No materials found for this filter.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <div className="text-center py-12 rounded-2xl border border-dashed border-white/10">
          <FolderUp className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-xl font-semibold text-white">
            Select a Batch and Subject
          </h3>
          <p className="mt-1 text-slate">
            Choose from the dropdowns above to manage study materials.
          </p>
        </div>
      )}
    </div>
  );
}
