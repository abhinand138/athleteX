import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { getErrorMessage } from "../../utils/errorHandler";
import {
  FaTrophy,
  FaMedal,
  FaPlus,
  FaCalendarAlt,
  FaUser,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSearch,
  FaStar,
  FaFire,
  FaAward,
  FaCertificate,
  FaExclamationCircle,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaUpload,
  FaTimesCircle,
  FaExternalLinkAlt,
  FaShieldAlt,
  FaBuilding,
  FaFingerprint
} from "react-icons/fa";

const CATEGORIES = ["ALL", "CHAMPIONSHIP", "MEDAL", "RECORD", "MILESTONE", "AWARD", "OTHER"];
const FORM_CATEGORIES = ["CHAMPIONSHIP", "MEDAL", "RECORD", "MILESTONE", "AWARD", "OTHER"];
const LEVELS = ["Gold", "Silver", "Bronze", "National", "State", "District", "Club", "Special"];
const ICONS = ["🏆", "🥇", "🥈", "🥉", "⭐", "🔥", "🎖️", "🏅", "👑", "🎯", "⚡", "🛡️"];

const TEAM_PRESETS = [
  { title: "Player of the Match", icon: "🏆", category: "AWARD", level: "Special", desc: "Awarded for exceptional match-winning athletic performance." },
  { title: "MVP - Most Valuable Player", icon: "👑", category: "AWARD", level: "Special", desc: "Recognized as the most influential player of the tournament/season." },
  { title: "Defensive Anchor / Clean Sheet", icon: "🛡️", category: "RECORD", level: "Club", desc: "Outstanding defensive discipline and match-saving execution." },
  { title: "Express Benchmark Breakthrough", icon: "⚡", category: "MILESTONE", level: "Personal Best", desc: "Achieved an elite physical speed, stamina, or strength breakthrough." },
  { title: "Coach's Choice - Exemplary Leadership", icon: "⭐", category: "AWARD", level: "Special", desc: "Honored for discipline, work ethic, and selfless team leadership." }
];

