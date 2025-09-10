// src/app/portal/(app)/student-dashboard/fees/page.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import {
  CheckCircle2,
  Copy,
  Loader2,
  Info,
  Clock,
  PieChart,
  QrCode,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";

const formatDate = (date) =>
  date instanceof Timestamp ? format(date.toDate(), "MMMM dd, yyyy") : "N/A";

// --- REUSABLE UI COMPONENTS ---

const StatusBadge = ({ status }) => {
  const styles = useMemo(
    () => ({
      Paid: "bg-green-500/10 text-green-400 border-green-500/20",
      Pending: "bg-sky-500/10 text-sky-400 border-sky-500/20",
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

const InstallmentRow = ({ installment }) => {
  const isPaid = installment.status === "paid";
  const isOverdue =
    isPast(installment.dueDate.toDate()) &&
    !isToday(installment.dueDate.toDate()) &&
    !isPaid;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
      <div className="flex items-center gap-4">
        <div
          className={`p-2 rounded-lg border ${
            isPaid
              ? "bg-green-500/10 border-green-500/20"
              : isOverdue
              ? "bg-red-500/10 border-red-500/20"
              : "bg-slate-700/50 border-slate-600"
          }`}>
          {isPaid ? (
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          ) : (
            <Clock
              className={`h-5 w-5 ${
                isOverdue ? "text-red-400" : "text-slate-400"
              }`}
            />
          )}
        </div>
        <div>
          <p className="font-semibold text-light-slate">
            {installment.description}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate">
            <span>Due: {formatDate(installment.dueDate)}</span>
            {isPaid && (
              <>
                <span className="text-slate-600">•</span>
                <span>Paid on: {formatDate(installment.paymentDate)}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
        <p
          className={`font-semibold text-lg ${
            isPaid ? "text-green-400" : "text-white"
          }`}>
          ₹{installment.amount.toLocaleString("en-IN")}
        </p>
        <div className="ml-auto">
          <StatusBadge
            status={isPaid ? "Paid" : isOverdue ? "Overdue" : "Pending"}
          />
        </div>
      </div>
    </div>
  );
};

// --- UPDATED PlanSummaryCard ---
const PlanSummaryCard = ({ allInstallments, assignedPlanName }) => {
  const totalPaid = useMemo(
    () =>
      allInstallments
        .filter((inst) => inst.status === "paid")
        .reduce((sum, inst) => sum + (inst.amountPaid || inst.amount), 0),
    [allInstallments]
  );

  // CORRECTED LOGIC: Total due is the sum of all assigned installments
  const totalDue = useMemo(
    () => allInstallments.reduce((sum, inst) => sum + inst.amount, 0),
    [allInstallments]
  );

  const percentagePaid = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="md:col-span-2 rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
        <h2 className="text-xl font-semibold text-brand-gold mb-1">
          Your Fee Plan
        </h2>
        <p className="text-2xl font-bold text-light-slate">
          {assignedPlanName}
        </p>

        <div className="mt-6">
          <div className="flex justify-between items-end text-sm mb-1">
            <span className="text-slate">Paid</span>
            <span className="font-bold text-white">
              ₹{totalPaid.toLocaleString("en-IN")} / ₹
              {totalDue.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2.5">
            <motion.div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: `${percentagePaid}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${percentagePaid}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg flex flex-col justify-center items-center">
        <PieChart className="h-10 w-10 text-slate-400 mb-2" />
        <p className="text-3xl font-bold text-light-slate">
          {Math.round(percentagePaid)}%
        </p>
        <h3 className="text-md font-medium text-slate">Paid of Total</h3>
      </div>
    </div>
  );
};

export default function PaymentsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  const [feeDetails, setFeeDetails] = useState(null);
  const [feeStructure, setFeeStructure] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const unsubStudent = onSnapshot(
      doc(db, "students", user.uid),
      (docSnap) => {
        setStudentProfile(
          docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
        );
      }
    );

    const unsubFeeDetails = onSnapshot(
      doc(db, "studentFeeDetails", user.uid),
      (docSnap) => {
        setFeeDetails(
          docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
        );
      }
    );

    return () => {
      unsubStudent();
      unsubFeeDetails();
    };
  }, [user]);

  useEffect(() => {
    if (studentProfile?.batchId) {
      const unsubFeeStructure = onSnapshot(
        doc(db, "feeStructures", studentProfile.batchId),
        (docSnap) => {
          setFeeStructure(
            docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
          );
          setLoading(false);
        },
        () => setLoading(false)
      );
      return () => unsubFeeStructure();
    } else if (studentProfile === null && user?.uid) {
      // If student profile is not found, we can stop loading
      setLoading(false);
    }
  }, [studentProfile, user]);

  const { nextInstallment, allInstallments, assignedPlanName } = useMemo(() => {
    if (!feeDetails?.installments) {
      return {
        nextInstallment: null,
        allInstallments: [],
        assignedPlanName: "N/A",
      };
    }
    const sorted = [...feeDetails.installments].sort(
      (a, b) => a.dueDate.toDate() - b.dueDate.toDate()
    );
    const next = sorted.find((inst) => inst.status === "pending") || null;
    const plan = feeStructure?.plans.find(
      (p) => p.id === feeDetails.selectedPlanId
    );
    const planName = plan ? plan.name : "Assigned Plan";

    return {
      nextInstallment: next,
      allInstallments: sorted,
      assignedPlanName: planName,
    };
  }, [feeDetails, feeStructure]);

  const handleCopy = () => {
    navigator.clipboard.writeText("brightspark.jaipur@okhdfcbank");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Fee Payments
      </h1>
      <p className="text-lg text-slate mb-8">
        Manage your payments and view your transaction history.
      </p>

      <AnimatePresence mode="wait">
        {!feeDetails ? (
          <motion.div
            key="no-plan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/10">
              <Info className="mx-auto h-12 w-12 text-slate-500" />
              <h3 className="mt-4 text-xl font-semibold text-white">
                No Payment Plan Assigned
              </h3>
              <p className="mt-2 text-sm text-slate">
                Your fee structure has not been configured yet. Please contact
                the administration.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="plan-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <PlanSummaryCard
              allInstallments={allInstallments}
              assignedPlanName={assignedPlanName}
            />
            {nextInstallment ? (
              <div className="mb-8 rounded-2xl border border-brand-gold/30 bg-slate-900/20 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-6 md:p-8 flex flex-col">
                    <div>
                      <p className="text-brand-gold font-semibold">
                        Next Installment Due
                      </p>
                      <h2 className="text-4xl font-bold text-white mt-2">
                        ₹{nextInstallment.amount.toLocaleString("en-IN")}
                      </h2>
                      <p className="text-sm text-slate mb-4">
                        For: {nextInstallment.description}
                      </p>
                      <p className="text-md font-semibold text-light-slate">
                        Due by: {formatDate(nextInstallment.dueDate)}
                      </p>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-700/50 flex-grow text-center">
                      <h4 className="text-sm font-semibold text-slate mb-2">
                        How to Pay
                      </h4>
                      <p className="text-xs text-slate/80">
                        You can pay with cash at the institute's front desk, or
                        use the QR code / UPI ID for online payment.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-slate-900/40 gap-6 md:flex-row md:gap-8">
                    <div className="text-center">
                      <h3 className="font-semibold text-light-slate mb-2">
                        Scan & Pay
                      </h3>
                      <div className="p-3 bg-white rounded-lg shadow-lg">
                        <QrCode className="h-28 w-28 md:h-32 md:w-32 text-dark-navy" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate">Or use UPI ID:</p>
                      <div className="mt-1 flex items-center gap-2 px-3 py-1.5 rounded-md">
                        <p className="text-base font-semibold text-light-slate tracking-wider">
                          brightspark.jaipur@okhdfcbank
                        </p>
                        <button
                          onClick={handleCopy}
                          className="text-slate hover:text-brand-gold transition-colors p-1"
                          title="Copy UPI ID">
                          {copied ? (
                            <CheckCircle2
                              size={16}
                              className="text-green-400"
                            />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 rounded-2xl border border-green-500/30 bg-green-500/10 p-8 text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-400 mb-4" />
                <h2 className="text-3xl font-bold text-white">
                  Fees Fully Paid
                </h2>
                <p className="text-green-300 mt-2">
                  Thank you! All installments for your plan have been cleared.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <h2 className="text-xl font-semibold text-brand-gold mb-4">
        Installment History
      </h2>
      <div className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg divide-y divide-slate-700/50">
        {allInstallments.length > 0
          ? allInstallments.map((installment, index) => (
              <InstallmentRow key={index} installment={installment} />
            ))
          : !loading && (
              <div className="p-12 text-center text-slate">
                <p>
                  Your installment schedule will appear here once a payment plan
                  is assigned.
                </p>
              </div>
            )}
      </div>
    </div>
  );
}
