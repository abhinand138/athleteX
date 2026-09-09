import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiEdit,
  FiAward,
  FiGlobe,
  FiCamera
} from "react-icons/fi";
import { FaDumbbell, FaUsers, FaCalendarCheck } from "react-icons/fa";
import { uploadProfilePhotoFromDevice } from "../../utils/profilePhotoUpload";

export default function CoachProfile() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const coachId = storedUser?.id;

  const [profile, setProfile] = useState(null);
  const [rosterCount, setRosterCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coachId) {
      navigate("/login");
      return;
    }
    fetchCoachData();
  }, [coachId]);

  const fetchCoachData = async () => {
    try {
      setLoading(true);
      const [profRes, rosterRes] = await Promise.allSettled([
        api.get(`/users/profile/${coachId}`),
        api.get(`/coach/assignments/coach/${coachId}`)
      ]);

      if (profRes.status === "fulfilled") {
        setProfile(profRes.value.data);
      }
      if (rosterRes.status === "fulfilled") {
        setRosterCount(rosterRes.value.data?.length || 0);
      }
    } catch (err) {
      console.error("Error fetching coach profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleUpdated = (e) => {
      if (e.detail?.profileImage) {
        setProfile((prev) => ({ ...prev, profileImage: e.detail.profileImage }));
      }
    };
    window.addEventListener("user-profile-updated", handleUpdated);
    return () => window.removeEventListener("user-profile-updated", handleUpdated);
  }, []);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && coachId) {
      uploadProfilePhotoFromDevice(file, coachId, (newImg) => {
        setProfile((prev) => ({ ...prev, profileImage: newImg }));
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-peach/20 border-t-brand-peach rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handlePhotoSelect}
      />

      <div className="space-y-8 max-w-5xl mx-auto pb-12">
        {/* Profile Header Card */}
        <div className="glass-card rounded-3xl p-8 border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-peach/10 blur-[120px] rounded-full pointer-events-none -z-10" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Interactive Avatar with Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer shrink-0"
                title="Click to upload profile photo from device"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-brand-peach/20 to-orange-500/20 border-2 border-brand-peach/40 flex items-center justify-center overflow-hidden text-brand-peach text-3xl font-black shadow-xl shrink-0">
                  {profile?.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    profile?.fullName?.charAt(0) || "C"
                  )}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-3xl bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiCamera className="text-lg text-brand-peach mb-0.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-200">
                    Upload
                  </span>
                </div>

                {/* Corner badge */}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-brand-peach text-brand-dark flex items-center justify-center shadow-lg border-2 border-[#0F1115]">
                  <FiCamera size={13} />
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-peach/10 border border-brand-peach/20 text-brand-peach text-xs font-bold uppercase tracking-wider mb-2">
                  <FiAward /> Official Certified Coach
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {profile?.fullName || "Coach"}
                </h1>
                <p className="text-gray-400 text-sm mt-1 font-medium flex items-center gap-2">
                  <span>{profile?.position || "Head Coach"}</span>
                  {profile?.sport && (
                    <>
                      <span>•</span>
                      <span className="text-brand-peach">{profile.sport}</span>
                    </>
                  )}
                </p>
                {(profile?.city || profile?.country) && (
                  <p className="text-gray-500 text-xs mt-1 flex items-center gap-1.5">
                    <FiMapPin size={13} />
                    <span>
                      {[profile.city, profile.state, profile.country].filter(Boolean).join(", ")}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate("/coach/profile/edit")}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-peach to-orange-500 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-95 shadow-xl shadow-brand-peach/20 transition-all flex items-center gap-2 self-start md:self-auto"
            >
              <FiEdit size={15} />
              <span>Edit Coach Profile</span>
            </button>
          </div>

          {/* Quick Stat Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/5">
            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Active Athletes
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                {rosterCount}
              </span>
            </div>
            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Experience
              </span>
              <span className="text-2xl font-black text-brand-peach mt-1 block">
                {profile?.age ? `${profile.age} Yrs` : "Experienced"}
              </span>
            </div>
            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Discipline
              </span>
              <span className="text-2xl font-black text-white mt-1 block truncate">
                {profile?.sport || "General Athletics"}
              </span>
            </div>
            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Account Role
              </span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                COACH
              </span>
            </div>
          </div>
        </div>

        {/* Contact & Philosophy Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Details */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5 flex items-center gap-2">
              <FiUser className="text-brand-peach" />
              <span>Contact Information</span>
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-gray-500 block mb-0.5">Email Address</span>
                <span className="text-white font-medium flex items-center gap-2">
                  <FiMail className="text-gray-400 text-xs" />
                  {profile?.email || storedUser?.email}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-0.5">Phone Number</span>
                <span className="text-white font-medium flex items-center gap-2">
                  <FiPhone className="text-gray-400 text-xs" />
                  {profile?.phone || "Not provided"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-0.5">Location</span>
                <span className="text-white font-medium flex items-center gap-2">
                  <FiGlobe className="text-gray-400 text-xs" />
                  {[profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ") || "Not set"}
                </span>
              </div>
            </div>
          </div>

          {/* Philosophy & Bio */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-8 border border-white/5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5 flex items-center gap-2">
              <FiAward className="text-brand-peach" />
              <span>Coaching Philosophy & Credentials</span>
            </h2>

            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {profile?.bio ||
                "Welcome to my coaching hub. I specialize in developing athletic conditioning, technical fundamentals, and peak match readiness for competitive athletes."}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
