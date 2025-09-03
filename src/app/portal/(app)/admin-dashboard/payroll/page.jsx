"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  PlusCircle,
  CheckCircle,
  Clock,
  Send,
  Download,
} from "lucide-react";
import { format, subMonths } from "date-fns";

// --- MOCK DATA ---
const mockPayrollData = {
  "2025-09": [
    {
      id: "pay1",
      teacherName: "Mr. A. K. Sharma",
      employeeId: "BS-T001",
      baseSalary: 60000,
      deductions: 2000,
      netPayable: 58000,
      status: "Pending",
      paymentDate: null,
    },
    {
      id: "pay2",
      teacherName: "Mrs. S. Gupta",
      employeeId: "BS-T002",
      baseSalary: 55000,
      deductions: 1800,
      netPayable: 53200,
      status: "Pending",
      paymentDate: null,
    },
  ],
  "2025-08": [
    {
      id: "pay3",
      teacherName: "Mr. A. K. Sharma",
      employeeId: "BS-T001",
      baseSalary: 60000,
      deductions: 2000,
      netPayable: 58000,
      status: "Paid",
      paymentDate: new Date("2025-08-30"),
    },
    {
      id: "pay4",
      teacherName: "Mrs. S. Gupta",
      employeeId: "BS-T002",
      baseSalary: 55000,
      deductions: 1800,
      netPayable: 53200,
      status: "Paid",
      paymentDate: new Date("2025-08-30"),
    },
    {
      id: "pay5",
      teacherName: "Mr. R. Verma",
      employeeId: "BS-T003",
      baseSalary: 50000,
      deductions: 1500,
      netPayable: 48500,
      status: "Paid",
      paymentDate: new Date("2025-08-31"),
    },
  ],
};

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

export default function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [payrollForMonth, setPayrollForMonth] = useState([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0 });

  useEffect(() => {
    const data = mockPayrollData[selectedMonth] || [];
    setPayrollForMonth(data);

    // Calculate stats for the selected month
    const total = data.reduce((sum, item) => sum + item.netPayable, 0);
    const paid = data
      .filter((i) => i.status === "Paid")
      .reduce((sum, i) => sum + i.netPayable, 0);
    setStats({ total, paid, pending: total - paid });
  }, [selectedMonth]);

  // Generate month options for the dropdown (e.g., current month and last 5 months)
  const monthOptions = Array.from({ length: 6 }).map((_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy"),
    };
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
            Teacher Payroll
          </h1>
          <p className="text-lg text-slate">
            Manage and process monthly salary payments for faculty.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Generate New Payroll</span>
        </button>
      </div>

      {/* Month Selector & Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
          <label className="text-md font-medium text-slate mb-2 block">
            Select Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            title="Total Payroll"
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

      {/* Payroll Table */}
      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}>
        <div className="grid grid-cols-7 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase tracking-wider">
          <div className="col-span-2">Teacher</div>
          <div>Base Salary</div>
          <div>Deductions</div>
          <div>Net Payable</div>
          <div className="text-center">Status</div>
          <div className="text-right">Actions</div>
        </div>
        <div className="divide-y divide-slate-700/50">
          {payrollForMonth.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-7 gap-4 items-center p-4 text-sm">
              <div className="col-span-2">
                <p className="font-medium text-light-slate">
                  {item.teacherName}
                </p>
                <p className="text-xs text-slate">{item.employeeId}</p>
              </div>
              <div className="text-slate">
                ₹{item.baseSalary.toLocaleString("en-IN")}
              </div>
              <div className="text-slate">
                - ₹{item.deductions.toLocaleString("en-IN")}
              </div>
              <div className="font-semibold text-white">
                ₹{item.netPayable.toLocaleString("en-IN")}
              </div>
              <div className="text-center">
                <StatusBadge status={item.status} />
              </div>
              <div className="flex justify-end gap-2">
                {item.status === "Pending" ? (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-dark-navy transition-colors">
                    <Send size={14} /> Pay
                  </button>
                ) : (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20 transition-colors">
                    <Download size={14} /> Payslip
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
