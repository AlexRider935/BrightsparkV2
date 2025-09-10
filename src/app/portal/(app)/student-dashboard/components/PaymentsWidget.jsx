"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import WidgetCard from "./WidgetCard";
import { CreditCard, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";

const PaymentsWidget = () => {
  const { user, initialising } = useAuth();
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialising || !user?.uid) {
      if (!initialising) setLoading(false);
      return;
    }

    const docRef = doc(db, "studentFeeDetails", user.uid);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setInstallments(docSnap.data().installments || []);
        } else {
          setError("No fee details found for this student.");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching payment details:", err);
        setError("Could not load payment details.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, initialising]);

  const { nextPayment, paymentHistory } = useMemo(() => {
    // Find the first upcoming payment that is pending
    const nextPayment = installments
      .filter((inst) => inst.status === "pending")
      .sort((a, b) => a.dueDate.toDate() - b.dueDate.toDate())[0];

    // Find the 3 most recent paid installments
    const paymentHistory = installments
      .filter((inst) => inst.status === "paid")
      .sort((a, b) => b.paymentDate.toDate() - a.paymentDate.toDate())
      .slice(0, 3);

    return { nextPayment, paymentHistory };
  }, [installments]);

  if (loading || initialising) {
    return (
      <WidgetCard title="Payments" Icon={CreditCard}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard title="Payments" Icon={CreditCard}>
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Payments"
      Icon={CreditCard}
      route="/portal/student-dashboard/payments">
      <div className="flex flex-col h-full">
        {/* Next Payment Section */}
        {nextPayment ? (
          <div className="mb-4 text-center">
            <p className="text-sm text-slate">{nextPayment.description}</p>
            <p className="text-3xl font-bold text-white tracking-tight my-1">
              ₹{nextPayment.amount.toLocaleString("en-IN")}
            </p>
            <p className="text-xs font-semibold text-amber-400">
              Due:{" "}
              {nextPayment.dueDate instanceof Timestamp
                ? format(nextPayment.dueDate.toDate(), "MMM d, yyyy")
                : "N/A"}
            </p>
            <button className="w-full mt-3 rounded-lg bg-brand-gold/20 py-2 text-sm font-bold text-brand-gold transition-colors hover:bg-brand-gold hover:text-dark-navy">
              Pay Now
            </button>
          </div>
        ) : (
          <div className="mb-4 text-center py-8">
            <CheckCircle2 className="mx-auto h-10 w-10 text-green-400" />
            <p className="mt-2 text-sm font-semibold text-light-slate">
              All dues cleared!
            </p>
            <p className="text-xs text-slate">No upcoming payments.</p>
          </div>
        )}

        <hr className="border-slate-700/50 my-2" />

        {/* Payment History List */}
        <div className="flex-grow">
          {paymentHistory.length > 0 ? (
            <ul className="space-y-3">
              {paymentHistory.map((payment, index) => (
                <li
                  key={index} // Using index as key is safe here as the list is stable
                  className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-slate/90">
                      {payment.description}
                    </p>
                    <p className="text-xs text-slate/70">
                      Paid:{" "}
                      {payment.paymentDate instanceof Timestamp
                        ? format(payment.paymentDate.toDate(), "MMM d, yyyy")
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-green-400 shrink-0">
                    <CheckCircle2 size={14} />
                    <span>Paid</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-slate-500">No payment history yet.</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate/60 mt-4">
          Receipts available on the payments page.
        </p>
      </div>
    </WidgetCard>
  );
};

export default PaymentsWidget;
