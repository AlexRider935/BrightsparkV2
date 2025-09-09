"use client";

import { useState, useMemo, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/firebase/config";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  query,
  orderBy,
  Timestamp,
  writeBatch,
  addDoc,
} from "firebase/firestore";
import {
  IndianRupee,
  Clock,
  Search,
  ChevronDown,
  X,
  Loader2,
  Save,
  Users,
  BarChart,
  CheckCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  startOfDay,
  isPast,
  isToday,
} from "date-fns";

// --- CONFIGURATION FOR PAYMENT PLANS ---
const PAYMENT_PLANS = {
  "one-time": { name: "One time payment", discount: 1500 },
  "two-installments": { name: "Two installments", discount: 500 },
  "three-installments": { name: "Three installments", discount: 0 },
  "per-month": { name: "Per Month", monthlyAmount: 2500, totalMonths: 11 },
};

// --- REUSABLE HELPER COMPONENTS (No changes) ---

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

const CollectInstallmentModal = ({
  isOpen,
  onClose,
  onSave,
  student,
  installment,
}) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const paymentMethods = ["Cash", "UPI", "Card", "Bank Transfer"];

  useEffect(() => {
    if (installment) {
      setFormData({
        amountPaid: installment.amount,
        paymentMethod: "UPI",
        paymentDate: format(new Date(), "yyyy-MM-dd"),
      });
    }
  }, [installment, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(student, installment, formData);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen || !student || !installment) return null;
  const formInputClasses =
    "w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold";

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
          className="relative w-full max-w-md rounded-2xl border border-white/10 bg-dark-navy/90 p-6 shadow-2xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}>
          <h2 className="text-xl font-bold text-brand-gold mb-2">
            Collect Installment
          </h2>
          <p className="text-sm text-slate mb-6">
            For:{" "}
            <span className="font-semibold text-light-slate">
              {student.name}
            </span>
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-sm text-slate-400">
                {installment.description}
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                ₹{installment.amount.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="amountPaid"
                  className="block text-sm font-medium text-slate mb-2">
                  Amount Paid
                </label>
                <input
                  id="amountPaid"
                  type="number"
                  value={formData.amountPaid || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, amountPaid: e.target.value })
                  }
                  required
                  className={formInputClasses}
                />
              </div>
              <div>
                <label
                  htmlFor="paymentDate"
                  className="block text-sm font-medium text-slate mb-2">
                  Payment Date
                </label>
                <input
                  id="paymentDate"
                  type="date"
                  value={formData.paymentDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentDate: e.target.value })
                  }
                  required
                  className={formInputClasses}
                />
              </div>
            </div>
            <div className="relative">
              <label
                htmlFor="paymentMethod"
                className="block text-sm font-medium text-slate mb-2">
                Payment Method
              </label>
              <select
                id="paymentMethod"
                value={formData.paymentMethod || "UPI"}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
                className={`${formInputClasses} appearance-none pr-8`}>
                {paymentMethods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
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
                Confirm Payment
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- FEE STRUCTURE VIEW COMPONENT (No changes) ---
const FeeStructureView = ({ students, batches, feeDetails, onSavePlan }) => {
  const [editingPlan, setEditingPlan] = useState({});

  const handlePlanChange = (studentId, plan) => {
    setEditingPlan((prev) => ({ ...prev, [studentId]: plan }));
  };

  const handleSave = (studentId) => {
    const plan = editingPlan[studentId];
    if (plan) {
      onSavePlan(studentId, plan);
      setEditingPlan((prev) => {
        const newState = { ...prev };
        delete newState[studentId];
        return newState;
      });
    }
  };

  const batchFeeMap = new Map(
    batches.map((b) => [b.name, b.totalCourseFee || 0])
  );
  const feeDetailMap = new Map(feeDetails.map((d) => [d.id, d]));

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-10 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase">
            <div className="col-span-3">Student</div>
            <div className="col-span-2">Total Course Fee</div>
            <div className="col-span-3">Payment Plan</div>
            <div className="col-span-2">Total Payable</div>
          </div>
          <div className="divide-y divide-slate-800">
            {students.map((s) => {
              const baseFee = batchFeeMap.get(s.batch) || 0;
              const studentFeeDetail = feeDetailMap.get(s.id);
              const isEditing = !!editingPlan[s.id];
              const selectedPlanKey =
                editingPlan[s.id] || studentFeeDetail?.selectedPlan;
              const planDetails = PAYMENT_PLANS[selectedPlanKey];
              const totalPayable =
                selectedPlanKey === "per-month" && planDetails
                  ? planDetails.monthlyAmount * planDetails.totalMonths
                  : baseFee - (planDetails?.discount || 0);

              return (
                <div
                  key={s.id}
                  className="grid grid-cols-10 gap-4 items-center p-3 text-sm">
                  <div className="col-span-3">
                    <p className="font-medium text-light-slate">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.batch}</p>
                  </div>
                  <div className="col-span-2 text-slate-300">
                    ₹{baseFee.toLocaleString("en-IN")}
                  </div>
                  <div className="col-span-3 flex items-center gap-2">
                    <select
                      value={selectedPlanKey || ""}
                      onChange={(e) => handlePlanChange(s.id, e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs focus:ring-brand-gold focus:border-brand-gold">
                      <option value="" disabled>
                        Select a plan
                      </option>
                      {Object.entries(PAYMENT_PLANS).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value.name}
                        </option>
                      ))}
                    </select>
                    {isEditing && (
                      <button
                        onClick={() => handleSave(s.id)}
                        className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-md"
                        title="Save Plan">
                        <Save size={14} />
                      </button>
                    )}
                  </div>
                  <div className="col-span-2 text-brand-gold font-bold text-base">
                    {selectedPlanKey
                      ? `₹${totalPayable.toLocaleString("en-IN")}`
                      : "N/A"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PAYMENT COLLECTION VIEW COMPONENT (Logic Corrected) ---
const PaymentCollectionView = ({
  feeDetails,
  students,
  onCollectFee,
  currentMonth,
}) => {
  const [filter, setFilter] = useState("Pending");

  const { pending, paid } = useMemo(() => {
    const monthInterval = {
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    };
    let paidForMonth = [];
    let pendingForMonth = [];

    feeDetails.forEach((detail) => {
      const student = students.find((s) => s.id === detail.id);
      if (student && detail.installments) {
        detail.installments.forEach((inst, index) => {
          const uniqueId = `${student.id}_${index}`;
          // An installment belongs to this month if it's DUE this month OR was PAID this month
          const isDueThisMonth = isWithinInterval(
            inst.dueDate.toDate(),
            monthInterval
          );
          const isPaidThisMonth = inst.paymentDate
            ? isWithinInterval(inst.paymentDate.toDate(), monthInterval)
            : false;

          if (isDueThisMonth || isPaidThisMonth) {
            const installmentData = {
              ...inst,
              studentId: student.id,
              studentName: student.name,
              batch: student.batch,
              installmentId: uniqueId,
            };

            if (inst.status === "paid" && isPaidThisMonth) {
              paidForMonth.push(installmentData);
            } else if (inst.status === "pending" && isDueThisMonth) {
              pendingForMonth.push({
                ...installmentData,
                isOverdue:
                  isPast(inst.dueDate.toDate()) &&
                  !isToday(inst.dueDate.toDate()),
              });
            }
          }
        });
      }
    });

    // Sort the lists
    pendingForMonth.sort((a, b) => a.dueDate.toDate() - b.dueDate.toDate());
    paidForMonth.sort(
      (a, b) => b.paymentDate.toDate() - a.paymentDate.toDate()
    );

    return { pending: pendingForMonth, paid: paidForMonth };
  }, [feeDetails, students, currentMonth]);

  const listToShow = filter === "Pending" ? pending : paid;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex border border-slate-700 rounded-lg p-1 bg-slate-900/50">
          <button
            onClick={() => setFilter("Pending")}
            className={`px-4 py-1.5 text-sm rounded-md ${
              filter === "Pending"
                ? "bg-brand-gold text-dark-navy font-bold"
                : "text-slate-300 hover:bg-slate-800"
            }`}>
            Pending ({pending.length})
          </button>
          <button
            onClick={() => setFilter("Paid")}
            className={`px-4 py-1.5 text-sm rounded-md ${
              filter === "Paid"
                ? "bg-brand-gold text-dark-navy font-bold"
                : "text-slate-300 hover:bg-slate-800"
            }`}>
            Paid ({paid.length})
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-10 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase">
              <div className="col-span-3">Student</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-1">Amount</div>
              <div className="col-span-1">
                {filter === "Paid" ? "Paid On" : "Due Date"}
              </div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>
            <div className="divide-y divide-slate-800">
              {listToShow.map((inst) => (
                <div
                  key={inst.installmentId}
                  className="grid grid-cols-10 gap-4 items-center p-3 text-sm">
                  <div className="col-span-3">
                    <p className="font-medium text-light-slate">
                      {inst.studentName}
                    </p>
                    <p className="text-xs text-slate-400">{inst.batch}</p>
                  </div>
                  <div className="col-span-3 text-slate-300">
                    {inst.description}
                  </div>
                  <div className="col-span-1 font-semibold text-light-slate">
                    ₹{inst.amount.toLocaleString("en-IN")}
                  </div>
                  <div className="col-span-1 text-slate-300">
                    {format(
                      filter === "Paid"
                        ? inst.paymentDate.toDate()
                        : inst.dueDate.toDate(),
                      "MMM dd, yyyy"
                    )}
                  </div>
                  <div className="col-span-1 text-center">
                    <StatusBadge
                      status={
                        inst.isOverdue
                          ? "Overdue"
                          : inst.status === "paid"
                          ? "Paid"
                          : "Pending"
                      }
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    {filter === "Pending" ? (
                      <button
                        onClick={() =>
                          onCollectFee(
                            students.find((s) => s.id === inst.studentId),
                            inst
                          )
                        }
                        className="px-3 py-1.5 text-xs font-bold rounded-md bg-green-500/20 text-green-300 hover:bg-green-500/30">
                        Collect
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">Paid</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {listToShow.length === 0 && (
              <p className="text-center text-slate-500 py-12">
                No installments found in this category for{" "}
                {format(currentMonth, "MMMM")}.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT (No logical changes, just the fixed import) ---
export default function FeeManagementPage() {
  const [activeTab, setActiveTab] = useState("paymentCollection");
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [feeDetails, setFeeDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collectingData, setCollectingData] = useState({
    student: null,
    installment: null,
  });

  const [batchFilter, setBatchFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubStudents = onSnapshot(
      query(collection(db, "students"), orderBy("name")),
      (snap) => setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubBatches = onSnapshot(
      query(collection(db, "batches"), orderBy("name")),
      (snap) => {
        setBatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );
    const unsubFeeDetails = onSnapshot(
      collection(db, "studentFeeDetails"),
      (snap) => setFeeDetails(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubStudents();
      unsubBatches();
      unsubFeeDetails();
    };
  }, []);

  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => batchFilter === "all" || s.batch === batchFilter)
      .filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.rollNumber || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [students, batchFilter, searchTerm]);

  const monthlyStats = useMemo(() => {
    const monthInterval = {
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    };
    let collected = 0;
    let pending = 0;

    feeDetails.forEach((detail) => {
      const student = filteredStudents.find((s) => s.id === detail.id);
      if (student && detail.installments) {
        detail.installments.forEach((inst) => {
          const isPaidThisMonth = inst.paymentDate
            ? isWithinInterval(inst.paymentDate.toDate(), monthInterval)
            : false;
          const isDueThisMonth = isWithinInterval(
            inst.dueDate.toDate(),
            monthInterval
          );

          if (inst.status === "paid" && isPaidThisMonth) {
            collected += inst.amountPaid || inst.amount;
          } else if (inst.status === "pending" && isDueThisMonth) {
            pending += inst.amount;
          }
        });
      }
    });

    return { collected, pending };
  }, [feeDetails, filteredStudents, currentMonth]);

  const handleSavePlan = async (studentId, planKey) => {
    const student = students.find((s) => s.id === studentId);
    const batch = batches.find((b) => b.name === student.batch);
    if (!student || !batch || !batch.totalCourseFee) {
      alert("Student's batch or batch fee is not configured correctly.");
      return;
    }

    const plan = PAYMENT_PLANS[planKey];
    const totalFee = batch.totalCourseFee;
    let installments = [];
    const admissionDate = student.admissionDate
      ? student.admissionDate.toDate()
      : new Date();

    switch (planKey) {
      case "one-time":
        installments.push({
          description: "One-time Full Payment",
          amount: totalFee - plan.discount,
          dueDate: Timestamp.fromDate(admissionDate),
          status: "pending",
        });
        break;
      case "two-installments":
        installments.push({
          description: "1st Installment",
          amount: 14000,
          dueDate: Timestamp.fromDate(admissionDate),
          status: "pending",
        });
        installments.push({
          description: "2nd Installment",
          amount: 12000,
          dueDate: Timestamp.fromDate(addMonths(admissionDate, 3)),
          status: "pending",
        });
        break;
      case "three-installments":
        installments.push({
          description: "1st Installment",
          amount: 10000,
          dueDate: Timestamp.fromDate(admissionDate),
          status: "pending",
        });
        installments.push({
          description: "2nd Installment",
          amount: 10000,
          dueDate: Timestamp.fromDate(addMonths(admissionDate, 2)),
          status: "pending",
        });
        installments.push({
          description: "3rd Installment",
          amount: 6500,
          dueDate: Timestamp.fromDate(addMonths(admissionDate, 4)),
          status: "pending",
        });
        break;
      case "per-month":
        for (let i = 0; i < plan.totalMonths; i++) {
          installments.push({
            description: `Fee for ${format(
              addMonths(admissionDate, i),
              "MMMM"
            )}`,
            amount: plan.monthlyAmount,
            dueDate: Timestamp.fromDate(addMonths(admissionDate, i)),
            status: "pending",
          });
        }
        break;
    }

    const docRef = doc(db, "studentFeeDetails", studentId);
    await setDoc(
      docRef,
      { selectedPlan: planKey, installments },
      { merge: true }
    );
  };

  const handleCollectFee = (student, installment) => {
    setCollectingData({ student, installment });
    setIsModalOpen(true);
  };

  const handleSavePayment = async (student, installment, paymentData) => {
    const feeDetailRef = doc(db, "studentFeeDetails", student.id);
    const transactionRef = collection(db, "feeTransactions");

    const feeDetailDoc = feeDetails.find((d) => d.id === student.id);
    if (!feeDetailDoc) return;
    const updatedInstallments = feeDetailDoc.installments.map((inst) => {
      if (
        inst.dueDate.isEqual(installment.dueDate) &&
        inst.description === installment.description
      ) {
        return {
          ...inst,
          status: "paid",
          paymentDate: Timestamp.fromDate(new Date(paymentData.paymentDate)),
          amountPaid: Number(paymentData.amountPaid),
        };
      }
      return inst;
    });

    await setDoc(
      feeDetailRef,
      { installments: updatedInstallments },
      { merge: true }
    );
    await addDoc(transactionRef, {
      studentId: student.id,
      studentName: student.name,
      amount: Number(paymentData.amountPaid),
      paymentDate: Timestamp.fromDate(new Date(paymentData.paymentDate)),
      paymentMethod: paymentData.paymentMethod,
      description: installment.description,
      createdAt: Timestamp.now(),
    });
  };

  return (
    <main>
      <CollectInstallmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePayment}
        student={collectingData.student}
        installment={collectingData.installment}
      />
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-1">
            Fee Management
          </h1>
          <p className="text-base text-slate">
            Assign payment plans and track all installments.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div className="flex border border-slate-700 rounded-lg p-1 bg-slate-900/50">
          <button
            onClick={() => setActiveTab("paymentCollection")}
            className={`px-4 py-1.5 text-sm rounded-md flex items-center gap-2 ${
              activeTab === "paymentCollection"
                ? "bg-brand-gold text-dark-navy font-bold"
                : "text-slate-300 hover:bg-slate-800"
            }`}>
            <IndianRupee size={16} />
            Payment Collection
          </button>
          <button
            onClick={() => setActiveTab("feeStructures")}
            className={`px-4 py-1.5 text-sm rounded-md flex items-center gap-2 ${
              activeTab === "feeStructures"
                ? "bg-brand-gold text-dark-navy font-bold"
                : "text-slate-300 hover:bg-slate-800"
            }`}>
            <BarChart size={16} />
            Fee Structures
          </button>
        </div>
        {activeTab === "paymentCollection" && (
          <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-lg p-1">
            <button
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              className="p-2 rounded-md hover:bg-slate-800">
              <ChevronLeft size={20} />
            </button>
            <span className="font-semibold text-lg text-light-slate w-32 text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              className="p-2 rounded-md hover:bg-slate-800">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 rounded-xl border border-white/10 bg-slate-900/20">
        <div className="relative w-full sm:w-64">
          <select
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
        <div className="relative w-full sm:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or roll no..."
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
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}>
            {activeTab === "paymentCollection" && (
              <Fragment>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <StatCard
                    title={`Collected (${format(currentMonth, "MMMM")})`}
                    value={`₹${monthlyStats.collected.toLocaleString("en-IN")}`}
                    Icon={CheckCircle}
                  />
                  <StatCard
                    title={`Pending (${format(currentMonth, "MMMM")})`}
                    value={`₹${monthlyStats.pending.toLocaleString("en-IN")}`}
                    Icon={Clock}
                  />
                </div>
                <PaymentCollectionView
                  feeDetails={feeDetails.filter((d) =>
                    filteredStudents.some((s) => s.id === d.id)
                  )}
                  students={filteredStudents}
                  onCollectFee={handleCollectFee}
                  currentMonth={currentMonth}
                />
              </Fragment>
            )}
            {activeTab === "feeStructures" && (
              <FeeStructureView
                students={filteredStudents}
                batches={batches}
                feeDetails={feeDetails}
                onSavePlan={handleSavePlan}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </main>
  );
}
