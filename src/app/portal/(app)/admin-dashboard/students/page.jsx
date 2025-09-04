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
} from "lucide-react";
import Link from "next/link";

// --- STATIC DATA ---
const statusOptions = ["Active", "On Hold", "Graduated", "Dropped Out"];

// --- HELPER & UI COMPONENTS ---

const StatusBadge = ({ status }) => {
  const styles = useMemo(
    () => ({
      Active: "bg-green-500/20 text-green-300",
      "On Hold": "bg-yellow-500/20 text-yellow-300",
      Graduated: "bg-sky-500/20 text-sky-400",
      "Dropped Out": "bg-slate-600/20 text-slate-400",
    }),
    []
  );
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
        styles[status] || styles["Dropped Out"]
      }`}>
      {status}
    </span>
  );
};

// NOTE: This modal is now ONLY for EDITING
const StudentEditModal = ({ isOpen, onClose, onSave, student, batches }) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    // Only populate form if a student is passed for editing
    if (student) {
      setFormData(student);
    }
    if (isOpen) setTimeout(() => nameInputRef.current?.focus(), 100);
  }, [student, isOpen]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    let dataToSave = { ...formData };
    // Convert date strings back to Timestamps if they were changed
    if (typeof dataToSave.dob === "string") {
      dataToSave.dob = Timestamp.fromDate(new Date(dataToSave.dob));
    }
    if (typeof dataToSave.admissionDate === "string") {
      dataToSave.admissionDate = Timestamp.fromDate(
        new Date(dataToSave.admissionDate)
      );
    }
    await onSave(dataToSave);
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
          className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-dark-navy/80 p-6 shadow-2xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}>
          <h2 className="text-xl font-bold text-brand-gold mb-6">
            Edit Student Details
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form fields are identical to the 'Add New' page, pre-filled with student data */}
            <fieldset className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate mb-2">
                  Student Full Name
                </label>
                <input
                  ref={nameInputRef}
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                  className="w-full form-input"
                />
              </div>
              <div>
                <label
                  htmlFor="rollNumber"
                  className="block text-sm font-medium text-slate mb-2">
                  Roll Number
                </label>
                <input
                  id="rollNumber"
                  name="rollNumber"
                  value={formData.rollNumber || ""}
                  onChange={handleChange}
                  required
                  className="w-full form-input"
                />
              </div>
              <div>
                <label
                  htmlFor="dob"
                  className="block text-sm font-medium text-slate mb-2">
                  Date of Birth
                </label>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  value={
                    formData.dob instanceof Timestamp
                      ? formData.dob.toDate().toISOString().split("T")[0]
                      : formData.dob || ""
                  }
                  onChange={handleChange}
                  required
                  className="w-full form-input"
                />
              </div>
            </fieldset>

            <fieldset className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-slate mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender || ""}
                  onChange={handleChange}
                  required
                  className="w-full form-input">
                  <option value="" disabled>
                    Select...
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="admissionDate"
                  className="block text-sm font-medium text-slate mb-2">
                  Admission Date
                </label>
                <input
                  id="admissionDate"
                  name="admissionDate"
                  type="date"
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
                  className="w-full form-input"
                />
              </div>
              <div>
                <label
                  htmlFor="batch"
                  className="block text-sm font-medium text-slate mb-2">
                  Assign to Batch
                </label>
                <select
                  id="batch"
                  name="batch"
                  value={formData.batch || ""}
                  onChange={handleChange}
                  required
                  className="w-full form-input">
                  <option value="" disabled>
                    Select Batch
                  </option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} ({b.classLevel})
                    </option>
                  ))}
                </select>
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
                  className="w-full form-input">
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>

            <fieldset className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="parentName"
                  className="block text-sm font-medium text-slate mb-2">
                  Parent's Name
                </label>
                <input
                  id="parentName"
                  name="parentName"
                  value={formData.parentName || ""}
                  onChange={handleChange}
                  required
                  className="w-full form-input"
                />
              </div>
              <div>
                <label
                  htmlFor="parentContact"
                  className="block text-sm font-medium text-slate mb-2">
                  Parent's Contact
                </label>
                <div className="flex items-center">
                  <span className="form-prefix">+91</span>
                  <input
                    id="parentContact"
                    name="parentContact"
                    type="tel"
                    maxLength="10"
                    value={formData.parentContact || ""}
                    onChange={handleChange}
                    required
                    className="w-full form-input rounded-l-none"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="emergencyContact"
                  className="block text-sm font-medium text-slate mb-2">
                  Emergency Contact
                </label>
                <div className="flex items-center">
                  <span className="form-prefix">+91</span>
                  <input
                    id="emergencyContact"
                    name="emergencyContact"
                    type="tel"
                    maxLength="10"
                    value={formData.emergencyContact || ""}
                    onChange={handleChange}
                    className="w-full form-input rounded-l-none"
                  />
                </div>
              </div>
            </fieldset>

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
                Save Changes
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
  <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/10">
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

// --- MAIN PAGE COMPONENT ---
export default function ManageStudentsPage() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
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
      (snap) => {
        setBatches(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
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
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [students, batchFilter, statusFilter, searchTerm]
  );

  const handleUpdate = async (studentData) => {
    try {
      if (editingStudent) {
        const { id, ...dataToUpdate } = studentData;
        await updateDoc(doc(db, "students", editingStudent.id), dataToUpdate);
      }
      setIsEditModalOpen(false);
      setEditingStudent(null);
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const handleDelete = (student) => {
    setDeletingStudent(student);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (deletingStudent) {
      try {
        await deleteDoc(doc(db, "students", deletingStudent.id));
        setIsDeleteModalOpen(false);
        setDeletingStudent(null);
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setIsEditModalOpen(true);
  };

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex justify-center items-center py-20">
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
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase">
              <div className="col-span-3">Student</div>
              <div className="col-span-3">Batch</div>
              <div className="col-span-2">Admission Date</div>
              <div className="col-span-2">Parent Contact</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            <div className="divide-y divide-slate-700/50">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="grid grid-cols-12 gap-4 items-center p-4 text-sm hover:bg-slate-800/20 transition-colors">
                  <div className="col-span-3">
                    <p className="font-medium text-light-slate">
                      {student.name}
                    </p>
                    <p className="text-xs text-slate">
                      Roll No: {student.rollNumber}
                    </p>
                  </div>
                  <div className="col-span-3 text-slate">{student.batch}</div>
                  <div className="col-span-2 text-slate">
                    {student.admissionDate instanceof Timestamp
                      ? student.admissionDate.toDate().toLocaleDateString()
                      : student.admissionDate}
                  </div>
                  <div className="col-span-2 text-slate">
                    {student.parentContact}
                  </div>
                  <div className="col-span-1">
                    <StatusBadge status={student.status} />
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <button
                      onClick={() => handleEdit(student)}
                      className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-white/10">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(student)}
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
      <style jsx global>{`
        .form-input {
          @apply w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-200;
        }
        .form-input[type="date"] {
          @apply pr-2;
        }
        .form-prefix {
          @apply inline-flex items-center px-3 rounded-l-lg border border-r-0 border-white/10 bg-slate-900/50 text-slate;
        }
      `}</style>
      <StudentEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdate}
        student={editingStudent}
        batches={batches}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        studentName={deletingStudent?.name}
      />
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
                  className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 pr-8 text-light-slate focus:border-brand-gold cursor-pointer">
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
                  onChange={(e) => setStatusFilter(e.geo.jsonvalue)}
                  className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 pr-8 text-light-slate focus:border-brand-gold cursor-pointer">
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
                  className="w-full pl-10 p-3 rounded-lg border border-white/10 bg-slate-900/50 text-light-slate focus:border-brand-gold"
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
