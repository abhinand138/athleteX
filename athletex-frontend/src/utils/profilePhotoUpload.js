import api from "../services/api";
import toast from "react-hot-toast";

/**
 * Resizes an image file and converts to optimized Base64 JPEG data URL
 */
const resizeImage = (file, maxWidth = 400, maxHeight = 400) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to 85% JPEG
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve(dataUrl);
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
};

/**
 * Uploads a profile picture from user device and syncs across backend and frontend
 */
export const uploadProfilePhotoFromDevice = async (file, userId, onComplete) => {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast.error("Please select a valid image file (JPG, PNG, WEBP).");
    return;
  }

  if (file.size > 8 * 1024 * 1024) {
    toast.error("Image exceeds 8MB. Please pick a smaller image.");
    return;
  }

  const toastId = toast.loading("Uploading and saving profile photo...");

  try {
    const base64Data = await resizeImage(file, 400, 400);

    // Fetch existing profile to maintain other details
    const profRes = await api.get(`/users/profile/${userId}`);
    const existing = profRes.data || {};

    const payload = {
      ...existing,
      profileImage: base64Data
    };

    await api.put(`/users/profile/${userId}`, payload);

    // Update localStorage
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    const updated = {
      ...stored,
      profileImage: base64Data
    };
    localStorage.setItem("user", JSON.stringify(updated));

    // Dispatch global custom event so all open views update simultaneously
    window.dispatchEvent(
      new CustomEvent("user-profile-updated", {
        detail: { profileImage: base64Data }
      })
    );

    toast.success("Profile photo updated successfully!", { id: toastId });

    if (onComplete) {
      onComplete(base64Data);
    }
  } catch (err) {
    console.error("Failed to upload profile photo:", err);
    toast.error("Failed to update profile photo.", { id: toastId });
  }
};
