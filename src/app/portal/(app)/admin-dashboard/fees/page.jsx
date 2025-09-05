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
  IndianRupee,
  PlusCircle,
  Clock,
  AlertTriangle,
  Search,
  ChevronDown,
  X,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";

const statusFilters = ["All", "Paid", "Due", "Overdue"];
const paymentMethods = ["Cash", "UPI", "Card", "Bank Transfer"];

// --- Reusable Components ---
const StatCard = ({ title, value, Icon }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
    <div className="flex items-center gap-3 mb-2">
      <Icon className="h-5 w-5 text-slate-400" />
      <h3 className="text-md font-medium text-slate">{title}</h3>
    </div>
    <p className="text-3xl font-bold text-light-slate">{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = useMemo(
    () => ({
      Paid: "bg-green-500/10 text-green-400 border-green-500/20",
      Due: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      Overdue: "bg-red-500/10 text-red-400 border-red-500/20",
    }),
    []
  );
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>
      {status}
    </span>
  );
};

const UserAvatar = ({ name, imageUrl, size = "sm" }) => {
  const sizeClasses = { sm: "w-10 h-10", md: "w-12 h-12" };
  const fontClasses = { sm: "text-sm", md: "text-lg" };
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

const EmptyState = ({
  onAction,
  title,
  message,
  buttonText,
  icon: Icon = IndianRupee,
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

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  transactionDescription,
}) => {
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
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">
            Delete Transaction
          </h3>
          <p className="mt-2 text-sm text-slate">
            Are you sure you want to delete the transaction{" "}
            <span className="font-bold text-light-slate">
              "{transactionDescription}"
            </span>
            ?
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

const FeeModal = ({
  isOpen,
  onClose,
  onSave,
  students,
  batches,
  transaction,
}) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("");
  const studentSelectRef = useRef(null);

  const studentsInBatch = useMemo(() => {
    if (!selectedBatch) return [];
    return students.filter((s) => s.batch === selectedBatch);
  }, [selectedBatch, students]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const initialData = {
      studentId: "",
      description: "",
      amount: "",
      dueDate: today,
      status: "Due",
      paymentDate: null,
      paymentMethod: "",
    };

    let dataToSet = transaction ? { ...transaction } : initialData;

    // Pre-fill dates for the input fields
    if (dataToSet.dueDate instanceof Timestamp)
      dataToSet.dueDate = dataToSet.dueDate
        .toDate()
        .toISOString()
        .split("T")[0];
    if (dataToSet.paymentDate instanceof Timestamp)
      dataToSet.paymentDate = dataToSet.paymentDate
        .toDate()
        .toISOString()
        .split("T")[0];

    setFormData(dataToSet);

    // If editing, pre-select the student's batch
    if (transaction) {
      const studentForTransaction = students.find(
        (s) => s.id === transaction.studentId
      );
      if (studentForTransaction) {
        setSelectedBatch(studentForTransaction.batch);
      }
    } else {
      // If creating new, reset batch selection
      setSelectedBatch("");
    }

    if (isOpen) setTimeout(() => studentSelectRef.current?.focus(), 100);
  }, [isOpen, transaction, students]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleBatchChange = (e) => {
    setSelectedBatch(e.target.value);
    // Reset student selection when batch changes
    setFormData((prev) => ({ ...prev, studentId: "" }));
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
    "w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-light-slate placeholder:text-slate-500 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-200";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-dark-navy/90 p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-bold text-brand-gold mb-6">
            {transaction ? "Edit Fee Record" : "Generate New Fee"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* --- NEW: BATCH DROPDOWN --- */}
              <div className="relative">
                <label
                  htmlFor="batch-select"
                  className="block text-sm font-medium text-slate mb-2">
                  Batch
                </label>
                <select
                  ref={studentSelectRef}
                  id="batch-select"
                  value={selectedBatch}
                  onChange={handleBatchChange}
                  required
                  className={`${formInputClasses} appearance-none pr-8`}
                  disabled={!!transaction}>
                  <option value="" disabled>
                    Select a batch
                  </option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
              {/* --- UPDATED: STUDENT DROPDOWN --- */}
              <div className="relative">
                <label
                  htmlFor="studentId"
                  className="block text-sm font-medium text-slate mb-2">
                  Student
                </label>
                <select
                  id="studentId"
                  name="studentId"
                  value={formData.studentId || ""}
                  onChange={handleChange}
                  required
                  className={`${formInputClasses} appearance-none pr-8`}
                  disabled={!selectedBatch || !!transaction}>
                  <option value="" disabled>
                    {selectedBatch ? "Select a student" : "Select batch first"}
                  </option>
                  {studentsInBatch.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNumber})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate mb-2">
                Description
              </label>
              <input
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                required
                className={formInputClasses}
                placeholder="e.g., Monthly Fee - September"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-slate mb-2">
                  Amount
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  value={formData.amount || ""}
                  onChange={handleChange}
                  required
                  className={formInputClasses}
                  placeholder="e.g. 5000"
                />
              </div>
              <div>
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-slate mb-2">
                  Due Date
                </label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate || ""}
                  onChange={handleChange}
                  required
                  className={`${formInputClasses} pr-2`}
                />
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
                value={formData.status || "Due"}
                onChange={handleChange}
                className={`${formInputClasses} appearance-none pr-8`}>
                <option value="Due">Due</option>
                <option value="Paid">Paid</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>

            {formData.status === "Paid" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="grid grid-cols-2 gap-4 border-t border-slate-700/50 pt-4">
                <div>
                  <label
                    htmlFor="paymentDate"
                    className="block text-sm font-medium text-slate mb-2">
                    Payment Date
                  </label>
                  <input
                    id="paymentDate"
                    name="paymentDate"
                    type="date"
                    value={
                      formData.paymentDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    onChange={handleChange}
                    required
                    className={`${formInputClasses} pr-2`}
                  />
                </div>
                <div className="relative">
                  <label
                    htmlFor="paymentMethod"
                    className="block text-sm font-medium text-slate mb-2">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod || "Cash"}
                    onChange={handleChange}
                    className={`${formInputClasses} appearance-none pr-8`}>
                    {paymentMethods.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
              </motion.div>
            )}

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
                {transaction ? "Save Changes" : "Generate Fee"}
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

export default function FeeManagementPage() {
  const [transactions, setTransactions] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ batch: "all", status: "all" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubT = onSnapshot(
      query(collection(db, "feeTransactions"), orderBy("dueDate", "desc")),
      (snap) => {
        setTransactions(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => d.id !== "--placeholder--")
        );
        setLoading(false);
      }
    );
    const unsubS = onSnapshot(
      query(collection(db, "students"), orderBy("name")),
      (snap) => setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubB = onSnapshot(
      query(collection(db, "batches"), orderBy("name")),
      (snap) => setBatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => {
      unsubT();
      unsubS();
      unsubB();
    };
  }, []);

  const processedTransactions = useMemo(
    () =>
      transactions.map((t) => {
        let status = t.status;
        if (
          t.status === "Due" &&
          isPast(t.dueDate.toDate()) &&
          !isToday(t.dueDate.toDate())
        ) {
          status = "Overdue";
        }
        return { ...t, calculatedStatus: status };
      }),
    [transactions]
  );

  const studentMap = useMemo(
    () =>
      students.reduce((acc, student) => {
        acc[student.id] = student;
        return acc;
      }, {}),
    [students]
  );

  const filteredTransactions = useMemo(
    () =>
      processedTransactions
        .filter(
          (t) =>
            filters.batch === "all" ||
            studentMap[t.studentId]?.batch === filters.batch
        )
        .filter(
          (t) =>
            filters.status === "all" || t.calculatedStatus === filters.status
        )
        .filter(
          (t) =>
            t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (studentMap[t.studentId]?.rollNumber || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        ),
    [processedTransactions, filters, searchTerm, studentMap]
  );

  const stats = useMemo(() => {
    const today = new Date();
    const paidThisMonth = processedTransactions
      .filter(
        (t) =>
          t.status === "Paid" &&
          t.paymentDate &&
          t.paymentDate.toDate().getMonth() === today.getMonth()
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const outstanding = processedTransactions
      .filter((t) => t.status === "Due")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const overdueCount = processedTransactions.filter(
      (t) => t.calculatedStatus === "Overdue"
    ).length;
    return { paidThisMonth, outstanding, overdueCount };
  }, [processedTransactions]);

  const handleSave = async (formData) => {
    try {
      const selectedStudent = students.find((s) => s.id === formData.studentId);
      const dataToSave = {
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        description: formData.description,
        amount: Number(formData.amount),
        dueDate: Timestamp.fromDate(new Date(formData.dueDate)),
        status: formData.status,
        paymentDate:
          formData.status === "Paid"
            ? Timestamp.fromDate(new Date(formData.paymentDate))
            : null,
        paymentMethod:
          formData.status === "Paid" ? formData.paymentMethod : null,
      };
      if (editingTransaction) {
        await updateDoc(
          doc(db, "feeTransactions", editingTransaction.id),
          dataToSave
        );
      } else {
        await addDoc(collection(db, "feeTransactions"), {
          ...dataToSave,
          createdAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error("Error saving fee transaction:", error);
    }
  };

  const handleCreate = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };
  const handleDelete = (transaction) => {
    setDeletingTransaction(transaction);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (deletingTransaction) {
      await deleteDoc(doc(db, "feeTransactions", deletingTransaction.id));
      setIsDeleteModalOpen(false);
      setDeletingTransaction(null);
    }
  };

  return (
    <main>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-1">
            Fee Management
          </h1>
          <p className="text-base text-slate">
            Track and manage all student fee transactions.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Generate New Fee</span>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Collected (This Month)"
          value={`₹${stats.paidThisMonth.toLocaleString("en-IN")}`}
          Icon={IndianRupee}
        />
        <StatCard
          title="Total Outstanding"
          value={`₹${stats.outstanding.toLocaleString("en-IN")}`}
          Icon={Clock}
        />
        <StatCard
          title="Payments Overdue"
          value={stats.overdueCount}
          Icon={AlertTriangle}
        />
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 rounded-xl border border-white/10 bg-slate-900/20">
        <div className="relative w-full sm:w-auto">
          <select
            onChange={(e) =>
              setFilters((p) => ({ ...p, batch: e.target.value }))
            }
            className="w-full sm:w-52 appearance-none rounded-lg border border-slate-700 bg-slate-900 p-3 pr-8 text-light-slate focus:border-brand-gold cursor-pointer">
            <option value="all">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative w-full sm:w-auto">
          <select
            onChange={(e) =>
              setFilters((p) => ({ ...p, status: e.target.value }))
            }
            className="w-full sm:w-52 appearance-none rounded-lg border border-slate-700 bg-slate-900 p-3 pr-8 text-light-slate focus:border-brand-gold cursor-pointer">
            <option value="all">All Statuses</option>
            {statusFilters.map((s) => (
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
            placeholder="Search by student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 p-3 rounded-lg border border-slate-700 bg-slate-900 text-light-slate focus:border-brand-gold"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
        </div>
      ) : filteredTransactions.length > 0 ? (
        <motion.div className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-10 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase tracking-wider">
                <div className="col-span-3">Student</div>
                <div className="col-span-2">Description</div>
                <div className="col-span-1">Amount</div>
                <div className="col-span-1">Due Date</div>
                <div className="col-span-1">Payment</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              <div className="divide-y divide-slate-800">
                {filteredTransactions.map((t) => {
                  const student = studentMap[t.studentId];
                  return (
                    <div
                      key={t.id}
                      className="grid grid-cols-10 gap-4 items-center p-4 text-sm hover:bg-slate-800/20">
                      <div className="col-span-3 flex items-center gap-3">
                        <UserAvatar
                          name={t.studentName}
                          imageUrl={student?.photoURL}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-light-slate">
                            {t.studentName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {student?.batch}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-2 text-slate-300">
                        {t.description}
                      </div>
                      <div className="col-span-1 text-light-slate font-semibold">
                        ₹{Number(t.amount).toLocaleString("en-IN")}
                      </div>
                      <div className="col-span-1 text-slate-300">
                        {format(t.dueDate.toDate(), "MMM dd, yyyy")}
                      </div>
                      <div className="col-span-1 text-slate-300">
                        {t.paymentDate
                          ? format(t.paymentDate.toDate(), "MMM dd, yyyy")
                          : "–"}
                      </div>
                      <div className="col-span-1 text-center">
                        <StatusBadge status={t.calculatedStatus} />
                      </div>
                      <div className="col-span-1 flex justify-end gap-1">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10">
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
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
      ) : (
        <EmptyState
          onAction={handleCreate}
          title="No Transactions Found"
          message="Get started by generating the first fee record."
          buttonText="Generate New Fee"
        />
      )}
<FeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        students={students}
        batches={batches}
        transaction={editingTransaction}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        transactionDescription={`${deletingTransaction?.description} for ${deletingTransaction?.studentName}`}
      />
    </main>
  );
}
