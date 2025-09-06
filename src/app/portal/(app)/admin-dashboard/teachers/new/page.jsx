"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { db } from "@/firebase/config";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import {
  ArrowLeft,
  UserPlus,
  Loader2,
  KeyRound,
  User as UserIcon,
  Briefcase,
  Check,
  BookMarked,
  Home,
  Landmark,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import ImageUploader from "../../../components/ImageUploader";

// --- Reusable Themed Components ---

const FormSection = ({ title, icon: Icon, children, className = "" }) => (
  <section
    className={`rounded-xl border border-white/10 bg-slate-900/30 p-6 backdrop-blur-sm ${className}`}>
    <div className="flex items-center gap-3 mb-5 border-b border-slate-700/50 pb-3">
      {Icon && <Icon className="h-6 w-6 text-brand-gold" />}
      <h2 className="text-lg font-semibold text-brand-gold tracking-wide">
        {title}
      </h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-5 gap-y-6">
      {children}
    </div>
  </section>
);

const CustomCheckbox = ({ id, label, value, checked, onChange }) => (
  <label
    htmlFor={id}
    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
    <div className="relative w-5 h-5">
      <input
        id={id}
        type="checkbox"
        value={value}
        checked={checked}
        onChange={onChange}
        className="absolute opacity-0 w-full h-full cursor-pointer"
      />
      <div
        className={`w-5 h-5 rounded border-2 ${
          checked ? "border-brand-gold bg-brand-gold/20" : "border-slate-600"
        } flex items-center justify-center transition-all`}>
        {checked && <Check className="h-3.5 w-3.5 text-brand-gold" />}
      </div>
    </div>
    <span className="text-light-slate select-none">{label}</span>
  </label>
);

