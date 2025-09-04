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
  AlertCircle,
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
  const styles = {
    Paid: "bg-green-500/20 text-green-300",
    Due: "bg-sky-500/20 text-sky-400",
    Overdue: "bg-red-500/20 text-red-400",
  };
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

// --- ADDED MISSING COMPONENT ---
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

// --- ADDED MISSING COMPONENT ---
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
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">
            Delete Transaction
          </h3>
          <p className="mt-2 text-sm text-slate">
            Are you sure you want to delete the transaction for{" "}
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

const FeeModal = ({ isOpen, onClose, onSave, students, transaction }) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const studentSelectRef = useRef(null);

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
    if (isOpen) setTimeout(() => studentSelectRef.current?.focus(), 100);
  }, [isOpen, transaction]);

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
          className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-dark-navy/80 p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-brand-gold mb-6">
            {transaction ? "Edit Fee Record" : "Generate New Fee"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="studentId"
                className="block text-sm font-medium text-slate mb-2">
                Student
              </label>
              <select
                ref={studentSelectRef}
                id="studentId"
                name="studentId"
                value={formData.studentId || ""}
                onChange={handleChange}
                required
                className="form-input"
                disabled={!!transaction}>
                <option value="" disabled>
                  Select a student
                </option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rollNumber})
                  </option>
                ))}
              </select>
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
                className="form-input"
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
                  className="form-input"
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
                  className="form-input"
                />
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
                value={formData.status || "Due"}
                onChange={handleChange}
                className="form-input">
                <option value="Due">Due</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            {formData.status === "Paid" && (
              <div className="grid grid-cols-2 gap-4 border-t border-slate-700/50 pt-4">
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
                    className="form-input"
                  />
                </div>
                <div>
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
                    className="form-input">
                    {paymentMethods.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
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
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
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

  const processedTransactions = useMemo(() => {
    return transactions.map((t) => {
      let status = t.status;
      if (
        t.status === "Due" &&
        isPast(t.dueDate.toDate()) &&
        !isToday(t.dueDate.toDate())
      ) {
        status = "Overdue";
      }
      return { ...t, calculatedStatus: status };
    });
  }, [transactions]);

  const filteredTransactions = useMemo(
    () =>
      processedTransactions
        .filter(
          (t) => filters.batch === "all" || t.studentBatch === filters.batch
        )
        .filter(
          (t) =>
            filters.status === "all" || t.calculatedStatus === filters.status
        )
        .filter(
          (t) =>
            t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.studentRollNumber &&
              t.studentRollNumber
                .toLowerCase()
                .includes(searchTerm.toLowerCase()))
        ),
    [processedTransactions, filters, searchTerm]
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
        studentRollNumber: selectedStudent.rollNumber,
        studentBatch: selectedStudent.batch,
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

  // --- ADDED MISSING FUNCTIONALITY ---
  const handleDelete = (transaction) => {
    setDeletingTransaction(transaction);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (deletingTransaction) {
      try {
        await deleteDoc(doc(db, "feeTransactions", deletingTransaction.id));
        setIsDeleteModalOpen(false);
        setDeletingTransaction(null);
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    }
  };

  return (
    <>
      <style jsx global>{`
        .form-input {
          @apply w-full appearance-none cursor-pointer rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-200;
        }
      `}</style>
      <FeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        students={students}
        transaction={editingTransaction}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        transactionDescription={`${deletingTransaction?.description} for ${deletingTransaction?.studentName}`}
      />

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
            Icon={AlertCircle}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 rounded-xl border border-white/10 bg-slate-900/20">
          <div className="relative w-full sm:w-auto">
            <select
              onChange={(e) =>
                setFilters((p) => ({ ...p, batch: e.target.value }))
              }
              className="w-full sm:w-52 form-input">
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
              className="w-full sm:w-52 form-input">
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
              className="w-full pl-10 p-3 rounded-lg border border-white/10 bg-slate-900/50 text-light-slate focus:border-brand-gold"
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
                <div className="grid grid-cols-10 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase">
                  <div className="col-span-2">Student</div>
                  <div className="col-span-2">Description</div>
                  <div className="col-span-1">Amount</div>
                  <div className="col-span-1">Due Date</div>
                  <div className="col-span-1">Payment Date</div>
                  <div className="col-span-1 text-center">Status</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                <div className="divide-y divide-slate-700/50">
                  {filteredTransactions.map((t) => (
                    <div
                      key={t.id}
                      className="grid grid-cols-10 gap-4 items-center p-4 text-sm hover:bg-slate-800/20">
                      <div className="col-span-2">
                        <p className="font-medium text-light-slate">
                          {t.studentName}
                        </p>
                        <p className="text-xs text-slate">
                          {t.studentRollNumber}
                        </p>
                      </div>
                      <div className="col-span-2 text-slate">
                        {t.description}
                      </div>
                      <div className="col-span-1 text-light-slate font-semibold">
                        ₹{Number(t.amount).toLocaleString("en-IN")}
                      </div>
                      <div className="col-span-1 text-slate">
                        {format(t.dueDate.toDate(), "MMM dd, yyyy")}
                      </div>
                      <div className="col-span-1 text-slate">
                        {t.paymentDate
                          ? format(t.paymentDate.toDate(), "MMM dd, yyyy")
                          : "–"}
                      </div>
                      <div className="col-span-1 text-center">
                        <StatusBadge status={t.calculatedStatus} />
                      </div>
                      <div className="col-span-2 flex justify-end gap-1">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-white/5">
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-white/5">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
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
      </main>
    </>
  );
}
