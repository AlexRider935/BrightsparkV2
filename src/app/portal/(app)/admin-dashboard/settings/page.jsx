// src/app/portal/(app)/admin-dashboard/settings/page.jsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { db } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  Save,
  RotateCcw,
  CheckCircle,
  Loader2,
  AlertTriangle,
  X,
  CreditCard,
  UploadCloud,
} from "lucide-react";

// --- Reusable Components ---
const SettingsCard = ({ icon: Icon, title, children }) => (
  <motion.div
    className="rounded-xl border border-white/10 bg-slate-900/30 p-6 backdrop-blur-sm"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}>
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

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState({ upiId: "", qrCodeUrl: "" });
  const [initialSettings, setInitialSettings] = useState({
    upiId: "",
    qrCodeUrl: "",
  });
  const [qrCodeImageFile, setQrCodeImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ message: "", type: "" });

  const isDirty =
    JSON.stringify(settings) !== JSON.stringify(initialSettings) ||
    !!qrCodeImageFile;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = doc(db, "settings", "payments");
        const docSnap = await getDoc(settingsRef);
        const fetchedData = docSnap.exists()
          ? docSnap.data()
          : { upiId: "", qrCodeUrl: "" };
        setSettings(fetchedData);
        setInitialSettings(fetchedData);
        setPreviewUrl(fetchedData.qrCodeUrl || "");
      } catch (err) {
        console.error("Error fetching settings:", err);
        setStatus({
          message: "Could not load payment settings.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrCodeImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setQrCodeImageFile(null);
    setPreviewUrl(initialSettings.qrCodeUrl || "");
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!isDirty) return;

    setIsSaving(true);
    setStatus({ message: "", type: "" });
    let newQrCodeUrl = settings.qrCodeUrl;

    try {
      // Step 1: Upload new image to Cloudinary if one is selected
      if (qrCodeImageFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", qrCodeImageFile);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
        );

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );

        if (!response.ok) throw new Error("Image upload failed.");

        const data = await response.json();
        newQrCodeUrl = data.secure_url;
        setIsUploading(false);
      }

      // Step 2: Save the updated settings to Firestore
      const newSettings = { ...settings, qrCodeUrl: newQrCodeUrl };
      const settingsRef = doc(db, "settings", "payments");
      await setDoc(settingsRef, newSettings, { merge: true });

      setSettings(newSettings);
      setInitialSettings(newSettings);
      setQrCodeImageFile(null);
      setStatus({
        message: "Payment settings updated successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Error saving settings:", err);
      setStatus({ message: "Failed to save settings.", type: "error" });
      setIsUploading(false);
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
        Manage global payment configurations for the student portal.
      </p>

      <form onSubmit={handleSaveChanges}>
        <SettingsCard icon={CreditCard} title="Payment Settings">
          <div>
            <label
              htmlFor="upiId"
              className="block text-sm font-medium text-slate mb-2">
              UPI ID
            </label>
            <input
              type="text"
              id="upiId"
              name="upiId"
              value={settings.upiId}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, upiId: e.target.value }))
              }
              placeholder="e.g., institute@okhdfcbank"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-light-slate placeholder:text-slate-500 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-2">
              QR Code Image
            </label>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-700 overflow-hidden">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="QR Code Preview"
                    width={128}
                    height={128}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-500">No Image</span>
                )}
              </div>
              <label
                htmlFor="qrCodeUpload"
                className="cursor-pointer flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/50 p-4 text-center text-slate-400 hover:border-brand-gold hover:text-brand-gold transition-colors w-full">
                {isUploading ? (
                  <Loader2 className="animate-spin h-8 w-8" />
                ) : (
                  <UploadCloud className="h-8 w-8" />
                )}
                <span className="mt-2 text-sm font-semibold">
                  {isUploading ? "Uploading..." : "Click to upload or replace"}
                </span>
                <span className="text-xs">PNG, JPG, or SVG</span>
                <input
                  id="qrCodeUpload"
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>
        </SettingsCard>
        <SaveBar
          isVisible={isDirty}
          isSaving={isSaving}
          onReset={handleReset}
          onSave={handleSaveChanges}
        />
      </form>
    </main>
  );
}
