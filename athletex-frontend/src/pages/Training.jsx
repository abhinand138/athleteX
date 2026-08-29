import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaDumbbell,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaUserTie,
  FaHeartbeat,
  FaFilter,
  FaSearch,
  FaFire,
  FaCheck
} from "react-icons/fa";
import DashboardLayout from "../layouts/DashboardLayout";
import WorkoutCompletionModal from "../components/dashboard/WorkoutCompletionModal";
import api from "../services/api";

export default function Training() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("SCHEDULED"); // SCHEDULED, COMPLETED, ALL
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedTraining, setSelectedTraining] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const athleteId = storedUser?.id;

  useEffect(() => {
    if (athleteId) {
      fetchTrainings();
    }
  }, [athleteId]);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/training/athlete/${athleteId}`);
      setTrainings(res.data || []);
    } catch (err) {
      console.error("Failed to load athlete trainings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleModalCompleted = () => {
    fetchTrainings();
  };

  // Metrics
  const totalCount = trainings.length;
  const completedCount = trainings.filter((t) => t.status === "COMPLETED").length;
  const scheduledCount = trainings.filter((t) => t.status === "SCHEDULED").length;
  const completedSessions = trainings.filter((t) => t.status === "COMPLETED" && t.rpe);
  const avgRpe =
    completedSessions.length > 0
      ? (completedSessions.reduce((acc, curr) => acc + curr.rpe, 0) / completedSessions.length).toFixed(1)
      : "—";

  const totalMinutes = trainings
    .filter((t) => t.status === "COMPLETED")
    .reduce((acc, curr) => acc + (curr.actualDurationMinutes || 45), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Filtered List
  const filteredTrainings = trainings.filter((t) => {
    const matchesTab = activeTab === "ALL" || t.status === activeTab;
    const matchesCat = categoryFilter === "ALL" || (t.category && t.category.toUpperCase() === categoryFilter.toUpperCase());
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.title?.toLowerCase().includes(q) ||
      t.coachName?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q);
    return matchesTab && matchesCat && matchesSearch;
  });

  const getRpeColor = (rpe) => {
    if (!rpe) return "text-gray-400 border-gray-500/30 bg-gray-500/10";
    if (rpe <= 3) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (rpe <= 6) return "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";
    if (rpe <= 8) return "text-brand-peach border-brand-peach/30 bg-brand-peach/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-wide flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-peach/20 to-orange-500/20 text-brand-peach border border-brand-peach/30">
                <FaDumbbell className="text-xl" />
              </span>
              Training & Workouts
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Track assigned training plans, log RPE reflections, and monitor your athletic workload.
            </p>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Scheduled</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{scheduledCount}</h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <FaHourglassHalf className="text-lg" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Upcoming training sessions</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Completed</p>
                <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{completedCount}</h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FaCheckCircle className="text-lg" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">{totalCount > 0 ? `${Math.round((completedCount / totalCount) * 100)}% completion rate` : "0% completion rate"}</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Avg Exertion</p>
                <h3 className="text-2xl font-extrabold text-brand-peach mt-1">
                  {avgRpe} <span className="text-xs text-gray-400 font-normal">/ 10 RPE</span>
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-brand-peach/10 border border-brand-peach/20 flex items-center justify-center text-brand-peach">
                <FaHeartbeat className="text-lg" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Average perceived effort</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Training Time</p>
                <h3 className="text-2xl font-extrabold text-orange-400 mt-1">
                  {totalHours} <span className="text-xs text-gray-400 font-normal">Hours</span>
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <FaFire className="text-lg" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Total logged workout volume</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="glass-card rounded-2xl p-4 md:p-6 border border-white/5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/5 max-w-fit">
              {["SCHEDULED", "COMPLETED", "ALL"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab
                      ? "bg-brand-peach text-black shadow-lg shadow-brand-peach/20"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab === "SCHEDULED" ? "Upcoming" : tab === "COMPLETED" ? "Completed" : "All Sessions"}
                </button>
              ))}
            </div>

            {/* Category Filter & Search */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-xs font-semibold text-gray-200 focus:outline-none focus:border-brand-peach cursor-pointer"
                >
                  <option value="ALL" className="bg-[#0e1014]">All Categories</option>
                  <option value="SPEED" className="bg-[#0e1014]">Speed</option>
                  <option value="STRENGTH" className="bg-[#0e1014]">Strength</option>
                  <option value="ENDURANCE" className="bg-[#0e1014]">Endurance</option>
                  <option value="AGILITY" className="bg-[#0e1014]">Agility</option>
                  <option value="RECOVERY" className="bg-[#0e1014]">Recovery</option>
                </select>
                <FaFilter className="absolute right-3 top-3 text-[10px] text-gray-400 pointer-events-none" />
              </div>

              <div className="relative flex-1 md:w-64">
                <FaSearch className="absolute left-3.5 top-3 text-xs text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workouts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-peach transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Workout Cards Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
            </div>
          ) : filteredTrainings.length === 0 ? (
            <div className="text-center py-16 text-gray-500 space-y-2">
              <FaDumbbell className="mx-auto text-4xl opacity-30 text-gray-400" />
              <p className="text-sm font-semibold">No training sessions found</p>
              <p className="text-xs text-gray-600">Your scheduled coach workouts will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {filteredTrainings.map((t) => {
                const isCompleted = t.status === "COMPLETED";
                const isCancelled = t.status === "CANCELLED";

                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl p-5 border transition-all ${
                      isCompleted
                        ? "bg-emerald-500/[0.03] border-emerald-500/20"
                        : isCancelled
                        ? "bg-white/[0.02] border-white/5 opacity-60"
                        : "bg-white/[0.03] border-white/10 hover:border-brand-peach/40 shadow-lg shadow-black/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-brand-peach/10 text-brand-peach border border-brand-peach/20">
                            {t.category || "General"}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isCompleted
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : isCancelled
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mt-2">{t.title}</h3>
                      </div>

                      {!isCompleted && !isCancelled && (
                        <button
                          onClick={() => setSelectedTraining(t)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
                        >
                          <FaCheck className="text-[10px]" />
                          <span>Complete</span>
                        </button>
                      )}
                    </div>

                    {t.description && (
                      <p className="text-xs text-gray-400 mt-2.5 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    )}

                    {/* Schedule Info */}
                    <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-white/5 text-xs text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <FaCalendarAlt className="text-brand-peach" /> {t.date || "Scheduled"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FaClock className="text-brand-peach" /> {t.time || "—"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FaUserTie className="text-brand-peach" /> Coach {t.coachName || "Assigned"}
                      </span>
                    </div>

                    {/* RPE & Feedback reflection (if completed) */}
                    {isCompleted && (
                      <div className="mt-3 pt-3 border-t border-emerald-500/10 bg-emerald-500/[0.04] -mx-5 -mb-5 p-4 rounded-b-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                            <FaHeartbeat className="text-brand-peach" /> Logged Effort:
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getRpeColor(t.rpe)}`}>
                            RPE {t.rpe || "—"} / 10 ({t.actualDurationMinutes || 45} mins)
                          </span>
                        </div>
                        {t.athleteFeedback && (
                          <p className="text-xs text-gray-400 italic">
                            "{t.athleteFeedback}"
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Completion Modal */}
      <WorkoutCompletionModal
        isOpen={Boolean(selectedTraining)}
        onClose={() => setSelectedTraining(null)}
        training={selectedTraining}
        onCompleted={handleModalCompleted}
      />
    </DashboardLayout>
  );
}