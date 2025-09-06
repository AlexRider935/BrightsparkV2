// src/app/portal/(app)/components/ProfileImageUploader.jsx
"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import imageCompression from "browser-image-compression";

// This new component is designed to be invisible and controlled by a ref.
const ProfileImageUploader = forwardRef(({ onUploadComplete }, ref) => {
  const fileInputRef = useRef(null);

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // This function is exposed to the parent component (ProfilePage) via the ref.
  useImperativeHandle(ref, () => ({
    triggerUpload() {
      fileInputRef.current.click();
    },
  }));

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show some feedback to the user, perhaps via a toast notification in the parent later
    console.log("Optimizing and uploading image...");

    const options = {
      maxSizeMB: 0.5,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      await handleUpload(compressedFile);
    } catch (error) {
      console.error("Image processing error:", error);
    }
  };

  const handleUpload = async (fileToUpload) => {
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (data.secure_url) {
        onUploadComplete(data.secure_url);
      } else {
        throw new Error("Cloudinary upload failed.");
      }
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
    }
  };

  // This component has no visible UI of its own. It's just a hidden input.
  return (
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileChange}
      accept="image/png, image/jpeg, image/webp"
      className="hidden"
    />
  );
});

ProfileImageUploader.displayName = "ProfileImageUploader";
export default ProfileImageUploader;
