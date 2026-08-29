import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
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
  FaCheckCircle
} from "react-icons/fa";

const CATEGORIES = ["ALL", "CHAMPIONSHIP", "MEDAL", "RECORD", "MILESTONE", "AWARD", "OTHER"];
const FORM_CATEGORIES = ["CHAMPIONSHIP", "MEDAL", "RECORD", "MILESTONE", "AWARD", "OTHER"];
const LEVELS = ["Gold", "Silver", "Bronze", "National", "State", "District", "Club", "Special"];
const ICONS = ["🏆", "🥇", "🥈", "🥉", "⭐", "🔥", "🎖️", "🏅", "👑", "🎯"];

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
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("NEWEST"); // NEWEST, OLDEST

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    athleteId: "",
    title: "",
    category: "CHAMPIONSHIP",
    level: "Gold",
    date: new Date().toISOString().split("T")[0],
    icon: "🏆",
    description: ""
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
      setError(err.response?.data || "Failed to load achievements data.");
    } finally {
      setLoading(false);
    }
  };

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
        description: formData.description.trim()
      });

      toast.success("Achievement awarded successfully! 🏆");
      setShowAddModal(false);
      setFormData({
        athleteId: "",
        title: "",
        category: "CHAMPIONSHIP",
        level: "Gold",
        date: new Date().toISOString().split("T")[0],
        icon: "🏆",
        description: ""
      });
      loadAllData();
    } catch (err) {
      const msg = err.response?.data || "Failed to save achievement.";
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
        description: editingAchievement.description?.trim() || ""
      });

      toast.success("Achievement updated successfully!");
      setEditingAchievement(null);
      loadAllData();
    } catch (err) {
      const msg = err.response?.data || "Failed to update achievement.";
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
      toast.error(err.response?.data || "Failed to delete achievement.");
    }
  };

  // Filter & Search & Sort
  const filteredAchievements = achievements
    .filter((a) => {
      const matchesCategory =
        activeCategory === "ALL" ||
        a.category?.toUpperCase() === activeCategory.toUpperCase();
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.title?.toLowerCase().includes(q) ||
        a.athleteName?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.level?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
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
          <div className="relative">
            <div className="absolute -left-10 -top-10 w-64 h-64 bg-yellow-400/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-3.5 mb-2">
              <div className="w-1.5 h-8 bg-brand-peach rounded-full"></div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
                Achievements
              </h1>
            </div>
            <p className="text-gray-400 text-base font-medium ml-5">
              Recognize and track athlete accomplishments
            </p>
          </div>

          <button
            onClick={() => {
              setFormError("");
              setShowAddModal(true);
            }}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-brand-peach to-orange-500 hover:from-brand-peach/90 hover:to-orange-500/90 text-black font-bold rounded-2xl shadow-[0_0_25px_rgba(255,123,84,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            <FaPlus className="text-sm" />
            Add Achievement
          </button>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 text-sm font-medium animate-fadeIn">
            <FaCheckCircle className="shrink-0 text-base" />
            <span>{notification.text}</span>
          </div>
        )}

        {/* Dynamic Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Achievements</span>
              <div className="p-2.5 bg-yellow-400/10 text-yellow-400 rounded-xl text-lg">
                <FaTrophy />
              </div>
            </div>
            <p className="text-3xl font-black text-white mt-2">{stats.totalAchievements}</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">This Month</span>
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl text-lg">
                <FaCalendarAlt />
              </div>
            </div>
            <p className="text-3xl font-black text-white mt-2">{stats.thisMonth}</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Records</span>
              <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl text-lg">
                <FaFire />
              </div>
            </div>
            <p className="text-3xl font-black text-white mt-2">{stats.records}</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-peach uppercase tracking-wider">Awards</span>
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
                placeholder="Search by athlete name, title, or category..."
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

          {/* Category Filter Pills */}
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
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="glass-card rounded-3xl p-12 border border-white/5 shadow-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-6 text-3xl text-yellow-400">
              <FaTrophy />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {search || activeCategory !== "ALL" ? "No Matching Achievements" : "No achievements yet"}
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6 text-sm">
              {search || activeCategory !== "ALL"
                ? "No athlete milestones match your search filters."
                : "Start recognizing your athletes' accomplishments by adding their first achievement."}
            </p>
            {achievements.length === 0 && (
              <button
                onClick={() => {
                  setFormError("");
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-peach text-black font-bold rounded-xl hover:bg-brand-peach/90 transition-all cursor-pointer"
              >
                <FaPlus />
                Add Achievement
              </button>
            )}
          </div>
        )}

        {/* Achievements Grid */}
        {filteredAchievements.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((ach) => (
              <div
                key={ach.id}
                className="glass-card rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-yellow-400/20 transition-all"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-3xl rounded-full pointer-events-none group-hover:bg-yellow-400/10 transition-all" />

                <div className="relative z-10 space-y-4">
                  {/* Top Bar: Icon, Category & Level */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-xl shrink-0">
                        {ach.icon || "🏆"}
                      </div>
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                          {ach.category || "AWARD"}
                        </span>
                      </div>
                    </div>

                    {ach.level && (
                      <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-full text-xs font-semibold uppercase tracking-wider">
                        {ach.level}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-white font-bold text-xl leading-snug group-hover:text-brand-peach transition-colors">
                      {ach.title}
                    </h3>
                    {ach.description && (
                      <p className="text-gray-400 text-sm mt-2 leading-relaxed line-clamp-3">
                        {ach.description}
                      </p>
                    )}
                  </div>

                  {/* Details (Athlete & Date) */}
                  <div className="space-y-2 pt-3 border-t border-white/5 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-brand-peach shrink-0" />
                      <span className="text-gray-200 font-semibold truncate">Athlete: {ach.athleteName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-500 shrink-0" />
                      <span>{ach.date ? new Date(ach.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-5 mt-5 border-t border-white/5 relative z-10">
                  <button
                    onClick={() => {
                      setFormError("");
                      setEditingAchievement(ach);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <FaEdit />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingId(ach.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ADD ACHIEVEMENT MODAL                                                     */}
        {/* ========================================================================= */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="glass-card bg-[#111317]/95 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 blur-[90px] rounded-full pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-400/10 text-yellow-400 rounded-2xl border border-yellow-400/20 text-xl">
                    <FaTrophy />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Add Achievement</h2>
                    <p className="text-gray-400 text-xs">Recognize accomplishment for your athlete</p>
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

              <form onSubmit={handleAddSubmit} className="mt-5 space-y-4 relative z-10">
                {/* Select Assigned Athlete */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Athlete *
                  </label>
                  {assignedAthletes.length === 0 ? (
                    <p className="text-xs text-red-400">
                      You have no athletes assigned to your roster yet. Please assign athletes from "My Athletes" first.
                    </p>
                  ) : (
                    <select
                      value={formData.athleteId}
                      onChange={(e) => setFormData({ ...formData, athleteId: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                      required
                    >
                      <option value="">-- Select Athlete --</option>
                      {assignedAthletes.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.fullName} ({a.sport || "Athlete"})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Achievement Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kerala State 100m Champion"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                    required
                  />
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
                        <option key={c} value={c}>
                          {c}
                        </option>
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
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
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
                        <option key={ic} value={ic}>
                          {ic} Badge
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Won first place in the Kerala State Under-21 Championship..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-peach/50 transition-colors resize-none"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || assignedAthletes.length === 0}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-peach to-orange-500 text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg"
                  >
                    {submitting ? "Saving..." : "Save Achievement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EDIT ACHIEVEMENT MODAL                                                   */}
        {/* ========================================================================= */}
        {editingAchievement && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="glass-card bg-[#111317]/95 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[90px] rounded-full pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 text-xl">
                    <FaEdit />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Edit Achievement</h2>
                    <p className="text-gray-400 text-xs">For athlete: {editingAchievement.athleteName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingAchievement(null)}
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

              <form onSubmit={handleEditSubmit} className="mt-5 space-y-4 relative z-10">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Achievement Title *
                  </label>
                  <input
                    type="text"
                    value={editingAchievement.title}
                    onChange={(e) => setEditingAchievement({ ...editingAchievement, title: e.target.value })}
                    className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                    required
                  />
                </div>

                {/* Category & Level Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <select
                      value={editingAchievement.category}
                      onChange={(e) => setEditingAchievement({ ...editingAchievement, category: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                    >
                      {FORM_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Level
                    </label>
                    <select
                      value={editingAchievement.level || "Gold"}
                      onChange={(e) => setEditingAchievement({ ...editingAchievement, level: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                    >
                      {LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
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
                      value={editingAchievement.date ? new Date(editingAchievement.date).toISOString().split("T")[0] : ""}
                      onChange={(e) => setEditingAchievement({ ...editingAchievement, date: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Badge Icon
                    </label>
                    <select
                      value={editingAchievement.icon || "🏆"}
                      onChange={(e) => setEditingAchievement({ ...editingAchievement, icon: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                    >
                      {ICONS.map((ic) => (
                        <option key={ic} value={ic}>
                          {ic} Badge
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={editingAchievement.description || ""}
                    onChange={(e) => setEditingAchievement({ ...editingAchievement, description: e.target.value })}
                    className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors resize-none"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingAchievement(null)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-all disabled:opacity-50 cursor-pointer shadow-lg"
                  >
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DELETE CONFIRMATION DIALOG                                                */}
        {/* ========================================================================= */}
        {deletingId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn">
            <div className="glass-card rounded-2xl p-8 border border-white/10 shadow-2xl max-w-md w-full relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500 rounded-t-2xl"></div>
              <h3 className="text-xl font-bold text-white mb-3">Delete Achievement?</h3>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to permanently delete this achievement? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 font-bold hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAchievement(deletingId)}
                  className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
