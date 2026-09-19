import { useEffect, useState } from "react";
import {
  FaTrophy,
  FaMedal,
  FaCalendarAlt,
  FaPlus,
  FaTimes,
  FaDownload,
  FaCertificate,
  FaAward,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaShareAlt,
  FaLinkedin,
  FaTwitter,
  FaLink,
  FaLock,
  FaUnlock,
  FaImage,
  FaStar,
  FaShieldAlt,
  FaExclamationCircle
} from "react-icons/fa";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import { generateAchievementCertificate } from "../utils/certificateGenerator";
import { getErrorMessage } from "../utils/errorHandler";

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Competition",
    level: "Gold",
    date: "",
    icon: "🏆",
    proofUrl: "",
    proofType: "IMAGE"
  });

  const [fieldErrors, setFieldErrors] = useState({
    title: "",
    description: "",
    date: "",
    proofUrl: ""
  });

  const todayDateStr = new Date().toISOString().split("T")[0];

  /* ============================= */
  /* FETCH ACHIEVEMENTS & BADGES */
  /* ============================= */

  const fetchAchievementsAndBadges = async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setError("User session not found. Please login again.");
        return;
      }

      const user = JSON.parse(storedUser);

      if (!user?.id) {
        setError("User ID not found. Please login again.");
        return;
      }

      const [achievementsRes, badgesRes] = await Promise.all([
        api.get(`/achievements/athlete/${user.id}`),
        api.get(`/achievements/athlete/${user.id}/badges`)
      ]);

      setAchievements(achievementsRes.data || []);
      setBadges(badgesRes.data || []);
    } catch (error) {
      console.error("Achievements API Error:", error);
      setError(getErrorMessage(error, "Unable to load achievements."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievementsAndBadges();
  }, []);

  /* ============================= */
  /* HANDLE INPUT & REALTIME VALIDATION */
  /* ============================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear specific field error
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ""
      });
    }

    setMessage("");
    setError("");
  };

  const validateForm = () => {
    const errors = { title: "", description: "", date: "", proofUrl: "" };
    let isValid = true;

    if (!formData.title || formData.title.trim().length < 3) {
      errors.title = "Achievement title must be at least 3 characters long.";
      isValid = false;
    } else if (formData.title.trim().length > 100) {
      errors.title = "Achievement title cannot exceed 100 characters.";
      isValid = false;
    }

    if (!formData.description || formData.description.trim().length < 5) {
      errors.description = "Description must be at least 5 characters long.";
      isValid = false;
    } else if (formData.description.trim().length > 500) {
      errors.description = "Description cannot exceed 500 characters.";
      isValid = false;
    }

    if (!formData.date) {
      errors.date = "Achievement date is required.";
      isValid = false;
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        errors.date = "Achievement date cannot be in the future.";
        isValid = false;
      }
    }

    if (formData.proofUrl && formData.proofUrl.trim()) {
      const url = formData.proofUrl.trim().toLowerCase();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        errors.proofUrl = "Proof URL must be a valid web link starting with http:// or https://";
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  /* ============================= */
  /* CREATE ACHIEVEMENT */
  /* ============================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix validation errors before submitting.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setError("User session not found. Please login again.");
        return;
      }

      const user = JSON.parse(storedUser);

      if (!user?.id) {
        setError("User ID not found. Please login again.");
        return;
      }

      const response = await api.post(
        `/achievements/${user.id}`,
        formData
      );

      setMessage("Achievement added successfully.");

      setFormData({
        title: "",
        description: "",
        category: "Competition",
        level: "Gold",
        date: "",
        icon: "🏆",
        proofUrl: "",
        proofType: "IMAGE"
      });

      setFieldErrors({ title: "", description: "", date: "", proofUrl: "" });
      setShowForm(false);

      await fetchAchievementsAndBadges();

    } catch (error) {
      console.error("Create Achievement Error:", error);
      setError(getErrorMessage(error, "Unable to create achievement."));
    } finally {
      setSaving(false);
    }
  };

  /* ============================= */
  /* SHARE HANDLERS */
  /* ============================= */

  const handleShareLinkedIn = (achievement) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const shareUrl = encodeURIComponent(`${window.location.origin}/verify/${user.id || ""}`);
    const title = encodeURIComponent(`🏆 Proud to announce my achievement: ${achievement.title} on AthleteX!`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&title=${title}`, "_blank");
  };

  const handleShareTwitter = (achievement) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const shareUrl = `${window.location.origin}/verify/${user.id || ""}`;
    const text = encodeURIComponent(`🏆 Unlocked '${achievement.title}' on AthleteX! Check out my official athletic milestone: ${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const handleCopyVerificationLink = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const verifyUrl = `${window.location.origin}/verify/${user.id || ""}`;
    navigator.clipboard.writeText(verifyUrl);
    toast.success("Public Verification Link copied to clipboard! 📋");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-brand-peach/20 border-t-brand-peach rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 mt-5">Loading achievements and milestone badges...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && achievements.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="bg-[#111317] border border-red-500/20 rounded-2xl p-8 text-center max-w-md">
            <h2 className="text-xl font-bold text-white">Achievements Unavailable</h2>
            <p className="text-gray-400 mt-3">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const unlockedBadgesCount = badges.filter((b) => b.isUnlocked).length;

  return (
    <DashboardLayout>
      <div className="space-y-10 relative z-10 pb-16">

        {/* HEADER */}
        <div className="relative">
          <div className="absolute -left-10 -top-10 w-64 h-64 bg-brand-peach/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 relative z-10">
            <div>
              <p className="text-brand-peach text-xs font-bold tracking-[0.25em] uppercase mb-3">
                Athlete Milestones
              </p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
                Achievements & Badges
              </h1>
              <p className="text-gray-400 mt-3 text-lg font-medium">
                Your accredited milestones, trophy cabinet, and verified athletic proofs.
              </p>
            </div>

            <button
              onClick={() => {
                setShowForm(true);
                setMessage("");
                setError("");
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-peach text-black rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-brand-peach/90 transition-all shadow-lg cursor-pointer"
            >
              <FaPlus />
              Add Achievement
            </button>
          </div>
        </div>

        {/* MESSAGE */}
        {(message || (error && achievements.length > 0)) && (
          <div
            className={`rounded-xl px-5 py-3 text-sm font-medium border ${
              message
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {message || error}
          </div>
        )}

        {/* ADD ACHIEVEMENT FORM WITH VALIDATIONS */}
        {showForm && (
          <div className="glass-card rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-peach/10 blur-[60px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <p className="text-brand-peach text-xs font-bold tracking-[0.2em] uppercase">
                  New Milestone
                </p>
                <h2 className="text-2xl font-bold text-white mt-2">
                  Add Achievement & Proof
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {/* TITLE */}
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">
                  Achievement Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. District Championship 100m Gold"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors ${
                    fieldErrors.title ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-brand-peach/50"
                  }`}
                />
                {fieldErrors.title && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <FaExclamationCircle /> {fieldErrors.title}
                  </p>
                )}
              </div>

              {/* DESCRIPTION */}
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your athletic achievement in detail..."
                  rows="3"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors resize-none ${
                    fieldErrors.description ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-brand-peach/50"
                  }`}
                />
                {fieldErrors.description && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <FaExclamationCircle /> {fieldErrors.description}
                  </p>
                )}
              </div>

              {/* PROOF URL */}
              <div className="md:col-span-2">
                <label className="block text-xs text-brand-peach uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                  <FaImage /> Optional Evidence / Proof Link
                </label>
                <input
                  type="url"
                  name="proofUrl"
                  value={formData.proofUrl}
                  onChange={handleChange}
                  placeholder="e.g. https://example.com/medal_photo.jpg or timing certificate URL"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors ${
                    fieldErrors.proofUrl ? "border-red-500/60 focus:border-red-500" : "border-brand-peach/30 focus:border-brand-peach"
                  }`}
                />
                {fieldErrors.proofUrl && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <FaExclamationCircle /> {fieldErrors.proofUrl}
                  </p>
                )}
              </div>

              {/* CATEGORY */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-[#111317] border border-white/10 focus:border-brand-peach/50 rounded-xl px-4 py-3 text-white outline-none transition-colors"
                >
                  <option value="Competition">Competition</option>
                  <option value="Training">Training</option>
                  <option value="Award">Award</option>
                  <option value="Milestone">Milestone</option>
                </select>
              </div>

              {/* LEVEL */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">
                  Level
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full bg-[#111317] border border-white/10 focus:border-brand-peach/50 rounded-xl px-4 py-3 text-white outline-none transition-colors"
                >
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Personal Best">Personal Best</option>
                </select>
              </div>

              {/* DATE */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">
                  Date <span className="text-red-400">*</span> (Cannot be in the future)
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  max={todayDateStr}
                  onChange={handleChange}
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white outline-none transition-colors ${
                    fieldErrors.date ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-brand-peach/50"
                  }`}
                />
                {fieldErrors.date && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <FaExclamationCircle /> {fieldErrors.date}
                  </p>
                )}
              </div>

              {/* ICON */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">
                  Icon
                </label>
                <select
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="w-full bg-[#111317] border border-white/10 focus:border-brand-peach/50 rounded-xl px-4 py-3 text-white outline-none transition-colors"
                >
                  <option value="🏆">🏆 Trophy</option>
                  <option value="🥇">🥇 Gold Medal</option>
                  <option value="🥈">🥈 Silver Medal</option>
                  <option value="🥉">🥉 Bronze Medal</option>
                  <option value="⭐">⭐ Star</option>
                  <option value="🔥">🔥 Milestone</option>
                </select>
              </div>

              {/* BUTTONS */}
              <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-brand-peach text-black hover:bg-brand-peach/90 transition-all font-bold text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer shadow-lg"
                >
                  {saving ? "Saving..." : <><FaPlus /> Save Achievement</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* GAMIFICATION BADGES SHOWCASE */}
        <div className="glass-card rounded-3xl p-7 border border-brand-peach/20 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FaStar className="text-amber-400 text-lg" />
                <h2 className="text-2xl font-black text-white">Trophy Cabinet & Milestone Badges</h2>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                Automated system badges earned through athletic accomplishments
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold flex items-center gap-1.5">
                <FaTrophy className="text-amber-400 text-xs" />
                <span>{unlockedBadgesCount} / {badges.length} Unlocked</span>
              </span>

              <button
                onClick={handleCopyVerificationLink}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FaLink className="text-brand-peach text-xs" />
                <span>Public Profile Link</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 relative overflow-hidden ${
                  b.isUnlocked
                    ? "bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/30 shadow-lg shadow-amber-500/5"
                    : "bg-white/[0.02] border-white/5 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{b.icon}</span>
                  {b.isUnlocked ? (
                    <span className="text-emerald-400 text-xs flex items-center gap-1 font-bold">
                      <FaUnlock className="text-[10px]" /> UNLOCKED
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs flex items-center gap-1 font-bold">
                      <FaLock className="text-[10px]" /> LOCKED
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-sm font-black text-white">{b.title}</p>
                  <p className="text-[11px] text-gray-400 mt-1 leading-snug line-clamp-2">{b.description}</p>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold mb-1">
                    <span>PROGRESS</span>
                    <span>{b.progress} / {b.target}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        b.isUnlocked ? "bg-amber-400" : "bg-gray-600"
                      }`}
                      style={{ width: `${Math.min(100, Math.round((b.progress / b.target) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACHIEVEMENTS GRID */}
        {achievements.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 shadow-xl text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
              <FaTrophy className="text-gray-600 text-3xl" />
            </div>
            <h2 className="text-xl font-bold text-white mt-6">No Achievements Yet</h2>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Your achievements will appear here as you reach new milestones in your athletic journey.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-brand-peach/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-peach/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-brand-peach/20 transition-colors duration-500" />

                <div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-brand-peach/10 border border-brand-peach/20 flex items-center justify-center text-2xl">
                      {achievement.icon || "🏆"}
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase bg-brand-peach/10 text-brand-peach px-3 py-1.5 rounded-full border border-brand-peach/20">
                        <FaMedal />
                        {achievement.level || "Achievement"}
                      </span>
                      {achievement.isVerified && (
                        <span className="flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/20">
                          <FaCheckCircle className="text-[10px]" /> Verified by Coach
                        </span>
                      )}
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-white mt-6 relative z-10 group-hover:text-brand-peach transition-colors">
                    {achievement.title}
                  </h2>

                  <p className="text-gray-400 text-sm mt-2 leading-relaxed relative z-10">
                    {achievement.description || "Achievement earned by the athlete."}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs relative z-10">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block">Category</span>
                      <span className="text-gray-300 font-semibold">{achievement.category || "General"}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block">Date</span>
                      <span className="text-gray-400 font-mono">
                        {achievement.date ? new Date(achievement.date).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* PROOF EVIDENCE LINK IF AVAILABLE */}
                  {achievement.proofUrl && (
                    <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs relative z-10">
                      <span className="text-gray-300 font-medium flex items-center gap-1.5">
                        <FaImage className="text-brand-peach" /> Media Evidence
                      </span>
                      <a
                        href={achievement.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-peach hover:underline font-bold text-xs flex items-center gap-1"
                      >
                        View Evidence <FaExternalLinkAlt className="text-[9px]" />
                      </a>
                    </div>
                  )}
                </div>

                {/* ACTION & SOCIAL SHARE BAR */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShareLinkedIn(achievement)}
                      title="Share to LinkedIn"
                      className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all text-xs cursor-pointer"
                    >
                      <FaLinkedin />
                    </button>
                    <button
                      onClick={() => handleShareTwitter(achievement)}
                      title="Share to Twitter / X"
                      className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-white transition-all text-xs cursor-pointer"
                    >
                      <FaTwitter />
                    </button>
                    <button
                      onClick={handleCopyVerificationLink}
                      title="Copy Public Profile Link"
                      className="p-2 rounded-xl bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:bg-white/10 transition-all text-xs cursor-pointer"
                    >
                      <FaLink />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const user = JSON.parse(localStorage.getItem("user") || "{}");
                      try {
                        generateAchievementCertificate(achievement, user?.fullName, achievement.coachName);
                        toast.success("Certificate generated & downloaded! 📜");
                      } catch (err) {
                        toast.error("Failed to generate certificate.");
                      }
                    }}
                    title="Download Official Certificate"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-peach/10 hover:bg-brand-peach border border-brand-peach/30 hover:border-brand-peach text-brand-peach hover:text-black text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <FaCertificate className="text-xs" />
                    <span>PDF Certificate</span>
                    <FaDownload className="text-[10px]" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}