import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiAward,
  FiCheck,
  FiArrowLeft,
  FiCamera
} from "react-icons/fi";
import { FaDumbbell, FaCalendarAlt } from "react-icons/fa";
import { uploadProfilePhotoFromDevice } from "../../utils/profilePhotoUpload";

const InputField = ({ label, name, value, onChange, icon: Icon, type = "text", placeholder, required = false }) => (
  <div className="relative group">
    <label className="block text-xs font-semibold text-gray-400 mb-2 group-focus-within:text-brand-peach transition-colors">
      {label} {required && <span className="text-rose-400">*</span>}
    </label>
    <div className="relative flex items-center">
      {Icon && (
        <div className="absolute left-4 text-gray-500 group-focus-within:text-brand-peach transition-colors">
          <Icon size={17} />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-[#111317]/90 border border-white/10 rounded-2xl py-3.5 ${
          Icon ? "pl-11" : "pl-4"
        } pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-peach/50 focus:ring-1 focus:ring-brand-peach/50 transition-all text-sm`}
      />
    </div>
  </div>
);

export default function CoachEditProfile() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const coachId = storedUser?.id;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    sport: "",
    position: "", // Used as Coaching Designation / Title
    age: "",      // Used as Years of Experience
    gender: "",
    city: "",
    state: "",
    country: "",
    bio: "",
    profileImage: ""
  });

  useEffect(() => {
    if (!coachId) {
      toast.error("User session not found. Please log in.");
      navigate("/login");
      return;
    }
    loadProfile();
  }, [coachId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/profile/${coachId}`);
      if (res.data) {
        setFormData({
          fullName: res.data.fullName || "",
          phone: res.data.phone || "",
          sport: res.data.sport || "",
          position: res.data.position || "",
          age: res.data.age || "",
          gender: res.data.gender || "",
          city: res.data.city || "",
          state: res.data.state || "",
          country: res.data.country || "",
          bio: res.data.bio || "",
          profileImage: res.data.profileImage || ""
        });
      }
    } catch (err) {
      console.error("Failed to load coach profile:", err);
      toast.error("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        sport: formData.sport.trim(),
        position: formData.position.trim(),
        age: formData.age ? parseInt(formData.age, 10) : null,
        gender: formData.gender,
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        bio: formData.bio.trim(),
        profileImage: formData.profileImage.trim()
      };

      await api.put(`/users/profile/${coachId}`, payload);

      // Synchronize localStorage so Topbar and Welcome headers update immediately
      const updatedUser = {
        ...storedUser,
        fullName: payload.fullName,
        profileImage: payload.profileImage
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Coach profile updated successfully!");
      setTimeout(() => {
        navigate("/settings");
      }, 1000);
    } catch (err) {
      console.error("Failed to update coach profile:", err);
      toast.error(err.response?.data?.message || "Failed to update profile.");
      setIsSubmitting(false);
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
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Top Navigation & Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/settings")}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition px-3 py-1.5 rounded-xl bg-white/5 border border-white/10"
          >
            <FiArrowLeft size={14} />
            <span>Back to Settings</span>
          </button>
          <span className="text-xs text-brand-peach font-mono uppercase tracking-widest font-bold">
            Coach Management
          </span>
        </div>

        {/* Header Banner */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-peach/10 blur-[100px] rounded-full pointer-events-none -z-10" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-peach/20 to-orange-500/20 border-2 border-brand-peach/40 flex items-center justify-center overflow-hidden text-brand-peach text-2xl font-black shadow-lg">
                {formData.profileImage ? (
                  <img
                    src={formData.profileImage}
                    alt={formData.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  formData.fullName?.charAt(0) || "C"
                )}
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-peach/10 border border-brand-peach/20 text-brand-peach text-[11px] font-bold uppercase tracking-wider mb-1.5">
                Official Coach Persona
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Edit Coach Profile
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                Manage your professional credentials, sport discipline, contact details, and philosophy.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="glass-card rounded-3xl p-6 sm:p-10 border border-white/5 shadow-2xl relative space-y-8"
        >
          {/* Section: Personal & Contact */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
              <FiUser className="text-brand-peach" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Personal Information
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                icon={FiUser}
                placeholder="Coach Full Name"
                required
              />
              <InputField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                icon={FiPhone}
                placeholder="+91 9876543210"
                required
              />
              <InputField
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                icon={FiUser}
                placeholder="Male / Female / Other"
              />
              <InputField
                label="Years of Experience / Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                icon={FaCalendarAlt}
                placeholder="e.g. 10 (years of coaching)"
              />
            </div>
          </div>

          {/* Section: Professional Coaching Details */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
              <FiAward className="text-brand-peach" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Coaching Credentials & Sport
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField
                label="Primary Sport / Discipline"
                name="sport"
                value={formData.sport}
                onChange={handleChange}
                icon={FaDumbbell}
                placeholder="e.g. Football, Track & Field, Swimming"
              />
              <InputField
                label="Coaching Title / Designation"
                name="position"
                value={formData.position}
                onChange={handleChange}
                icon={FiAward}
                placeholder="e.g. Head Coach, Strength & Conditioning Specialist"
              />
              <div className="sm:col-span-2 space-y-2">
                <input
                  type="file"
                  id="coach-profile-file-input"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && coachId) {
                      uploadProfilePhotoFromDevice(file, coachId, (newImg) => {
                        setFormData((prev) => ({ ...prev, profileImage: newImg }));
                      });
                    }
                  }}
                />
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                  <div className="flex-1">
                    <InputField
                      label="Profile Image URL or Uploaded Image"
                      name="profileImage"
                      value={formData.profileImage}
                      onChange={handleChange}
                      icon={FiCamera}
                      placeholder="https://example.com/coach-photo.jpg or click upload"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => document.getElementById("coach-profile-file-input")?.click()}
                    className="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-brand-peach hover:text-black border border-white/10 text-xs font-bold text-gray-200 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <FiCamera size={15} />
                    <span>Upload from Device</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Location */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
              <FiMapPin className="text-brand-peach" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Location & Base
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                icon={FiMapPin}
                placeholder="e.g. Kochi"
              />
              <InputField
                label="State / Province"
                name="state"
                value={formData.state}
                onChange={handleChange}
                icon={FiMapPin}
                placeholder="e.g. Kerala"
              />
              <InputField
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                icon={FiGlobe}
                placeholder="e.g. India"
              />
            </div>
          </div>

          {/* Section: Coaching Philosophy & Bio */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Coaching Philosophy & Bio
              </h2>
            </div>
            <textarea
              name="bio"
              rows={4}
              value={formData.bio || ""}
              onChange={handleChange}
              placeholder="Describe your coaching methodology, career achievements, player development track record, or certifications (e.g. AFC B License, CSCS)..."
              className="w-full bg-[#111317]/90 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-peach/50 focus:ring-1 focus:ring-brand-peach/50 transition-all text-sm leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition font-bold text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-peach to-orange-500 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-95 shadow-lg shadow-brand-peach/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <FiCheck size={16} />
                  <span>Save Coach Profile</span>
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </DashboardLayout>
  );
}
