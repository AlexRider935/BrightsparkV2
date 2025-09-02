"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  CheckCircle2,
  Download,
  QrCode,
  Wallet,
  BellRing,
  Copy,
} from "lucide-react";

// --- MOCK DATA ---
const mockPayments = [
  {
    id: 1,
    description: "September Fee",
    amount: 5000,
    date: new Date("2025-09-15"),
    status: "Due",
  },
  {
    id: 2,
    description: "August Fee",
    amount: 5000,
    date: new Date("2025-08-14"),
    status: "Paid",
    transactionId: "TXN84729472B",
    method: "UPI",
  },
  {
    id: 3,
    description: "July Fee",
    amount: 5000,
    date: new Date("2025-07-15"),
    status: "Paid",
    transactionId: "TXN73927492C",
    method: "Cash",
  },
  {
    id: 4,
    description: "June Fee",
    amount: 5000,
    date: new Date("2025-06-13"),
    status: "Paid",
    transactionId: "TXN69381734D",
    method: "UPI",
  },
];

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

// --- Component for a single row in the payment history ---
const PaymentHistoryRow = ({ payment }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
    <div className="flex items-center gap-4">
      <div className="bg-green-500/10 p-2 rounded-lg border border-green-500/20">
        <CheckCircle2 className="h-5 w-5 text-green-400" />
      </div>
      <div>
        <p className="font-semibold text-light-slate">{payment.description}</p>
        <div className="flex items-center gap-2 text-xs text-slate">
          <span>Paid on: {formatDate(payment.date)}</span>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1">
            {payment.method === "Cash" ? (
              <Wallet size={12} />
            ) : (
              <CreditCard size={12} />
            )}
            <span>via {payment.method}</span>
          </div>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
      <p className="font-semibold text-lg text-white">
        ₹{payment.amount.toLocaleString("en-IN")}
      </p>
      <button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-brand-gold hover:text-dark-navy transition-colors shrink-0 ml-auto">
        <Download size={14} />
        <span>Receipt</span>
      </button>
    </div>
  </div>
);

export default function PaymentsPage() {
  const [notification, setNotification] = useState("");
  const [copied, setCopied] = useState(false);

  const nextPayment = mockPayments.find((p) => p.status === "Due");
  const paymentHistory = mockPayments
    .filter((p) => p.status === "Paid")
    .sort((a, b) => b.date - a.date);

  const handleNotify = (method) => {
    setNotification(`Notification sent for ${method} payment.`);
    setTimeout(() => setNotification(""), 5000); // Reset after 5 seconds
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("brightspark.jaipur@okhdfcbank");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Fee Payments
      </h1>
      <p className="text-lg text-slate mb-8">
        Manage your payments and view your transaction history.
      </p>

      {/* Next Payment Section */}
      {nextPayment && (
        <motion.div
          className="mb-8 rounded-2xl border border-brand-gold/30 bg-slate-900/20 overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Side: Payment Details & Notification */}
            <div className="p-6 md:p-8 flex flex-col">
              <div>
                <p className="text-brand-gold font-semibold">
                  Next Payment Due
                </p>
                <h2 className="text-4xl font-bold text-white mt-2">
                  ₹{nextPayment.amount.toLocaleString("en-IN")}
                </h2>
                <p className="text-sm text-slate mb-4">
                  For: {nextPayment.description}
                </p>
                <p className="text-md font-semibold text-light-slate">
                  Due by: {formatDate(nextPayment.date)}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-700/50 flex-grow">
                <h4 className="text-sm font-semibold text-slate mb-2">
                  Payment Methods:
                </h4>
                <ul className="list-disc list-inside text-sm text-slate/80 space-y-1">
                  <li>Pay with cash at the institute's front desk.</li>
                  <li>
                    Scan the QR code or use the UPI ID for online payment.
                  </li>
                </ul>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700/50">
                {notification ? (
                  <p className="text-sm text-center text-green-400 font-semibold p-2">
                    {notification}
                  </p>
                ) : (
                  <div>
                    <h4 className="text-sm font-semibold text-slate mb-2 text-center">
                      Already Paid? Notify the Institute
                    </h4>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleNotify("Cash")}
                        className="flex-1 text-xs flex items-center justify-center gap-2 text-slate hover:text-brand-gold transition-colors p-2 rounded-md hover:bg-white/5">
                        <Wallet size={14} /> Notify Cash Payment
                      </button>
                      <button
                        onClick={() => handleNotify("UPI")}
                        className="flex-1 text-xs flex items-center justify-center gap-2 text-slate hover:text-brand-gold transition-colors p-2 rounded-md hover:bg-white/5">
                        <CreditCard size={14} /> Notify UPI Payment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: QR Code and UPI ID */}
            <div className="flex flex-col items-center justify-center p-6 md:p-8 text-center gap-6 md:flex-row md:gap-8">
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
                <div className="mt-1 flex items-center gap-2px-3 py-1.5 rounded-md">
                  <p className="text-base font-semibold text-light-slate tracking-wider">
                    brightspark.jaipur@okhdfcbank
                  </p>
                  <button
                    onClick={handleCopy}
                    className="text-slate hover:text-brand-gold transition-colors p-1"
                    title="Copy UPI ID">
                    {copied ? (
                      <CheckCircle2 size={16} className="text-green-400" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Payment History Section */}
      <h2 className="text-xl font-semibold text-brand-gold mb-4">
        Payment History
      </h2>
      <div className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg divide-y divide-slate-700/50">
        {paymentHistory.map((payment) => (
          <PaymentHistoryRow key={payment.id} payment={payment} />
        ))}
      </div>
    </div>
  );
}
