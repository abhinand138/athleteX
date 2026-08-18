import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import {
  FaChartLine,
  FaUsers,
  FaCalendarAlt,
  FaTrophy,
  FaDumbbell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaFire,
  FaExchangeAlt,
  FaMedal,
  FaRunning,
  FaShieldAlt,
  FaClock
} from "react-icons/fa";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

const RANGE_OPTIONS = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 3 Months", value: "3m" },
  { label: "This Year", value: "1y" },
  { label: "All Time", value: "all" }
];

export default function CoachAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("30d");

  // Chart Athlete Filter
  const [selectedAthleteId, setSelectedAthleteId] = useState("ALL");

  // Comparison State
  const [compareAthlete1, setCompareAthlete1] = useState("");
  const [compareAthlete2, setCompareAthlete2] = useState("");
  const [comparisonData, setComparisonData] = useState([]);
  const [comparing, setComparing] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const coachId = storedUser?.id;

  useEffect(() => {
    if (!coachId || storedUser.role !== "COACH") {
      setError("Access denied. Coach authentication required.");
      setLoading(false);
      return;
    }
    fetchAnalytics(range);
  }, [range]);

  const fetchAnalytics = async (selectedRange) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/coach/analytics/${coachId}?range=${selectedRange}`);
      setData(res.data);

      // Auto-set comparison athlete defaults if available
      if (res.data?.assignedAthletesList?.length >= 2 && !compareAthlete1 && !compareAthlete2) {
        setCompareAthlete1(res.data.assignedAthletesList[0].id);
        setCompareAthlete2(res.data.assignedAthletesList[1].id);
      } else if (res.data?.assignedAthletesList?.length === 1 && !compareAthlete1) {
        setCompareAthlete1(res.data.assignedAthletesList[0].id);
      }
    } catch (err) {
      setError(err.response?.data || "Failed to load performance analytics.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!compareAthlete1) return;
    const ids = [compareAthlete1];
    if (compareAthlete2 && compareAthlete2 !== compareAthlete1) {
      ids.push(compareAthlete2);
    }

    setComparing(true);
    try {
      const res = await api.post(`/coach/analytics/${coachId}/compare`, ids);
      setComparisonData(res.data || []);
    } catch (err) {
      console.error("Comparison error:", err);
    } finally {
      setComparing(false);
    }
  };

  useEffect(() => {
    if (compareAthlete1) {
      handleCompare();
    }
  }, [compareAthlete1, compareAthlete2]);

  if (loading && !data) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium animate-pulse">Aggregating roster analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex items-center justify-center p-6">
          <div className="glass-card rounded-3xl p-8 border border-red-500/20 text-center max-w-md w-full shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500 rounded-t-3xl"></div>
            <h2 className="text-xl font-bold text-white mb-2">Analytics Unavailable</h2>
            <p className="text-gray-400 text-sm">{error || "Could not retrieve analytics data."}</p>
            <button
              onClick={() => fetchAnalytics(range)}
              className="mt-6 px-6 py-2.5 bg-brand-peach text-black font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-brand-peach/90 transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const {
    summary,
    performanceTrends,
    categoryAnalysis,
    trainingAnalytics,
    achievementAnalytics,
    topAthletes,
    athletesNeedingAttention,
    recentActivity,
    assignedAthletesList
  } = data;

  // Filter line chart data based on selected athlete
  const filteredTrends = (performanceTrends || []).filter((pt) => {
    if (selectedAthleteId === "ALL") return true;
    return pt.athleteId === selectedAthleteId;
  });

  // Radar chart data preparation
  const radarData = (categoryAnalysis || []).map((cat) => ({
    category: cat.category,
    average: cat.avgScore,
    topScore: cat.topScore,
    fullMark: 100
  }));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10 pb-16 relative z-10">

        {/* ========================================================================= */}
        {/* HEADER & DATE RANGE FILTER                                                */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative">
          <div className="relative">
            <div className="absolute -left-10 -top-10 w-64 h-64 bg-brand-peach/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-3.5 mb-2">
              <div className="w-1.5 h-8 bg-brand-peach rounded-full"></div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
                Performance Analytics
              </h1>
            </div>
            <p className="text-gray-400 text-base font-medium ml-5">
              Track athlete development, training progress, and performance trends
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 bg-[#111317] p-1.5 rounded-2xl border border-white/5 shrink-0 self-start md:self-auto shadow-lg">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  range === opt.value
                    ? "bg-brand-peach text-black shadow-md"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUMMARY CARDS (6-METRICS GRID)                                           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="glass-card rounded-2xl p-4 border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between text-blue-400 mb-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Athletes</span>
              <FaUsers className="text-sm" />
            </div>
            <p className="text-2xl font-black text-white">{summary.totalAthletes}</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between text-yellow-400 mb-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Sessions</span>
              <FaCalendarAlt className="text-sm" />
            </div>
            <p className="text-2xl font-black text-white">{summary.activeTrainingSessions}</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Completed</span>
              <FaCheckCircle className="text-sm" />
            </div>
            <p className="text-2xl font-black text-white">{summary.completedTrainings}</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between text-brand-peach mb-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Achievements</span>
              <FaTrophy className="text-sm" />
            </div>
            <p className="text-2xl font-black text-white">{summary.totalAchievements}</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between text-purple-400 mb-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Avg Performance</span>
              <FaChartLine className="text-sm" />
            </div>
            <p className="text-2xl font-black text-white">{summary.averagePerformance}%</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Completion Rate</span>
              <FaDumbbell className="text-sm" />
            </div>
            <p className="text-2xl font-black text-white">{summary.trainingCompletionRate}%</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: PERFORMANCE PROGRESSION & CATEGORY ATTRIBUTES                  */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progression Line Chart */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                  <FaChartLine className="text-brand-peach" />
                  Performance Progression
                </h2>
                <p className="text-gray-400 text-xs mt-1">Score history and trajectory across testing assessments</p>
              </div>

              {/* Athlete Selector for Chart */}
              <select
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                className="bg-[#111317] border border-white/10 rounded-xl px-4 py-2 text-white text-xs font-semibold focus:outline-none focus:border-brand-peach/50 transition-colors"
              >
                <option value="ALL">All Athletes (Timeline)</option>
                {assignedAthletesList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName}
                  </option>
                ))}
              </select>
            </div>

            {filteredTrends.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center text-gray-500 text-xs">
                <FaChartLine className="text-3xl mb-2 text-gray-600" />
                No progression records recorded for the selected time range.
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={11} domain={[0, 100]} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111317",
                        borderColor: "#ffffff15",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Overall Score"
                      stroke="#ff7b54"
                      strokeWidth={3}
                      dot={{ fill: "#ff7b54", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line type="monotone" dataKey="speed" name="Speed" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="strength" name="Strength" stroke="#10b981" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="endurance" name="Endurance" stroke="#eab308" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="agility" name="Agility" stroke="#a855f7" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Category Radar / Bar Analysis */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <FaRunning className="text-yellow-400" />
                Category Breakdown
              </h2>
              <p className="text-gray-400 text-xs mt-1">Average vs Highest score per discipline</p>
            </div>

            <div className="h-64 w-full my-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#ffffff15" />
                  <PolarAngleAxis dataKey="category" stroke="#9ca3af" fontSize={11} />
                  <PolarRadiusAxis domain={[0, 100]} stroke="#4b5563" fontSize={9} />
                  <Radar name="Roster Avg" dataKey="average" stroke="#ff7b54" fill="#ff7b54" fillOpacity={0.4} />
                  <Radar name="Top Score" dataKey="topScore" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111317",
                      borderColor: "#ffffff15",
                      borderRadius: "12px",
                      fontSize: "12px"
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Stat Pill Row */}
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/5 text-center">
              {categoryAnalysis.map((cat) => (
                <div key={cat.category} className="p-2 rounded-xl bg-white/5">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">{cat.category}</p>
                  <p className="text-sm font-bold text-white mt-0.5">{cat.avgScore}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: TRAINING ANALYTICS & COMPLETION                                */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Training Overview & Progress Indicator */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                  <FaDumbbell className="text-cyan-400" />
                  Training Overview
                </h2>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded-full border border-cyan-400/20">
                  {trainingAnalytics.totalTrainings} Total
                </span>
              </div>
              <p className="text-gray-400 text-xs mb-6">Completion health and workload status</p>

              {/* Progress Indicator */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-300">Completion Rate</span>
                  <span className="text-emerald-400 font-bold">{trainingAnalytics.completionRate}%</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${trainingAnalytics.completionRate}%` }}
                    className="bg-emerald-500 transition-all duration-700"
                    title={`Completed: ${trainingAnalytics.completed}`}
                  ></div>
                  <div
                    style={{
                      width: `${
                        trainingAnalytics.totalTrainings > 0
                          ? (trainingAnalytics.scheduled * 100) / trainingAnalytics.totalTrainings
                          : 0
                      }%`
                    }}
                    className="bg-yellow-400 transition-all duration-700"
                    title={`Scheduled: ${trainingAnalytics.scheduled}`}
                  ></div>
                  <div
                    style={{
                      width: `${
                        trainingAnalytics.totalTrainings > 0
                          ? (trainingAnalytics.cancelled * 100) / trainingAnalytics.totalTrainings
                          : 0
                      }%`
                    }}
                    className="bg-red-500 transition-all duration-700"
                    title={`Cancelled: ${trainingAnalytics.cancelled}`}
                  ></div>
                </div>
              </div>

              {/* Detailed Numbers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <FaCheckCircle /> Completed
                  </div>
                  <span className="text-white font-bold text-sm">{trainingAnalytics.completed}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-yellow-400">
                    <FaCalendarAlt /> Scheduled
                  </div>
                  <span className="text-white font-bold text-sm">{trainingAnalytics.scheduled}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
                    <FaExclamationTriangle /> Cancelled
                  </div>
                  <span className="text-white font-bold text-sm">{trainingAnalytics.cancelled}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Training Activity Chart */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5 mb-1">
              <FaCalendarAlt className="text-brand-peach" />
              Monthly Training Volume
            </h2>
            <p className="text-gray-400 text-xs mb-6">Distribution of workouts scheduled vs completed</p>

            {trainingAnalytics.monthlyDistribution.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500 text-xs">
                No monthly training sessions recorded.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trainingAnalytics.monthlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111317",
                        borderColor: "#ffffff15",
                        borderRadius: "12px",
                        fontSize: "12px"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="scheduled" name="Scheduled" fill="#eab308" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: TOP PERFORMERS & ATTENTION ALERTS                              */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Athletes Leaderboard */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                  <FaTrophy className="text-yellow-400" />
                  Top Performing Athletes
                </h2>
                <p className="text-gray-400 text-xs mt-1">Ranked by performance score and training consistency</p>
              </div>
            </div>

            {topAthletes.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-8">No assigned athletes found on roster.</p>
            ) : (
              <div className="space-y-3">
                {topAthletes.map((ath) => (
                  <div
                    key={ath.athleteId}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-peach/30 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          ath.rank === 1
                            ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                            : ath.rank === 2
                            ? "bg-gray-300 text-black"
                            : ath.rank === 3
                            ? "bg-amber-600 text-white"
                            : "bg-white/10 text-gray-400"
                        }`}
                      >
                        {ath.rank}
                      </span>
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate">{ath.name}</p>
                        <p className="text-gray-500 text-[11px] truncate">
                          {ath.sport} • {ath.achievementCount} Achievements
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-white font-bold text-sm">{ath.performanceScore}%</p>
                        <p className="text-emerald-400 text-[10px] font-mono">{ath.trainingCompletionRate}% Comp</p>
                      </div>
                      <span
                        className={`text-xs p-1.5 rounded-lg ${
                          ath.trend === "UP"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : ath.trend === "DOWN"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-white/5 text-gray-400"
                        }`}
                        title={`Trend: ${ath.trend}`}
                      >
                        {ath.trend === "UP" && <FaArrowUp />}
                        {ath.trend === "DOWN" && <FaArrowDown />}
                        {ath.trend === "NEUTRAL" && <FaMinus />}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Athletes Needing Attention */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                    <FaExclamationTriangle className="text-red-400" />
                    Athletes Needing Attention
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">Identified risks in attendance, completion, or performance drop</p>
                </div>
              </div>

              {athletesNeedingAttention.length === 0 ? (
                <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center my-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 text-xl">
                    <FaCheckCircle />
                  </div>
                  <h3 className="text-white font-bold text-base">All athletes are on track</h3>
                  <p className="text-gray-400 text-xs mt-1">
                    No critical drops in performance or low completion rates detected across your roster.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {athletesNeedingAttention.map((att) => (
                    <div
                      key={att.athleteId}
                      className={`p-4 rounded-2xl border ${
                        att.severity === "HIGH"
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-white text-sm">{att.name}</span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            att.severity === "HIGH" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {att.severity} Priority
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{att.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: INTERACTIVE ATHLETE COMPARISON TOOL                            */}
        {/* ========================================================================= */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <FaExchangeAlt className="text-brand-peach" />
                Head-to-Head Athlete Comparison
              </h2>
              <p className="text-gray-400 text-xs mt-1">Compare performance attributes and metrics side-by-side</p>
            </div>

            {/* Athlete Selection Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={compareAthlete1}
                onChange={(e) => setCompareAthlete1(e.target.value)}
                className="bg-[#111317] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs font-semibold focus:outline-none focus:border-brand-peach/50 transition-colors"
              >
                <option value="">-- Athlete 1 --</option>
                {assignedAthletesList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName}
                  </option>
                ))}
              </select>

              <span className="text-gray-500 text-xs font-bold">vs</span>

              <select
                value={compareAthlete2}
                onChange={(e) => setCompareAthlete2(e.target.value)}
                className="bg-[#111317] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs font-semibold focus:outline-none focus:border-brand-peach/50 transition-colors"
              >
                <option value="">-- Athlete 2 (Optional) --</option>
                {assignedAthletesList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {comparisonData.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-6">
              Select one or two athletes from your roster above to compare metrics.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Metric</th>
                    {comparisonData.map((a) => (
                      <th key={a.athleteId} className="py-3 px-4 font-bold text-white">
                        {a.athleteName} ({a.sport})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300 font-medium">
                  <tr>
                    <td className="py-3 px-4 text-gray-400 font-semibold">Overall Performance</td>
                    {comparisonData.map((a) => (
                      <td key={a.athleteId} className="py-3 px-4 font-bold text-brand-peach text-sm">
                        {a.overallScore}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-400 font-semibold">Speed</td>
                    {comparisonData.map((a) => (
                      <td key={a.athleteId} className="py-3 px-4">
                        {a.speed}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-400 font-semibold">Strength</td>
                    {comparisonData.map((a) => (
                      <td key={a.athleteId} className="py-3 px-4">
                        {a.strength}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-400 font-semibold">Endurance</td>
                    {comparisonData.map((a) => (
                      <td key={a.athleteId} className="py-3 px-4">
                        {a.endurance}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-400 font-semibold">Agility</td>
                    {comparisonData.map((a) => (
                      <td key={a.athleteId} className="py-3 px-4">
                        {a.agility}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-400 font-semibold">Training Completion</td>
                    {comparisonData.map((a) => (
                      <td key={a.athleteId} className="py-3 px-4 text-emerald-400 font-bold">
                        {a.completionRate}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-400 font-semibold">Total Achievements</td>
                    {comparisonData.map((a) => (
                      <td key={a.athleteId} className="py-3 px-4 text-yellow-400 font-bold">
                        {a.achievementCount}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: ACHIEVEMENT BREAKDOWN & RECENT ACTIVITY FEED                   */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Achievement Breakdown */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5 mb-1">
              <FaMedal className="text-yellow-400" />
              Achievement Insights
            </h2>
            <p className="text-gray-400 text-xs mb-6">Distribution across categories</p>

            <div className="space-y-3">
              {achievementAnalytics.distribution.map((d) => (
                <div key={d.category} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-xs text-gray-300 font-semibold">{d.category}</span>
                  <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2.5 py-0.5 rounded-full border border-yellow-400/20">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Performance Activity Feed */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5 mb-1">
              <FaClock className="text-brand-peach" />
              Recent Roster Activity
            </h2>
            <p className="text-gray-400 text-xs mb-6">Latest milestones and achievements logged by your athletes</p>

            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-8">No recent activity found for this time range.</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {recentActivity.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-brand-peach/10 border border-brand-peach/20 flex items-center justify-center text-base shrink-0">
                      {act.icon || "🏆"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-white font-bold text-xs truncate">{act.title}</p>
                        <span className="text-[10px] text-gray-500 font-mono shrink-0">
                          {act.timestamp ? new Date(act.timestamp).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-gray-400 text-[11px] mt-0.5 truncate">
                        <span className="text-brand-peach font-semibold">{act.athleteName}:</span> {act.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
