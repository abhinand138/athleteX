import { useState, useEffect } from "react";
import {
  FaBolt,
  FaShieldAlt,
  FaRunning,
  FaFire,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPlus,
  FaHistory,
  FaTachometerAlt
} from "react-icons/fa";
import api from "../../services/api";

export default function SportWorkloadCard({
  userId,
  onOpenLogModal,
  refreshTrigger
}) {
  const [activeSport, setActiveSport] = useState("CRICKET");
  const [workloadData, setWorkloadData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkload = async (sport) => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await api.get(`/sports/workload/${userId}?sport=${sport}`);
      setWorkloadData(res.data);
    } catch (err) {
      console.error("Failed to load sport workload:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkload(activeSport);
  }, [userId, activeSport, refreshTrigger]);

  const getAcwrBadgeColor = (acwr) => {
    if (acwr >= 1.5) return "bg-red-500/20 text-red-300 border-red-500/40";
    if (acwr >= 1.3) return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    if (acwr >= 0.8) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    return "bg-blue-500/20 text-blue-300 border-blue-500/40";
  };

  const getAcwrBarPosition = (acwr) => {
    // Mapping ACWR 0.0 to 2.0 to 0% to 100%
    const clamped = Math.max(0.4, Math.min(2.0, acwr || 1.0));
    return ((clamped - 0.4) / (2.0 - 0.4)) * 100;
  };

  const recentLogs = workloadData?.recentLogs || [];

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/5 relative overflow-hidden shadow-xl">
      {/* Dynamic ambient backdrop */}
      <div
        className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] pointer-events-none transition-all duration-500 ${
          activeSport === "CRICKET" ? "bg-amber-500/10" : "bg-emerald-500/10"
        }`}
      />

      {/* Top Header & Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full animate-ping ${
                activeSport === "CRICKET" ? "bg-amber-400" : "bg-emerald-400"
              }`}
            />
            <span
              className={`text-[11px] font-black uppercase tracking-[0.2em] ${
                activeSport === "CRICKET" ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              Real-World Sports Workload Hub
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {activeSport === "CRICKET"
              ? "Cricket Fast Bowler Lumbar Workload Engine"
              : "Football Match Load & GPS Wearables Hub"}
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-2xl">
            {activeSport === "CRICKET"
              ? "Prevents lumbar pars bone stress fractures using rolling 7:28 day Acute-to-Chronic Workload Ratios (ECB & Cricket Australia medical guidelines)."
              : "Quantifies High-Speed Running (HSR > 19.8 km/h), sprint volume, and maximum velocity exposure to build hamstring strain immunity."}
          </p>
        </div>

        {/* Actions & Sport Tabs */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
          <div className="inline-flex p-1 bg-black/40 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveSport("CRICKET")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSport === "CRICKET"
                  ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🏏 Cricket
            </button>
            <button
              onClick={() => setActiveSport("FOOTBALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSport === "FOOTBALL"
                  ? "bg-emerald-400 text-black shadow-md shadow-emerald-400/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              ⚽ Football
            </button>
          </div>

          <button
            onClick={() => onOpenLogModal && onOpenLogModal(activeSport)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-black text-xs font-black uppercase tracking-wider shadow-lg transition-all ${
              activeSport === "CRICKET"
                ? "bg-amber-400 hover:bg-amber-300 shadow-amber-400/20"
                : "bg-emerald-400 hover:bg-emerald-300 shadow-emerald-400/20"
            }`}
          >
            <FaPlus className="text-xs" />
            <span>{activeSport === "CRICKET" ? "Log Bowling Spell" : "Log GPS Match"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          CRICKET FAST BOWLER VIEW
      ======================================================== */}
      {activeSport === "CRICKET" && (
        <div className="space-y-6 mt-6 relative z-10">
          {/* Workload Stats Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                7-Day Acute Overs
              </span>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1">
                {workloadData?.acute7DayOvers ?? 0}
                <span className="text-xs text-gray-400 ml-1 font-semibold">overs</span>
              </p>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                ~{Math.round((workloadData?.acute7DayOvers || 0) * 6)} deliveries
              </span>
            </div>

            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                4-Wk Chronic Avg
              </span>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1">
                {workloadData?.chronic28DayWeeklyOvers ?? 0}
                <span className="text-xs text-gray-400 ml-1 font-semibold">ov/wk</span>
              </p>
              <span className="text-[10px] text-gray-500 block mt-0.5">Rolling 28-day baseline</span>
            </div>

            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Bowling ACWR
              </span>
              <p
                className={`text-2xl sm:text-3xl font-black mt-1 ${
                  (workloadData?.bowlingAcwr || 1.0) >= 1.5
                    ? "text-red-400"
                    : (workloadData?.bowlingAcwr || 1.0) >= 1.3
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {workloadData?.bowlingAcwr?.toFixed(2) ?? "1.00"}
              </p>
              <span className="text-[10px] text-gray-500 block mt-0.5">Acute vs Chronic</span>
            </div>

            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Peak Radar Speed
              </span>
              <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 flex items-center gap-1.5">
                <FaFire className="text-lg text-amber-500" />
                <span>
                  {workloadData?.peakBowlingSpeedKmh
                    ? `${workloadData.peakBowlingSpeedKmh} km/h`
                    : "--"}
                </span>
              </p>
              <span className="text-[10px] text-gray-500 block mt-0.5">Top delivery velocity</span>
            </div>
          </div>

          {/* ACWR 4-Zone Spectrum Bar with Pointer Needle */}
          <div className="bg-black/40 rounded-2xl p-5 border border-white/5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FaTachometerAlt className="text-amber-400 text-sm" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Fast Bowler Lumbar Pars Strain Spectrum (Tim Gabbett ACWR)
                </h4>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${getAcwrBadgeColor(
                  workloadData?.bowlingAcwr || 1.0
                )}`}
              >
                {workloadData?.lumbarStressBadge || "🟢 Safe Workload Zone (0.8 - 1.3)"}
              </span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="relative pt-6 pb-2">
              {/* Pointer Needle */}
              <div
                className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-700 pointer-events-none z-20"
                style={{
                  left: `${getAcwrBarPosition(workloadData?.bowlingAcwr || 1.0)}%`
                }}
              >
                <div className="px-2 py-0.5 rounded-md bg-white text-black font-black text-[10px] shadow-lg">
                  {workloadData?.bowlingAcwr?.toFixed(2) ?? "1.00"}
                </div>
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-white" />
              </div>

              {/* Multi-zone Color Bar */}
              <div className="h-3.5 w-full rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="bg-blue-500/80 hover:opacity-100 transition-opacity relative group"
                  style={{ width: "25%" }}
                  title="Undertrained (<0.8)"
                />
                <div
                  className="bg-emerald-500/90 hover:opacity-100 transition-opacity relative group"
                  style={{ width: "31.25%" }}
                  title="Optimal Adaptation Zone (0.8 - 1.3)"
                />
                <div
                  className="bg-amber-500/90 hover:opacity-100 transition-opacity relative group"
                  style={{ width: "12.5%" }}
                  title="Elevated Strain Zone (1.3 - 1.5)"
                />
                <div
                  className="bg-red-500/90 hover:opacity-100 transition-opacity relative group"
                  style={{ width: "31.25%" }}
                  title="Critical Bone Stress Hazard (>1.5)"
                />
              </div>

              {/* Axis Labels */}
              <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono font-bold">
                <span>0.4 (Low)</span>
                <span className="text-emerald-400">0.8 (Safe Zone)</span>
                <span className="text-amber-400">1.3 (Caution)</span>
                <span className="text-red-400">1.5 (Hazard)</span>
                <span>2.0+</span>
              </div>
            </div>

            {/* Medical Recommendation Card */}
            <div
              className={`rounded-xl p-4 border flex items-start gap-3.5 ${
                (workloadData?.bowlingAcwr || 1.0) >= 1.5
                  ? "bg-red-500/10 border-red-500/30 text-red-200"
                  : (workloadData?.bowlingAcwr || 1.0) >= 1.3
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
              }`}
            >
              {(workloadData?.bowlingAcwr || 1.0) >= 1.5 ? (
                <FaExclamationTriangle className="text-red-400 text-xl shrink-0 mt-0.5" />
              ) : (
                <FaShieldAlt className="text-emerald-400 text-xl shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h5 className="font-extrabold text-xs uppercase tracking-wide">
                    Clinical Workload Prescription
                  </h5>
                  <span className="px-2 py-0.5 rounded-md bg-black/40 text-[10px] font-black uppercase text-white">
                    {workloadData?.maxRecommendedOversToday || "10 - 12 Overs Permitted"}
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  {workloadData?.lumbarRecommendation ||
                    "Optimal fast bowling workload. Bone density and muscular capacity are adapting progressively with minimized injury risk."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          FOOTBALL (SOCCER) MATCH & GPS VIEW
      ======================================================== */}
      {activeSport === "FOOTBALL" && (
        <div className="space-y-6 mt-6 relative z-10">
          {/* Football Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                7-Day High-Speed Run
              </span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                {workloadData?.highSpeedRunningWeeklyM ?? 0}
                <span className="text-xs text-gray-400 ml-1 font-semibold">m</span>
              </p>
              <span className="text-[10px] text-gray-500 block mt-0.5">&gt; 19.8 km/h</span>
            </div>

            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Sprint Distance
              </span>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1">
                {workloadData?.sprintDistanceWeeklyM ?? 0}
                <span className="text-xs text-gray-400 ml-1 font-semibold">m</span>
              </p>
              <span className="text-[10px] text-gray-500 block mt-0.5">&gt; 25.2 km/h</span>
            </div>

            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Peak Velocity (Vmax)
              </span>
              <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 flex items-center gap-1.5">
                <FaBolt className="text-lg text-amber-400" />
                <span>
                  {workloadData?.peakMatchVelocityKmh
                    ? `${workloadData.peakMatchVelocityKmh} km/h`
                    : "--"}
                </span>
              </p>
              <span className="text-[10px] text-gray-500 block mt-0.5">Match top speed</span>
            </div>

            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Total Match Distance
              </span>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1">
                {workloadData?.totalDistanceWeeklyKm ?? 0}
                <span className="text-xs text-gray-400 ml-1 font-semibold">km</span>
              </p>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                {workloadData?.totalMatchMinutesWeekly ?? 0} match mins
              </span>
            </div>
          </div>

          {/* Hamstring Inoculation & HSR Exposure Card */}
          <div className="bg-black/40 rounded-2xl p-5 border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FaRunning className="text-emerald-400 text-sm" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Hamstring Strain Inoculation & Velocity Exposure
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                {workloadData?.footballLoadBadge || "🟢 Pro High-Speed Exposure"}
              </span>
            </div>

            {/* HSR Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-gray-300">
                  HSR % of Total Distance ({workloadData?.hsrPercentageOfDistance ?? 8.5}%)
                </span>
                <span className="text-emerald-400">Pro Benchmark: 8.0% - 12.0%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(10, ((workloadData?.hsrPercentageOfDistance || 8.5) / 12) * 100)
                    )}%`
                  }}
                />
              </div>
            </div>

            {/* Science prescription box */}
            <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30 text-emerald-200 flex items-start gap-3">
              <FaShieldAlt className="text-emerald-400 text-xl shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="font-extrabold text-xs uppercase tracking-wide">
                  Injury Prevention Standard
                </h5>
                <p className="text-xs leading-relaxed opacity-90">
                  {workloadData?.footballRecommendation ||
                    "Weekly High-Speed Running (>19.8 km/h) exposes hamstring motor units to peak eccentric load, significantly reducing match-day strain injuries."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          RECENT SESSIONS FEED
      ======================================================== */}
      {recentLogs.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <FaHistory className="text-gray-400 text-xs" />
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">
              Recent Logged Sessions
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="bg-black/30 rounded-xl p-3 border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white">
                      {log.sport === "CRICKET" ? "🏏 Cricket Spell" : "⚽ Match GPS"}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-bold text-gray-400">
                      {log.sessionType}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {log.date} • Effort {log.rpe}/10
                  </p>
                </div>

                <div className="text-right">
                  {log.sport === "CRICKET" ? (
                    <div>
                      <p className="font-black text-amber-400">{log.totalOvers} Overs</p>
                      <p className="text-[10px] text-gray-500">
                        {log.matchOvers} match / {log.practiceOvers} nets
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-black text-emerald-400">
                        {log.totalDistanceKm ? `${log.totalDistanceKm}km` : `${log.minutesPlayed}m`}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {log.highSpeedRunningMeters ? `${log.highSpeedRunningMeters}m HSR` : ""}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
