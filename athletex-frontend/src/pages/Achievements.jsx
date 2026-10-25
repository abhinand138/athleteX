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
  FaExclamationCircle,
  FaSearch,
  FaFilter,
  FaUpload,
  FaSyncAlt,
  FaClock,
  FaTimesCircle,
  FaEye,
  FaBuilding,
  FaFingerprint
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

  // Modals & UI States
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [previewEvidence, setPreviewEvidence] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, APPROVED, PENDING, COMBINE
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Competition",
    level: "Gold",
    date: "",
    icon: "🏆",
    proofUrl: "",
    proofType: "IMAGE",
    tournamentName: "",
    organizer: "",
    sanctionId: ""
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
  /* SYNC COMBINE PRs */
  /* ============================= */
  const handleSyncCombine = async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const user = JSON.parse(storedUser);

    setSyncing(true);
    try {
      const res = await api.post(`/achievements/athlete/${user.id}/sync-combine`);
      setAchievements(res.data || []);
      const badgesRes = await api.get(`/achievements/athlete/${user.id}/badges`);
      setBadges(badgesRes.data || []);
      toast.success("Trophy cabinet synchronized with Coach-Approved Combine PRs! ⚡");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to sync combine PRs."));
    } finally {
      setSyncing(false);
    }
  };

  /* ============================= */
  /* DIRECT FILE UPLOAD */
  /* ============================= */
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size cannot exceed 15MB");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", file);

    setUploadingProof(true);
    try {
      const res = await api.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setFormData((prev) => ({
        ...prev,
        proofUrl: res.data.url,
        proofType: res.data.fileType || "IMAGE"
      }));

      // Clear proofUrl error if any
      setFieldErrors((prev) => ({ ...prev, proofUrl: "" }));
      toast.success("Evidence document uploaded and attached! 📎");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload evidence file."));
    } finally {
      setUploadingProof(false);
    }
  };

  /* ============================= */
  /* HANDLE INPUT & REALTIME VALIDATION */
  /* ============================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
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
      if (
        !url.startsWith("http://") &&
        !url.startsWith("https://") &&
        !url.startsWith("/api/uploads/") &&
        !url.startsWith("/uploads/")
      ) {
        errors.proofUrl = "Proof URL must be a valid link or uploaded file path.";
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

      await api.post(`/achievements`, {
        athleteId: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        level: formData.level,
        date: formData.date,
        icon: formData.icon,
        proofUrl: formData.proofUrl ? formData.proofUrl.trim() : null,
        proofType: formData.proofType,
        tournamentName: formData.tournamentName ? formData.tournamentName.trim() : null,
        organizer: formData.organizer ? formData.organizer.trim() : null,
        sanctionId: formData.sanctionId ? formData.sanctionId.trim() : null
      });

      toast.success("Achievement logged! Submitted to coach for official verification.");
      setMessage("Achievement submitted successfully. Verification status: PENDING.");

      setFormData({
        title: "",
        description: "",
        category: "Competition",
        level: "Gold",
        date: "",
        icon: "🏆",
        proofUrl: "",
        proofType: "IMAGE",
        tournamentName: "",
        organizer: "",
        sanctionId: ""
      });

      setFieldErrors({ title: "", description: "", date: "", proofUrl: "" });
      setShowForm(false);
      await fetchAchievementsAndBadges();
    } catch (error) {
      console.error("Create Achievement Error:", error);
      setError(getErrorMessage(error, "Unable to create achievement."));
      toast.error(getErrorMessage(error, "Failed to create achievement."));
    } finally {
      setSaving(false);
    }
  };

  /* ============================= */
  /* SHARE & VERIFY HANDLERS */
  /* ============================= */

  const handleShareLinkedIn = (achievement) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const certParam = achievement.certificateHash || achievement.id;
    const shareUrl = encodeURIComponent(`${window.location.origin}/verify/${user.id || ""}?cert=${certParam}`);
    const title = encodeURIComponent(`🏆 Proud to announce my verified achievement: ${achievement.title} on AthleteX!`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&title=${title}`, "_blank");
  };

  const handleShareTwitter = (achievement) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const certParam = achievement.certificateHash || achievement.id;
    const shareUrl = `${window.location.origin}/verify/${user.id || ""}?cert=${certParam}`;
    const text = encodeURIComponent(`🏆 Unlocked verified milestone '${achievement.title}' on AthleteX! Audit official credentials: ${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const handleCopyVerificationLink = (achievement = null) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const certParam = achievement ? `?cert=${achievement.certificateHash || achievement.id}` : "";
    const verifyUrl = `${window.location.origin}/verify/${user.id || ""}${certParam}`;
    navigator.clipboard.writeText(verifyUrl);
    toast.success("Public Verification Link copied with cryptographic token! 📋");
  };

  /* ============================= */
  /* FILTERED ACHIEVEMENTS */
  /* ============================= */

  const filteredAchievements = achievements.filter((ach) => {
    // Search
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ach.title?.toLowerCase().includes(q) ||
      ach.description?.toLowerCase().includes(q) ||
      ach.tournamentName?.toLowerCase().includes(q) ||
      ach.organizer?.toLowerCase().includes(q) ||
      ach.sanctionId?.toLowerCase().includes(q) ||
      ach.category?.toLowerCase().includes(q) ||
      ach.level?.toLowerCase().includes(q);

    // Status Filter
    const isApproved = ach.verificationStatus === "APPROVED" || Boolean(ach.isVerified);
    const isPending = ach.verificationStatus === "PENDING" && !ach.isVerified;
    const isCombine = ach.tournamentName?.includes("Combine") || ach.sanctionId?.startsWith("COMBINE-");

    let matchesStatus = true;
    if (statusFilter === "APPROVED") matchesStatus = isApproved;
    if (statusFilter === "PENDING") matchesStatus = isPending;
    if (statusFilter === "COMBINE") matchesStatus = isCombine;

    // Category Filter
    const matchesCategory =
      categoryFilter === "ALL" ||
      ach.category?.toLowerCase() === categoryFilter.toLowerCase();

    // Level Filter
    const matchesLevel =
      levelFilter === "ALL" ||
      ach.level?.toLowerCase() === levelFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory && matchesLevel;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-brand-peach/20 border-t-brand-peach rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 mt-5">Loading accredited achievements and badges...</p>
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
                Athlete Accreditation & Trophies
              </p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
                Achievements & Badges
              </h1>
              <p className="text-gray-400 mt-3 text-lg font-medium">
                Your coach-certified milestones, tournament medals, and authenticated athletic proofs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSyncCombine}
                disabled={syncing}
                title="Sync coach-approved combine benchmark PRs into trophy cabinet"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-brand-peach/30 text-brand-peach hover:bg-brand-peach/10 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                <FaSyncAlt className={syncing ? "animate-spin" : ""} />
                <span>{syncing ? "Syncing..." : "Sync Combine PRs"}</span>
              </button>

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

        {/* ADD ACHIEVEMENT FORM WITH DIRECT FILE UPLOAD & FEDERATION SANCTIONS */}
        {showForm && (
          <div className="glass-card rounded-2xl p-8 shadow-xl relative overflow-hidden border border-brand-peach/30">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-peach/10 blur-[60px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <p className="text-brand-peach text-xs font-bold tracking-[0.2em] uppercase">
                  Accreditation Claim
                </p>
                <h2 className="text-2xl font-bold text-white mt-2">
                  Add Achievement & Authenticated Evidence
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Submitted achievements enter your coach's verification queue before public certification.
                </p>
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
                  placeholder="e.g. State Track & Field Championship 100m Gold"
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

              {/* TOURNAMENT / EVENT & FEDERATION SANCTION */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                  <FaBuilding className="text-brand-peach text-xs" /> Tournament / Meet Name (Optional)
                </label>
                <input
                  type="text"
                  name="tournamentName"
                  value={formData.tournamentName}
                  onChange={handleChange}
                  placeholder="e.g. 64th National Inter-State Athletics"
                  className="w-full bg-white/5 border border-white/10 focus:border-brand-peach/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                  <FaFingerprint className="text-brand-peach text-xs" /> Sanction / License ID (Optional)
                </label>
                <input
                  type="text"
                  name="sanctionId"
                  value={formData.sanctionId}
                  onChange={handleChange}
                  placeholder="e.g. AFI/2026/G-104 or Match BIB"
                  className="w-full bg-white/5 border border-white/10 focus:border-brand-peach/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors"
                />
              </div>

              {/* ORGANIZER / FEDERATION */}
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">
                  Governing Body / Federation (Optional)
                </label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  placeholder="e.g. Athletics Federation of India / BCCI / FIFA Recognized Academy"
                  className="w-full bg-white/5 border border-white/10 focus:border-brand-peach/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors"
                />
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
                  placeholder="Detail your performance, timing, score, or podium finish..."
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

              {/* DIRECT FILE UPLOAD OR URL EVIDENCE */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-white/[0.02] border border-brand-peach/30 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-brand-peach uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <FaImage /> Authenticated Media Evidence / Proof
                  </label>
                  <span className="text-[10px] text-gray-400">JPG, PNG, WEBP, PDF (Max 15MB)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File Upload Button */}
                  <div>
                    <label className="w-full h-12 rounded-xl bg-brand-peach/10 hover:bg-brand-peach/20 border border-brand-peach/40 flex items-center justify-center gap-2 text-brand-peach text-xs font-bold uppercase tracking-wider cursor-pointer transition-all">
                      <FaUpload className={uploadingProof ? "animate-bounce" : ""} />
                      <span>{uploadingProof ? "Uploading..." : "Upload Certificate / Photo"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingProof}
                      />
                    </label>
                  </div>

                  {/* External URL alternative */}
                  <div>
                    <input
                      type="text"
                      name="proofUrl"
                      value={formData.proofUrl}
                      onChange={handleChange}
                      placeholder="Or paste external URL (http://...)"
                      className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none transition-colors ${
                        fieldErrors.proofUrl ? "border-red-500/60" : "border-white/10 focus:border-brand-peach/50"
                      }`}
                    />
                  </div>
                </div>

                {formData.proofUrl && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                    <span className="flex items-center gap-2 truncate">
                      <FaCheckCircle /> Attached: <strong className="font-mono truncate">{formData.proofUrl}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, proofUrl: "", proofType: "IMAGE" })}
                      className="text-red-400 hover:text-red-300 font-bold ml-2 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {fieldErrors.proofUrl && (
                  <p className="text-red-400 text-xs flex items-center gap-1 font-medium">
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
                  <option value="CHAMPIONSHIP">Championship</option>
                  <option value="RECORD">Record</option>
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
                  <option value="National">National Level</option>
                  <option value="State">State Level</option>
                  <option value="District">District Level</option>
                  <option value="Personal Best">Personal Best</option>
                </select>
              </div>

              {/* DATE */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">
                  Date <span className="text-red-400">*</span>
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
                  <option value="⚡">⚡ Lightning PR</option>
                  <option value="🔥">🔥 Streak / Milestone</option>
                  <option value="👑">👑 Championship</option>
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
                  disabled={saving || uploadingProof}
                  className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-brand-peach text-black hover:bg-brand-peach/90 transition-all font-bold text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer shadow-lg"
                >
                  {saving ? "Submitting..." : <><FaPlus /> Submit for Verification</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* GAMIFICATION BADGES SHOWCASE (12 SPORT-REALISTIC BADGES) */}
        <div className="glass-card rounded-3xl p-7 border border-brand-peach/20 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FaStar className="text-amber-400 text-lg" />
                <h2 className="text-2xl font-black text-white">Trophy Cabinet & Accredited Badges</h2>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                Standardized physical combine PRs, tournament accolades, and verified federation credentials
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold flex items-center gap-1.5">
                <FaTrophy className="text-amber-400 text-xs" />
                <span>{unlockedBadgesCount} / {badges.length} Unlocked</span>
              </span>

              <button
                onClick={() => handleCopyVerificationLink()}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FaLink className="text-brand-peach text-xs" />
                <span>Public Verification Link</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 relative overflow-hidden ${
                  b.isUnlocked
                    ? "bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/40 shadow-lg shadow-amber-500/10"
                    : "bg-white/[0.02] border-white/5 opacity-55"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{b.icon}</span>
                  {b.isUnlocked ? (
                    <span className="text-emerald-400 text-[10px] flex items-center gap-1 font-black uppercase tracking-wider">
                      <FaUnlock className="text-[9px]" /> UNLOCKED
                    </span>
                  ) : (
                    <span className="text-gray-500 text-[10px] flex items-center gap-1 font-bold uppercase tracking-wider">
                      <FaLock className="text-[9px]" /> LOCKED
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-xs font-black text-white line-clamp-1">{b.title}</p>
                  <p className="text-[10px] text-gray-400 mt-1 leading-snug line-clamp-2">{b.description}</p>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold mb-1">
                    <span>{b.category || "PROGRESS"}</span>
                    <span>{b.progress} / {b.target}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        b.isUnlocked ? "bg-amber-400 shadow-sm shadow-amber-400" : "bg-gray-600"
                      }`}
                      style={{ width: `${Math.min(100, Math.round((b.progress / b.target) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search achievements by title, tournament, federation, or keyword..."
                className="w-full bg-white/5 border border-white/10 focus:border-brand-peach/50 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Quick Status Tabs */}
            <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0 overflow-x-auto">
              {[
                { id: "ALL", label: "All Items" },
                { id: "APPROVED", label: "✔ Verified" },
                { id: "PENDING", label: "⏳ Pending" },
                { id: "COMBINE", label: "⚡ Combine PRs" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === tab.id
                      ? "bg-brand-peach text-black shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <FaFilter className="text-brand-peach text-[10px]" /> Filter:
              </span>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#111317] border border-white/10 rounded-lg px-2.5 py-1 text-gray-300 outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="Competition">Competition</option>
                <option value="Training">Training</option>
                <option value="Award">Award</option>
                <option value="Milestone">Milestone</option>
              </select>

              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="bg-[#111317] border border-white/10 rounded-lg px-2.5 py-1 text-gray-300 outline-none"
              >
                <option value="ALL">All Levels</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Bronze">Bronze</option>
                <option value="National">National</option>
                <option value="State">State</option>
                <option value="Personal Best">Personal Best</option>
              </select>
            </div>

            <span className="text-gray-400 font-mono font-bold">
              Showing {filteredAchievements.length} of {achievements.length} Accolades
            </span>
          </div>
        </div>

        {/* ACHIEVEMENTS GRID */}
        {filteredAchievements.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 shadow-xl text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
              <FaTrophy className="text-gray-600 text-3xl" />
            </div>
            <h2 className="text-xl font-bold text-white mt-6">
              {searchQuery || statusFilter !== "ALL" ? "No Matching Achievements" : "No Achievements Yet"}
            </h2>
            <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">
              {searchQuery || statusFilter !== "ALL"
                ? "Try adjusting your search criteria or resetting the status filters."
                : "Log your first competition medal or click 'Sync Combine PRs' to import verified drills."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => {
              const isApproved = achievement.verificationStatus === "APPROVED" || Boolean(achievement.isVerified);
              const isPending = achievement.verificationStatus === "PENDING" && !achievement.isVerified;
              const isRejected = achievement.verificationStatus === "REJECTED";

              return (
                <div
                  key={achievement.id}
                  className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-brand-peach/40 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-peach/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-brand-peach/20 transition-colors duration-500" />

                  <div>
                    {/* Top Badges Bar */}
                    <div className="flex items-start justify-between relative z-10 gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-brand-peach/10 border border-brand-peach/20 flex items-center justify-center text-2xl shrink-0">
                        {achievement.icon || "🏆"}
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase bg-brand-peach/10 text-brand-peach px-3 py-1 rounded-full border border-brand-peach/20">
                          <FaMedal className="text-[10px]" />
                          {achievement.level || "Achievement"}
                        </span>

                        {isApproved && (
                          <span className="flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                            <FaCheckCircle className="text-[10px]" />
                            <span>Verified by Coach</span>
                          </span>
                        )}

                        {isPending && (
                          <span className="flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                            <FaClock className="text-[9px]" />
                            <span>Pending Review</span>
                          </span>
                        )}

                        {isRejected && (
                          <span className="flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase bg-red-500/10 text-red-400 px-2.5 py-0.5 rounded-md border border-red-500/30">
                            <FaTimesCircle className="text-[9px]" />
                            <span>Revision Needed</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-white mt-5 relative z-10 group-hover:text-brand-peach transition-colors">
                      {achievement.title}
                    </h2>

                    {/* Federation / Tournament Tag */}
                    {(achievement.tournamentName || achievement.sanctionId) && (
                      <div className="mt-2 text-xs font-semibold text-brand-peach/90 flex flex-wrap items-center gap-2 relative z-10">
                        {achievement.tournamentName && <span>🏆 {achievement.tournamentName}</span>}
                        {achievement.sanctionId && (
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">
                            ID: {achievement.sanctionId}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-gray-400 text-sm mt-2 leading-relaxed relative z-10 line-clamp-3">
                      {achievement.description || "Achievement accredited on AthleteX."}
                    </p>

                    {/* Coach Feedback if rejected */}
                    {isRejected && achievement.coachFeedback && (
                      <div className="mt-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 relative z-10">
                        <strong className="block text-red-400 mb-0.5">Coach Feedback:</strong>
                        {achievement.coachFeedback}
                      </div>
                    )}

                    {/* Metadata Grid */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs relative z-10">
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

                    {/* Cryptographic Digital Signature Token */}
                    {achievement.certificateHash && (
                      <div className="mt-3 text-[10px] font-mono text-gray-500 flex items-center gap-1 relative z-10 truncate">
                        <FaFingerprint className="text-brand-peach text-xs shrink-0" />
                        <span className="truncate">SIG: {achievement.certificateHash}</span>
                      </div>
                    )}

                    {/* PROOF EVIDENCE LINK IF AVAILABLE */}
                    {achievement.proofUrl && (
                      <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs relative z-10">
                        <span className="text-gray-300 font-medium flex items-center gap-1.5">
                          <FaImage className="text-brand-peach" /> Media Evidence
                        </span>
                        <button
                          onClick={() => setPreviewEvidence(achievement)}
                          className="text-brand-peach hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <FaEye className="text-[10px]" /> View Evidence
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ACTION & SOCIAL SHARE BAR */}
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShareLinkedIn(achievement)}
                        title="Share Accredited Milestone to LinkedIn"
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
                        onClick={() => handleCopyVerificationLink(achievement)}
                        title="Copy Public Verification Link with Token"
                        className="p-2 rounded-xl bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:bg-white/10 transition-all text-xs cursor-pointer"
                      >
                        <FaLink />
                      </button>
                    </div>

                    <button
                      onClick={async () => {
                        const user = JSON.parse(localStorage.getItem("user") || "{}");
                        try {
                          await generateAchievementCertificate(
                            achievement,
                            user?.fullName,
                            achievement.verifiedByCoachName || achievement.coachName
                          );
                          toast.success("Official Certificate downloaded with Scannable QR Code! 📜");
                        } catch (err) {
                          console.error("Certificate generation error:", err);
                          toast.error("Failed to generate certificate.");
                        }
                      }}
                      title="Download Official Accredited PDF Certificate with Scannable QR"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-peach/10 hover:bg-brand-peach border border-brand-peach/30 hover:border-brand-peach text-brand-peach hover:text-black text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      <FaCertificate className="text-xs" />
                      <span>PDF Certificate</span>
                      <FaDownload className="text-[10px]" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* IN-APP EVIDENCE LIGHTBOX / PREVIEW MODAL */}
        {previewEvidence && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-card bg-[#12151e] border border-brand-peach/30 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Media Evidence Proof</h3>
                  <p className="text-xs text-brand-peach">{previewEvidence.title}</p>
                </div>
                <button
                  onClick={() => setPreviewEvidence(null)}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="rounded-2xl bg-black/50 border border-white/10 p-2 overflow-hidden flex items-center justify-center min-h-[250px] max-h-[500px]">
                {previewEvidence.proofUrl?.toLowerCase().endsWith(".pdf") ? (
                  <div className="text-center p-8 space-y-3">
                    <FaCertificate className="text-4xl text-brand-peach mx-auto" />
                    <p className="text-sm text-gray-300">PDF Document Proof Attached</p>
                    <a
                      href={previewEvidence.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-peach text-black text-xs font-bold uppercase tracking-wider"
                    >
                      Open PDF in New Window <FaExternalLinkAlt />
                    </a>
                  </div>
                ) : (
                  <img
                    src={previewEvidence.proofUrl}
                    alt="Achievement Evidence"
                    className="max-h-[460px] w-auto object-contain rounded-xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
                <span className="font-mono text-[10px] truncate max-w-xs">{previewEvidence.proofUrl}</span>
                <a
                  href={previewEvidence.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-peach hover:underline font-bold flex items-center gap-1"
                >
                  Open Original <FaExternalLinkAlt className="text-[10px]" />
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}