import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import {
  FaDumbbell,
  FaPlus,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaExclamationCircle
} from "react-icons/fa";

const CATEGORIES = ["Speed", "Strength", "Endurance", "Agility", "Recovery", "General"];

export default function CoachTraining() {
  const [trainings, setTrainings] = useState([]);
  const [assignedAthletes, setAssignedAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, SCHEDULED, COMPLETED, CANCELLED
  const [search, setSearch] = useState("");

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    athleteId: "",
    title: "",
    category: "Speed",
    date: "",
    time: "",
    description: ""
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [editingTraining, setEditingTraining] = useState(null);

  // Cancel Dialog State
  const [cancellingId, setCancellingId] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const coachId = storedUser?.id;

  useEffect(() => {
    if (!coachId || storedUser.role !== "COACH") {
      setError("Access denied. Coach login required.");
      setLoading(false);
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trainingsRes, athletesRes] = await Promise.all([
        api.get(`/training/coach/${coachId}`),
        api.get(`/coach/assignments/coach/${coachId}`)
      ]);
      setTrainings(trainingsRes.data || []);
      setAssignedAthletes(athletesRes.data || []);
    } catch (err) {
      setError(err.response?.data || "Failed to load training management data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.athleteId) return setFormError("Please select an assigned athlete.");
    if (!formData.title.trim()) return setFormError("Title is required.");
    if (!formData.date) return setFormError("Date is required.");
    if (!formData.time) return setFormError("Time is required.");

    setSubmitting(true);
    try {
      await api.post("/training", {
        coachId,
        athleteId: formData.athleteId,
        title: formData.title.trim(),
        category: formData.category,
        date: formData.date,
        time: formData.time,
        description: formData.description.trim()
      });

      toast.success("Training session assigned successfully!");
      setShowCreateModal(false);
      setFormData({
        athleteId: "",
        title: "",
        category: "Speed",
        date: "",
        time: "",
        description: ""
      });
      loadData();
    } catch (err) {
      const msg = err.response?.data || "Failed to create training session.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!editingTraining.title.trim()) return setFormError("Title is required.");
    if (!editingTraining.date) return setFormError("Date is required.");
    if (!editingTraining.time) return setFormError("Time is required.");

    setSubmitting(true);
    try {
      await api.put(`/training/${editingTraining.id}`, {
        coachId,
        athleteId: editingTraining.athleteId,
        title: editingTraining.title.trim(),
        category: editingTraining.category,
        date: editingTraining.date,
        time: editingTraining.time,
        description: editingTraining.description?.trim() || ""
      });

      toast.success("Training session updated!");
      setEditingTraining(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data || "Failed to update training session.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelTraining = async (id) => {
    try {
      await api.delete(`/training/${id}?coachId=${coachId}`);
      toast.success("Training session cancelled.");
      setCancellingId(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data || "Failed to cancel training session.");
    }
  };

  // Filtering
  const filteredTrainings = trainings.filter((t) => {
    const matchesTab = activeTab === "ALL" || t.status === activeTab;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.title?.toLowerCase().includes(q) ||
      t.athleteName?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const countByStatus = (status) => trainings.filter((t) => t.status === status).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium animate-pulse">Loading training sessions...</p>
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

        {/* Header & Create Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
          <div className="relative">
            <div className="absolute -left-10 -top-10 w-64 h-64 bg-brand-peach/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-3.5 mb-2">
              <div className="w-1.5 h-8 bg-brand-peach rounded-full"></div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
                Training Management
              </h1>
            </div>
            <p className="text-gray-400 text-base font-medium ml-5">
              Create, schedule, and track workout sessions for your athletes
            </p>
          </div>

          <button
            onClick={() => {
              setFormError("");
              setShowCreateModal(true);
            }}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-brand-peach to-orange-500 hover:from-brand-peach/90 hover:to-orange-500/90 text-black font-bold rounded-2xl shadow-[0_0_25px_rgba(255,123,84,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            <FaPlus className="text-sm" />
            Create Training
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div
            onClick={() => setActiveTab("ALL")}
            className={`glass-card rounded-2xl p-5 border transition-all cursor-pointer ${
              activeTab === "ALL" ? "border-brand-peach shadow-[0_0_15px_rgba(255,123,84,0.2)]" : "border-white/5 hover:border-white/10"
            }`}
          >
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Sessions</span>
            <p className="text-3xl font-black text-white mt-1">{trainings.length}</p>
          </div>

          <div
            onClick={() => setActiveTab("SCHEDULED")}
            className={`glass-card rounded-2xl p-5 border transition-all cursor-pointer ${
              activeTab === "SCHEDULED" ? "border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.2)]" : "border-white/5 hover:border-white/10"
            }`}
          >
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Scheduled</span>
            <p className="text-3xl font-black text-white mt-1">{countByStatus("SCHEDULED")}</p>
          </div>

          <div
            onClick={() => setActiveTab("COMPLETED")}
            className={`glass-card rounded-2xl p-5 border transition-all cursor-pointer ${
              activeTab === "COMPLETED" ? "border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)]" : "border-white/5 hover:border-white/10"
            }`}
          >
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Completed</span>
            <p className="text-3xl font-black text-white mt-1">{countByStatus("COMPLETED")}</p>
          </div>

          <div
            onClick={() => setActiveTab("CANCELLED")}
            className={`glass-card rounded-2xl p-5 border transition-all cursor-pointer ${
              activeTab === "CANCELLED" ? "border-red-400 shadow-[0_0_15px_rgba(248,113,113,0.2)]" : "border-white/5 hover:border-white/10"
            }`}
          >
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Cancelled</span>
            <p className="text-3xl font-black text-white mt-1">{countByStatus("CANCELLED")}</p>
          </div>
        </div>

        {/* Search Bar & Tab Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search training by title, athlete, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111317] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-peach/50 transition-colors text-sm"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#111317] p-1.5 rounded-2xl border border-white/5 self-start">
            {["ALL", "SCHEDULED", "COMPLETED", "CANCELLED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-brand-peach text-black shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredTrainings.length === 0 && (
          <div className="glass-card rounded-3xl p-12 border border-white/5 shadow-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-brand-peach/10 border border-brand-peach/20 flex items-center justify-center mx-auto mb-6 text-3xl text-brand-peach">
              <FaDumbbell />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No Training Sessions Found</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6 text-sm">
              {search
                ? "No sessions match your search query."
                : activeTab !== "ALL"
                ? `No ${activeTab.toLowerCase()} sessions recorded.`
                : "You haven't scheduled any training sessions for your athletes yet."}
            </p>
            {trainings.length === 0 && (
              <button
                onClick={() => {
                  setFormError("");
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-peach text-black font-bold rounded-xl hover:bg-brand-peach/90 transition-all cursor-pointer"
              >
                <FaPlus />
                Schedule First Session
              </button>
            )}
          </div>
        )}

        {/* Training Cards Grid */}
        {filteredTrainings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainings.map((t) => (
              <div
                key={t.id}
                className="glass-card rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-white/15 transition-all"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-peach/5 blur-3xl rounded-full pointer-events-none group-hover:bg-brand-peach/10 transition-all" />

                <div className="relative z-10 space-y-4">
                  {/* Top Row: Category & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-peach/10 text-brand-peach border border-brand-peach/20">
                      {t.category}
                    </span>

                    {t.status === "SCHEDULED" && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
                        <FaHourglassHalf className="text-[10px]" />
                        Scheduled
                      </span>
                    )}
                    {t.status === "COMPLETED" && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                        <FaCheckCircle className="text-[10px]" />
                        Completed
                      </span>
                    )}
                    {t.status === "CANCELLED" && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1.5">
                        <FaTimesCircle className="text-[10px]" />
                        Cancelled
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-white font-bold text-xl leading-tight">{t.title}</h3>
                    {t.description && (
                      <p className="text-gray-400 text-sm mt-1.5 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    )}
                  </div>

                  {/* Details (Athlete, Date, Time) */}
                  <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-gray-400">
                    <div className="flex items-center gap-2.5">
                      <FaUser className="text-brand-peach shrink-0" />
                      <span className="text-gray-300 font-semibold truncate">Athlete: {t.athleteName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-500 shrink-0" />
                        <span>{t.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock className="text-gray-500 shrink-0" />
                        <span>{t.time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions (Only for SCHEDULED sessions) */}
                {t.status === "SCHEDULED" && (
                  <div className="flex items-center gap-2 pt-5 mt-5 border-t border-white/5 relative z-10">
                    <button
                      onClick={() => {
                        setFormError("");
                        setEditingTraining(t);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <FaEdit />
                      Edit
                    </button>
                    <button
                      onClick={() => setCancellingId(t.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <FaTrash />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* CREATE TRAINING MODAL                                                     */}
        {/* ========================================================================= */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="glass-card bg-[#111317]/95 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-peach/10 blur-[90px] rounded-full pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-peach/10 text-brand-peach rounded-2xl border border-brand-peach/20">
                    <FaDumbbell className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Create Training</h2>
                    <p className="text-gray-400 text-xs">Assign a workout to one of your roster athletes</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
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

              <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4 relative z-10">
                {/* Select Assigned Athlete */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Assign To Athlete *
                  </label>
                  {assignedAthletes.length === 0 ? (
                    <p className="text-xs text-red-400">
                      You have no athletes assigned to your roster yet. Please assign athletes from the "My Athletes" page first.
                    </p>
                  ) : (
                    <select
                      value={formData.athleteId}
                      onChange={(e) => setFormData({ ...formData, athleteId: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                      required
                    >
                      <option value="">-- Choose Athlete --</option>
                      {assignedAthletes.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.fullName} ({a.sport || "Athlete"})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Training Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Training Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100m Sprint Intervals, Strength Core Workout"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date and Time Row */}
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
                      Time *
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Instructions / Notes
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Provide details about sets, reps, warm-up instructions..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-peach/50 transition-colors resize-none"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || assignedAthletes.length === 0}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-peach to-orange-500 text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg"
                  >
                    {submitting ? "Scheduling..." : "Schedule Training"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EDIT TRAINING MODAL                                                       */}
        {/* ========================================================================= */}
        {editingTraining && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="glass-card bg-[#111317]/95 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[90px] rounded-full pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                    <FaEdit className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Edit Training</h2>
                    <p className="text-gray-400 text-xs">For athlete: {editingTraining.athleteName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingTraining(null)}
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
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editingTraining.title}
                    onChange={(e) => setEditingTraining({ ...editingTraining, title: e.target.value })}
                    className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={editingTraining.category}
                    onChange={(e) => setEditingTraining({ ...editingTraining, category: e.target.value })}
                    className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={editingTraining.date}
                      onChange={(e) => setEditingTraining({ ...editingTraining, date: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={editingTraining.time}
                      onChange={(e) => setEditingTraining({ ...editingTraining, time: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={editingTraining.description || ""}
                    onChange={(e) => setEditingTraining({ ...editingTraining, description: e.target.value })}
                    className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingTraining(null)}
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
        {/* CANCEL CONFIRMATION DIALOG                                                */}
        {/* ========================================================================= */}
        {cancellingId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="glass-card rounded-2xl p-8 border border-white/10 shadow-2xl max-w-md w-full relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500 rounded-t-2xl"></div>
              <h3 className="text-xl font-bold text-white mb-3">Cancel Training Session?</h3>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to cancel this training session? It will be marked as Cancelled and removed from the athlete's upcoming schedule.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancellingId(null)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 font-bold hover:bg-white/5 transition-all cursor-pointer"
                >
                  Keep Session
                </button>
                <button
                  onClick={() => handleCancelTraining(cancellingId)}
                  className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
