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
  ChevronDown,
  Building,
  Wrench,
  Megaphone,
  Package,
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

const expenseCategories = [
  "Payroll",
  "Rent",
  "Utilities",
  "Marketing",
  "Supplies",
  "Miscellaneous",
];
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
      Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
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

const CategoryIcon = ({ category, className = "h-8 w-8" }) => {
  const iconMap = {
    Payroll: <Banknote className={className} />,
    Rent: <Building className={className} />,
    Utilities: <Wrench className={className} />,
    Marketing: <Megaphone className={className} />,
    Supplies: <Package className={className} />,
    Miscellaneous: <Package className={className} />,
  };
  return iconMap[category] || <Package className={className} />;
};

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  expenseDescription,
}) => {
  /* ... Full JSX from previous responses ... */
};
const EmptyState = ({
  onAction,
  title,
  message,
  buttonText,
  icon: Icon = Banknote,
}) => {
  /* ... Full JSX from previous responses ... */
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
    if (name === "category" && value !== "Payroll") {
      newFormData.teacherId = "";
      newFormData.description = "";
    }
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
  const formInputClasses =
    "w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-light-slate placeholder:text-slate-500 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold";

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
            {expense ? "Edit Expense" : "Add New Expense"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-slate mb-2">
                Category
              </label>
              <select
                ref={categorySelectRef}
                name="category"
                value={formData.category || ""}
                onChange={handleChange}
                required
                className={`${formInputClasses} appearance-none pr-8`}>
                <option value="" disabled>
                  Select...
                </option>
                {expenseCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
            <AnimatePresence>
              {formData.category === "Payroll" ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}>
                  <div className="relative pt-4">
                    <label className="block text-sm font-medium text-slate mb-2">
                      Teacher
                    </label>
                    <select
                      name="teacherId"
                      value={formData.teacherId || ""}
                      onChange={handleChange}
                      required
                      className={`${formInputClasses} appearance-none pr-8`}
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
                    <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}>
                  <div className="pt-4">
                    <label className="block text-sm font-medium text-slate mb-2">
                      Description
                    </label>
                    <input
                      name="description"
                      value={formData.description || ""}
                      onChange={handleChange}
                      required
                      className={formInputClasses}
                      placeholder="e.g., Electricity Bill"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                  className={formInputClasses}
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
                  className={`${formInputClasses} pr-2`}
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
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}{" "}
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
      (snap) => setTeachers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
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
        updatedAt: Timestamp.now(),
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
  const handleDelete = (expense) => {
    setDeletingExpense(expense);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (deletingExpense) {
      await deleteDoc(doc(db, "expenses", deletingExpense.id));
      setIsDeleteModalOpen(false);
      setDeletingExpense(null);
    }
  };

  return (
    <main>
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
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-900 p-3 pr-8 text-light-slate focus:border-brand-gold cursor-pointer">
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          </div>
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
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
        </div>
      ) : expensesForMonth.length > 0 ? (
        <motion.div
          className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-9 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase tracking-wider">
                <div className="col-span-4">Description</div>
                <div>Amount</div>
                <div className="text-center col-span-1">Status</div>
                <div className="text-center col-span-1">Date</div>
                <div className="text-right col-span-2">Actions</div>
              </div>
              <div className="divide-y divide-slate-800">
                {expensesForMonth.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-9 gap-4 items-center p-4 text-sm">
                    <div className="col-span-4 flex items-center gap-4">
                      <div className="p-2 bg-slate-700/50 rounded-lg text-brand-gold shrink-0">
                        <CategoryIcon
                          category={item.category}
                          className="h-6 w-6"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-light-slate">
                          {item.description}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.category}
                        </p>
                      </div>
                    </div>
                    <div className="font-semibold text-white">
                      ₹{Number(item.amount).toLocaleString("en-IN")}
                    </div>
                    <div className="text-center col-span-1">
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="text-center col-span-1 text-slate-300">
                      {format(item.expenseDate.toDate(), "dd MMM")}
                    </div>
                    <div className="flex justify-end gap-2 col-span-2">
                      {item.status === "Pending" && (
                        <button
                          onClick={() => markAsPaid(item.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-dark-navy transition-colors">
                          <Send size={14} /> Mark as Paid
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10">
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-red-400/10">
                        <Trash2 size={14} />
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
          title={`No Expenses for ${format(
            new Date(`${selectedMonth}-02`),
            "MMMM yyyy"
          )}`}
          message="Get started by adding the first expense record for this month."
          buttonText="Add New Expense"
        />
      )}
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
    </main>
  );
}
