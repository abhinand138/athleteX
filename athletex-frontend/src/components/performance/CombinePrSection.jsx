import { useState } from "react";
import {
  FaTrophy,
  FaPlus,
  FaBolt,
  FaRunning,
  FaDumbbell,
  FaHeartbeat,
  FaHistory,
  FaCheckCircle,
  FaSyncAlt,
  FaExternalLinkAlt,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function CombinePrSection({
  userId,
  combineData,
  onOpenLogModal,
  onOpenHistoryModal,
  onRefreshData
}) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [syncing, setSyncing] = useState(false);

  const personalRecords = combineData?.personalRecords || [];
  const recentAttempts = combineData?.recentAttempts || [];
  const benchmarkScores = combineData?.benchmarkScores || {};

  // Filter PRs by selected category
  const filteredPrs = selectedCategory === "ALL"
    ? personalRecords
    : personalRecords.filter((pr) => pr.category?.toUpperCase() === selectedCategory);

  const handleSyncRatings = async () => {
    try {
      setSyncing(true);
      const res = await api.post(`/performance/${userId}/combine/sync-ratings`);
      toast.success("Ratings calibrated from your verified combine PRs!", {
        icon: "⚡",
        duration: 4000
      });
      if (onRefreshData) {
        onRefreshData(res.data);
      }
    } catch (err) {
      console.error("Failed to sync ratings:", err);
      toast.error(err.response?.data?.message || "Could not sync ratings from PRs.");
    } finally {
      setSyncing(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toUpperCase()) {
      case "SPEED":
        return <FaRunning className="text-amber-400" />;
      case "STRENGTH":
        return <FaDumbbell className="text-purple-400" />;
      case "ENDURANCE":
        return <FaHeartbeat className="text-rose-400" />;
      case "AGILITY":
        return <FaBolt className="text-emerald-400" />;
      default:
        return <FaTrophy className="text-brand-peach" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toUpperCase()) {
      case "SPEED":
        return "border-amber-500/30 text-amber-400 bg-amber-500/10";
      case "STRENGTH":
        return "border-purple-500/30 text-purple-400 bg-purple-500/10";
      case "ENDURANCE":
        return "border-rose-500/30 text-rose-400 bg-rose-500/10";
      case "AGILITY":
        return "border-emerald-500/30 text-emerald-400 bg-emerald-500/10";
      default:
        return "border-brand-peach/30 text-brand-peach bg-brand-peach/10";
    }
  };

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case "elite division":
        return "bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black";
      case "pro":
        return "bg-purple-500 text-white font-bold";
      case "varsity star":
        return "bg-sky-500 text-white font-bold";
      case "varsity":
        return "bg-emerald-500/90 text-white font-bold";
      default:
        return "bg-white/10 text-gray-300 font-semibold";
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-brand-peach/10 to-transparent blur-[100px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-peach animate-ping" />
              <p className="text-brand-peach text-xs font-bold tracking-[0.25em] uppercase">
                Combine Testing & Records
              </p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Personal Records & Athletic Drills
            </h2>
            <p className="text-gray-400 text-sm mt-1 max-w-2xl">
              Track standardized collegiate combine drills (40-yd dash, vertical jump, 1RM lifts, shuttle runs) with verified personal bests, historical curves, and benchmark tiers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSyncRatings}
              disabled={syncing || personalRecords.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all disabled:opacity-40"
              title="Automatically calibrate 0-100 pillar ratings from your PR percentiles"
            >
              <FaSyncAlt className={`text-xs ${syncing ? "animate-spin text-brand-peach" : "text-brand-peach"}`} />
              <span>{syncing ? "Syncing Scores..." : "Calibrate Ratings"}</span>
            </button>

            <button
              onClick={() => onOpenLogModal && onOpenLogModal()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-peach text-black text-xs font-black uppercase tracking-wider hover:bg-brand-peach/90 transition-all shadow-lg shadow-brand-peach/20"
            >
              <FaPlus className="text-xs" />
              <span>Log Combine Drill</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/5 relative z-10">
          <div className="bg-black/30 rounded-xl p-3 border border-white/5">
            <p className="text-[11px] text-gray-500 font-bold uppercase">All-Time PRs</p>
            <p className="text-2xl font-black text-white mt-1 flex items-center gap-2">
              <FaTrophy className="text-amber-400 text-lg" />
              <span>{combineData?.personalRecordsCount || 0}</span>
            </p>
          </div>

          <div className="bg-black/30 rounded-xl p-3 border border-white/5">
            <p className="text-[11px] text-gray-500 font-bold uppercase">Coach Certified</p>
            <p className="text-2xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
              <FaCheckCircle className="text-base" />
              <span>
                {personalRecords.filter((pr) => pr.isCoachVerified || pr.verificationStatus === "APPROVED").length}
              </span>
            </p>
          </div>

          <div className="bg-black/30 rounded-xl p-3 border border-white/5">
            <p className="text-[11px] text-gray-500 font-bold uppercase">Pending Audit</p>
            <p className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span>
                {personalRecords.filter((pr) => !pr.isCoachVerified && pr.verificationStatus === "PENDING").length}
              </span>
            </p>
          </div>

          <div className="bg-black/30 rounded-xl p-3 border border-white/5">
            <p className="text-[11px] text-gray-500 font-bold uppercase">Calibrated Index</p>
            <p className="text-2xl font-black text-brand-peach mt-1">
              {benchmarkScores.overall ? `${benchmarkScores.overall}%` : "--"}
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 scrollbar-none relative z-10">
          {[
            { id: "ALL", label: "All Drills" },
            { id: "SPEED", label: "⚡ Speed" },
            { id: "STRENGTH", label: "🏋️ Strength & Power" },
            { id: "AGILITY", label: "🌪️ Agility" },
            { id: "ENDURANCE", label: "🏃 Endurance" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-brand-peach text-black shadow-md shadow-brand-peach/20"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* PR Cards Grid */}
      {filteredPrs.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center border border-white/5 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl text-gray-500 mx-auto mb-4">
            <FaTrophy />
          </div>
          <h3 className="text-lg font-bold text-white">No combine drills logged in this category</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
            Log your official 40-yard dash, vertical jump, 1RM lifts, or agility shuttles to display your Personal Records.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
            <button
              onClick={() => onOpenLogModal && onOpenLogModal("40_YARD_DASH")}
              className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:border-brand-peach/40 hover:text-white transition-all"
            >
              ⚡ Log 40-Yard Dash
            </button>
            <button
              onClick={() => onOpenLogModal && onOpenLogModal("VERTICAL_JUMP")}
              className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:border-brand-peach/40 hover:text-white transition-all"
            >
              🚀 Log Vertical Jump
            </button>
            <button
              onClick={() => onOpenLogModal && onOpenLogModal("BENCH_PRESS_1RM")}
              className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:border-brand-peach/40 hover:text-white transition-all"
            >
              🏋️ Log 1RM Bench
            </button>
            <button
              onClick={() => onOpenLogModal && onOpenLogModal("PRO_AGILITY_5105")}
              className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:border-brand-peach/40 hover:text-white transition-all"
            >
              🌪️ Log 5-10-5 Shuttle
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPrs.map((pr) => {
            const hasImprovement = pr.previousBest !== null && pr.previousBest !== undefined;
            const isBetter = hasImprovement && (
              pr.lowerIsBetter
                ? pr.bestValue < pr.previousBest
                : pr.bestValue > pr.previousBest
            );
            const delta = hasImprovement
              ? Math.abs(Math.round((pr.bestValue - pr.previousBest) * 100) / 100)
              : null;

            return (
              <div
                key={pr.drillCode}
                className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover:border-brand-peach/30 transition-all flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-brand-peach/5 blur-[50px] rounded-full pointer-events-none" />

                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getCategoryColor(pr.category)}`}>
                      {getCategoryIcon(pr.category)}
                      <span>{pr.category}</span>
                    </span>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] tracking-wide ${getTierColor(pr.tierBadge)}`}>
                      {pr.tierBadge || "Competitor"}
                    </span>
                  </div>

                  {/* Drill Name */}
                  <h4 className="text-lg font-extrabold text-white tracking-wide">
                    {pr.drillName}
                  </h4>

                  {/* PR Value */}
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-300">
                      {pr.bestValue}
                    </span>
                    <span className="text-lg font-bold text-brand-peach">
                      {pr.unit}
                    </span>

                    {/* PR Ribbon */}
                    <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase">
                      <FaTrophy className="text-[9px]" />
                      <span>PR</span>
                    </span>
                  </div>

                  {/* Improvement Delta */}
                  <div className="mt-2.5 flex items-center justify-between text-xs">
                    {hasImprovement ? (
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        isBetter ? "text-emerald-400" : "text-gray-400"
                      }`}>
                        {pr.lowerIsBetter ? <FaArrowDown className="text-[10px]" /> : <FaArrowUp className="text-[10px]" />}
                        <span>{delta} {pr.unit} vs prior best</span>
                      </span>
                    ) : (
                      <span className="text-gray-500">Benchmark baseline</span>
                    )}

                    <span className="text-gray-400 text-[11px]">
                      {pr.attemptCount} {pr.attemptCount === 1 ? "attempt" : "attempts"}
                    </span>
                  </div>

                  {/* Percentile Progress Bar */}
                  {pr.percentile && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-gray-400">Division Standing</span>
                        <span className="font-bold text-white">
                          Top {Math.max(1, (100 - pr.percentile).toFixed(0))}% ({pr.percentile}th)
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-peach to-amber-400 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(pr.percentile, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Verification Status & Proof Link */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px] gap-2">
                      {pr.isCoachVerified || pr.verificationStatus === "APPROVED" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                          <FaCheckCircle className="text-[10px]" />
                          <span>Verified by {pr.verifiedByCoachName || "Coach"}</span>
                        </span>
                      ) : pr.verificationStatus === "REJECTED" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold" title={pr.coachFeedback || "Coach requested a re-test"}>
                          <span>⚠️ Re-test Requested</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold" title="Attempt submitted with proof, queued for coach review">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                          <span>In Review · Proof Submitted</span>
                        </span>
                      )}

                      {pr.proofUrl && (
                        <a
                          href={pr.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-peach hover:underline inline-flex items-center gap-1 text-[11px] font-bold shrink-0"
                          title="Open Video or Activity Proof"
                        >
                          <span>Watch Proof</span>
                          <FaExternalLinkAlt className="text-[9px]" />
                        </a>
                      )}
                    </div>

                    {/* Coach Feedback Note for Rejected Drills */}
                    {pr.verificationStatus === "REJECTED" && pr.coachFeedback && (
                      <div className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/20 text-[11px] text-rose-300/90 leading-tight">
                        <strong className="text-rose-400">Coach Feedback: </strong>
                        <span>"{pr.coachFeedback}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-2 gap-2 mt-5 pt-3 border-t border-white/5">
                  <button
                    onClick={() => onOpenLogModal && onOpenLogModal(pr.drillCode)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-bold border border-white/5 transition-all"
                  >
                    <FaPlus className="text-[10px]" />
                    <span>Log Rep</span>
                  </button>

                  <button
                    onClick={() => onOpenHistoryModal && onOpenHistoryModal(pr.drillCode, pr.drillName)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-brand-peach/10 hover:text-brand-peach hover:border-brand-peach/30 text-gray-200 text-xs font-bold border border-white/5 transition-all"
                  >
                    <FaHistory className="text-[10px]" />
                    <span>History</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Combine Attempts Timeline */}
      {recentAttempts.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <FaHistory className="text-brand-peach text-sm" />
              <span>Recent Combine Attempts Log</span>
            </h3>
            <span className="text-xs text-gray-400 font-mono">Last 10 recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Drill</th>
                  <th className="pb-3">Result</th>
                  <th className="pb-3">Tier Standing</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentAttempts.map((attempt, idx) => (
                  <tr key={attempt.id || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-semibold text-white flex items-center gap-2">
                      {attempt.isPersonalRecord && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Personal Record" />
                      )}
                      <span>{attempt.drillName}</span>
                    </td>
                    <td className="py-3">
                      <span className="font-mono font-bold text-white">
                        {attempt.value} {attempt.unit}
                      </span>
                      {attempt.isPersonalRecord && (
                        <span className="ml-2 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-extrabold">
                          PR
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-gray-300">
                      {attempt.tierBadge || "Varsity"} ({attempt.percentile || 75}th%)
                    </td>
                    <td className="py-3">
                      {attempt.isCoachVerified || attempt.verificationStatus === "APPROVED" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          <FaCheckCircle className="text-[9px]" />
                          <span>Certified</span>
                        </span>
                      ) : attempt.verificationStatus === "REJECTED" ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold cursor-help"
                          title={attempt.coachFeedback ? `Coach feedback: ${attempt.coachFeedback}` : "Re-test requested by coach"}
                        >
                          <span>⚠️ Re-test</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-gray-400 font-mono">
                      {attempt.recordedAt ? new Date(attempt.recordedAt).toLocaleDateString() : "--"}
                    </td>
                    <td className="py-3 text-right">
                      {attempt.proofUrl ? (
                        <a
                          href={attempt.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-peach hover:underline inline-flex items-center gap-1 font-bold"
                        >
                          <span>View</span>
                          <FaExternalLinkAlt className="text-[9px]" />
                        </a>
                      ) : (
                        <span className="text-gray-600">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
