"use client";

import WidgetCard from "./WidgetCard";
import { CreditCard, CheckCircle2 } from "lucide-react";

// Mock data for payments, assuming a consistent monthly fee.
const mockPayments = [
  {
    id: 1,
    month: "September Fee",
    amount: 5000,
    date: "Due: Sep 15, 2025",
    status: "Due",
  },
  {
    id: 2,
    month: "August Fee",
    amount: 5000,
    date: "Paid: Aug 14, 2025",
    status: "Paid",
  },
  {
    id: 3,
    month: "July Fee",
    amount: 5000,
    date: "Paid: Jul 15, 2025",
    status: "Paid",
  },
  {
    id: 4,
    month: "June Fee",
    amount: 5000,
    date: "Paid: Jun 13, 2025",
    status: "Paid",
  },
];

const PaymentsWidget = () => {
  const nextPayment = mockPayments[0];
  const paymentHistory = mockPayments.slice(1, 4);

  return (
    <WidgetCard title="Payments" Icon={CreditCard} route="/portal/payments">
      <div className="flex flex-col h-full">
        {/* Next Payment Section */}
        <div className="mb-4 text-center">
          <p className="text-sm text-slate">{nextPayment.month}</p>
          <p className="text-3xl font-bold text-white tracking-tight my-1">
            ₹{nextPayment.amount.toLocaleString("en-IN")}
          </p>
          <p className="text-xs font-semibold text-amber-400">
            {nextPayment.date}
          </p>
          <button className="w-full mt-3 rounded-lg bg-brand-gold/20 py-2 text-sm font-bold text-brand-gold transition-colors hover:bg-brand-gold hover:text-dark-navy">
            Pay Now
          </button>
        </div>

        {/* Separator */}
        <hr className="border-slate-700/50 my-2" />

        {/* Payment History List */}
        <div className="flex-grow">
          <ul className="space-y-3">
            {paymentHistory.map((payment) => (
              <li
                key={payment.id}
                className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-slate/90">{payment.month}</p>
                  <p className="text-xs text-slate/70">{payment.date}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-green-400 shrink-0">
                  <CheckCircle2 size={14} />
                  <span>{payment.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-center text-xs text-slate/60 mt-4">
          Receipts available on the payments page.
        </p>
      </div>
    </WidgetCard>
  );
};

export default PaymentsWidget;
