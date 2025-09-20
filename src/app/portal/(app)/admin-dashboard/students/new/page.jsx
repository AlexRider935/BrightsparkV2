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
  ClipboardUser,
  Shield,
  NotebookPen,
  UserCheck,
  ChevronDown,
  BookMarked,
  Home,
  Check,
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
export default function AddNewStudentPage() {
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const firstNameInputRef = useRef(null);

  const [formData, setFormData] = useState({
    photoURL: "",
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    rollNumber: "",
    dob: "",
    gender: "",
    admissionDate: new Date().toISOString().split("T")[0],
    batch: "",
    classLevel: "", // --- MODIFIED: Added classLevel to store the student's specific class
    status: "Active",
    fatherName: "",
    fatherContact: "",
    motherName: "",
    motherContact: "",
    parentEmail: "",
    whatsappNumber: "",
    addressStreet: "",
    addressState: "",
    addressPincode: "",
    subjects: [],
    presentSchool: "",
    specialRequest: "",
  });

  useEffect(() => {
    firstNameInputRef.current?.focus();

    const qBatches = query(collection(db, "batches"), orderBy("name"));
    const unsubBatches = onSnapshot(qBatches, (s) =>
      setBatches(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      const snapshot = await getDocs(collection(db, "subjects"));
      setSubjects(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoadingSubjects(false);
    };
    fetchSubjects();

    const generateNextRollNumber = async () => {
      const ROLL_NUMBER_PREFIX = "23BS";
      const STARTING_NUMBER = 151;

      const studentsCollection = collection(db, "students");
      const studentsSnapshot = await getDocs(studentsCollection);

      if (studentsSnapshot.empty) {
        setFormData((prev) => ({
          ...prev,
          rollNumber: `${ROLL_NUMBER_PREFIX}${STARTING_NUMBER}`,
        }));
        return;
      }

      let maxNumber = 0;
      studentsSnapshot.forEach((doc) => {
        const rollNo = doc.data().rollNumber;
        if (rollNo && rollNo.startsWith(ROLL_NUMBER_PREFIX)) {
          const numberPart = parseInt(
            rollNo.substring(ROLL_NUMBER_PREFIX.length),
            10
          );
          if (!isNaN(numberPart) && numberPart > maxNumber) {
            maxNumber = numberPart;
          }
        }
      });

      const nextNumber = maxNumber === 0 ? STARTING_NUMBER : maxNumber + 1;
      setFormData((prev) => ({
        ...prev,
        rollNumber: `${ROLL_NUMBER_PREFIX}${nextNumber}`,
      }));
    };

    generateNextRollNumber();

    return () => unsubBatches();
  }, []);

  useEffect(() => {
    const { firstName, dob, rollNumber } = formData;
    const newUsername = rollNumber;
    let newPassword = "";
    if (firstName && dob) {
      const formattedDob = dob.split("-").reverse().join("");
      newPassword = `${firstName.toLowerCase().trim()}${formattedDob}`;
    }
    setFormData((prev) => ({
      ...prev,
      username: newUsername,
      password: newPassword,
    }));
  }, [formData.firstName, formData.dob, formData.rollNumber]);

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((p) => ({ ...p, [name]: value }));
};

// This new function checks if a batch is old or new and sets the class accordingly
const handleBatchChange = (e) => {
  const batchName = e.target.value;
  const selectedBatch = batches.find((b) => b.name === batchName);

  if (selectedBatch?.classLevel) {
    // Old batch with single class
    setFormData((prev) => ({
      ...prev,
      batch: batchName,
      classLevel: selectedBatch.classLevel, // Auto-set the class
    }));
  } else {
    // New batch with multiple classes
    setFormData((prev) => ({
      ...prev,
      batch: batchName,
      classLevel: "", // Reset class to force user selection
    }));
  }
};

  const handleSubjectChange = (subjectName, isChecked) => {
    setFormData((prev) => ({
      ...prev,
      subjects: isChecked
        ? [...prev.subjects, subjectName]
        : prev.subjects.filter((s) => s !== subjectName),
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
      const res = await fetch("/api/create-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to enroll student.");
      }
      router.push("/portal/admin-dashboard/students");
    } catch (err) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  const formInputClasses =
    "w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-light-slate placeholder:text-slate-500 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-200";

  // --- NEW: Find the selected batch object to populate the class dropdown ---
  const selectedBatch = batches.find((b) => b.name === formData.batch);

  return (
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
            Create a student profile and their portal login account.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex flex-col md:flex-row gap-8 items-start p-6 rounded-xl border border-white/10 bg-slate-900/30 backdrop-blur-sm">
                <div className="w-full md:w-auto flex justify-center shrink-0">
                  <ImageUploader onUploadComplete={handleUploadComplete} />
                </div>
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">
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
                      Admission / Roll No.
                    </label>
                    <input
                      name="rollNumber"
                      value={formData.rollNumber}
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
                      required
                      className={`${formInputClasses} pr-2`}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className={`${formInputClasses} appearance-none pr-8`}>
                      <option value="" disabled>
                        Select...
                      </option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <FormSection title="Guardian Information" icon={Shield}>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate mb-2">
                    Father’s Name
                  </label>
                  <input
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    required
                    className={formInputClasses}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate mb-2">
                    Father’s Contact
                  </label>
                  <input
                    name="fatherContact"
                    maxLength="10"
                    value={formData.fatherContact}
                    onChange={handleChange}
                    required
                    className={formInputClasses}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate mb-2">
                    Mother’s Name
                  </label>
                  <input
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    required
                    className={formInputClasses}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate mb-2">
                    Mother’s Contact
                  </label>
                  <input
                    name="motherContact"
                    maxLength="10"
                    value={formData.motherContact}
                    onChange={handleChange}
                    required
                    className={formInputClasses}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate mb-2">
                    Parent Email
                  </label>
                  <input
                    type="email"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleChange}
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
              </FormSection>

              <FormSection title="Address Information" icon={Home}>
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
            </div>

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
                    placeholder="Auto-generated from Roll No."
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

              <FormSection title="Academic Details" icon={BookMarked}>
                <div className="sm:col-span-4 relative">
                  <label className="block text-sm font-medium text-slate mb-2">
                    Batch
                  </label>
                  <select
                    name="batch"
                    value={formData.batch}
                    onChange={handleBatchChange}
                    required
                    className={`${formInputClasses} appearance-none pr-8`}>
                    <option value="" disabled>
                      Select Batch
                    </option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name} ({(b.classLevels || [b.classLevel]).join(", ")}
                        )
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>

                <div className="sm:col-span-4 relative">
                  <label className="block text-sm font-medium text-slate mb-2">
                    Class Level
                  </label>
                  {selectedBatch?.classLevels ? (
                    // If it's a multi-class batch, show the dropdown
                    <>
                      <select
                        name="classLevel"
                        value={formData.classLevel}
                        onChange={handleChange}
                        required
                        disabled={!formData.batch}
                        className={`${formInputClasses} appearance-none pr-8 disabled:bg-slate-800 disabled:cursor-not-allowed`}>
                        <option value="" disabled>
                          Select Class
                        </option>
                        {(selectedBatch.classLevels || []).map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 mt-3 h-5 w-5 text-slate-400 pointer-events-none" />
                    </>
                  ) : (
                    // If it's a single-class batch or no batch, show a disabled input
                    <input
                      name="classLevel"
                      value={formData.classLevel || ""}
                      readOnly
                      required
                      placeholder="Select a batch first"
                      className={`${formInputClasses} bg-slate-800 cursor-not-allowed`}
                    />
                  )}
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium text-slate mb-2">
                    Subjects Opted
                  </label>
                  <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 space-y-2 max-h-48 overflow-y-auto">
                    {loadingSubjects
                      ? Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-6 bg-slate-700/50 rounded animate-pulse"
                          />
                        ))
                      : subjects.map((sub) => (
                          <CustomCheckbox
                            key={sub.id}
                            id={sub.id}
                            label={sub.name}
                            value={sub.name}
                            checked={formData.subjects.includes(sub.name)}
                            onChange={(e) =>
                              handleSubjectChange(
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
                    Special Request
                  </label>
                  <textarea
                    name="specialRequest"
                    value={formData.specialRequest}
                    onChange={handleChange}
                    rows="3"
                    className={formInputClasses}
                  />
                </div>
              </FormSection>
            </div>

            <div className="lg:col-span-3">
              {error && (
                <div className="bg-red-900/50 border border-red-500/30 text-red-300 text-sm p-3 rounded-lg text-center mb-6">
                  {error}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
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
            </div>
          </div>
        </form>
      </motion.div>
    </main>
  );
}
