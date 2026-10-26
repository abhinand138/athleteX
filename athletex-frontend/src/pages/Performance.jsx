import { useEffect, useState } from "react";
import {
  FaRunning,
  FaDumbbell,
  FaHeartbeat,
  FaBolt,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import PerformanceChart from "../components/performance/PerformanceChart";
import FitnessRadarChart from "../components/performance/FitnessRadarChart";
import FitnessFreshnessWidget from "../components/performance/FitnessFreshnessWidget";
import CombinePrSection from "../components/performance/CombinePrSection";
import LogDrillModal from "../components/performance/LogDrillModal";
import DrillHistoryModal from "../components/performance/DrillHistoryModal";
import WorkloadEngineCard from "../components/performance/WorkloadEngineCard";
import SportWorkloadCard from "../components/performance/SportWorkloadCard";
import LogSportWorkloadModal from "../components/performance/LogSportWorkloadModal";

export default function Performance() {
  const [performance, setPerformance] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [fitnessProfile, setFitnessProfile] = useState(null);

  // Combine & PR Tracker states
  const [combineData, setCombineData] = useState(null);
  const [isLogDrillOpen, setIsLogDrillOpen] = useState(false);
  const [selectedDrillForLog, setSelectedDrillForLog] = useState(null);
  const [historyModalDrill, setHistoryModalDrill] = useState(null);

  // Sport-specific Workload states (Cricket Bowler & Football GPS)
  const [isSportWorkloadModalOpen, setIsSportWorkloadModalOpen] = useState(false);
  const [sportWorkloadInitialSport, setSportWorkloadInitialSport] = useState("CRICKET");
  const [sportWorkloadRefreshTrigger, setSportWorkloadRefreshTrigger] = useState(0);

  // Automated Workout Engine attribution
  const [attribution, setAttribution] = useState(null);

  const storedUserObj = (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();
  const currentUserId = storedUserObj?.id;

  /*
   * =============================
   * FETCH PERFORMANCE & FITNESS PROFILE
   * =============================
   */

  const fetchFitnessData = async (userId) => {
    try {
      const fitRes = await api.get(`/performance/${userId}/fitness-profile`);
      setFitnessProfile(fitRes.data);
    } catch (err) {
      console.error("Failed to load fitness profile:", err);
    }
  };

  const fetchCombineData = async (userId) => {
    try {
      const combRes = await api.get(`/performance/${userId}/combine`);
      setCombineData(combRes.data);
    } catch (err) {
      console.error("Failed to load combine summary:", err);
    }
  };

  const fetchWorkloadAttribution = async (userId) => {
    try {
      const attrRes = await api.get(`/performance/${userId}/workload-attribution`);
      setAttribution(attrRes.data);
    } catch (err) {
      console.error("Failed to load workload attribution:", err);
    }
  };

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
          setError("User session not found. Please login again.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);

        if (!user?.id) {
          setError("User ID not found. Please login again.");
          setLoading(false);
          return;
        }

        const response = await api.get(
          `/performance/${user.id}`
        );

        console.log("Performance data:", response.data);

        setPerformance(response.data);

        const historyResponse = await api.get(
          `/performance/${user.id}/history`
        );
        setHistory(historyResponse.data);

        // Fetch Banister & Radar profile
        await fetchFitnessData(user.id);

        // Fetch Combine & PR summary
        await fetchCombineData(user.id);

        // Fetch Workout Engine attribution
        await fetchWorkloadAttribution(user.id);

      } catch (error) {
        console.error("Performance API Error:", error);

        setError(
          error.response?.data?.message ||
          "Unable to load performance data."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  const handleOpenSportWorkloadModal = (sport = "CRICKET") => {
    setSportWorkloadInitialSport(sport);
    setIsSportWorkloadModalOpen(true);
  };

  const handleSportWorkloadSuccess = async () => {
    setSportWorkloadRefreshTrigger((prev) => prev + 1);
    if (currentUserId) {
      await fetchWorkloadAttribution(currentUserId);
      await fetchFitnessData(currentUserId);
    }
  };

  const handleOpenLogModal = (drillCode) => {
    setSelectedDrillForLog(drillCode || null);
    setIsLogDrillOpen(true);
  };

  const handleOpenHistoryModal = (drillCode, drillName) => {
    setHistoryModalDrill({ code: drillCode, name: drillName });
  };

  const handleDrillSuccess = async () => {
    if (currentUserId) {
      await fetchCombineData(currentUserId);
      await fetchFitnessData(currentUserId);
      await fetchWorkloadAttribution(currentUserId);
      try {
        const pRes = await api.get(`/performance/${currentUserId}`);
        setPerformance(pRes.data);
      } catch (err) {
        console.error("Failed to reload performance:", err);
      }
    }
  };

  const handleRecalculateSuccess = (updatedPerformance) => {
    if (updatedPerformance) {
      setPerformance(updatedPerformance);
    }
    if (currentUserId) {
      fetchWorkloadAttribution(currentUserId);
      fetchFitnessData(currentUserId);
      fetchCombineData(currentUserId);
      api.get(`/performance/${currentUserId}/history`).then((res) => {
        setHistory(res.data);
      }).catch(console.error);
    }
  };

  const handleRatingsCalibrated = (updatedPerformance) => {
    if (updatedPerformance) {
      setPerformance(updatedPerformance);
    }
    if (currentUserId) {
      fetchCombineData(currentUserId);
      fetchFitnessData(currentUserId);
      api.get(`/performance/${currentUserId}/history`).then((res) => {
        setHistory(res.data);
      }).catch(console.error);
    }
  };



  /*
   * =============================
   * LOADING STATE
   * =============================
   */

  if (loading) {
    return (
      <DashboardLayout>

        <div className="min-h-[70vh] flex items-center justify-center">

          <div className="text-center">

            <div className="w-12 h-12 border-4 border-brand-peach/20 border-t-brand-peach rounded-full animate-spin mx-auto" />

            <p className="text-gray-400 mt-5">
              Loading performance data...
            </p>

          </div>

        </div>

      </DashboardLayout>
    );
  }

  /*
   * =============================
   * ERROR STATE
   * =============================
   */

  if (error && !performance) {
    return (
      <DashboardLayout>

        <div className="min-h-[70vh] flex items-center justify-center">

          <div className="bg-[#111317] border border-red-500/20 rounded-2xl p-8 text-center max-w-md">

            <h2 className="text-xl font-bold text-white">
              Performance Unavailable
            </h2>

            <p className="text-gray-400 mt-3">
              {error}
            </p>

          </div>

        </div>

      </DashboardLayout>
    );
  }

  if (!performance) {
    return null;
  }

  /*
   * =============================
   * METRICS
   * =============================
   */

  const metrics = [
    {
      title: "Speed",
      name: "speed",
      value: Number(performance?.speed) || 0,
      icon: <FaRunning />,
      color: "text-blue-400",
      bar: "bg-blue-400",
    },
    {
      title: "Strength",
      name: "strength",
      value: Number(performance?.strength) || 0,
      icon: <FaDumbbell />,
      color: "text-brand-peach",
      bar: "bg-brand-peach",
    },
    {
      title: "Endurance",
      name: "endurance",
      value: Number(performance?.endurance) || 0,
      icon: <FaHeartbeat />,
      color: "text-red-400",
      bar: "bg-red-400",
    },
    {
      title: "Agility",
      name: "agility",
      value: Number(performance?.agility) || 0,
      icon: <FaBolt />,
      color: "text-yellow-400",
      bar: "bg-yellow-400",
    },
  ];

  return (
    <DashboardLayout>

      <div className="space-y-8 relative z-10">

        {/* ============================= */}
        {/* HEADER */}
        {/* ============================= */}

        <div className="relative">

          <div className="absolute -left-10 -top-10 w-64 h-64 bg-brand-peach/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 relative z-10">

            <div>

              <p className="text-brand-peach text-xs font-bold tracking-[0.25em] uppercase mb-3">
                Athlete Analytics
              </p>

              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
                Performance
              </h1>

              <p className="text-gray-400 mt-3 text-lg font-medium">
                Track your athletic development and monitor your performance.
              </p>

            </div>

            {/* Autonomous Engine Status Badge */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                ⚡ Workout-Calibrated Engine
              </span>
            </div>

          </div>

        </div>


        {/* ============================= */}
        {/* SUCCESS / ERROR MESSAGE */}
        {/* ============================= */}

        {(message || (error && performance)) && (
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


        {/* ============================= */}
        {/* OVERALL PERFORMANCE */}
        {/* ============================= */}

        <div className="glass-card rounded-2xl p-8 shadow-xl relative overflow-hidden">

          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-peach/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

            <div>

              {performance.isCoachVerified ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider mb-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <FaCheckCircle className="text-sm text-emerald-400" />
                  <span>✔ CERTIFIED SCOUT PASSPORT (Verified by Coach {performance.verifiedByCoachName || "Coach"})</span>
                </div>
              ) : performance.lastEvaluatedBy === "WORKOUT_ENGINE" ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-wider mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>⚡ AUTONOMOUS WORKLOAD INDEX (TRIMP Engine)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
                  <FaExclamationTriangle className="text-amber-400" />
                  <span>⚠️ UNVERIFIED SELF-REPORTED RATINGS</span>
                </div>
              )}

              <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">
                Overall Conditioning Index
              </p>

              <h2 className="text-6xl font-extrabold text-white mt-3">
                {performance.overallScore ?? 0}
                <span className="text-2xl text-brand-peach">
                  %
                </span>
              </h2>

              <p className="text-gray-400 mt-2 max-w-xl text-xs leading-relaxed">
                {performance.isCoachVerified 
                  ? `Officially certified by Coach ${performance.verifiedByCoachName || ""}. This verified status gives college recruiters and scouts certified confidence in your athletic metrics.` 
                  : performance.lastEvaluatedBy === "WORKOUT_ENGINE"
                  ? "Scientific athletic conditioning score continuously calculated from completed workout volume, RPE intensity, and combine tests."
                  : "Self-reported scores carry an unverified badge on scout and college leaderboards. Calibrate from official combine PRs or completed coach workouts to certify your passport."}
              </p>

              {/* Anti-Inflation Calibration CTA */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await api.post(`/performance/${currentUserId}/combine/sync-ratings`);
                      handleRatingsCalibrated(res.data);
                      toast.success("Ratings calibrated from your verified combine PRs!", { icon: "⚡" });
                    } catch (err) {
                      toast.error("Please log combine drill personal records first to calibrate ratings.");
                    }
                  }}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-peach/10 hover:bg-brand-peach/20 border border-brand-peach/30 text-brand-peach text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <FaBolt />
                  <span>Calibrate from Combine PRs</span>
                </button>
              </div>

            </div>

            <div className="relative w-36 h-36 flex items-center justify-center">

              <div className="absolute inset-0 rounded-full border-8 border-white/5" />

              <div
                className="absolute inset-0 rounded-full border-8 border-brand-peach"
                style={{
                  opacity:
                    Number(performance.overallScore) > 0
                      ? 1
                      : 0.2,
                }}
              />

              <span className="text-2xl font-bold text-white">
                {performance.overallScore ?? 0}%
              </span>

            </div>

          </div>

        </div>


        {/* ============================= */}
        {/* METRIC CARDS */}
        {/* ============================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

          {metrics.map((metric) => (

            <div
              key={metric.title}
              className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                    {metric.title}
                  </p>

                  <p className={`text-3xl font-extrabold mt-3 ${metric.color}`}>
                    {metric.value}%
                  </p>

                </div>

                <div
                  className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl ${metric.color}`}
                >
                  {metric.icon}
                </div>

              </div>

              <div className="mt-6 h-2 bg-white/5 rounded-full overflow-hidden">

                <div
                  className={`h-full ${metric.bar} rounded-full transition-all duration-700`}
                  style={{
                    width: `${Math.min(
                      Math.max(metric.value, 0),
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

          ))}

        </div>


        {/* ============================= */}
        {/* REAL-WORLD SPORTS WORKLOAD ENGINE (Cricket & Football) */}
        {/* ============================= */}
        <SportWorkloadCard
          userId={currentUserId}
          onOpenLogModal={handleOpenSportWorkloadModal}
          refreshTrigger={sportWorkloadRefreshTrigger}
        />

        {/* ============================= */}
        {/* WORKLOAD ATTRIBUTION ENGINE */}
        {/* ============================= */}
        <WorkloadEngineCard
          userId={currentUserId}
          attribution={attribution}
          onRecalculateSuccess={handleRecalculateSuccess}
        />


        {/* ============================= */}
        {/* BANISTER FITNESS & FRESHNESS MODEL */}
        {/* ============================= */}
        {fitnessProfile && (
          <FitnessFreshnessWidget fitnessProfile={fitnessProfile} />
        )}

        {/* ============================= */}
        {/* COMBINE DRILLS & PERSONAL RECORDS (PRS) */}
        {/* ============================= */}
        <CombinePrSection
          userId={currentUserId}
          combineData={combineData}
          onOpenLogModal={handleOpenLogModal}
          onOpenHistoryModal={handleOpenHistoryModal}
          onRefreshData={handleRatingsCalibrated}
        />

        {/* ============================= */}
        {/* CHARTS: RADAR & PROGRESSION */}
        {/* ============================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 5-Pillar Athletic Radar */}
          {fitnessProfile?.radarData && (
            <FitnessRadarChart
              radarData={fitnessProfile.radarData}
              overallScore={fitnessProfile.overallFitnessScore}
            />
          )}

          {/* Performance History Chart */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Score Progression
                </h3>
                <span className="text-xs text-gray-400 font-mono">Historical Curve</span>
              </div>
              <p className="text-xs text-gray-400">
                Composite evaluation score tracked across rating updates.
              </p>
            </div>
            
            <div className="relative z-10">
              <PerformanceChart historyData={history} />
            </div>
          </div>
        </div>

        {/* ============================= */}
        {/* PERFORMANCE BREAKDOWN */}
        {/* ============================= */}

        <div className="glass-card rounded-2xl p-8 shadow-xl relative overflow-hidden">

          <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-peach/5 blur-[60px] rounded-full pointer-events-none" />

          <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-8">
            Performance Breakdown
          </h2>

          <div className="space-y-6 relative z-10">

            {metrics.map((metric) => (

              <div key={metric.title}>

                <div className="flex justify-between items-center mb-2">

                  <span className="text-sm font-semibold text-gray-300">
                    {metric.title}
                  </span>

                  <span className={`text-sm font-bold ${metric.color}`}>
                    {metric.value}%
                  </span>

                </div>

                <div className="h-2 bg-white/5 rounded-full overflow-hidden">

                  <div
                    className={`h-full ${metric.bar} rounded-full transition-all duration-700`}
                    style={{
                      width: `${Math.min(
                        Math.max(metric.value, 0),
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* ============================= */}
        {/* LAST UPDATED */}
        {/* ============================= */}

        <div className="text-center">

          <p className="text-xs text-gray-600 font-mono">

            LAST UPDATED:{" "}

            {performance.lastUpdated
              ? new Date(
                  performance.lastUpdated
                ).toLocaleString()
              : "Not available"}

          </p>

        </div>

        {/* ============================= */}
        {/* MODALS */}
        {/* ============================= */}
        <LogDrillModal
          isOpen={isLogDrillOpen}
          onClose={() => {
            setIsLogDrillOpen(false);
            setSelectedDrillForLog(null);
          }}
          userId={currentUserId}
          initialDrillCode={selectedDrillForLog}
          existingPrs={combineData?.personalRecords || []}
          onSuccess={handleDrillSuccess}
        />

        <DrillHistoryModal
          isOpen={!!historyModalDrill}
          onClose={() => setHistoryModalDrill(null)}
          userId={currentUserId}
          drillCode={historyModalDrill?.code}
          drillName={historyModalDrill?.name}
          onLogNew={(drillCode) => {
            handleOpenLogModal(drillCode);
          }}
          onUpdate={handleDrillSuccess}
        />

        <LogSportWorkloadModal
          isOpen={isSportWorkloadModalOpen}
          onClose={() => setIsSportWorkloadModalOpen(false)}
          userId={currentUserId}
          initialSport={sportWorkloadInitialSport}
          onSuccess={handleSportWorkloadSuccess}
        />



      </div>

    </DashboardLayout>
  );
}