"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/firebase/config";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  getDocs,
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
  GraduationCap,
  Check,
  ClipboardUser,
  Shield,
  BookMarked,
  Settings2,
  Home,
} from "lucide-react";
import Link from "next/link";
import ImageUploader from "../../components/ImageUploader";

// --- STATIC DATA ---
const statusOptions = ["Active", "On Hold", "Graduated", "Dropped Out"];
const editTabs = ["Profile", "Academic", "Contact", "Admin"];

// --- HELPER & UI COMPONENTS ---

const StatusBadge = ({ status }) => {
  const styles = useMemo(
    () => ({
      Active: "bg-green-500/10 text-green-400 border-green-500/20",
      "On Hold": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      Graduated: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      "Dropped Out": "bg-slate-600/10 text-slate-400 border-slate-500/20",
    }),
    []
  );
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
        styles[status] || styles["Dropped Out"]
      }`}>
      {" "}
      {status}{" "}
    </span>
  );
};

const UserAvatar = ({ name, imageUrl, size = "md" }) => {
  const sizeClasses = { sm: "w-10 h-10", md: "w-12 h-12" };
  const fontClasses = { sm: "text-sm", md: "text-lg" };

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name || "Student"}
        className={`rounded-full object-cover shrink-0 ${sizeClasses[size]}`}
      />
    );
  }

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

const StudentEditModal = ({
  isOpen,
  onClose,
  onSave,
  student,
  batches,
  subjects,
}) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("Profile");

  // --- ADD THIS NEW FUNCTION ---
  const handleBatchChange = (e) => {
    const batchName = e.target.value;
    const selectedBatch = batches.find((b) => b.name === batchName);
    setFormData((prev) => ({
      ...prev,
      batch: batchName,
      classLevel: selectedBatch ? selectedBatch.classLevel : "", // Also update the classLevel
    }));
  };

  useEffect(() => {
    if (student) {
      setFormData({ ...student, subjects: student.subjects || [] });
      setActiveTab("Profile");
    }
  }, [student, isOpen]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubjectChange = (subjectName, isChecked) => {
    setFormData((prev) => ({
      ...prev,
      subjects: isChecked
        ? [...prev.subjects, subjectName]
        : prev.subjects.filter((s) => s !== subjectName),
    }));
  };
  const handleUploadComplete = (url) => {
    setFormData((prev) => ({ ...prev, photoURL: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    let dataToSave = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
    };
    if (typeof dataToSave.dob === "string" && dataToSave.dob)
      dataToSave.dob = Timestamp.fromDate(new Date(dataToSave.dob));
    if (
      typeof dataToSave.admissionDate === "string" &&
      dataToSave.admissionDate
    )
      dataToSave.admissionDate = Timestamp.fromDate(
        new Date(dataToSave.admissionDate)
      );
    await onSave(dataToSave);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;
  const formInputClasses =
    "w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-light-slate placeholder:text-slate-500 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-200";

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
          className="relative w-full max-w-5xl h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-dark-navy shadow-2xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}>
          <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-4">
              <UserAvatar name={formData.name} imageUrl={formData.photoURL} />{" "}
              <div>
                <h2 className="text-xl font-bold text-brand-gold">
                  Edit Student Profile
                </h2>
                <p className="text-slate-400">{formData.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-grow overflow-hidden">
            <div className="w-1/4 border-r border-slate-800 p-4 space-y-1 shrink-0">
              {editTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-brand-gold/10 text-brand-gold"
                      : "text-slate-300 hover:bg-white/5"
                  }`}>
                  {tab}
                </button>
              ))}
            </div>
            <form
              onSubmit={handleSubmit}
              className="w-3/4 flex flex-col overflow-hidden">
              <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                {activeTab === "Profile" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-8 items-start">
                    <div className="space-y-5 flex-grow">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-slate mb-2">
                            First Name
                          </label>
                          <input
                            name="firstName"
                            value={formData.firstName || ""}
                            onChange={handleChange}
                            required
                            className={formInputClasses}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate mb-2">
                            Last Name
                          </label>
                          <input
                            name="lastName"
                            value={formData.lastName || ""}
                            onChange={handleChange}
                            required
                            className={formInputClasses}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate mb-2">
                            Admission / Roll No.
                          </label>
                          <input
                            name="rollNumber"
                            value={formData.rollNumber || ""}
                            onChange={handleChange}
                            required
                            className={formInputClasses}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate mb-2">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            name="dob"
                            value={
                              formData.dob instanceof Timestamp
                                ? formData.dob
                                    .toDate()
                                    .toISOString()
                                    .split("T")[0]
                                : formData.dob || ""
                            }
                            onChange={handleChange}
                            required
                            className={`${formInputClasses} pr-2`}
                          />
                        </div>
                        <div className="relative sm:col-span-2">
                          <label className="block text-sm font-medium text-slate mb-2">
                            Gender
                          </label>
                          <select
                            name="gender"
                            value={formData.gender || ""}
                            onChange={handleChange}
                            required
                            className={`${formInputClasses} appearance-none pr-8`}>
                            <option value="" disabled>
                              Select...
                            </option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <label className="block text-sm font-medium text-slate mb-2 text-center">
                        Student Photo
                      </label>
                      <ImageUploader
                        onUploadComplete={handleUploadComplete}
                        initialImageUrl={formData.photoURL}
                      />
                    </div>
                  </motion.div>
                )}
                {activeTab === "Academic" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="relative">
                        <label className="block text-sm font-medium text-slate mb-2">
                          Batch
                        </label>
                        <select
                          name="batch"
                          value={formData.batch || ""}
                          onChange={handleBatchChange} // <-- USE THE NEW HANDLER
                          required
                          className={`${formInputClasses} appearance-none pr-8`}>
                          <option value="" disabled>
                            Select Batch
                          </option>
                          {batches.map((b) => (
                            <option key={b.id} value={b.name}>
                              {b.name} ({b.classLevel})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate mb-2">
                          Admission Date
                        </label>
                        <input
                          type="date"
                          name="admissionDate"
                          value={
                            formData.admissionDate instanceof Timestamp
                              ? formData.admissionDate
                                  .toDate()
                                  .toISOString()
                                  .split("T")[0]
                              : formData.admissionDate || ""
                          }
                          onChange={handleChange}
                          required
                          className={`${formInputClasses} pr-2`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate mb-2">
                          Present School Name
                        </label>
                        <input
                          name="presentSchool"
                          value={formData.presentSchool || ""}
                          onChange={handleChange}
                          className={formInputClasses}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">
                        Subjects Opted
                      </label>
                      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 grid grid-cols-2 sm:grid-cols-3 max-h-48 overflow-y-auto">
                        {subjects.map((sub) => (
                          <CustomCheckbox
                            key={sub.id}
                            id={`edit-${sub.id}`}
                            label={sub.name}
                            value={sub.name}
                            checked={(formData.subjects || []).includes(
                              sub.name
                            )}
                            onChange={(e) =>
                              handleSubjectChange(
                                e.target.value,
                                e.target.checked
                              )
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeTab === "Contact" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">
                        Father’s Name
                      </label>
                      <input
                        name="fatherName"
                        value={formData.fatherName || ""}
                        onChange={handleChange}
                        className={formInputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">
                        Father’s Contact
                      </label>
                      <input
                        name="fatherContact"
                        maxLength="10"
                        value={formData.fatherContact || ""}
                        onChange={handleChange}
                        className={formInputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">
                        Mother’s Name
                      </label>
                      <input
                        name="motherName"
                        value={formData.motherName || ""}
                        onChange={handleChange}
                        className={formInputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">
                        Mother’s Contact
                      </label>
                      <input
                        name="motherContact"
                        maxLength="10"
                        value={formData.motherContact || ""}
                        onChange={handleChange}
                        className={formInputClasses}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate mb-2">
                        Parent Email
                      </label>
                      <input
                        type="email"
                        name="parentEmail"
                        value={formData.parentEmail || ""}
                        onChange={handleChange}
                        className={formInputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">
                        WhatsApp Number
                      </label>
                      <input
                        name="whatsappNumber"
                        maxLength="10"
                        value={formData.whatsappNumber || ""}
                        onChange={handleChange}
                        className={formInputClasses}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate mb-2">
                        Street / Area
                      </label>
                      <input
                        name="addressStreet"
                        value={formData.addressStreet || ""}
                        onChange={handleChange}
                        className={formInputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">
                        State
                      </label>
                      <input
                        name="addressState"
                        value={formData.addressState || ""}
                        onChange={handleChange}
                        className={formInputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">
                        Pincode
                      </label>
                      <input
                        name="addressPincode"
                        value={formData.addressPincode || ""}
                        onChange={handleChange}
                        className={formInputClasses}
                      />
                    </div>
                  </motion.div>
                )}
                {activeTab === "Admin" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-5">
                    <div className="relative">
                      <label className="block text-sm font-medium text-slate mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status || ""}
                        onChange={handleChange}
                        required
                        className={`${formInputClasses} appearance-none pr-8`}>
                        <option value="" disabled>
                          Select Status
                        </option>
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">
                        Special Request
                      </label>
                      <textarea
                        name="specialRequest"
                        value={formData.specialRequest || ""}
                        onChange={handleChange}
                        rows="4"
                        className={formInputClasses}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">
                        Internal Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes || ""}
                        onChange={handleChange}
                        rows="4"
                        className={formInputClasses}
                      />
                    </div>
                  </motion.div>
                )}
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-slate-800 bg-dark-navy/70 shrink-0">
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">
            Delete Student Record
          </h3>
          <p className="mt-2 text-sm text-slate">
            Are you sure you want to delete{" "}
            <span className="font-bold text-light-slate">"{studentName}"</span>?
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
  buttonLink,
  icon: Icon = Users,
}) => (
  <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/10 col-span-full">
    <Icon className="mx-auto h-12 w-12 text-slate-500" />
    <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm text-slate">{message}</p>
    {onAction && buttonLink && buttonText && (
      <Link
        href={buttonLink}
        className="mt-6 inline-flex items-center mx-auto gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400">
        <PlusCircle size={18} />
        <span>{buttonText}</span>
      </Link>
    )}
  </div>
);

export default function ManageStudentsPage() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchFilter, setBatchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubStudents = onSnapshot(
      query(collection(db, "students"), orderBy("name")),
      (snap) => {
        setStudents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }
    );
    const unsubBatches = onSnapshot(
      query(collection(db, "batches"), orderBy("name")),
      (snap) => setBatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    getDocs(collection(db, "subjects")).then((snap) =>
      setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => {
      unsubStudents();
      unsubBatches();
    };
  }, []);

  const filteredStudents = useMemo(
    () =>
      students
        .filter((s) => batchFilter === "all" || s.batch === batchFilter)
        .filter((s) => statusFilter === "all" || s.status === statusFilter)
        .filter(
          (s) =>
            (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.rollNumber || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        ),
    [students, batchFilter, statusFilter, searchTerm]
  );

  const handleUpdate = async (studentData) => {
    try {
      if (editingStudent)
        await updateDoc(doc(db, "students", editingStudent.id), studentData);
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };
  const handleDelete = (student) => {
    setDeletingStudent(student);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!deletingStudent) return;

    try {
      const response = await fetch("/api/delete-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: deletingStudent.id }), // sending the student's ID (which is the UID)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete student.");
      }

      // The onSnapshot listener will automatically update the UI list
    } catch (error) {
      console.error("Error deleting student:", error);
      // Optionally, show an error message to the user here
    } finally {
      // Close the modal and reset the state regardless of success or failure
      setIsDeleteModalOpen(false);
      setDeletingStudent(null);
    }
  };
  const handleEdit = (student) => {
    setEditingStudent(student);
    setIsEditModalOpen(true);
  };

  const renderContent = () => {
    if (loading)
      return (
        <div className="col-span-full flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
          <p className="ml-4 text-slate">Loading Students...</p>
        </div>
      );
    if (students.length === 0 && !loading)
      return (
        <EmptyState
          onAction={true}
          buttonLink="/portal/admin-dashboard/students/new"
          title="No Students Found"
          message="Get started by enrolling the first student."
          buttonText="Add New Student"
        />
      );
    if (filteredStudents.length === 0)
      return (
        <EmptyState
          title="No Results Found"
          message="Your search or filter criteria did not match any student records."
          icon={Search}
        />
      );
    return (
      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg overflow-hidden col-span-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase tracking-wider">
              <div className="col-span-4">Student</div>
              <div className="col-span-3">Batch & Class</div>
              <div className="col-span-3">Parent Contact</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            <div className="divide-y divide-slate-800">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="grid grid-cols-12 gap-4 items-center p-4 text-sm hover:bg-slate-800/20 transition-colors">
                  <div className="col-span-4 flex items-center gap-4">
                    <UserAvatar
                      name={student.name}
                      imageUrl={student.photoURL}
                      size="sm"
                    />{" "}
                    <div>
                      <p className="font-medium text-light-slate">
                        {student.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        Roll No: {student.rollNumber}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-slate-300">{student.batch}</p>
                    <p className="text-xs text-slate-400">
                      {student.classLevel}
                    </p>
                  </div>
                  <div className="col-span-3 text-slate-300">
                    {student.fatherContact || student.parentContact}
                  </div>
                  <div className="col-span-1">
                    <StatusBadge status={student.status} />
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <button
                      onClick={() => handleEdit(student)}
                      className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(student)}
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
            Manage Students
          </h1>
          <p className="text-base text-slate">
            View, edit, and manage all student records.
          </p>
        </div>
        <Link
          href="/portal/admin-dashboard/students/new"
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Add New Student</span>
        </Link>
      </div>
      <AnimatePresence>
        {students.length > 0 && (
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 rounded-xl border border-white/10 bg-slate-900/20"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}>
            <div className="relative w-full sm:w-52">
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
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
            <div className="relative w-full sm:w-52">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-900 p-3 pr-8 text-light-slate focus:border-brand-gold cursor-pointer">
                <option value="all">All Statuses</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative w-full sm:flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 p-3 rounded-lg border border-slate-700 bg-slate-900 text-light-slate focus:border-brand-gold"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {renderContent()}
      <StudentEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdate}
        student={editingStudent}
        batches={batches}
        subjects={subjects}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        studentName={deletingStudent?.name}
      />
    </main>
  );
}
