"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  Save,
  RotateCcw,
  CheckCircle,
  Building,
  Settings,
  KeyRound,
  Loader2,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// --- Default Data (Used only if the Firestore document doesn't exist) ---
const defaultSettings = {
  general: {
    instituteName: "Brightspark Institute",
    contactEmail: "info@brightspark.space",
    contactPhone: "+91 98765 43210",
  },
  portal: { allowRegistrations: true, maintenanceMode: false },
  payments: { upiId: "institute@bank", gatewayKey: "" },
};

// --- Reusable Themed Components ---
const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate mb-2">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-light-slate placeholder:text-slate-500 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-200"
    />
  </div>
);

const ToggleSwitch = ({ label, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between py-4">
    <div>
      <p className="font-medium text-light-slate">{label}</p>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-dark-navy ${
        enabled ? "bg-brand-gold" : "bg-slate-700"
      }`}>
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

const SettingsCard = ({ icon: Icon, title, children, delay = 0 }) => (
  <motion.div
    className="rounded-xl border border-white/10 bg-slate-900/30 p-6 backdrop-blur-sm"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}>
    <div className="flex items-center gap-3 mb-5 border-b border-slate-700/50 pb-3">
      {Icon && <Icon className="h-6 w-6 text-brand-gold" />}
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
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto z-50">
        <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-slate-800/80 p-3 shadow-2xl backdrop-blur-lg">
          <p className="text-sm text-slate-300">You have unsaved changes.</p>
          <button
            onClick={onReset}
            type="button"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold bg-slate-700/80 text-slate-300 transition-colors hover:bg-slate-600/80 disabled:opacity-50">
            <RotateCcw size={16} /> Reset
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex min-w-[140px] items-center justify-center gap-2 rounded-md bg-brand-gold px-6 py-2 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 disabled:bg-slate-600">
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

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [initialSettings, setInitialSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = doc(db, "settings", "system");
        const docSnap = await getDoc(settingsRef);
        if (docSnap.exists()) {
          const fetchedData = docSnap.data();
          setSettings(fetchedData);
          setInitialSettings(fetchedData);
        } else {
          setSettings(defaultSettings);
          setInitialSettings(defaultSettings);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
        setError("Could not load system settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (section, name, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [name]: value },
    }));
    setIsDirty(true);
  };

  const handleToggle = (section, key) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: !prev[section][key] },
    }));
    setIsDirty(true);
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setIsDirty(false);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!isDirty) return;
    setIsSaving(true);
    setStatus({ message: "", type: "" });
    try {
      const settingsRef = doc(db, "settings", "system");
      await setDoc(settingsRef, settings, { merge: true });
      setInitialSettings(settings);
      setIsDirty(false);
      setStatus({
        message: "System settings updated successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Error saving settings:", err);
      setStatus({ message: "Failed to save settings.", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus({ message: "", type: "" }), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-light-slate">
          An Error Occurred
        </h2>
        <p className="text-slate">{error}</p>
      </div>
    );
  }

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
        System Settings
      </h1>
      <p className="text-base text-slate mb-8">
        Manage global configurations for the website and portal.
      </p>

      {settings && (
        <form onSubmit={handleSaveChanges}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* --- Main Settings Column --- */}
            <div className="lg:col-span-2 space-y-8">
              <SettingsCard icon={Building} title="General Institute Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Institute Name"
                    name="instituteName"
                    value={settings.general.instituteName}
                    onChange={(e) =>
                      handleInputChange(
                        "general",
                        e.target.name,
                        e.target.value
                      )
                    }
                  />
                  <FormField
                    label="Public Contact Email"
                    name="contactEmail"
                    value={settings.general.contactEmail}
                    onChange={(e) =>
                      handleInputChange(
                        "general",
                        e.target.name,
                        e.target.value
                      )
                    }
                    type="email"
                  />
                  <FormField
                    label="Public Contact Phone"
                    name="contactPhone"
                    value={settings.general.contactPhone}
                    onChange={(e) =>
                      handleInputChange(
                        "general",
                        e.target.name,
                        e.target.value
                      )
                    }
                    type="tel"
                  />
                </div>
              </SettingsCard>
              <SettingsCard icon={Settings} title="Portal Settings" delay={0.1}>
                <div className="divide-y divide-slate-700/50">
                  <ToggleSwitch
                    label="Enable New Student Registrations"
                    description="Allow students to sign up via the public website."
                    enabled={settings.portal.allowRegistrations}
                    onToggle={() =>
                      handleToggle("portal", "allowRegistrations")
                    }
                  />
                  <ToggleSwitch
                    label="Enable Maintenance Mode"
                    description="Temporarily disable student/teacher login."
                    enabled={settings.portal.maintenanceMode}
                    onToggle={() => handleToggle("portal", "maintenanceMode")}
                  />
                </div>
              </SettingsCard>
            </div>
            {/* --- Sidebar Column --- */}
            <div className="lg:col-span-1 space-y-8">
              <SettingsCard icon={KeyRound} title="Payment Gateway" delay={0.2}>
                <FormField
                  label="UPI ID"
                  name="upiId"
                  value={settings.payments.upiId}
                  onChange={(e) =>
                    handleInputChange("payments", e.target.name, e.target.value)
                  }
                />
                <FormField
                  label="Gateway Public Key"
                  name="gatewayKey"
                  value={settings.payments.gatewayKey}
                  onChange={(e) =>
                    handleInputChange("payments", e.target.name, e.target.value)
                  }
                  placeholder="pk_live_..."
                />
              </SettingsCard>
            </div>
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
