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
  Banknote,
  PlusCircle,
  CheckCircle,
  Clock,
  Send,
  X,
  Loader2,
  AlertTriangle,
  Edit,
  Trash2,
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

const expenseCategories = [
  "Payroll",
  "Rent",
  "Utilities",
  "Marketing",
  "Miscellaneous",
];

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
    Pending: "bg-amber-500/20 text-amber-400",
  };
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  expenseDescription,
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
            Delete Expense Record
          </h3>
          <p className="mt-2 text-sm text-slate">
            Are you sure you want to delete the expense for{" "}
            <span className="font-bold text-light-slate">
              "{expenseDescription}"
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

const ExpenseModal = ({ isOpen, onClose, onSave, teachers, expense }) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const categorySelectRef = useRef(null);

  useEffect(() => {
    const initialData = {
      category: "Payroll",
      description: "",
      amount: "",
      expenseDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      paymentDate: null,
      teacherId: "",
    };
    let dataToSet = expense ? { ...expense } : initialData;
    if (dataToSet.expenseDate instanceof Timestamp)
      dataToSet.expenseDate = dataToSet.expenseDate
        .toDate()
        .toISOString()
        .split("T")[0];
    if (dataToSet.paymentDate instanceof Timestamp)
      dataToSet.paymentDate = dataToSet.paymentDate
        .toDate()
        .toISOString()
        .split("T")[0];
    setFormData(dataToSet);

    if (isOpen) setTimeout(() => categorySelectRef.current?.focus(), 100);
  }, [isOpen, expense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    if (name === "teacherId" && value) {
      const teacher = teachers.find((t) => t.id === value);
      if (teacher) newFormData.description = `Salary for ${teacher.name}`;
    }
    setFormData(newFormData);
  };

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
          className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-dark-navy/80 p-6 shadow-2xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}>
          <h2 className="text-xl font-bold text-brand-gold mb-6">
            {expense ? "Edit Expense" : "Add New Expense"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate">
              Category
            </label>
            <select
              ref={categorySelectRef}
              name="category"
              value={formData.category || ""}
              onChange={handleChange}
              required
              className="form-input">
              {expenseCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {formData.category === "Payroll" ? (
              <div>
                <label className="block text-sm font-medium text-slate mb-2">
                  Teacher
                </label>
                <select
                  name="teacherId"
                  value={formData.teacherId || ""}
                  onChange={handleChange}
                  required
                  className="form-input"
                  disabled={!!expense}>
                  <option value="" disabled>
                    Select a teacher
                  </option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.employeeId})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate mb-2">
                  Description
                </label>
                <input
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="e.g., Electricity Bill"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate mb-2">
                  Amount (₹)
                </label>
                <input
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
                <label className="block text-sm font-medium text-slate mb-2">
                  Expense Date
                </label>
                <input
                  name="expenseDate"
                  type="date"
                  value={formData.expenseDate || ""}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
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
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {expense ? "Save Changes" : "Add Expense"}
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

export default function ExpenseManagementPage() {
  const [allExpenses, setAllExpenses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubExpenses = onSnapshot(
      query(collection(db, "expenses"), orderBy("expenseDate", "desc")),
      (snap) => {
        setAllExpenses(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => d.id !== "--placeholder--")
        );
        setLoading(false);
      }
    );
    const unsubTeachers = onSnapshot(
      query(collection(db, "teachers"), orderBy("name")),
      (snap) => {
        setTeachers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );
    return () => {
      unsubExpenses();
      unsubTeachers();
    };
  }, []);

  const { expensesForMonth, stats } = useMemo(() => {
    const selectedDate = new Date(`${selectedMonth}-02`);
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    const expensesForMonth = allExpenses.filter((e) => {
      const expenseDate = e.expenseDate.toDate();
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    });

    const total = expensesForMonth.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );
    const paid = expensesForMonth
      .filter((i) => i.status === "Paid")
      .reduce((sum, i) => sum + Number(i.amount), 0);

    return { expensesForMonth, stats: { total, paid, pending: total - paid } };
  }, [selectedMonth, allExpenses]);

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => {
        const date = subMonths(new Date(), i);
        return {
          value: format(date, "yyyy-MM"),
          label: format(date, "MMMM yyyy"),
        };
      }),
    []
  );

  const handleSave = async (formData) => {
    try {
      const dataToSave = {
        ...formData,
        amount: Number(formData.amount),
        expenseDate: Timestamp.fromDate(new Date(formData.expenseDate)),
      };
      if (editingExpense) {
        await updateDoc(doc(db, "expenses", editingExpense.id), dataToSave);
      } else {
        await addDoc(collection(db, "expenses"), {
          ...dataToSave,
          createdAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const markAsPaid = async (expenseId) => {
    try {
      await updateDoc(doc(db, "expenses", expenseId), {
        status: "Paid",
        paymentDate: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error marking as paid:", error);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  // --- ADDED MISSING FUNCTIONALITY ---
  const handleDelete = (expense) => {
    setDeletingExpense(expense);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingExpense) {
      try {
        await deleteDoc(doc(db, "expenses", deletingExpense.id));
        setIsDeleteModalOpen(false);
        setDeletingExpense(null);
      } catch (error) {
        console.error("Error deleting expense:", error);
      }
    }
  };

  return (
    <div>
      <style jsx global>{`
        .form-input {
          @apply w-full appearance-none cursor-pointer rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-200;
        }
      `}</style>
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        teachers={teachers}
        expense={editingExpense}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        expenseDescription={deletingExpense?.description}
      />

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-1">
            Expense Management
          </h1>
          <p className="text-base text-slate">
            Track all institute expenses, including payroll.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Add New Expense</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
          <label className="text-md font-medium text-slate mb-2 block">
            Select Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full form-input">
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            title="Total Expenses"
            value={`₹${stats.total.toLocaleString("en-IN")}`}
            Icon={Banknote}
          />
          <StatCard
            title="Amount Paid"
            value={`₹${stats.paid.toLocaleString("en-IN")}`}
            Icon={CheckCircle}
          />
          <StatCard
            title="Amount Pending"
            value={`₹${stats.pending.toLocaleString("en-IN")}`}
            Icon={Clock}
          />
        </div>
      </div>

      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}>
        <div className="grid grid-cols-8 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase">
          <div className="col-span-3">Description</div>
          <div>Category</div>
          <div>Amount</div>
          <div className="text-center col-span-1">Status</div>
          <div className="text-right col-span-2">Actions</div>
        </div>
        <div className="divide-y divide-slate-700/50">
          {loading ? (
            <div className="text-center p-4 text-slate">Loading...</div>
          ) : expensesForMonth.length > 0 ? (
            expensesForMonth.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-8 gap-4 items-center p-4 text-sm">
                <div className="col-span-3 font-medium text-light-slate">
                  {item.description}
                </div>
                <div className="text-slate">{item.category}</div>
                <div className="font-semibold text-white">
                  ₹{Number(item.amount).toLocaleString("en-IN")}
                </div>
                <div className="text-center col-span-1">
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex justify-end gap-2 col-span-2">
                  {item.status === "Pending" && (
                    <button
                      onClick={() => markAsPaid(item.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-dark-navy transition-colors">
                      <Send size={14} /> Pay
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-white/5">
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-white/5">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-8 text-slate">
              No expenses recorded for{" "}
              {format(new Date(`${selectedMonth}-02`), "MMMM yyyy")}.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
