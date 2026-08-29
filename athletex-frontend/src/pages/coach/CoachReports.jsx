import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import {
  FaFileAlt,
  FaFilePdf,
  FaUser,
  FaUsers,
  FaDumbbell,
  FaTrophy,
  FaChartLine,
  FaExchangeAlt,
  FaDownload,
  FaPrint,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaRunning,
  FaHeartbeat,
  FaBolt,
  FaShieldAlt,
  FaMedal
} from "react-icons/fa";
import { generatePdfReport } from "../../utils/pdfGenerator";
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

const REPORT_TYPES = [
  { id: "INDIVIDUAL", title: "Individual Athlete", icon: <FaUser />, desc: "Detailed profile, scores, workouts & milestones" },
  { id: "TEAM", title: "Team / Roster", icon: <FaUsers />, desc: "Rankings, averages, team completion & breakdown" },
  { id: "TRAINING", title: "Training Overview", icon: <FaDumbbell />, desc: "Workload, completion rates & session breakdown" },
  { id: "ACHIEVEMENT", title: "Achievements", icon: <FaTrophy />, desc: "Medals, records, leaderboard & chronological timeline" },
  { id: "ANALYTICS", title: "Performance Analytics", icon: <FaChartLine />, desc: "Macro trends, category radar & attention alerts" },
  { id: "COMPARISON", title: "Athlete Comparison", icon: <FaExchangeAlt />, desc: "Side-by-side metric matrix for selected athletes" }
];

const RANGE_OPTIONS = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "3 Months", value: "3m" },
  { label: "This Year", value: "1y" },
  { label: "All Time", value: "all" },
  { label: "Custom Range", value: "custom" }
];

