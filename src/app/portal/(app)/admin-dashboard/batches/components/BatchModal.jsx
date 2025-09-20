"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, IndianRupee, Loader2, X } from "lucide-react";

// Helper component used only by the modal
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

// --- STATIC DATA ---
const classLevels = ["IV", "V", "VI", "VII", "VIII", "IX", "X"];
const statusOptions = ["Upcoming", "Active", "Full", "Completed"];

export default function BatchModal({
  isOpen,
  onClose,
  onSave,
  batch,
  teachers,
  subjects,
}) {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    const initialData = {
      name: "",
      classLevels: [],
      teacher: "",
      subjects: [],
      capacity: 12,
      status: "Upcoming",
      totalCourseFee: "",
    };
    setFormData(
      batch
        ? {
            ...initialData,
            ...batch,
            subjects: batch.subjects || [],
            classLevels: batch.classLevels || [],
          }
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
    await onSave({
      ...formData,
      capacity: Number(formData.capacity),
      totalCourseFee: Number(formData.totalCourseFee),
    });
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-700/50 pt-6">
              <div>
                <label
                  htmlFor="totalCourseFee"
                  className="block text-sm font-medium text-slate mb-2">
                  Total Course Fee (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="totalCourseFee"
                    name="totalCourseFee"
                    type="number"
                    placeholder="e.g. 26500"
                    value={formData.totalCourseFee || ""}
                    onChange={handleChange}
                    required
                    className={`${formInputClasses} pl-9`}
                  />
                </div>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate mb-2">
                  Class Levels
                </label>
                <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 grid grid-cols-2 max-h-40 overflow-y-auto">
                  {classLevels.map((c) => (
                    <CustomCheckbox
                      key={c}
                      id={`class-${c}`}
                      label={`Class ${c}`}
                      value={`Class ${c}`}
                      checked={(formData.classLevels || []).includes(
                        `Class ${c}`
                      )}
                      onChange={(e) =>
                        handleArrayChange(
                          "classLevels",
                          e.target.value,
                          e.target.checked
                        )
                      }
                    />
                  ))}
                </div>
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
}
