"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/firebase/config";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import {
  Users,
  ChevronDown,
  Search,
  Phone,
  Eye,
  X,
  Loader2,
  Cake,
  Calendar,
  UserSquare,
  MapPin,
  Mail,
} from "lucide-react";
import { format } from "date-fns";

// --- UPDATED: Student Detail Modal ---
const StudentDetailModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  const DetailItem = ({ Icon, label, value }) => (
    <div>
      <div className="flex items-center gap-2 text-sm text-slate">
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <p className="mt-1 font-semibold text-light-slate break-words">
        {value || "N/A"}
      </p>
    </div>
  );

  // Helper to format the address from multiple fields
  const getFullAddress = () => {
    const parts = [
      student.addressStreet,
      student.addressState,
      student.addressPincode,
    ];
    const validParts = parts.filter((p) => p); // Filter out empty or null parts
    if (validParts.length === 0) return "N/A";
    return validParts.join(", ");
  };

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
          className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-dark-navy/80 p-6 shadow-2xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-slate-700 flex items-center justify-center font-bold text-3xl text-brand-gold shrink-0">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-brand-gold">
                  {student.name}
                </h2>
                <p className="text-slate">
                  Roll No: {student.rollNumber} | Batch: {student.batch}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-slate-700/50 pt-6">
              <DetailItem
                Icon={Cake}
                label="Date of Birth"
                value={
                  student.dob instanceof Timestamp
                    ? format(student.dob.toDate(), "MMM dd, yyyy")
                    : "N/A"
                }
              />
              <DetailItem
                Icon={Calendar}
                label="Admission Date"
                value={
                  student.admissionDate instanceof Timestamp
                    ? format(student.admissionDate.toDate(), "MMM dd, yyyy")
                    : "N/A"
                }
              />
              <DetailItem Icon={Users} label="Gender" value={student.gender} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-slate-700/50 pt-6">
              <DetailItem
                Icon={UserSquare}
                label="Father's Name"
                value={student.fatherName}
              />
              <DetailItem
                Icon={Phone}
                label="Father's Contact"
                value={student.fatherContact}
              />
              <DetailItem
                Icon={Mail}
                label="Parent's Email"
                value={student.parentEmail}
              />
            </div>
            <div className="border-t border-slate-700/50 pt-6">
              <DetailItem
                Icon={MapPin}
                label="Address"
                value={getFullAddress()}
              />
            </div>
          </div>

          <div className="flex justify-end pt-8 mt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20">
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- UPDATED: Student Row ---
const StudentRow = ({ student, index, onView }) => (
  <motion.div
    className="grid grid-cols-6 gap-4 items-center p-4"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}>
    <div className="col-span-3 flex items-center gap-4">
      <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-brand-gold shrink-0">
        {student.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="font-semibold text-light-slate">{student.name}</p>
        <p className="text-xs text-slate">Roll No: {student.rollNumber}</p>
      </div>
    </div>
    <div className="col-span-2">
      {/* --- FIX: Displaying fatherContact now --- */}
      <div className="flex items-center gap-2 text-sm text-slate">
        <Phone size={14} />
        <span>{student.fatherContact || "N/A"}</span>
      </div>
    </div>
    <div className="col-span-1 text-right">
      <button
        onClick={() => onView(student)}
        className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-brand-gold hover:text-dark-navy transition-colors">
        <Eye size={14} />
        <span>View</span>
      </button>
    </div>
  </motion.div>
);

export default function StudentRosterPage() {
  const [allStudents, setAllStudents] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingStudent, setViewingStudent] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubStudents = onSnapshot(
      query(collection(db, "students"), orderBy("rollNumber")), // Better to sort by roll number
      (snap) => {
        setAllStudents(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => d.id !== "--placeholder--")
        );
      }
    );
    const unsubBatches = onSnapshot(
      query(collection(db, "batches"), orderBy("name")),
      (snap) => {
        setAllBatches(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => d.id !== "--placeholder--")
        );
        setLoading(false);
      }
    );
    return () => {
      unsubStudents();
      unsubBatches();
    };
  }, []);

  const filteredStudents = useMemo(() => {
    if (!selectedBatch) return [];

    const studentsInBatch = allStudents.filter(
      (student) => student.batch === selectedBatch
    );

    if (!searchTerm) return studentsInBatch;

    return studentsInBatch.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.rollNumber &&
          student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [selectedBatch, searchTerm, allStudents]);

  const handleViewStudent = (student) => {
    setViewingStudent(student);
  };

  return (
    <div>
      <StudentDetailModal
        isOpen={!!viewingStudent}
        onClose={() => setViewingStudent(null)}
        student={viewingStudent}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Student Roster
      </h1>
      <p className="text-lg text-slate mb-8">
        View student details for any batch in the institute.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 p-4 rounded-xl border border-white/10 bg-slate-900/20">
        <div className="relative w-full sm:w-64">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
            <option value="">Select a Batch to View Roster</option>
            {allBatches.map((batch) => (
              <option key={batch.id} value={batch.name}>
                {batch.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative w-full sm:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 p-3 rounded-lg border border-white/10 bg-slate-900/50 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
            disabled={!selectedBatch}
          />
        </div>
      </div>

      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg"
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}>
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
          </div>
        ) : selectedBatch ? (
          <>
            <div className="grid grid-cols-6 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate">
              <div className="col-span-3">Student Name</div>
              {/* --- FIX: Updated header --- */}
              <div className="col-span-2">Father's Contact</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            <div className="divide-y divide-slate-700/50">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    index={index}
                    onView={handleViewStudent}
                  />
                ))
              ) : (
                <p className="p-12 text-center text-slate">
                  No students found matching your criteria in this batch.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-slate">
            <Users className="mx-auto h-12 w-12 text-slate-500" />
            <h3 className="mt-4 text-xl font-semibold text-white">
              Select a Batch
            </h3>
            <p className="mt-1">
              Choose a batch from the dropdown above to see the list of
              students.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