export default function CoachReports() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeType, setActiveType] = useState("INDIVIDUAL");
  const [range, setRange] = useState("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [assignedAthletes, setAssignedAthletes] = useState([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState("");

  // Comparison State
  const [compareAthlete1, setCompareAthlete1] = useState("");
  const [compareAthlete2, setCompareAthlete2] = useState("");

  // Report Data State
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const coachId = storedUser?.id;

  useEffect(() => {
    if (!coachId || storedUser.role !== "COACH") {
      setError("Access denied. Coach authentication required.");
      setLoading(false);
      return;
    }
    loadAssignedAthletes();
  }, []);

  const loadAssignedAthletes = async () => {
    try {
      const res = await api.get(`/coach/assignments/coach/${coachId}`);
      const athletes = res.data || [];
      setAssignedAthletes(athletes);

      // Check query param
      const urlAthleteId = searchParams.get("athleteId");
      if (urlAthleteId && athletes.some((a) => a.id === urlAthleteId)) {
        setSelectedAthleteId(urlAthleteId);
        setActiveType("INDIVIDUAL");
      } else if (athletes.length > 0) {
        setSelectedAthleteId(athletes[0].id);
        setCompareAthlete1(athletes[0].id);
        if (athletes.length > 1) {
          setCompareAthlete2(athletes[1].id);
        }
      }
    } catch (err) {
      console.error("Failed to load athletes:", err);
    }
  };

  useEffect(() => {
    if (coachId && assignedAthletes.length > 0) {
      fetchReport();
    }
  }, [activeType, range, selectedAthleteId, compareAthlete1, compareAthlete2, customStart, customEnd, assignedAthletes]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      let queryParams = `range=${range}`;
      if (range === "custom" && customStart && customEnd) {
        if (customStart > customEnd) {
          setError("Start date cannot be after end date.");
          setLoading(false);
          return;
        }
        queryParams = `range=custom&startDate=${customStart}&endDate=${customEnd}`;
      }

      let res;
      if (activeType === "INDIVIDUAL") {
        if (!selectedAthleteId) {
          setReportData(null);
          setLoading(false);
          return;
        }
        res = await api.get(`/coach/reports/athlete/${coachId}/${selectedAthleteId}?${queryParams}`);
      } else if (activeType === "TEAM") {
        res = await api.get(`/coach/reports/team/${coachId}?${queryParams}`);
      } else if (activeType === "TRAINING") {
        res = await api.get(`/coach/reports/training/${coachId}?${queryParams}`);
      } else if (activeType === "ACHIEVEMENT") {
        res = await api.get(`/coach/reports/achievements/${coachId}?${queryParams}`);
      } else if (activeType === "ANALYTICS") {
        res = await api.get(`/coach/analytics/${coachId}?${queryParams}`);
      } else if (activeType === "COMPARISON") {
        const ids = [compareAthlete1];
        if (compareAthlete2 && compareAthlete2 !== compareAthlete1) {
          ids.push(compareAthlete2);
        }
        res = await api.post(`/coach/analytics/${coachId}/compare`, ids);
      }

      setReportData(res?.data || null);
    } catch (err) {
      setError(err.response?.data || "Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = async () => {
    setExporting(true);
    try {
      let url = "";
      let filename = "athletex-report.csv";

      if (activeType === "INDIVIDUAL" && selectedAthleteId) {
        url = `/coach/reports/athlete/${coachId}/${selectedAthleteId}/csv?range=${range}`;
        filename = `athlete-performance-${selectedAthleteId}.csv`;
      } else if (activeType === "TEAM") {
        url = `/coach/reports/team/${coachId}/csv?range=${range}`;
        filename = "team-performance-report.csv";
      } else if (activeType === "TRAINING") {
        url = `/coach/reports/training/${coachId}/csv?range=${range}`;
        filename = "training-report.csv";
      } else if (activeType === "ACHIEVEMENT") {
        url = `/coach/reports/achievements/${coachId}/csv?range=${range}`;
        filename = "achievement-report.csv";
      } else {
        toast.error("CSV export is available for Individual, Team, Training, and Achievement reports.");
        setExporting(false);
        return;
      }

      const res = await api.get(url, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV export downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download CSV export.");
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!reportData) return;
    try {
      generatePdfReport(activeType, reportData, storedUser?.fullName || "Coach", range);
      toast.success("PDF document generated successfully!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF document. Please try again.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-16 relative z-10 print:max-w-none print:w-full print:p-0 print:m-0 print:space-y-4">

        {/* ========================================================================= */}
        {/* HEADER & EXPORT ACTIONS (HIDDEN IN PRINT)                                 */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
          <div className="relative">
            <div className="absolute -left-10 -top-10 w-64 h-64 bg-brand-peach/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-3.5 mb-2">
              <div className="w-1.5 h-8 bg-brand-peach rounded-full"></div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
                Performance Reports
              </h1>
            </div>
            <p className="text-gray-400 text-base font-medium ml-5">
              Generate, review, and export athlete performance reports
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleDownloadPdf}
              disabled={loading || !reportData}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-peach to-orange-500 hover:from-brand-peach/90 hover:to-orange-500/90 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,123,84,0.3)] cursor-pointer disabled:opacity-50"
            >
              <FaFilePdf className="text-sm" />
              Download PDF Report
            </button>

            <button
              onClick={handleDownloadCsv}
              disabled={exporting || loading || !reportData}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
            >
              <FaDownload className="text-brand-peach" />
              {exporting ? "Exporting..." : "Export CSV"}
            </button>

            <button
              onClick={handlePrint}
              disabled={loading || !reportData}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
              title="Browser Print Preview"
            >
              <FaPrint />
              Print
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* REPORT TYPE SELECTOR CARDS (HIDDEN IN PRINT)                              */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 print:hidden">
          {REPORT_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeType === t.id
                  ? "bg-brand-peach/10 border-brand-peach text-white shadow-lg shadow-brand-peach/10"
                  : "glass-card border-white/5 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              <div className={`p-2.5 rounded-xl w-fit text-lg mb-3 ${
                activeType === t.id ? "bg-brand-peach text-black" : "bg-white/5 text-brand-peach"
              }`}>
                {t.icon}
              </div>
              <div>
                <p className="font-bold text-xs text-white leading-tight">{t.title}</p>
                <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 leading-snug">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* FILTER BAR: RANGE & ATHLETE SELECTOR (HIDDEN IN PRINT)                    */}
        {/* ========================================================================= */}
        <div className="glass-card rounded-2xl p-4 border border-white/5 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 print:hidden">
          {/* Athlete Selector (when applicable) */}
          {activeType === "INDIVIDUAL" ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Athlete:</span>
              <select
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                className="bg-[#111317] border border-white/10 rounded-xl px-4 py-2 text-white text-xs font-semibold focus:outline-none focus:border-brand-peach/50 transition-colors"
              >
                {assignedAthletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName} ({a.sport || "Athlete"})
                  </option>
                ))}
              </select>
            </div>
          ) : activeType === "COMPARISON" ? (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Compare:</span>
              <select
                value={compareAthlete1}
                onChange={(e) => setCompareAthlete1(e.target.value)}
                className="bg-[#111317] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs font-semibold focus:outline-none focus:border-brand-peach/50"
              >
                {assignedAthletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName}
                  </option>
                ))}
              </select>
              <span className="text-xs text-gray-500 font-bold">vs</span>
              <select
                value={compareAthlete2}
                onChange={(e) => setCompareAthlete2(e.target.value)}
                className="bg-[#111317] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs font-semibold focus:outline-none focus:border-brand-peach/50"
              >
                <option value="">-- None --</option>
                {assignedAthletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <FaUsers className="text-brand-peach" />
              <span>Target Roster: {assignedAthletes.length} Assigned Athletes</span>
            </div>
          )}

          {/* Time Range Pills */}
          <div className="flex items-center gap-1.5 bg-[#111317] p-1 rounded-xl border border-white/5 self-start md:self-auto overflow-x-auto">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  range === opt.value
                    ? "bg-brand-peach text-black shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Range Picker */}
        {range === "custom" && (
          <div className="glass-card rounded-2xl p-4 border border-white/5 flex items-center gap-4 text-xs print:hidden animate-fadeIn">
            <span className="text-gray-400 font-semibold uppercase">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-[#111317] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-brand-peach/50"
            />
            <span className="text-gray-400 font-semibold uppercase">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-[#111317] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-brand-peach/50"
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64 print:hidden">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
              <p className="text-gray-400 text-xs font-medium animate-pulse">Compiling official report data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="glass-card rounded-2xl p-6 border border-red-500/20 text-center max-w-md mx-auto print:hidden">
            <h3 className="text-white font-bold text-base mb-1">Report Error</h3>
            <p className="text-gray-400 text-xs">{error}</p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* REPORT PREVIEW CONTAINER                                                  */}
        {/* ========================================================================= */}
        {!loading && !error && reportData && (
          <div className="glass-card rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl space-y-8 relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white print:text-slate-900 print-page-break-avoid">
            
            {/* Official Report Header */}
            <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:border-b-2 print:border-slate-800 print:pb-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-widest uppercase text-brand-peach print:text-orange-600 print:font-extrabold">
                    ATHLETEX PERFORMANCE REPORTING SYSTEM
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight print:text-slate-950 print:text-3xl">
                  {activeType === "INDIVIDUAL" && `${reportData.athleteName} — Performance Evaluation`}
                  {activeType === "TEAM" && "Team Roster Performance Evaluation"}
                  {activeType === "TRAINING" && "Comprehensive Training Workload Report"}
                  {activeType === "ACHIEVEMENT" && "Athletic Milestones & Achievements Report"}
                  {activeType === "ANALYTICS" && "Performance Analytics & Insights Report"}
                  {activeType === "COMPARISON" && "Head-to-Head Athlete Comparison Evaluation"}
                </h2>
                <p className="text-xs text-gray-400 print:text-slate-600 font-medium">
                  Supervising Coach: <span className="text-gray-200 font-semibold print:text-slate-900">{storedUser.fullName || "Coach"}</span> • Generated Date: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>

              <div className="text-right sm:self-center">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 print:border-slate-400 print:bg-slate-100 print:text-slate-900">
                  Period: {range.toUpperCase()}
                </span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 1. INDIVIDUAL ATHLETE REPORT CONTENT                                      */}
            {/* ========================================================================= */}
            {activeType === "INDIVIDUAL" && (
              <div className="space-y-6">
                {/* Profile Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 text-xs print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                  <div>
                    <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold print:text-slate-500">Sport / Position</span>
                    <p className="text-white font-bold text-sm mt-0.5 print:text-slate-900">{reportData.sport || "Athlete"} {reportData.position ? `(${reportData.position})` : ""}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold print:text-slate-500">Age / Gender</span>
                    <p className="text-white font-bold text-sm mt-0.5 print:text-slate-900">{reportData.age ? `${reportData.age} yrs` : "N/A"} • {reportData.gender || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold print:text-slate-500">Height / Weight</span>
                    <p className="text-white font-bold text-sm mt-0.5 print:text-slate-900">{reportData.height ? `${reportData.height} cm` : "N/A"} • {reportData.weight ? `${reportData.weight} kg` : "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold print:text-slate-500">Location</span>
                    <p className="text-white font-bold text-sm mt-0.5 print:text-slate-900">{[reportData.city, reportData.state].filter(Boolean).join(", ") || "N/A"}</p>
                  </div>
                </div>

                {/* Score & Progression */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest print:text-slate-500">Overall Score</span>
                      <h3 className="text-5xl font-black text-white mt-2 print:text-slate-950">{reportData.overallScore}%</h3>
                      <p className="text-xs text-gray-400 mt-2 print:text-slate-600">
                        Previous: <span className="text-white font-semibold print:text-slate-900">{reportData.previousScore}%</span>
                        {reportData.changePercentage !== 0 && (
                          <span className={`ml-2 font-bold ${reportData.changePercentage > 0 ? "text-emerald-400 print:text-emerald-700" : "text-red-400 print:text-red-700"}`}>
                            {reportData.changePercentage > 0 ? `+${reportData.changePercentage}%` : `${reportData.changePercentage}%`}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5 text-xs mt-4 print:border-slate-200">
                      <div><span className="text-gray-500 print:text-slate-500">Speed:</span> <b className="text-white print:text-slate-900 ml-1">{reportData.speed}%</b></div>
                      <div><span className="text-gray-500 print:text-slate-500">Strength:</span> <b className="text-white print:text-slate-900 ml-1">{reportData.strength}%</b></div>
                      <div><span className="text-gray-500 print:text-slate-500">Endurance:</span> <b className="text-white print:text-slate-900 ml-1">{reportData.endurance}%</b></div>
                      <div><span className="text-gray-500 print:text-slate-500">Agility:</span> <b className="text-white print:text-slate-900 ml-1">{reportData.agility}%</b></div>
                    </div>
                  </div>

                  {/* Progression Line Chart */}
                  <div className="md:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/5 print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl print:col-span-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest print:text-slate-500">Performance Progression Timeline</span>
                    <div className="h-48 w-full mt-3">
                      {reportData.progressionHistory?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={reportData.progressionHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b830" vertical={false} />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: "8px", fontSize: "11px" }} />
                            <Line type="monotone" dataKey="score" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 print:text-slate-500 text-xs font-medium">
                          Single assessment logged (Overall: {reportData.overallScore}%)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Training & Achievements Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-gray-400 uppercase font-bold print:text-slate-500">Total Trainings</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.totalTrainings}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold print:text-emerald-700">Completed</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.completedTrainings}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-cyan-400 uppercase font-bold print:text-cyan-700">Completion Rate</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.trainingCompletionRate}%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-yellow-400 uppercase font-bold print:text-amber-700">Achievements</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.totalAchievements}</p>
                  </div>
                </div>

                {/* Achievements List */}
                {reportData.achievementsList?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider print:text-slate-950">Milestones & Achievements</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2">
                      {reportData.achievementsList.map((a) => (
                        <div key={a.id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3 text-xs print:bg-slate-50 print:border print:border-slate-200">
                          <span className="text-xl shrink-0">{a.icon || "🏆"}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-bold truncate print:text-slate-950">{a.title}</p>
                            <p className="text-gray-400 text-[11px] mt-0.5 print:text-slate-600">{a.description || a.category}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. TEAM ROSTER REPORT CONTENT                                             */}
            {/* ========================================================================= */}
            {activeType === "TEAM" && (
              <div className="space-y-6">
                {/* Team Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-gray-400 uppercase font-bold print:text-slate-500">Total Athletes</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.teamSummary?.totalAthletes}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-brand-peach uppercase font-bold print:text-orange-600">Avg Performance</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.teamSummary?.averagePerformance}%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold print:text-emerald-700">Completion Rate</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.teamSummary?.trainingCompletionRate}%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-yellow-400 uppercase font-bold print:text-amber-700">Total Achievements</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.teamSummary?.totalAchievements}</p>
                  </div>
                </div>

                {/* Athlete Performance Table */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider print:text-slate-950">Roster Performance Rankings</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] print:border-b-2 print:border-slate-400 print:text-slate-700">
                          <th className="py-2.5 px-3">Rank</th>
                          <th className="py-2.5 px-3">Athlete</th>
                          <th className="py-2.5 px-3">Sport</th>
                          <th className="py-2.5 px-3">Performance</th>
                          <th className="py-2.5 px-3">Training Completion</th>
                          <th className="py-2.5 px-3">Achievements</th>
                          <th className="py-2.5 px-3">Trend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-gray-300 print:divide-slate-200 print:text-slate-900">
                        {reportData.athleteRankings?.map((ath) => (
                          <tr key={ath.athleteId}>
                            <td className="py-2.5 px-3 font-bold text-white print:text-slate-950">#{ath.rank}</td>
                            <td className="py-2.5 px-3 font-semibold text-white print:text-slate-950">{ath.name}</td>
                            <td className="py-2.5 px-3">{ath.sport}</td>
                            <td className="py-2.5 px-3 font-bold text-brand-peach print:text-orange-600">{ath.performanceScore}%</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-medium print:text-emerald-700">{ath.trainingCompletionRate}%</td>
                            <td className="py-2.5 px-3 text-yellow-400 font-medium print:text-amber-700">{ath.achievementCount}</td>
                            <td className="py-2.5 px-3">{ath.trend}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. TRAINING REPORT CONTENT                                                */}
            {/* ========================================================================= */}
            {activeType === "TRAINING" && (
              <div className="space-y-6">
                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-gray-400 uppercase font-bold print:text-slate-500">Total Sessions</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.totalTrainings}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold print:text-emerald-700">Completed</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.completed}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-yellow-400 uppercase font-bold print:text-amber-700">Scheduled</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.scheduled}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-cyan-400 uppercase font-bold print:text-cyan-700">Completion Rate</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.completionRate}%</p>
                  </div>
                </div>

                {/* Athlete-by-Athlete Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider print:text-slate-950">Athlete Workload & Completion Breakdown</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] print:border-b-2 print:border-slate-400 print:text-slate-700">
                          <th className="py-2.5 px-3">Athlete</th>
                          <th className="py-2.5 px-3">Sport</th>
                          <th className="py-2.5 px-3">Total Sessions</th>
                          <th className="py-2.5 px-3">Completed</th>
                          <th className="py-2.5 px-3">Scheduled</th>
                          <th className="py-2.5 px-3">Cancelled</th>
                          <th className="py-2.5 px-3">Completion Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-gray-300 print:divide-slate-200 print:text-slate-900">
                        {reportData.athleteTrainingStats?.map((s) => (
                          <tr key={s.athleteId}>
                            <td className="py-2.5 px-3 font-semibold text-white print:text-slate-950">{s.athleteName}</td>
                            <td className="py-2.5 px-3">{s.sport}</td>
                            <td className="py-2.5 px-3 font-bold">{s.totalSessions}</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-bold print:text-emerald-700">{s.completed}</td>
                            <td className="py-2.5 px-3 text-yellow-400 print:text-amber-700">{s.scheduled}</td>
                            <td className="py-2.5 px-3 text-red-400 print:text-red-700">{s.cancelled}</td>
                            <td className="py-2.5 px-3 font-bold text-cyan-400 print:text-cyan-700">{s.completionRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 4. ACHIEVEMENT REPORT CONTENT                                             */}
            {/* ========================================================================= */}
            {activeType === "ACHIEVEMENT" && (
              <div className="space-y-6">
                {/* Category Totals */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-gray-400 uppercase font-bold print:text-slate-500">Total Milestones</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.totalAchievements}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-yellow-400 uppercase font-bold print:text-amber-700">Championships</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.championships}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-red-400 uppercase font-bold print:text-red-700">Records</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.records}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-brand-peach uppercase font-bold print:text-orange-600">Awards</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.awards}</p>
                  </div>
                </div>

                {/* Leaderboard Table */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider print:text-slate-950">Achievement Leaderboard</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] print:border-b-2 print:border-slate-400 print:text-slate-700">
                          <th className="py-2.5 px-3">Rank</th>
                          <th className="py-2.5 px-3">Athlete</th>
                          <th className="py-2.5 px-3">Sport</th>
                          <th className="py-2.5 px-3">Total Achievements</th>
                          <th className="py-2.5 px-3">Records</th>
                          <th className="py-2.5 px-3">Awards</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-gray-300 print:divide-slate-200 print:text-slate-900">
                        {reportData.leaderboard?.map((l) => (
                          <tr key={l.athleteId}>
                            <td className="py-2.5 px-3 font-bold text-white print:text-slate-950">#{l.rank}</td>
                            <td className="py-2.5 px-3 font-semibold text-white print:text-slate-950">{l.athleteName}</td>
                            <td className="py-2.5 px-3">{l.sport}</td>
                            <td className="py-2.5 px-3 font-bold text-yellow-400 print:text-amber-700">{l.totalAchievements}</td>
                            <td className="py-2.5 px-3 text-red-400 font-medium print:text-red-700">{l.records}</td>
                            <td className="py-2.5 px-3 text-brand-peach font-medium print:text-orange-600">{l.awards}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. PERFORMANCE ANALYTICS REPORT CONTENT                                   */}
            {/* ========================================================================= */}
            {activeType === "ANALYTICS" && (
              <div className="space-y-6">
                {/* Summary Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-gray-400 uppercase font-bold print:text-slate-500">Total Athletes</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.summary?.totalAthletes}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-brand-peach uppercase font-bold print:text-orange-600">Average Performance</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.summary?.averagePerformance}%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold print:text-emerald-700">Training Completion</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.summary?.trainingCompletionRate}%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                    <span className="text-[10px] text-yellow-400 uppercase font-bold print:text-amber-700">Total Achievements</span>
                    <p className="text-2xl font-black text-white mt-1 print:text-slate-950">{reportData.summary?.totalAchievements}</p>
                  </div>
                </div>

                {/* Category Averages */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
                  {reportData.categoryAnalysis?.map((c) => (
                    <div key={c.category} className="p-4 rounded-2xl bg-white/5 border border-white/5 print:bg-slate-50 print:border print:border-slate-200 print:rounded-xl">
                      <span className="text-[10px] text-gray-400 uppercase font-bold print:text-slate-500">{c.category}</span>
                      <p className="text-xl font-bold text-white mt-1 print:text-slate-950">Avg: {c.avgScore}%</p>
                      <p className="text-xs text-brand-peach print:text-orange-600">Peak: {c.topScore}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 6. COMPARISON REPORT CONTENT                                              */}
            {/* ========================================================================= */}
            {activeType === "COMPARISON" && Array.isArray(reportData) && (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] print:border-b-2 print:border-slate-400 print:text-slate-700">
                        <th className="py-3 px-4">Evaluation Metric</th>
                        {reportData.map((a) => (
                          <th key={a.athleteId} className="py-3 px-4 font-bold text-white print:text-slate-950">
                            {a.athleteName} ({a.sport})
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300 print:divide-slate-200 print:text-slate-900">
                      <tr>
                        <td className="py-3 px-4 text-gray-400 font-semibold print:text-slate-600">Overall Performance Score</td>
                        {reportData.map((a) => (
                          <td key={a.athleteId} className="py-3 px-4 font-bold text-brand-peach text-sm print:text-orange-600">{a.overallScore}%</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-400 font-semibold print:text-slate-600">Speed</td>
                        {reportData.map((a) => (
                          <td key={a.athleteId} className="py-3 px-4">{a.speed}%</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-400 font-semibold print:text-slate-600">Strength</td>
                        {reportData.map((a) => (
                          <td key={a.athleteId} className="py-3 px-4">{a.strength}%</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-400 font-semibold print:text-slate-600">Endurance</td>
                        {reportData.map((a) => (
                          <td key={a.athleteId} className="py-3 px-4">{a.endurance}%</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-400 font-semibold print:text-slate-600">Agility</td>
                        {reportData.map((a) => (
                          <td key={a.athleteId} className="py-3 px-4">{a.agility}%</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-400 font-semibold print:text-slate-600">Training Completion Rate</td>
                        {reportData.map((a) => (
                          <td key={a.athleteId} className="py-3 px-4 text-emerald-400 font-bold print:text-emerald-700">{a.completionRate}%</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-400 font-semibold print:text-slate-600">Total Achievements</td>
                        {reportData.map((a) => (
                          <td key={a.athleteId} className="py-3 px-4 text-yellow-400 font-bold print:text-amber-700">{a.achievementCount}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Official Report Footer */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 print:text-slate-500 print:border-t-2 print:border-slate-300 print:pt-4">
              <span>AthleteX Performance Analytics Engine — Official Confidential Coaching Evaluation</span>
              <span className="mt-1 sm:mt-0 font-mono">Document Status: Verified Active Data</span>
            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
