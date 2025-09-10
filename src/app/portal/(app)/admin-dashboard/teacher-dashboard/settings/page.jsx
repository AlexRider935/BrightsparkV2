"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "@/firebase/config";
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  query,
  collection,
  where,
} from "firebase/firestore";
import {
  Settings,
  KeyRound,
  Bell,
  CheckCircle,
  BookMarked,
  Loader2,
  Save,
} from "lucide-react";

// The default settings for a teacher when they visit for the first time.
const defaultSettings = {
  notifications: {
    submissions: true,
    messages: true,
    reminders: false,
  },
  gradebook: {
    autoPublish: false,
  },
};

// --- Reusable Components ---
const ToggleSwitch = ({ label, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between py-4">
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

export default function TeacherSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const teacherName = "Mr. A. K. Sharma"; // Placeholder for logged-in teacher

  useEffect(() => {
    // 1. Find the teacher's document to get their ID
    const qTeacher = query(
      collection(db, "teachers"),
      where("name", "==", teacherName)
    );
    const unsubTeacher = onSnapshot(qTeacher, (snapshot) => {
      if (!snapshot.empty) {
        const teacherDoc = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        };
        setTeacher(teacherDoc);

        // 2. Use the teacher's ID to listen for their specific settings
        const settingsRef = doc(db, "teacherSettings", teacherDoc.id);
        const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
          if (docSnap.exists()) {
            setSettings(docSnap.data());
          } else {
            // If no settings exist, create them with defaults
            setDoc(settingsRef, defaultSettings);
            setSettings(defaultSettings);
          }
          setLoading(false);
        });
        return () => unsubSettings();
      } else {
        setLoading(false); // Teacher not found
      }
    });

    return () => unsubTeacher();
  }, [teacherName]);

  const handleToggle = (category, key) => {
    setSettings((prev) => ({
      ...prev,
      [category]: { ...prev[category], [key]: !prev[category][key] },
    }));
    setSaveStatus("");
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!teacher || !settings) return;
    setIsSaving(true);
    setSaveStatus("");
    try {
      const settingsRef = doc(db, "teacherSettings", teacher.id);
      await updateDoc(settingsRef, settings);
      setSaveStatus("Preferences saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus("Failed to save.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(""), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-20 text-slate">
        Could not load settings.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Settings
      </h1>
      <p className="text-lg text-slate mb-8">
        Manage your account, notifications, and gradebook preferences.
      </p>

      <form onSubmit={handleSaveChanges} className="space-y-8">
        <motion.div
          className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
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
              onClick={() =>
                alert("Password change functionality will be enabled soon.")
              }
              className="w-full mt-4 sm:mt-0 sm:w-auto shrink-0 rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-brand-gold hover:text-dark-navy transition-colors">
              Change Password
            </button>
          </div>
        </motion.div>

        <motion.div
          className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
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

        <motion.div
          className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
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
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-md bg-brand-gold px-6 py-2 text-sm font-bold text-dark-navy hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-slate-600">
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
