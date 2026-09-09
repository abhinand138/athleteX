import { useState, useRef, useEffect } from "react";
import { FiMapPin, FiMail, FiEdit3, FiCamera } from "react-icons/fi";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { uploadProfilePhotoFromDevice } from "../../utils/profilePhotoUpload";

export default function ProfileHeader({ profile }) {
  const [photo, setPhoto] = useState(profile?.profileImage);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPhoto(profile?.profileImage);
  }, [profile?.profileImage]);

  useEffect(() => {
    const handleUpdated = (e) => {
      if (e.detail?.profileImage) {
        setPhoto(e.detail.profileImage);
      }
    };
    window.addEventListener("user-profile-updated", handleUpdated);
    return () => window.removeEventListener("user-profile-updated", handleUpdated);
  }, []);

  const hasCustomPhoto =
    photo &&
    !photo.includes("pravatar.cc") &&
    !photo.includes("profile.jpg");

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && profile?.id) {
      uploadProfilePhotoFromDevice(file, profile.id, (newImg) => {
        setPhoto(newImg);
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-[#161A20]/80 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl"
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handlePhotoSelect}
      />

      {/* Premium Gradient Background */}
      <div className="absolute inset-0 h-40 bg-gradient-to-r from-brand-peach/20 via-brand-peach/5 to-transparent opacity-50 z-0" />

      <div className="relative z-10 p-8 pt-20 flex flex-col md:flex-row items-center md:items-end gap-8">
        {/* Avatar with Camera Overlay */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative group cursor-pointer shrink-0"
          title="Click to change profile picture from device"
        >
          {hasCustomPhoto ? (
            <motion.img
              whileHover={{ scale: 1.03 }}
              src={photo}
              alt="Profile"
              className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 border-[#0F1115] shadow-xl object-cover ring-2 ring-brand-peach/50 bg-[#161A20]"
            />
          ) : (
            <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 border-[#0F1115] shadow-xl ring-2 ring-brand-peach/50 bg-gradient-to-tr from-brand-peach/20 to-orange-500/20 flex items-center justify-center text-brand-peach text-5xl font-black">
              {profile?.fullName?.charAt(0) || "A"}
            </div>
          )}

          {/* Hover overlay with Camera */}
          <div className="absolute inset-0 rounded-full bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <FiCamera className="text-xl text-brand-peach mb-1" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-200">
              {hasCustomPhoto ? "Change Photo" : "Add Photo"}
            </span>
          </div>

          {/* Bottom badge */}
          <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-brand-peach text-brand-dark flex items-center justify-center shadow-lg border-2 border-[#0F1115]">
            <FiCamera size={14} />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left mb-2 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight truncate">
              {profile?.fullName || "Athlete Name"}
            </h1>
            {profile?.role && (
              <span className="px-3 py-1 bg-brand-peach/10 border border-brand-peach/20 text-brand-peach text-xs font-bold uppercase tracking-wider rounded-full self-center md:self-auto shrink-0">
                {profile.role}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-400 font-medium text-sm">
            {profile?.sport && profile?.position && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-white/80">{profile.position} • {profile.sport}</span>
              </div>
            )}

            {(profile?.city || profile?.country) && (
              <div className="flex items-center gap-1.5">
                <FiMapPin className="text-brand-peach/70" />
                <span>{[profile.city, profile.country].filter(Boolean).join(", ")}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <FiMail className="text-brand-peach/70" />
              <span>{profile?.email}</span>
            </div>
          </div>
        </div>

        <div className="mb-2 flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-brand-peach px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-white/10"
          >
            <FiCamera size={14} />
            <span>Upload Photo</span>
          </button>

          <Link
            to="/profile/edit"
            className="flex items-center gap-2 bg-brand-peach text-[#0F1115] hover:bg-brand-peach/90 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
          >
            <FiEdit3 size={14} />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}