export default function CoachAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    totalAchievements: 0,
    thisMonth: 0,
    records: 0,
    awards: 0
  });
  const [assignedAthletes, setAssignedAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Filters & Sorting
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState("ALL"); // ALL, PENDING, VERIFIED, REJECTED
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("NEWEST"); // NEWEST, OLDEST

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [rejectingAchievement, setRejectingAchievement] = useState(null);
  const [rejectionFeedback, setRejectionFeedback] = useState("");
  const [previewEvidence, setPreviewEvidence] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    athleteId: "",
    title: "",
    category: "CHAMPIONSHIP",
    level: "Gold",
    date: new Date().toISOString().split("T")[0],
    icon: "🏆",
    description: "",
    proofUrl: "",
    proofType: "IMAGE",
    tournamentName: "",
    organizer: "",
    sanctionId: ""
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const coachId = storedUser?.id;

  useEffect(() => {
    if (!coachId || storedUser.role !== "COACH") {
      setError("Access denied. Coach authentication required.");
      setLoading(false);
      return;
    }
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [achievementsRes, statsRes, athletesRes] = await Promise.all([
        api.get(`/achievements/coach/${coachId}`),
        api.get(`/achievements/coach/${coachId}/stats`),
        api.get(`/coach/assignments/coach/${coachId}`)
      ]);
      setAchievements(achievementsRes.data || []);
      setStats(statsRes.data || { totalAchievements: 0, thisMonth: 0, records: 0, awards: 0 });
      setAssignedAthletes(athletesRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load achievements data."));
    } finally {
      setLoading(false);
    }
  };

  /* ============================= */
  /* VERIFICATION & ENDORSEMENT */
  /* ============================= */

  const handleVerifyAchievement = async (id) => {
    try {
      await api.put(`/achievements/${id}/verify?coachId=${coachId}`);
      toast.success("Achievement verified and endorsed! Official seal issued. ✔");
      loadAllData();
    } catch (err) {
      toast.error(err.response?.data || "Failed to update verification.");
    }
  };

  const handleRejectAchievement = async () => {
    if (!rejectingAchievement) return;
    try {
      await api.put(`/achievements/${rejectingAchievement.id}/reject?coachId=${coachId}&feedback=${encodeURIComponent(rejectionFeedback || "Evidence did not satisfy official criteria.")}`);
      toast.success("Feedback sent to athlete. Status marked as Revision Requested.");
      setRejectingAchievement(null);
      setRejectionFeedback("");
      loadAllData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to reject achievement."));
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

    setUploadingFile(true);
    try {
      const res = await api.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFormData((prev) => ({
        ...prev,
        proofUrl: res.data.url,
        proofType: res.data.fileType || "IMAGE"
      }));
      toast.success("Evidence document uploaded and attached! 📎");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload file."));
    } finally {
      setUploadingFile(false);
    }
  };

  const applyTeamPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      title: preset.title,
      icon: preset.icon,
      category: preset.category,
      level: preset.level,
      description: preset.desc
    }));
    toast.success(`Preset '${preset.title}' applied!`);
  };

  /* ============================= */
  /* ADD & EDIT SUBMIT */
  /* ============================= */

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.athleteId) return setFormError("Please select an assigned athlete.");
    if (!formData.title.trim()) return setFormError("Achievement title is required.");
    if (!formData.date) return setFormError("Date is required.");

    setSubmitting(true);
    try {
      await api.post("/achievements", {
        coachId,
        athleteId: formData.athleteId,
        title: formData.title.trim(),
        category: formData.category,
        level: formData.level,
        date: formData.date,
        icon: formData.icon,
        description: formData.description.trim(),
        proofUrl: formData.proofUrl ? formData.proofUrl.trim() : null,
        proofType: formData.proofType,
        tournamentName: formData.tournamentName ? formData.tournamentName.trim() : null,
        organizer: formData.organizer ? formData.organizer.trim() : null,
        sanctionId: formData.sanctionId ? formData.sanctionId.trim() : null
      });

      toast.success("Official Team Accolade awarded successfully! 🏆");
      setShowAddModal(false);
      setFormData({
        athleteId: "",
        title: "",
        category: "CHAMPIONSHIP",
        level: "Gold",
        date: new Date().toISOString().split("T")[0],
        icon: "🏆",
        description: "",
        proofUrl: "",
        proofType: "IMAGE",
        tournamentName: "",
        organizer: "",
        sanctionId: ""
      });
      loadAllData();
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to save achievement.");
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!editingAchievement.title.trim()) return setFormError("Achievement title is required.");
    if (!editingAchievement.date) return setFormError("Date is required.");

    setSubmitting(true);
    try {
      await api.put(`/achievements/${editingAchievement.id}`, {
        coachId,
        athleteId: editingAchievement.athleteId,
        title: editingAchievement.title.trim(),
        category: editingAchievement.category,
        level: editingAchievement.level,
        date: editingAchievement.date,
        icon: editingAchievement.icon,
        description: editingAchievement.description?.trim() || "",
        proofUrl: editingAchievement.proofUrl ? editingAchievement.proofUrl.trim() : null,
        tournamentName: editingAchievement.tournamentName ? editingAchievement.tournamentName.trim() : null,
        sanctionId: editingAchievement.sanctionId ? editingAchievement.sanctionId.trim() : null
      });

      toast.success("Achievement updated successfully!");
      setEditingAchievement(null);
      loadAllData();
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to update achievement.");
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAchievement = async (id) => {
    try {
      await api.delete(`/achievements/${id}?coachId=${coachId}`);
      setDeletingId(null);
      toast.success("Achievement deleted.");
      loadAllData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete achievement."));
    }
  };

  // Pending Count
  const pendingCount = achievements.filter(
    (a) => a.verificationStatus === "PENDING" && !a.isVerified
  ).length;

  // Filter & Search & Sort
  const filteredAchievements = achievements
    .filter((a) => {
      const matchesCategory =
        activeCategory === "ALL" ||
        a.category?.toUpperCase() === activeCategory.toUpperCase();

      const isApproved = a.verificationStatus === "APPROVED" || Boolean(a.isVerified);
      const isPending = a.verificationStatus === "PENDING" && !a.isVerified;
      const isRejected = a.verificationStatus === "REJECTED";

      let matchesVerification = true;
      if (verificationFilter === "VERIFIED") matchesVerification = isApproved;
      if (verificationFilter === "PENDING") matchesVerification = isPending;
      if (verificationFilter === "REJECTED") matchesVerification = isRejected;

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.title?.toLowerCase().includes(q) ||
        a.athleteName?.toLowerCase().includes(q) ||
        a.tournamentName?.toLowerCase().includes(q) ||
        a.sanctionId?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.level?.toLowerCase().includes(q);

      return matchesCategory && matchesVerification && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return sortBy === "NEWEST" ? dateB - dateA : dateA - dateB;
    });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium animate-pulse">Loading athlete achievements...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex items-center justify-center p-6">
          <div className="glass-card rounded-3xl p-8 border border-red-500/20 text-center max-w-md w-full shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500 rounded-t-3xl"></div>
            <h2 className="text-xl font-bold text-white mb-2">Error</h2>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-16 relative z-10">

        {/* Header & Add Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
          <div>
            <p className="text-brand-peach text-xs font-bold tracking-[0.25em] uppercase mb-1">
              Coaching Governance & Accreditation
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Athlete Achievements
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Verify submitted athlete claims, audit combine PRs, and award official team trophies.
            </p>
          </div>

          <button
            onClick={() => {
              setFormError("");
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-peach text-black font-bold rounded-xl hover:bg-brand-peach/90 transition-all shadow-lg text-xs uppercase tracking-wider cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <FaPlus className="text-sm" />
            Award Achievement
          </button>
        </div>

        {/* PENDING CLAIMS PRIORITY BANNER */}
        {pendingCount > 0 && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg shrink-0">
                <FaClock />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">
                  {pendingCount} Athlete Claim{pendingCount > 1 ? "s" : ""} Awaiting Verification
                </h4>
                <p className="text-xs text-amber-400/80">
                  Athletes have submitted competition medals and proofs requiring coaching attestation.
                </p>
              </div>
            </div>

            <button
              onClick={() => setVerificationFilter("PENDING")}
              className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              Review Pending Claims
            </button>
          </div>
        )}

        {/* Dynamic Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Accreditations</span>
              <div className="p-2.5 bg-yellow-400/10 text-yellow-400 rounded-xl text-lg">
                <FaTrophy />
              </div>
            </div>
            <p className="text-3xl font-black text-white mt-2">{stats.totalAchievements}</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pending Review</span>
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl text-lg">
                <FaClock />
              </div>
            </div>
            <p className="text-3xl font-black text-amber-400 mt-2">{pendingCount}</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Coach Verified</span>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-lg">
                <FaCheckCircle />
              </div>
            </div>
            <p className="text-3xl font-black text-white mt-2">
              {achievements.filter((a) => Boolean(a.isVerified)).length}
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-peach uppercase tracking-wider">Awards & Cups</span>
              <div className="p-2.5 bg-brand-peach/10 text-brand-peach rounded-xl text-lg">
                <FaMedal />
              </div>
            </div>
            <p className="text-3xl font-black text-white mt-2">{stats.awards}</p>
          </div>
        </div>

        {/* Search, Sorting & Filter Tabs */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by athlete name, tournament, title, or sanction ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#111317] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-peach/50 transition-colors text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#111317] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-brand-peach/50 transition-colors"
              >
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Category & Verification Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory === cat
                      ? "bg-brand-peach text-black shadow-md"
                      : "bg-[#111317] text-gray-400 hover:text-white border border-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5 shrink-0 self-start sm:self-auto overflow-x-auto">
              {[
                { id: "ALL", label: "All Items" },
                { id: "PENDING", label: `⏳ Pending (${pendingCount})` },
                { id: "VERIFIED", label: "✔ Verified" },
                { id: "REJECTED", label: "❌ Revisions" }
              ].map((vTab) => (
                <button
                  key={vTab.id}
                  onClick={() => setVerificationFilter(vTab.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                    verificationFilter === vTab.id
                      ? "bg-emerald-500 text-black shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {vTab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="glass-card rounded-3xl p-12 border border-white/5 shadow-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-6 text-3xl text-yellow-400">
              <FaTrophy />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {search || activeCategory !== "ALL" || verificationFilter !== "ALL" ? "No Matching Achievements" : "No achievements yet"}
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6 text-sm">
              {search || activeCategory !== "ALL" || verificationFilter !== "ALL"
                ? "No athlete milestones match your current filters."
                : "Start recognizing your roster's accomplishments by awarding official team trophies."}
            </p>
          </div>
        )}

        {/* Achievements Grid */}
        {filteredAchievements.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((ach) => {
              const isApproved = ach.verificationStatus === "APPROVED" || Boolean(ach.isVerified);
              const isPending = ach.verificationStatus === "PENDING" && !ach.isVerified;
              const isRejected = ach.verificationStatus === "REJECTED";

              return (
                <div
                  key={ach.id}
                  className="glass-card rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-yellow-400/20 transition-all"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-3xl rounded-full pointer-events-none group-hover:bg-yellow-400/10 transition-all" />

                  <div className="relative z-10 space-y-4">
                    {/* Top Bar: Icon, Category & Level */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-xl shrink-0">
                          {ach.icon || "🏆"}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                            {ach.category || "AWARD"}
                          </span>

                          {isApproved && (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-max">
                              <FaCheckCircle className="text-[9px]" /> Verified
                            </span>
                          )}

                          {isPending && (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-max">
                              <FaClock className="text-[9px]" /> Awaiting Review
                            </span>
                          )}

                          {isRejected && (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 w-max">
                              <FaTimesCircle className="text-[9px]" /> Revision Needed
                            </span>
                          )}
                        </div>
                      </div>

                      {ach.level && (
                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-full text-xs font-semibold uppercase tracking-wider">
                          {ach.level}
                        </span>
                      )}
                    </div>

                    {/* Athlete Name */}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <FaUser className="text-yellow-400" />
                      <span className="font-bold text-white text-sm">{ach.athleteName || "Athlete"}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-black text-white group-hover:text-yellow-400 transition-colors">
                      {ach.title}
                    </h3>

                    {/* Tournament / Sanction ID */}
                    {(ach.tournamentName || ach.sanctionId) && (
                      <div className="text-xs text-brand-peach/90 font-medium space-y-0.5">
                        {ach.tournamentName && <p>🏆 {ach.tournamentName}</p>}
                        {ach.sanctionId && <p className="font-mono text-[10px] text-gray-400">SANCTION: {ach.sanctionId}</p>}
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                      {ach.description || "Milestone achieved."}
                    </p>

                    {/* Coach Feedback if rejected */}
                    {ach.coachFeedback && (
                      <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-300">
                        <strong>Feedback:</strong> {ach.coachFeedback}
                      </div>
                    )}

                    {/* Evidence & Date Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <FaCalendarAlt className="text-brand-peach" />
                        <span>{ach.date}</span>
                      </div>

                      {ach.proofUrl && (
                        <button
                          onClick={() => setPreviewEvidence(ach)}
                          className="text-brand-peach hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <FaEye className="text-[10px]" /> View Proof
                        </button>
                      )}
                    </div>

                    {/* Cryptographic Hash */}
                    {ach.certificateHash && (
                      <div className="text-[10px] font-mono text-gray-500 truncate flex items-center gap-1">
                        <FaFingerprint className="text-brand-peach text-xs shrink-0" />
                        <span className="truncate">SIG: {ach.certificateHash}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 relative z-10">
                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleVerifyAchievement(ach.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-emerald-400 transition-all cursor-pointer flex items-center gap-1 shadow-md"
                          >
                            <FaCheckCircle /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectingAchievement(ach);
                              setRejectionFeedback("");
                            }}
                            className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                          >
                            <FaTimesCircle /> Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleVerifyAchievement(ach.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isApproved
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                              : "bg-white/5 text-gray-400 border border-white/10 hover:text-white"
                          }`}
                        >
                          <FaCheckCircle className="text-xs" />
                          <span>{isApproved ? "Verified" : "Verify"}</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingAchievement(ach)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs cursor-pointer"
                        title="Edit Achievement"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteAchievement(ach.id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all text-xs cursor-pointer"
                        title="Delete Achievement"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ADD ACHIEVEMENT / TEAM ACCOLADE MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="glass-card bg-[#111317]/95 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-400/10 text-yellow-400 rounded-2xl border border-yellow-400/20 text-xl">
                    <FaTrophy />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Award Team Achievement</h2>
                    <p className="text-gray-400 text-xs">Accredit a milestone or confer official team honors</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>

              {formError && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <FaExclamationCircle className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Team Accolade Quick Presets */}
              <div className="mt-4 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                <span className="text-[10px] uppercase font-bold text-brand-peach tracking-wider block mb-2">
                  ⚡ Quick Team Honor Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {TEAM_PRESETS.map((p) => (
                    <button
                      key={p.title}
                      type="button"
                      onClick={() => applyTeamPreset(p)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-brand-peach hover:text-black border border-white/10 text-[11px] font-semibold text-gray-300 transition-all cursor-pointer"
                    >
                      {p.icon} {p.title}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddSubmit} className="mt-4 space-y-4 relative z-10">
                {/* Select Assigned Athlete */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Assignee Athlete *
                  </label>
                  <select
                    value={formData.athleteId}
                    onChange={(e) => setFormData({ ...formData, athleteId: e.target.value })}
                    className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                    required
                  >
                    <option value="">-- Select Athlete from Your Roster --</option>
                    {assignedAthletes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.fullName} ({a.sport || "Athlete"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Achievement Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Player of the Match - District Finals"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                    required
                  />
                </div>

                {/* Tournament & Sanction ID */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Tournament / Event (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. State Championship"
                      value={formData.tournamentName}
                      onChange={(e) => setFormData({ ...formData, tournamentName: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-brand-peach/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Sanction / License Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. FED-2026-X1"
                      value={formData.sanctionId}
                      onChange={(e) => setFormData({ ...formData, sanctionId: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-brand-peach/50"
                    />
                  </div>
                </div>

                {/* Category & Level Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                    >
                      {FORM_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Level
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                    >
                      {LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date & Icon */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Badge Icon
                    </label>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                    >
                      {ICONS.map((ic) => (
                        <option key={ic} value={ic}>{ic}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Description & Citation
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Describe the milestone, tournament context, or winning play..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-peach/50 transition-colors resize-none"
                  />
                </div>

                {/* Direct Upload for Evidence */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Attach Evidence / Certificate (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-brand-peach flex items-center gap-2 cursor-pointer">
                      <FaUpload />
                      <span>{uploadingFile ? "Uploading..." : "Upload File"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingFile}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or enter proof URL"
                      value={formData.proofUrl}
                      onChange={(e) => setFormData({ ...formData, proofUrl: e.target.value })}
                      className="flex-1 bg-[#181b22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingFile}
                    className="px-6 py-2.5 bg-brand-peach text-black font-bold rounded-xl hover:bg-brand-peach/90 transition-all text-xs uppercase tracking-wider shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Awarding..." : "Confer Accolade"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* REJECT / REVISION REQUEST MODAL */}
        {rejectingAchievement && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card bg-[#111317] border border-red-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaTimesCircle className="text-red-400" /> Request Revision
                </h3>
                <button
                  onClick={() => setRejectingAchievement(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              <p className="text-xs text-gray-300">
                Provide feedback to <strong>{rejectingAchievement.athleteName}</strong> explaining what verification evidence is required for '{rejectingAchievement.title}'.
              </p>

              <textarea
                rows="4"
                value={rejectionFeedback}
                onChange={(e) => setRejectionFeedback(e.target.value)}
                placeholder="e.g. Please attach an official certificate or tournament results link with your BIB number..."
                className="w-full bg-[#181b22] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setRejectingAchievement(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectAchievement}
                  className="px-5 py-2 rounded-xl bg-red-500 text-white text-xs font-bold uppercase hover:bg-red-600"
                >
                  Send Revision Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IN-APP EVIDENCE LIGHTBOX MODAL */}
        {previewEvidence && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-card bg-[#12151e] border border-brand-peach/30 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Media Evidence Verification</h3>
                  <p className="text-xs text-brand-peach">{previewEvidence.athleteName} • {previewEvidence.title}</p>
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
