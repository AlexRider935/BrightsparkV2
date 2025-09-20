"use client";

import { useState, useRef, useEffect } from "react";
import imageCompression from "browser-image-compression";
import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

export default function ImageUploader({ onUploadComplete }) {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // --- CONFIGURATION ---
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // This effect triggers the upload when a file is selected
  useEffect(() => {
    if (imageFile) {
      handleUpload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]);

  const handleFileSelect = () => {
    setError(null);
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      // 5MB initial limit
      setError("File is too large. Max 5MB.");
      return;
    }

    // --- ✨ NEW: Image Optimization Step ---
    setIsUploading(true);
    setError("Optimizing image...");

    // --- NEW SETTINGS ---
    const options = {
      maxSizeMB: 0.5, // Target size: 500KB
      useWebWorker: true, // Use a web worker for performance
      // By NOT including `maxWidthOrHeight`, the original dimensions are preserved.
    };

    try {
      const compressedFile = await imageCompression(file, options);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(URL.createObjectURL(compressedFile));
      setImageFile(compressedFile);
      setError(null);
    } catch (compressionError) {
      console.error("Image compression error:", compressionError);
      setError("Failed to optimize image. Please try another file.");
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        true
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          onUploadComplete(data.secure_url);
        } else {
          throw new Error("Upload to Cloudinary failed.");
        }
        setIsUploading(false);
      };

      xhr.onerror = () => {
        throw new Error("Network error during upload.");
      };

      xhr.send(formData);
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      setError("Upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  const renderContent = () => {
    if (isUploading && uploadProgress === 0 && error?.includes("Optimizing")) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
          <p className="mt-2 text-sm text-slate-300">Optimizing...</p>
        </div>
      );
    }

    if (isUploading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
          <p className="mt-2 text-sm text-slate-300">Uploading...</p>
          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
            <div
              className="bg-brand-gold h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      );
    }

    if (previewUrl && !isUploading) {
      return (
        <div className="absolute inset-0">
          <img
            src={previewUrl}
            alt="Student preview"
            className="w-full h-full object-cover rounded-full"
          />
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 hover-opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleFileSelect}
              className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">
              Change
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center text-center text-slate-400 p-4">
        <ImageIcon className="h-10 w-10 mb-2" />
        <p className="text-sm font-semibold">Profile Photo</p>
        <p className="text-xs">Click to upload</p>
      </div>
    );
  };

  return (
    <div className="w-40 h-40 flex-shrink-0">
      <div
        onClick={!isUploading ? handleFileSelect : undefined}
        className={`relative w-40 h-40 rounded-full border-2 ${
          error && !error.includes("Optimizing")
            ? "border-red-500/50"
            : "border-slate-700"
        } border-dashed bg-slate-900/50 flex items-center justify-center cursor-pointer hover:border-brand-gold transition-colors overflow-hidden`}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />
        {renderContent()}
      </div>
      {error && !error.includes("Optimizing") && (
        <p className="text-xs text-red-400 mt-2 text-center w-40">{error}</p>
      )}
    </div>
  );
}
