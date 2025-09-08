"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
  PlusCircle,
  Edit,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  Users,
  Sun,
  FileText,
  CalendarDays,
  Check,
  ChevronDown,
  Briefcase, // <-- ADD THIS ICON
} from "lucide-react";
import { format } from "date-fns";

// --- HELPER & UI COMPONENTS ---

const eventTypes = [
  { key: "Event", label: "General Event", Icon: CalendarDays },
  { key: "Test", label: "Test", Icon: FileText },
  { key: "ExtraClass", label: "Extra Class", Icon: Briefcase },
  { key: "ExtendedClass", label: "Extended Class", Icon: CalendarDays },
  { key: "PTM", label: "Parent-Teacher Meeting", Icon: Users },
  { key: "Holiday", label: "Holiday", Icon: Sun },
];

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

const EventModal = ({ isOpen, onClose, onSave, event, batches, subjects }) => {
  const [formData, setFormData] = useState({ batches: [] });
  const [isSaving, setIsSaving] = useState(false);
  const titleInputRef = useRef(null);

  useEffect(() => {
    const initialData = {
      title: "",
      type: "Event",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: "",
      description: "",
      batches: [],
      subject: "",
      totalMarks: 100,
    };
    if (event) {
      setFormData({
        ...initialData,
        ...event,
        startDate: format(event.startDate.toDate(), "yyyy-MM-dd"),
        endDate: event.endDate
          ? format(event.endDate.toDate(), "yyyy-MM-dd")
          : "",
      });
    } else {
      setFormData(initialData);
    }
    if (isOpen) setTimeout(() => titleInputRef.current?.focus(), 100);
  }, [event, isOpen]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleBatchChange = (isChecked, batchName) => {
    const currentBatches = formData.batches || [];
    if (batchName === "ALL") {
      setFormData({ ...formData, batches: [] });
    } else {
      const newBatches = isChecked
        ? [...currentBatches, batchName]
        : currentBatches.filter((b) => b !== batchName);
      setFormData({ ...formData, batches: newBatches.filter((b) => b) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const needsSubject = ["Test", "ExtraClass", "ExtendedClass"].includes(
      formData.type
    );
    if (needsSubject && !formData.subject) {
      alert("For a Test or Class event, you must select a subject.");
      return;
    }
    if (formData.type === "Test" && formData.batches.length === 0) {
      alert("For a 'Test' event, you must select at least one specific batch.");
      return;
    }
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
            {event ? "Edit Event" : "Create New Event"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate mb-2">
                Event Title
              </label>
              <input
                ref={titleInputRef}
                id="title"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                required
                className={formInputClasses}
                placeholder="e.g., Mid-Term Physics Test"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-slate mb-2">
                  Event Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type || "Event"}
                  onChange={handleChange}
                  required
                  className={formInputClasses}>
                  {eventTypes.map((et) => (
                    <option key={et.key} value={et.key}>
                      {et.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-slate mb-2">
                  Event Date / Start Date
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate || ""}
                  onChange={handleChange}
                  required
                  className={formInputClasses}
                />
              </div>
            </div>

            <AnimatePresence>
              {["Test", "ExtraClass", "ExtendedClass"].includes(
                formData.type
              ) && (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-700/50"
                  initial={{
                    opacity: 0,
                    height: 0,
                    marginTop: 0,
                    paddingTop: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    marginTop: "1.5rem",
                    paddingTop: "1.5rem",
                  }}
                  exit={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0 }}>
                  <div
                    className={`relative ${
                      formData.type === "Test"
                        ? "sm:col-span-2"
                        : "sm:col-span-3"
                    }`}>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-slate mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject || ""}
                      onChange={handleChange}
                      required={[
                        "Test",
                        "ExtraClass",
                        "ExtendedClass",
                      ].includes(formData.type)}
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
                  {formData.type === "Test" && (
                    <div>
                      <label
                        htmlFor="totalMarks"
                        className="block text-sm font-medium text-slate mb-2">
                        Total Marks
                      </label>
                      <input
                        id="totalMarks"
                        name="totalMarks"
                        type="number"
                        value={formData.totalMarks || ""}
                        onChange={handleChange}
                        placeholder="e.g., 100"
                        required={formData.type === "Test"}
                        className={formInputClasses}
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-slate mb-2">
                Target Batches
              </label>
              <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 grid grid-cols-2 sm:grid-cols-3 max-h-40 overflow-y-auto">
                <CustomCheckbox
                  id="batch-all"
                  label="All Batches"
                  value="ALL"
                  checked={(formData.batches || []).length === 0}
                  onChange={(e) => handleBatchChange(e.target.checked, "ALL")}
                />
                {batches.map((b) => (
                  <CustomCheckbox
                    key={b.id}
                    id={`batch-${b.id}`}
                    label={b.name}
                    value={b.name}
                    checked={(formData.batches || []).includes(b.name)}
                    onChange={(e) =>
                      handleBatchChange(e.target.checked, b.name)
                    }
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50 mt-6">
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
                {event ? "Save Changes" : "Create Event"}
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

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, eventTitle }) => {
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
          <h3 className="mt-4 text-lg font-bold text-white">Delete Event</h3>
          <p className="mt-2 text-sm text-slate">
            Are you sure you want to delete{" "}
            <span className="font-bold text-light-slate">"{eventTitle}"</span>?
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

// --- MAIN PAGE COMPONENT ---
export default function ManageEventsPage() {
  const [events, setEvents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);

  useEffect(() => {
    const unsubEvents = onSnapshot(
      query(collection(db, "events"), orderBy("startDate", "desc")),
      (snap) => {
        setEvents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }
    );
    const unsubBatches = onSnapshot(
      query(collection(db, "batches"), orderBy("name")),
      (snap) =>
        setBatches(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => d.id !== "--placeholder--")
        )
    );
    const unsubSubjects = onSnapshot(
      query(collection(db, "subjects"), orderBy("name")),
      (snap) =>
        setSubjects(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => d.id !== "--placeholder--")
        )
    );
    return () => {
      unsubEvents();
      unsubBatches();
      unsubSubjects();
    };
  }, []);

  const handleSave = async (formData) => {
    try {
      const isTestEvent = formData.type === "Test";
      const eventData = {
        title: formData.title,
        type: formData.type,
        startDate: Timestamp.fromDate(
          new Date(`${formData.startDate}T00:00:00`)
        ),
        endDate: formData.endDate
          ? Timestamp.fromDate(new Date(`${formData.endDate}T23:59:59`))
          : null,
        description: formData.description || "",
        batches: formData.batches || [],
        updatedAt: Timestamp.now(),
      };

      if (editingEvent) {
        await updateDoc(doc(db, "events", editingEvent.id), eventData);
      } else {
        const newEventRef = await addDoc(collection(db, "events"), {
          ...eventData,
          createdAt: Timestamp.now(),
        });

        if (isTestEvent) {
          for (const batchName of formData.batches) {
            const assessmentData = {
              title: `${formData.title} (${batchName})`,
              batch: batchName,
              subject: formData.subject,
              totalMarks: Number(formData.totalMarks),
              assessmentDate: eventData.startDate,
              eventId: newEventRef.id,
              createdAt: Timestamp.now(),
              isPublished: false,
            };
            await addDoc(collection(db, "assessments"), assessmentData);
          }
        }
      }
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Error saving event.");
    }
  };

  const handleDelete = (event) => {
    setDeletingEvent(event);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (deletingEvent) {
      await deleteDoc(doc(db, "events", deletingEvent.id));
      setIsDeleteModalOpen(false);
      setDeletingEvent(null);
    }
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };
  const handleEdit = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
        </div>
      );
    if (events.length === 0)
      return (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/10">
          <CalendarDays className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-xl font-semibold text-white">
            No Events Created
          </h3>
          <p className="mt-2 text-sm text-slate">
            Get started by adding the first event.
          </p>
          <button
            onClick={handleCreate}
            className="mt-6 flex items-center mx-auto gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400">
            <PlusCircle size={18} />
            <span>Add New Event</span>
          </button>
        </div>
      );

    return (
      <motion.div className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase tracking-wider">
              <div className="col-span-4">Event Title</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Date(s)</div>
              <div className="col-span-3">Target Batches</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            <div className="divide-y divide-slate-800">
              {events.map((event) => {
                const { Icon } =
                  eventTypes.find((et) => et.key === event.type) || {};
                return (
                  <div
                    key={event.id}
                    className="grid grid-cols-12 gap-4 items-center p-4 text-sm hover:bg-slate-800/20">
                    <div className="col-span-4 font-medium text-light-slate truncate">
                      {event.title}
                    </div>
                    <div className="col-span-2 flex items-center gap-2 text-slate-300">
                      {Icon && <Icon size={14} />}{" "}
                      {eventTypes.find((et) => et.key === event.type)?.label ||
                        "Event"}
                    </div>
                    <div className="col-span-2 text-slate-400">
                      {format(event.startDate.toDate(), "MMM dd, yyyy")}{" "}
                      {event.endDate &&
                        `- ${format(event.endDate.toDate(), "MMM dd, yyyy")}`}
                    </div>
                    <div className="col-span-3 text-slate-300">
                      {event.batches && event.batches.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {event.batches.map((b) => (
                            <span
                              key={b}
                              className="text-xs bg-slate-700/50 px-2 py-0.5 rounded">
                              {b}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-green-400">
                          All Batches
                        </span>
                      )}
                    </div>
                    <div className="col-span-1 flex justify-end gap-1">
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10">
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(event)}
                        className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-red-400/10">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
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
            Manage Events
          </h1>
          <p className="text-base text-slate">
            Create, edit, and manage all institute events.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Add New Event</span>
        </button>
      </div>
      {renderContent()}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        event={editingEvent}
        batches={batches}
        subjects={subjects}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        eventTitle={deletingEvent?.title}
      />
    </main>
  );
}
