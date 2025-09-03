"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { UserPlus, PlusCircle, Check, Phone, Eye } from "lucide-react";

// --- MOCK DATA ---
const mockInquiries = [
  {
    id: "inq1",
    studentName: "Rohan Mehra",
    classApplied: "Class VI",
    parentName: "Mr. Mehra",
    contact: "+91 99887 76655",
    inquiryDate: new Date("2025-09-02"),
    status: "New Inquiry",
  },
  {
    id: "inq2",
    studentName: "Priya Singh",
    classApplied: "Class VII",
    parentName: "Mrs. Singh",
    contact: "+91 99887 76644",
    inquiryDate: new Date("2025-08-30"),
    status: "Contacted",
  },
  {
    id: "inq3",
    studentName: "Aarav Sharma",
    classApplied: "Class VI",
    parentName: "Mr. Sharma",
    contact: "+91 99887 76633",
    inquiryDate: new Date("2025-08-28"),
    status: "Enrolled",
  },
  {
    id: "inq4",
    studentName: "Sanya Gupta",
    classApplied: "Class VIII",
    parentName: "Ms. Gupta",
    contact: "+91 99887 76622",
    inquiryDate: new Date("2025-08-25"),
    status: "New Inquiry",
  },
  {
    id: "inq5",
    studentName: "Vikram Rathore",
    classApplied: "Class IX",
    parentName: "Mr. Rathore",
    contact: "+91 99887 76611",
    inquiryDate: new Date("2025-08-22"),
    status: "Rejected",
  },
];

const filters = ["All", "New Inquiry", "Contacted", "Enrolled", "Rejected"];

// --- Reusable Components ---
const StatusBadge = ({ status }) => {
  const styles = {
    "New Inquiry": "bg-sky-500/20 text-sky-400",
    Contacted: "bg-amber-500/20 text-amber-400",
    Enrolled: "bg-green-500/20 text-green-300",
    Rejected: "bg-red-900/40 text-red-400",
  };
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

export default function AdmissionsPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredInquiries = useMemo(() => {
    if (activeFilter === "All") return mockInquiries;
    return mockInquiries.filter((i) => i.status === activeFilter);
  }, [activeFilter]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
            Admissions Pipeline
          </h1>
          <p className="text-lg text-slate">
            Manage new student inquiries and enrollments.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 shrink-0">
          <PlusCircle size={18} />
          <span>Add New Inquiry</span>
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-700/50">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "border-b-2 border-brand-gold text-brand-gold"
                : "text-slate hover:text-white"
            }`}>
            {filter}
          </button>
        ))}
      </div>

      {/* Inquiries Table */}
      <motion.div
        key={activeFilter}
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase tracking-wider">
          <div className="col-span-3">Student Name</div>
          <div className="col-span-2">Class Applied</div>
          <div className="col-span-3">Parent Contact</div>
          <div className="col-span-2">Inquiry Date</div>
          <div className="col-span-2">Status</div>
        </div>
        <div className="divide-y divide-slate-700/50">
          {filteredInquiries.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-4 items-center p-4 text-sm">
              <div className="col-span-3 font-medium text-light-slate">
                {item.studentName}
              </div>
              <div className="col-span-2 text-slate">{item.classApplied}</div>
              <div className="col-span-3">
                <p className="text-slate">{item.parentName}</p>
                <p className="text-xs text-slate/70">{item.contact}</p>
              </div>
              <div className="col-span-2 text-slate">
                {item.inquiryDate.toLocaleDateString("en-CA")}
              </div>
              <div className="col-span-2">
                <StatusBadge status={item.status} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
