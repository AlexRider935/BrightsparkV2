// src/app/portal/(app)/student-dashboard/settings/page.jsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import {
  Settings,
  KeyRound,
  CheckCircle,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";

// --- Change Password Modal Component ---
const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    setIsSaving(true);

    try {
      // Step 1: Re-authenticate the user to prove their identity
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Step 2: If re-authentication is successful, call our secure API route
      const idToken = await user.getIdToken(true); // Get a fresh token
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to change password.");
      }

      alert("Password changed successfully!");
      onClose();
    } catch (authError) {
      if (authError.code === "auth/wrong-password") {
        setError("The current password you entered is incorrect.");
      } else if (authError.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(authError.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-dark-navy p-6">
        <h2 className="text-xl font-bold text-brand-gold mb-4">
          Change Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-light-slate"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-light-slate"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-light-slate"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 p-3 bg-red-500/10 rounded-lg">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center w-36 px-6 py-2.5 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400 disabled:bg-slate-600">
              {isSaving ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Save Password"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function SettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <AnimatePresence>
        <ChangePasswordModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </AnimatePresence>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Settings
      </h1>
      <p className="text-lg text-slate mb-8">Manage your account security.</p>

      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}>
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
              It's a good idea to use a strong password that you're not using
              elsewhere.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-4 sm:mt-0 sm:w-auto shrink-0 rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-brand-gold hover:text-dark-navy transition-colors">
            Change Password
          </button>
        </div>
      </motion.div>
    </div>
  );
}
