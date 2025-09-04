"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { db } from "@/firebase/config";
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";

// --- MAIN PAGE COMPONENT ---
export default function AddNewStudentPage() {
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    dob: "",
    gender: "",
    admissionDate: new Date().toISOString().split("T")[0],
    batch: "",
    status: "Active",
    parentName: "",
    parentContact: "",
    emergencyContact: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    // Focus the first input on page load
    nameInputRef.current?.focus();

    // Fetch batches for the dropdown
    const qBatches = query(collection(db, "batches"), orderBy("name"));
    const unsubscribeBatches = onSnapshot(qBatches, (snapshot) => {
      setBatches(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribeBatches();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      let dataToSave = { ...formData };
      // Convert date strings to Timestamps for Firestore
      dataToSave.dob = Timestamp.fromDate(new Date(dataToSave.dob));
      dataToSave.admissionDate = Timestamp.fromDate(
        new Date(dataToSave.admissionDate)
      );

      await addDoc(collection(db, "students"), {
        ...dataToSave,
        createdAt: Timestamp.now(),
      });

      // Redirect back to the main students list on success
      router.push("/portal/admin-dashboard/students");
    } catch (error) {
      console.error("Error enrolling student:", error);
      setIsSaving(false); // Re-enable button on error
    }
  };

  return (
    <>
      <style jsx global>{`
        .form-input {
          @apply w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-200;
        }
        .form-input[type="date"] {
          @apply pr-2;
        }
        .form-prefix {
          @apply inline-flex items-center px-3 rounded-l-lg border border-r-0 border-white/10 bg-slate-900/50 text-slate;
        }
      `}</style>
      <main>
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/portal/admin-dashboard/students"
            className="p-2 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-1">
              Enroll New Student
            </h1>
            <p className="text-base text-slate">
              Enter the details for the new student enrollment.
            </p>
          </div>
        </div>

        <motion.div
          className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg p-6 sm:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate mb-2">
                  Student Full Name
                </label>
                <input
                  ref={nameInputRef}
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                  className="w-full form-input"
                />
              </div>
              <div>
                <label
                  htmlFor="rollNumber"
                  className="block text-sm font-medium text-slate mb-2">
                  Roll Number
                </label>
                <input
                  id="rollNumber"
                  name="rollNumber"
                  value={formData.rollNumber || ""}
                  onChange={handleChange}
                  required
                  className="w-full form-input"
                />
              </div>
              <div>
                <label
                  htmlFor="dob"
                  className="block text-sm font-medium text-slate mb-2">
                  Date of Birth
                </label>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  value={formData.dob || ""}
                  onChange={handleChange}
                  required
                  className="w-full form-input"
                />
              </div>
            </fieldset>

            <fieldset className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-slate mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender || ""}
                  onChange={handleChange}
                  required
                  className="w-full form-input">
                  <option value="" disabled>
                    Select...
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="admissionDate"
                  className="block text-sm font-medium text-slate mb-2">
                  Admission Date
                </label>
                <input
                  id="admissionDate"
                  name="admissionDate"
                  type="date"
                  value={formData.admissionDate || ""}
                  onChange={handleChange}
                  required
                  className="w-full form-input"
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="batch"
                  className="block text-sm font-medium text-slate mb-2">
                  Assign to Batch
                </label>
                <select
                  id="batch"
                  name="batch"
                  value={formData.batch || ""}
                  onChange={handleChange}
                  required
                  className="w-full form-input">
                  <option value="" disabled>
                    Select Batch
                  </option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} ({b.classLevel})
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>

            <fieldset className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-700/50 pt-6">
              <div>
                <label
                  htmlFor="parentName"
                  className="block text-sm font-medium text-slate mb-2">
                  Parent's Name
                </label>
                <input
                  id="parentName"
                  name="parentName"
                  value={formData.parentName || ""}
                  onChange={handleChange}
                  required
                  className="w-full form-input"
                />
              </div>
              <div>
                <label
                  htmlFor="parentContact"
                  className="block text-sm font-medium text-slate mb-2">
                  Parent's Contact
                </label>
                <div className="flex items-center">
                  <span className="form-prefix">+91</span>
                  <input
                    id="parentContact"
                    name="parentContact"
                    type="tel"
                    maxLength="10"
                    value={formData.parentContact || ""}
                    onChange={handleChange}
                    required
                    className="w-full form-input rounded-l-none"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="emergencyContact"
                  className="block text-sm font-medium text-slate mb-2">
                  Emergency Contact
                </label>
                <div className="flex items-center">
                  <span className="form-prefix">+91</span>
                  <input
                    id="emergencyContact"
                    name="emergencyContact"
                    type="tel"
                    maxLength="10"
                    value={formData.emergencyContact || ""}
                    onChange={handleChange}
                    className="w-full form-input rounded-l-none"
                  />
                </div>
              </div>
            </fieldset>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-slate mb-2">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                rows="3"
                className="w-full form-input"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link
                href="/portal/admin-dashboard/students"
                className="px-6 py-2.5 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20 transition-colors">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400 flex items-center gap-2 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus size={16} />
                )}
                <span>{isSaving ? "Enrolling..." : "Enroll Student"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </>
  );
}
