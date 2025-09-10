// src/app/portal/(app)/admin-dashboard/edit-contact/page.jsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  Save,
  RotateCcw,
  CheckCircle,
  Loader2,
  AlertTriangle,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Plus,
  Trash2,
} from "lucide-react";

// --- Reusable Components (can be moved to a separate file later) ---
const FormField = ({ label, name, value, onChange, placeholder = "" }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate mb-2">
      {label}
    </label>
    <input
      type="text"
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-light-slate placeholder:text-slate-500 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
    />
  </div>
);

const SettingsCard = ({ icon: Icon, title, children }) => (
  <motion.div
    className="rounded-xl border border-white/10 bg-slate-900/30 p-6 backdrop-blur-sm"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}>
    <div className="flex items-center gap-3 mb-5 border-b border-slate-700/50 pb-3">
      <Icon className="h-6 w-6 text-brand-gold" />
      <h3 className="text-lg font-semibold text-brand-gold tracking-wide">
        {title}
      </h3>
    </div>
    <div className="space-y-6">{children}</div>
  </motion.div>
);

const SaveBar = ({ isVisible, isSaving, onSave, onReset }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto z-50">
        <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-slate-800/80 p-3 shadow-2xl backdrop-blur-lg">
          <p className="text-sm text-slate-300">You have unsaved changes.</p>
          <button
            onClick={onReset}
            type="button"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold bg-slate-700/80 text-slate-300 hover:bg-slate-600/80 disabled:opacity-50">
            <RotateCcw size={16} /> Reset
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex min-w-[140px] items-center justify-center gap-2 rounded-md bg-brand-gold px-6 py-2 text-sm font-bold text-dark-navy hover:bg-yellow-400 disabled:bg-slate-600">
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ToastNotification = ({ message, type, onDismiss }) => {
  if (!message) return null;
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 20 }}
      exit={{ y: -100 }}
      className="fixed top-0 left-1/2 -translate-x-1/2 z-50">
      <div
        className={`flex items-center gap-3 rounded-lg border ${
          type === "success"
            ? "border-green-500/30 bg-green-900/70 text-green-300"
            : "border-red-500/30 bg-red-900/70 text-red-300"
        } p-3 shadow-2xl backdrop-blur-lg`}>
        {type === "success" ? (
          <CheckCircle size={16} />
        ) : (
          <AlertTriangle size={16} />
        )}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onDismiss} className="ml-4">
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default function EditContactPage() {
  const [details, setDetails] = useState(null);
  const [initialDetails, setInitialDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ message: "", type: "" });

  const isDirty = JSON.stringify(details) !== JSON.stringify(initialDetails);

  useEffect(() => {
    const fetchContactDetails = async () => {
      const docRef = doc(db, "settings", "contactDetails");
      try {
        const docSnap = await getDoc(docRef);
        const defaultData = {
          address: "",
          phone: "",
          email: "",
          hours: [{ day: "Monday - Friday", time: "4PM - 8PM" }],
        };
        const data = docSnap.exists() ? docSnap.data() : defaultData;
        setDetails(data);
        setInitialDetails(data);
      } catch (error) {
        console.error("Error fetching contact details:", error);
        setStatus({
          message: "Failed to load contact details.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchContactDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleHourChange = (index, field, value) => {
    const newHours = [...details.hours];
    newHours[index][field] = value;
    setDetails((prev) => ({ ...prev, hours: newHours }));
  };

  const addHour = () => {
    setDetails((prev) => ({
      ...prev,
      hours: [...prev.hours, { day: "", time: "" }],
    }));
  };

  const removeHour = (index) => {
    setDetails((prev) => ({
      ...prev,
      hours: prev.hours.filter((_, i) => i !== index),
    }));
  };

  const handleReset = () => setDetails(initialDetails);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!isDirty) return;
    setIsSaving(true);
    setStatus({ message: "", type: "" });
    try {
      await setDoc(doc(db, "settings", "contactDetails"), details);
      setInitialDetails(details);
      setStatus({
        message: "Contact details updated successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Error saving details:", err);
      setStatus({ message: "Failed to save details.", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus({ message: "", type: "" }), 5000);
    }
  };

  if (loading)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );

  return (
    <main>
      <AnimatePresence>
        <ToastNotification
          message={status.message}
          type={status.type}
          onDismiss={() => setStatus({ message: "", type: "" })}
        />
      </AnimatePresence>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-1">
        Edit Contact Page
      </h1>
      <p className="text-base text-slate mb-8">
        Update the contact information displayed to students.
      </p>

      {details && (
        <form onSubmit={handleSaveChanges}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SettingsCard icon={MapPin} title="Contact Information">
              <FormField
                label="Full Address"
                name="address"
                value={details.address}
                onChange={handleInputChange}
              />
              <FormField
                label="Phone Number"
                name="phone"
                value={details.phone}
                onChange={handleInputChange}
              />
              <FormField
                label="Email Address"
                name="email"
                value={details.email}
                onChange={handleInputChange}
              />
            </SettingsCard>

            <SettingsCard icon={Clock} title="Operating Hours">
              {details.hours.map((hour, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="grid grid-cols-2 gap-2 flex-grow">
                    <FormField
                      label={`Day(s) ${index + 1}`}
                      name="day"
                      value={hour.day}
                      onChange={(e) =>
                        handleHourChange(index, "day", e.target.value)
                      }
                    />
                    <FormField
                      label="Time"
                      name="time"
                      value={hour.time}
                      onChange={(e) =>
                        handleHourChange(index, "time", e.target.value)
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeHour(index)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-full mb-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addHour}
                className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-white/10 text-slate-300 hover:bg-white/20">
                <Plus size={14} /> Add Hour Slot
              </button>
            </SettingsCard>
          </div>
          <SaveBar
            isVisible={isDirty}
            isSaving={isSaving}
            onReset={handleReset}
            onSave={handleSaveChanges}
          />
        </form>
      )}
    </main>
  );
}
