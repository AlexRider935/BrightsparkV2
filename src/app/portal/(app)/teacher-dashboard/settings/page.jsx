"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  KeyRound,
  Bell,
  CheckCircle,
  BookMarked,
} from "lucide-react";

// --- Helper Components ---

// Reusable, styled toggle switch component
const ToggleSwitch = ({ label, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between py-4">
    <div>
      <p className="font-medium text-light-slate">{label}</p>
      <p className="text-sm text-slate">{description}</p>
    </div>
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-slate-900 ${
        enabled ? "bg-brand-gold" : "bg-slate-700"
      }`}>
      <span
        aria-hidden="true"
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

export default function TeacherSettingsPage() {
  // State to manage all settings in one object
  const [settings, setSettings] = useState({
    notifications: {
      submissions: true,
      messages: true,
      reminders: false,
    },
    gradebook: {
      autoPublish: false,
    },
  });

  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  // A more flexible handler for nested state
  const handleToggle = (category, key) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }));
    setIsDirty(true);
    setSaveStatus("");
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    console.log("Saving teacher settings:", settings);
    setIsDirty(false);
    setSaveStatus("Your preferences have been saved successfully!");
    setTimeout(() => setSaveStatus(""), 5000);
  };

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Settings
      </h1>
      <p className="text-lg text-slate mb-8">
        Manage your account, notifications, and gradebook preferences.
      </p>

      <form onSubmit={handleSaveChanges} className="space-y-8">
        {/* Account Security Section */}
        <motion.div
          className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-4">
            <KeyRound className="h-6 w-6 text-brand-gold" />
            <h3 className="text-lg font-semibold text-light-slate">
              Account Security
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg bg-dark-navy/50">
            <div>
              <p className="font-medium text-light-slate">Password</p>
              <p className="text-sm text-slate">
                It's a good idea to use a strong, unique password.
              </p>
            </div>
            <button
              type="button"
              className="w-full mt-4 sm:mt-0 sm:w-auto shrink-0 rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-brand-gold hover:text-dark-navy transition-colors">
              Change Password
            </button>
          </div>
        </motion.div>

        {/* Notification Preferences Section */}
        <motion.div
          className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="flex items-center gap-3 mb-2">
            <Bell className="h-6 w-6 text-brand-gold" />
            <h3 className="text-lg font-semibold text-light-slate">
              Notification Preferences
            </h3>
          </div>
          <div className="divide-y divide-slate-700/50">
            <ToggleSwitch
              label="New Student Submissions"
              description="Get notified when a student submits an assignment."
              enabled={settings.notifications.submissions}
              onToggle={() => handleToggle("notifications", "submissions")}
            />
            <ToggleSwitch
              label="Parent/Student Messages"
              description="Receive an alert for new direct messages."
              enabled={settings.notifications.messages}
              onToggle={() => handleToggle("notifications", "messages")}
            />
            <ToggleSwitch
              label="Upcoming Class Reminders"
              description="Get a reminder 15 minutes before a class starts."
              enabled={settings.notifications.reminders}
              onToggle={() => handleToggle("notifications", "reminders")}
            />
          </div>
        </motion.div>

        {/* Gradebook Settings Section */}
        <motion.div
          className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="flex items-center gap-3 mb-2">
            <BookMarked className="h-6 w-6 text-brand-gold" />
            <h3 className="text-lg font-semibold text-light-slate">
              Gradebook Settings
            </h3>
          </div>
          <div className="divide-y divide-slate-700/50">
            <ToggleSwitch
              label="Auto-publish Results"
              description="Automatically make grades visible to students upon saving."
              enabled={settings.gradebook.autoPublish}
              onToggle={() => handleToggle("gradebook", "autoPublish")}
            />
          </div>
        </motion.div>

        {/* Save Changes Button */}
        <motion.div
          className="flex items-center justify-end gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}>
          {saveStatus && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle size={16} />
              <span>{saveStatus}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={!isDirty}
            className="rounded-md bg-brand-gold px-6 py-2 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-400">
            Save Changes
          </button>
        </motion.div>
      </form>
    </div>
  );
}
