import { useState, useEffect, useRef } from "react";
import { FaCamera, FaPlus } from "react-icons/fa";
import { uploadProfilePhotoFromDevice } from "../../utils/profilePhotoUpload";

export default function AthleteProfileCard({ user }) {
  const [profileImg, setProfileImg] = useState(user?.profileImage);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setProfileImg(user?.profileImage);
  }, [user?.profileImage]);

  useEffect(() => {
    const handleUpdated = (e) => {
      if (e.detail?.profileImage) {
        setProfileImg(e.detail.profileImage);
      }
    };
    window.addEventListener("user-profile-updated", handleUpdated);
    return () => window.removeEventListener("user-profile-updated", handleUpdated);
  }, []);

  const hasCustomPhoto =
    profileImg &&
    !profileImg.includes("pravatar.cc") &&
    !profileImg.includes("profile.jpg");

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && user?.id) {
      uploadProfilePhotoFromDevice(file, user.id, (newImg) => {
        setProfileImg(newImg);
      });
    }
  };

  return (
    <div className="glass-card rounded-2xl p-8 shadow-xl relative overflow-hidden group">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handlePhotoSelect}
      />

      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-peach/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-brand-peach/10 transition-colors duration-500" />

      <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-6 relative z-10">
        Athlete Profile
      </h2>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
        {/* Profile Image with Camera Upload Overlay */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative group/avatar cursor-pointer shrink-0"
          title="Click to add or change profile picture from device"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-peach to-orange-500 rounded-full blur opacity-25 group-hover/avatar:opacity-60 transition duration-500" />

          {hasCustomPhoto ? (
            <img
              src={profileImg}
              alt={user?.fullName || "Profile"}
              className="relative w-24 h-24 rounded-full border-2 border-brand-peach/40 object-cover shadow-2xl"
            />
          ) : (
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-brand-peach/20 to-orange-500/20 border-2 border-brand-peach/40 flex items-center justify-center text-brand-peach font-black text-3xl shadow-2xl">
              {user?.fullName?.charAt(0) || "A"}
            </div>
          )}

          {/* Hover Camera Overlay */}
          <div className="absolute inset-0 rounded-full bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity">
            <FaCamera className="text-sm text-brand-peach mb-0.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-200">
              {hasCustomPhoto ? "Change" : "Add Photo"}
            </span>
          </div>

          {/* Badge */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand-peach text-brand-dark flex items-center justify-center shadow-lg">
            {hasCustomPhoto ? <FaCamera className="text-[10px]" /> : <FaPlus className="text-[10px]" />}
          </div>
        </div>

        {/* User Information */}
        <div className="text-center sm:text-left flex-1 min-w-0">
          <h2 className="text-white text-2xl font-extrabold tracking-tight mb-1 truncate">
            {user?.fullName || "Loading..."}
          </h2>

          <p className="text-gray-400 font-medium mb-3 truncate">
            {user?.email || "Loading..."}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
            <span className="px-4 py-1.5 rounded-full bg-brand-peach/10 border border-brand-peach/20 text-brand-peach text-xs font-bold uppercase tracking-wider shadow-inner">
              {user?.role || "ATHLETE"}
            </span>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FaCamera className="text-brand-peach text-[11px]" />
              <span>{hasCustomPhoto ? "Update Photo" : "Add Profile Photo"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}