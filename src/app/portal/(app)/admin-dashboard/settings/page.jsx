"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle,
  Building,
  ToggleLeft,
  KeyRound,
} from "lucide-react";

// --- MOCK DATA (Initial state for the settings form) ---
const initialSettings = {
  general: {
    instituteName: "Brightspark Institute",
    contactEmail: "info@brightspark.space",
    contactPhone: "+91 98765 43210",
  },
  portal: {
    allowRegistrations: true,
    maintenanceMode: false,
  },
  payments: {
    upiId: "brightspark.jaipur@okhdfcbank",
    gatewayKey: "pk_test_xxxxxxxxxxxxxxxx",
  },
};

// --- Reusable Components ---
const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate mb-1">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
    />
  </div>
);

const ToggleSwitch = ({ label, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="font-medium text-light-slate">{label}</p>
      <p className="text-sm text-slate">{description}</p>
    </div>
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
        enabled ? "bg-brand-gold" : "bg-slate-700"
      }`}>
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const handleInputChange = (section, name, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [name]: value },
    }));
    setIsDirty(true);
    setSaveStatus("");
  };

  const handleToggle = (section, key) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: !prev[section][key] },
    }));
    setIsDirty(true);
    setSaveStatus("");
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    console.log("Saving System Settings:", settings);
    setIsDirty(false);
    setSaveStatus("System settings updated successfully!");
    setTimeout(() => setSaveStatus(""), 5000);
  };

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        System Settings
      </h1>
      <p className="text-lg text-slate mb-8">
        Manage global configurations for the website and portal.
      </p>

      <form onSubmit={handleSaveChanges} className="space-y-8">
        {/* General Settings Card */}
        <motion.div
          className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <Building className="h-6 w-6 text-brand-gold" />
            <h3 className="text-lg font-semibold text-light-slate">
              General Institute Details
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Institute Name"
              name="instituteName"
              value={settings.general.instituteName}
              onChange={(e) =>
                handleInputChange("general", e.target.name, e.target.value)
              }
            />
            <FormField
              label="Public Contact Email"
              name="contactEmail"
              value={settings.general.contactEmail}
              onChange={(e) =>
                handleInputChange("general", e.target.name, e.target.value)
              }
              type="email"
            />
            <FormField
              label="Public Contact Phone"
              name="contactPhone"
              value={settings.general.contactPhone}
              onChange={(e) =>
                handleInputChange("general", e.target.name, e.target.value)
              }
              type="tel"
            />
          </div>
        </motion.div>

        {/* Portal Settings Card */}
        <motion.div
          className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-3 mb-2">
            <ToggleLeft className="h-6 w-6 text-brand-gold" />
            <h3 className="text-lg font-semibold text-light-slate">
              Portal Settings
            </h3>
          </div>
          <div className="divide-y divide-slate-700/50">
            <ToggleSwitch
              label="Enable New Student Registrations"
              description="Allow new students to sign up via the public website."
              enabled={settings.portal.allowRegistrations}
              onToggle={() => handleToggle("portal", "allowRegistrations")}
            />
            <ToggleSwitch
              label="Enable Maintenance Mode"
              description="Temporarily disable student and teacher login with a notification."
              enabled={settings.portal.maintenanceMode}
              onToggle={() => handleToggle("portal", "maintenanceMode")}
            />
          </div>
        </motion.div>

        {/* Payment Gateway Card */}
        <motion.div
          className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-3 mb-4">
            <KeyRound className="h-6 w-6 text-brand-gold" />
            <h3 className="text-lg font-semibold text-light-slate">
              Payment Gateway
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            />
          </div>
        </motion.div>

        {/* Save Changes Button */}
        <motion.div
          className="flex items-center justify-end gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          {saveStatus && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle size={16} />
              <span>{saveStatus}</span>
            </div>
          )}
          <button
            onClick={() => setSettings(initialSettings)}
            type="button"
            disabled={!isDirty}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20 disabled:opacity-50">
            <RotateCcw size={16} /> Reset
          </button>
          <button
            type="submit"
            disabled={!isDirty}
            className="flex items-center gap-2 rounded-md bg-brand-gold px-6 py-2 text-sm font-bold text-dark-navy hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-slate-600">
            <Save size={16} /> Save All Settings
          </button>
        </motion.div>
      </form>
    </div>
  );
}