// --- MAIN PAGE COMPONENT ---
export default function AddNewTeacherPage() {
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const firstNameInputRef = useRef(null);

  const [formData, setFormData] = useState({
    photoURL: "",
    username: "", // Changed from email
    password: "",
    firstName: "",
    lastName: "",
    employeeId: "",
    dob: "",
    guardianName: "",
    joiningDate: new Date().toISOString().split("T")[0],
    contact: "",
    whatsappNumber: "",
    addressStreet: "",
    addressState: "",
    addressPincode: "",
    presentSchool: "",
    subjects: [],
    batches: [],
    status: "Active",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankBranchAddress: "",
    upiNumber: "",
  });

  useEffect(() => {
    firstNameInputRef.current?.focus();
    // Fetch batches and subjects
    const unsubBatches = onSnapshot(
      query(collection(db, "batches"), orderBy("name")),
      (s) => setBatches(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubSubjects = onSnapshot(
      query(collection(db, "subjects"), orderBy("name")),
      (s) => setSubjects(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    // --- NEW: Generate Next Employee ID ---
    const generateNextEmployeeId = async () => {
      const PREFIX = "23BST";
      const teachersSnapshot = await getDocs(collection(db, "teachers"));
      let maxId = 0;
      teachersSnapshot.forEach((doc) => {
        const eid = doc.data().employeeId;
        if (eid && eid.startsWith(PREFIX)) {
          const numPart = parseInt(eid.substring(PREFIX.length), 10);
          if (!isNaN(numPart) && numPart > maxId) {
            maxId = numPart;
          }
        }
      });
      const nextId = maxId + 1;
      setFormData((prev) => ({ ...prev, employeeId: `${PREFIX}${nextId}` }));
    };

    generateNextEmployeeId();

    return () => {
      unsubBatches();
      unsubSubjects();
    };
  }, []);

  // --- NEW: useEffect to auto-generate username and password ---
  useEffect(() => {
    const { firstName, dob, employeeId } = formData;

    // Username is the employee ID
    const newUsername = employeeId;

    // Password is firstname(small) + @ + dob(ddmmyyyy)
    let newPassword = "";
    if (firstName && dob) {
      const formattedDob = dob.split("-").reverse().join(""); // yyyy-mm-dd to ddmmyyyy
      newPassword = `${firstName.toLowerCase().trim()}@${formattedDob}`;
    }

    setFormData((prev) => ({
      ...prev,
      username: newUsername,
      password: newPassword,
    }));
  }, [formData.firstName, formData.dob, formData.employeeId]);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleArrayChange = (field, itemName, isChecked) => {
    setFormData((prev) => ({
      ...prev,
      [field]: isChecked
        ? [...prev[field], itemName]
        : prev[field].filter((i) => i !== itemName),
    }));
  };

  const handleUploadComplete = (url) => {
    setFormData((prev) => ({ ...prev, photoURL: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setError(null);
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setIsSaving(true);
    try {
      // NOTE: Ensure your API route is updated to handle all these new fields
      const res = await fetch("/api/create-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add teacher.");
      }
      router.push("/portal/admin-dashboard/teachers");
    } catch (err) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  const formInputClasses =
    "w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-light-slate placeholder:text-slate-500 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-200";

  return (
    <main>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/portal/admin-dashboard/teachers"
          className="p-2 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-1">
            Add New Teacher
          </h1>
          <p className="text-base text-slate">
            Create a profile and portal login for a new faculty member.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* --- Main Column (Left) --- */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex flex-col md:flex-row gap-8 items-start p-6 rounded-xl border border-white/10 bg-slate-900/30 backdrop-blur-sm">
                <div className="w-full md:w-auto flex justify-center shrink-0">
                  <ImageUploader onUploadComplete={handleUploadComplete} />
                </div>
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">
                  <div className="sm:col-span-2">
                    <h2 className="text-lg font-semibold text-brand-gold tracking-wide mb-2">
                      Personal & Role Details
                    </h2>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate mb-2">
                      First Name
                    </label>
                    <input
                      ref={firstNameInputRef}
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className={formInputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate mb-2">
                      Last Name
                    </label>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className={formInputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate mb-2">
                      Employee ID
                    </label>
                    <input
                      name="employeeId"
                      value={formData.employeeId}
                      readOnly
                      className={`${formInputClasses} bg-slate-800 cursor-not-allowed`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className={`${formInputClasses} pr-2`}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate mb-2">
                      Father/Husband's Name
                    </label>
                    <input
                      name="guardianName"
                      value={formData.guardianName}
                      onChange={handleChange}
                      className={formInputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate mb-2">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleChange}
                      required
                      className={`${formInputClasses} pr-2`}
                    />
                  </div>
                </div>
              </div>
              <FormSection title="Contact Information" icon={Home}>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate mb-2">
                    Contact Number
                  </label>
                  <input
                    name="contact"
                    maxLength="10"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                    className={formInputClasses}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    name="whatsappNumber"
                    maxLength="10"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    className={formInputClasses}
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium text-slate mb-2">
                    Street / Area
                  </label>
                  <input
                    name="addressStreet"
                    value={formData.addressStreet}
                    onChange={handleChange}
                    className={formInputClasses}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate mb-2">
                    State
                  </label>
                  <input
                    name="addressState"
                    value={formData.addressState}
                    onChange={handleChange}
                    className={formInputClasses}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate mb-2">
                    Pincode
                  </label>
                  <input
                    name="addressPincode"
                    value={formData.addressPincode}
                    onChange={handleChange}
                    className={formInputClasses}
                  />
                </div>
              </FormSection>
              <FormSection title="Professional Assignments" icon={BookMarked}>
                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium text-slate mb-2">
                    Present School Name
                  </label>
                  <input
                    name="presentSchool"
                    value={formData.presentSchool}
                    onChange={handleChange}
                    className={formInputClasses}
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium text-slate mb-2">
                    Subjects Taught
                  </label>
                  <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 grid grid-cols-2 max-h-40 overflow-y-auto">
                    {subjects.map((s) => (
                      <CustomCheckbox
                        key={s.id}
                        id={`sub-${s.id}`}
                        label={s.name}
                        value={s.name}
                        checked={formData.subjects.includes(s.name)}
                        onChange={(e) =>
                          handleArrayChange(
                            "subjects",
                            e.target.value,
                            e.target.checked
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium text-slate mb-2">
                    Batches Assigned
                  </label>
                  <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 grid grid-cols-2 max-h-40 overflow-y-auto">
                    {batches.map((b) => (
                      <CustomCheckbox
                        key={b.id}
                        id={`batch-${b.id}`}
                        label={b.name}
                        value={b.name}
                        checked={formData.batches.includes(b.name)}
                        onChange={(e) =>
                          handleArrayChange(
                            "batches",
                            e.target.value,
                            e.target.checked
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              </FormSection>
            </div>
            {/* --- Sidebar Column (Right) --- */}
            <div className="lg:col-span-1 space-y-8">
              <FormSection title="Login Credentials" icon={UserCheck}>
                <div className="sm:col-span-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate mb-2">
                    <UserIcon size={14} /> Username
                  </label>
                  <input
                    name="username"
                    value={formData.username}
                    readOnly
                    className={`${formInputClasses} bg-slate-800 cursor-not-allowed`}
                    placeholder="Auto-generated from Employee ID"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate mb-2">
                    <KeyRound size={14} /> Password
                  </label>
                  <input
                    name="password"
                    type="text"
                    value={formData.password}
                    readOnly
                    className={`${formInputClasses} bg-slate-800 cursor-not-allowed`}
                    placeholder="Auto-generated from Name + DOB"
                  />
                </div>
              </FormSection>
              <FormSection title="Financial Details" icon={Landmark}>
                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium text-slate mb-2">
                    Bank Name
                  </label>
                  <input
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className={formInputClasses}
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium text-slate mb-2">
                    Account Holder's Name
                  </label>
                  <input
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleChange}
                    className={formInputClasses}
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium text-slate mb-2">
                    Account Number
                  </label>
                  <input
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className={formInputClasses}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate mb-2">
                    IFSC Code
                  </label>
                  <input
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    className={formInputClasses}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate mb-2">
                    UPI Number
                  </label>
                  <input
                    name="upiNumber"
                    value={formData.upiNumber}
                    onChange={handleChange}
                    className={formInputClasses}
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium text-slate mb-2">
                    Branch Address
                  </label>
                  <input
                    name="bankBranchAddress"
                    value={formData.bankBranchAddress}
                    onChange={handleChange}
                    className={formInputClasses}
                  />
                </div>
              </FormSection>
            </div>
          </div>
          {/* --- Buttons --- */}
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-900/50 border border-red-500/30 text-red-300 text-sm p-3 rounded-lg text-center mb-6">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
              <Link
                href="/portal/admin-dashboard/teachers"
                className="px-6 py-2.5 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20 transition-colors">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400 flex items-center gap-2 disabled:bg-slate-600 disabled:cursor-not-allowed">
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus size={16} />
                )}
                <span>{isSaving ? "Adding..." : "Add Teacher"}</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </main>
  );
}
