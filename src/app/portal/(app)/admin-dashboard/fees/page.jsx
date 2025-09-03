"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IndianRupee,
  PlusCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  ChevronDown,
  X,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";

// --- MOCK DATA ---
const mockAllTransactions = [
  {
    id: "txn1",
    studentName: "Alex Rider",
    rollNumber: "VI-01",
    batch: "Class VI - Foundation",
    description: "September Fee",
    amount: 5000,
    dueDate: new Date("2025-09-15"),
    paymentDate: null,
    status: "Due",
  },
  {
    id: "txn2",
    studentName: "Ben Tennyson",
    rollNumber: "VI-02",
    batch: "Class VI - Foundation",
    description: "September Fee",
    amount: 5000,
    dueDate: new Date("2025-09-15"),
    paymentDate: null,
    status: "Due",
  },
  {
    id: "txn3",
    studentName: "Priya Singh",
    rollNumber: "VII-01",
    batch: "Class VII - Olympiad",
    description: "September Fee",
    amount: 6000,
    dueDate: new Date("2025-09-15"),
    paymentDate: null,
    status: "Due",
  },
  {
    id: "txn4",
    studentName: "David Johnson",
    rollNumber: "VII-04",
    batch: "Class VII - Olympiad",
    description: "August Fee",
    amount: 6000,
    paymentDate: new Date("2025-08-14"),
    dueDate: new Date("2025-08-15"),
    status: "Paid",
  },
  {
    id: "txn5",
    studentName: "Cindy Vortex",
    rollNumber: "VI-03",
    batch: "Class VI - Foundation",
    description: "August Fee",
    amount: 5000,
    paymentDate: new Date("2025-08-12"),
    dueDate: new Date("2025-08-15"),
    status: "Paid",
  },
  {
    id: "txn6",
    studentName: "Eva Williams",
    rollNumber: "VII-05",
    batch: "Class VII - Olympiad",
    description: "August Fee",
    amount: 6000,
    dueDate: new Date("2025-08-15"),
    paymentDate: null,
    status: "Overdue",
  },
];

const mockBatches = ["Class VI - Foundation", "Class VII - Olympiad"];
const statusFilters = ["All", "Paid", "Due", "Overdue"];
const paymentMethods = ["Cash", "UPI", "Card"];

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

const RecordPaymentModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        student: "",
        amount: "",
        paymentDate: format(new Date(), "yyyy-MM-dd"),
        method: "Cash",
        notes: "",
      });
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Recording Payment:", formData);
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
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: -20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-dark-navy p-6">
          <h2 className="text-xl font-bold text-brand-gold mb-4">
            Record New Payment
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="student"
              value={formData.student}
              onChange={(e) =>
                setFormData({ ...formData, student: e.target.value })
              }
              placeholder="Student Name or Roll No."
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                name="amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="Amount (e.g., 5000)"
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                required
              />
              <input
                name="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) =>
                  setFormData({ ...formData, paymentDate: e.target.value })
                }
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                required
              />
            </div>
            <select
              name="method"
              value={formData.method}
              onChange={(e) =>
                setFormData({ ...formData, method: e.target.value })
              }
              className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
              {paymentMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Transaction notes (e.g., September Fee)"
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20">
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400">
                Record Payment
              </button>
            </div>
          </form>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate hover:text-white">
            <X size={24} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function FeeManagementPage() {
  const [filters, setFilters] = useState({ batch: "all", status: "all" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const today = new Date("2025-09-03");

  const processedTransactions = useMemo(() => {
    return mockAllTransactions
      .map((t) => ({
        ...t,
        status:
          t.status === "Due" && isPast(t.dueDate) && !isToday(t.dueDate)
            ? "Overdue"
            : t.status,
      }))
      .filter((t) => filters.batch === "all" || t.batch === filters.batch)
      .filter((t) => filters.status === "all" || t.status === filters.status)
      .filter(
        (t) =>
          t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [filters, searchTerm]);

  const paidThisMonth = mockAllTransactions
    .filter(
      (t) =>
        t.status === "Paid" &&
        new Date(t.paymentDate).getMonth() === today.getMonth()
    )
    .reduce((sum, t) => sum + t.amount, 0);
  const outstandingFees = mockAllTransactions
    .filter((t) => t.status !== "Paid")
    .reduce((sum, t) => sum + t.amount, 0);
  const overdueCount = mockAllTransactions.filter(
    (t) => t.status === "Due" && isPast(t.dueDate) && !isToday(t.dueDate)
  ).length;

  return (
    <>
      <RecordPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
              Fee Management
            </h1>
            <p className="text-lg text-slate">
              Track and manage all student fee transactions.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 shrink-0">
            <PlusCircle size={18} />
            <span>Record Payment</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Collected (This Month)"
            value={`₹${paidThisMonth.toLocaleString("en-IN")}`}
            Icon={IndianRupee}
          />
          <StatCard
            title="Total Outstanding"
            value={`₹${outstandingFees.toLocaleString("en-IN")}`}
            Icon={Clock}
          />
          <StatCard
            title="Payments Overdue"
            value={overdueCount}
            Icon={AlertCircle}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 rounded-xl border border-white/10 bg-slate-900/20">
          <div className="relative w-full sm:w-auto">
            <select
              onChange={(e) => handleFilterChange("batch", e.target.value)}
              className="w-full sm:w-52 appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
              <option value="all">All Batches</option>
              {mockBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative w-full sm:w-auto">
            <select
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full sm:w-52 appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
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
              placeholder="Search by student name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-3 rounded-lg border border-white/10 bg-slate-900/50 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>
        </div>

        <motion.div className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg">
          <div className="grid grid-cols-8 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase">
            <div className="col-span-2">Student</div>
            <div className="col-span-2">Description</div>
            <div className="col-span-1">Amount</div>
            <div className="col-span-1">Due Date</div>
            <div className="col-span-1">Payment Date</div>
            <div className="col-span-1 text-center">Status</div>
          </div>
          <div className="divide-y divide-slate-700/50">
            {processedTransactions.map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-8 gap-4 items-center p-4 text-sm">
                <div className="col-span-2">
                  <p className="font-medium text-light-slate">
                    {t.studentName}
                  </p>
                  <p className="text-xs text-slate">{t.rollNumber}</p>
                </div>
                <div className="col-span-2 text-slate">{t.description}</div>
                <div className="col-span-1 text-light-slate font-semibold">
                  ₹{t.amount.toLocaleString("en-IN")}
                </div>
                <div className="col-span-1 text-slate">
                  {format(t.dueDate, "MMM dd, yyyy")}
                </div>
                <div className="col-span-1 text-slate">
                  {t.paymentDate ? format(t.paymentDate, "MMM dd, yyyy") : "–"}
                </div>
                <div className="col-span-1 text-center">
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
