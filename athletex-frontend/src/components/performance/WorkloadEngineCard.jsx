import { useState } from "react";
import {
  FaBolt,
  FaSyncAlt,
  FaRunning,
  FaDumbbell,
  FaHeartbeat,
  FaCalendarCheck,
  FaArrowUp,
  FaInfoCircle
} from "react-icons/fa";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function WorkloadEngineCard({
  userId,
  attribution,
  onRecalculateSuccess
}) {
  const [recalculating, setRecalculating] = useState(false);

  const handleRecalculate = async () => {
    if (!userId) return;
    try {
      setRecalculating(true);
      const res = await api.post(`/performance/${userId}/recalculate-from-workouts`);
      toast.success("Conditioning index recalibrated from completed workouts!", {
        icon: "⚡",
        duration: 3500
      });
      if (onRecalculateSuccess) {
        onRecalculateSuccess(res.data);
      }
    } catch (err) {
      console.error("Failed to recalibrate performance:", err);
      toast.error(err.response?.data?.message || "Failed to recalibrate from workouts.");
    } finally {
      setRecalculating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "peaking":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "building":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "maintaining":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "detraining":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-white/10 text-gray-400 border-white/10";
    }
  };

  const metrics = attribution?.categoryMetrics || {};

  const categories = [
    {
      key: "SPEED",
      title: "Speed Workload",
      icon: FaRunning,
      color: "text-blue-400",
      accent: "from-blue-500/10 to-transparent",
      data: metrics["SPEED"] || { sessionsCount: 0, totalLoadAU: 0, status: "Untrained" }
    },
    {
      key: "STRENGTH",
      title: "Strength Workload",
      icon: FaDumbbell,
      color: "text-brand-peach",
      accent: "from-brand-peach/10 to-transparent",
      data: metrics["STRENGTH"] || { sessionsCount: 0, totalLoadAU: 0, status: "Untrained" }
    },
    {
      key: "ENDURANCE",
      title: "Endurance Workload",
      icon: FaHeartbeat,
      color: "text-red-400",
      accent: "from-red-500/10 to-transparent",
      data: metrics["ENDURANCE"] || { sessionsCount: 0, totalLoadAU: 0, status: "Untrained" }
    },
    {
      key: "AGILITY",
      title: "Agility Workload",
      icon: FaBolt,
      color: "text-yellow-400",
      accent: "from-yellow-500/10 to-transparent",
      data: metrics["AGILITY"] || { sessionsCount: 0, totalLoadAU: 0, status: "Untrained" }
    }
  ];

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/5 relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-peach/5 blur-[90px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">
              Automated Workout-Driven Engine
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Workload Conditioning & Training Impulse</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Ratings are autonomously calculated using sports science (TRIMP & Session-RPE) from your verified workout completions and volume over the last 28 days.
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-brand-peach/40 text-gray-200 hover:text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 self-start sm:self-auto shrink-0"
        >
          <FaSyncAlt className={`text-xs text-brand-peach ${recalculating ? "animate-spin" : ""}`} />
          <span>{recalculating ? "Recalculating..." : "Recalculate Engine"}</span>
        </button>
      </div>

      {/* Workload Attribution Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 relative z-10">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const d = cat.data;
          return (
            <div
              key={cat.key}
              className={`bg-gradient-to-b ${cat.accent} bg-black/40 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`text-base ${cat.color}`} />
                    <span className="text-xs font-bold text-gray-300">{cat.title}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(d.status)}`}>
                    {d.status || "Untrained"}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">
                    {d.totalLoadAU || 0}
                  </span>
                  <span className="text-xs font-bold text-gray-400">AU Load</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
                  <span>{d.sessionsCount || 0} {d.sessionsCount === 1 ? "session" : "sessions"}</span>
                  <span>
                    {d.lastTrainedDaysAgo !== null && d.lastTrainedDaysAgo !== undefined
                      ? d.lastTrainedDaysAgo === 0
                        ? "Trained today"
                        : `${d.lastTrainedDaysAgo}d ago`
                      : "No recent reps"}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-gray-500 text-[10px] uppercase font-bold">Attributed Rating</span>
                <span className={`font-black ${cat.color}`}>{d.score}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Workout Impact Motivator */}
      {attribution?.nextWorkoutImpact && (
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-brand-peach/10 via-purple-500/10 to-transparent border border-brand-peach/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-peach/20 border border-brand-peach/30 flex items-center justify-center text-brand-peach shrink-0 mt-0.5 sm:mt-0">
              <FaArrowUp />
            </div>
            <div>
              <span className="font-extrabold text-white block">
                Next Session Impact
              </span>
              <p className="text-gray-300 text-[11px] mt-0.5">
                {attribution.nextWorkoutImpact}
              </p>
            </div>
          </div>

          {attribution.potentialScoreGain && (
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-brand-peach/30 text-brand-peach font-bold text-xs self-start sm:self-auto">
              <span>Est. Gain:</span>
              <span className="text-white font-black">+{attribution.potentialScoreGain} pts</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
