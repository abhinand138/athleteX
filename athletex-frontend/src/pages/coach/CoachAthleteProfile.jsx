import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api, { getMediaUrl } from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaArrowLeft,
  FaFutbol,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaRuler,
  FaWeight,
  FaRunning,
  FaDumbbell,
  FaHeartbeat,
  FaBolt,
  FaTrophy,
  FaCalendarAlt,
  FaChartLine,
  FaMedal,
  FaFileAlt,
  FaClipboardCheck,
  FaBullseye,
  FaCommentDots,
  FaCheckCircle,
  FaVideo,
  FaExternalLinkAlt,
  FaTimes,
  FaExclamationTriangle,
  FaShieldAlt
} from "react-icons/fa";
import toast from "react-hot-toast";
import PerformanceChart from "../../components/performance/PerformanceChart";
import CoachEvaluationModal from "../../components/coach/CoachEvaluationModal";

export default function CoachAthleteProfile() {
  const { athleteId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const navigate = useNavigate();

  // Combine Drills & Proof Certification State
  const [drills, setDrills] = useState([]);
  const [drillsLoading, setDrillsLoading] = useState(false);
  const [drillsFilter, setDrillsFilter] = useState("ALL"); // ALL, PENDING, APPROVED, REJECTED
  const [reviewModalDrill, setReviewModalDrill] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("APPROVED");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const coachId = storedUser?.id;

  useEffect(() => {
    if (!coachId || storedUser.role !== "COACH") {
      setError("Access denied. Coach authentication required.");
      setLoading(false);
      return;
    }
    fetchAthleteDetails();
    fetchAthleteDrills();
  }, [athleteId]);

  const fetchAthleteDrills = async () => {
    try {
      setDrillsLoading(true);
      const res = await api.get(`/performance/coach/${coachId}/athlete/${athleteId}/drills`);
      setDrills(res.data || []);
    } catch (err) {
      console.warn("Could not load drills via coach endpoint, trying combine endpoint:", err);
      try {
        const fallbackRes = await api.get(`/performance/${athleteId}/combine`);
        setDrills(fallbackRes.data?.recentAttempts || []);
      } catch (e) {
        console.error("Failed to load drills:", e);
      }
    } finally {
      setDrillsLoading(false);
    }
  };

  const handleQuickApprove = async (drill) => {
    try {
      await api.put(`/performance/drills/${drill.id}/review?coachId=${coachId}`, {
        status: "APPROVED",
        feedback: "Official certified combine performance."
      });
      toast.success(`Certified ${drill.drillName} attempt! ✔`);
      fetchAthleteDrills();
      fetchAthleteDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to certify drill.");
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModalDrill) return;
    try {
      setReviewSubmitting(true);
      await api.put(`/performance/drills/${reviewModalDrill.id}/review?coachId=${coachId}`, {
        status: reviewStatus,
        feedback: reviewFeedback
      });
      toast.success(
        reviewStatus === "APPROVED"
          ? "Combine drill certified with your official seal! ✔"
          : "Re-test request sent to athlete with coaching feedback."
      );
      setReviewModalDrill(null);
      setReviewFeedback("");
      fetchAthleteDrills();
      fetchAthleteDetails();
    } catch (err) {
      console.error("Failed to review drill:", err);
      toast.error(err.response?.data?.message || err.response?.data || "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const fetchAthleteDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/coach/athletes/${coachId}/${athleteId}`);
      setData(response.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Access Denied: This athlete is not assigned to your coaching roster.");
      } else if (err.response?.status === 404) {
        setError("Athlete not found.");
      } else {
        setError(err.response?.data || "Failed to load athlete details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium animate-pulse">Loading athlete monitoring data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
          <div className="glass-card rounded-3xl p-8 border border-red-500/20 text-center max-w-lg w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500 rounded-t-3xl"></div>
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 text-2xl">
              <FaUser />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Monitoring Access Error</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">{error || "An unknown error occurred."}</p>
            <button
              onClick={() => navigate("/coach/athletes")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-semibold rounded-xl transition-all cursor-pointer"
            >
              <FaArrowLeft />
              Back to My Athletes
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const evalData = data.coachEvaluation;

  const metrics = [
    {
      title: "Speed",
      value: data.speed ?? 0,
      target: evalData?.targetSpeed ?? null,
      icon: <FaRunning />,
      color: "text-blue-400",
      bar: "bg-blue-400"
    },
    {
      title: "Strength",
      value: data.strength ?? 0,
      target: evalData?.targetStrength ?? null,
      icon: <FaDumbbell />,
      color: "text-brand-peach",
      bar: "bg-brand-peach"
    },
    {
      title: "Endurance",
      value: data.endurance ?? 0,
      target: evalData?.targetEndurance ?? null,
      icon: <FaHeartbeat />,
      color: "text-rose-400",
      bar: "bg-rose-400"
    },
    {
      title: "Agility",
      value: data.agility ?? 0,
      target: evalData?.targetAgility ?? null,
      icon: <FaBolt />,
      color: "text-yellow-400",
      bar: "bg-yellow-400"
    }
  ];

  const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3.5 py-3 border-b border-white/5 last:border-0">
      <div className="p-2.5 rounded-xl bg-white/5 text-brand-peach shrink-0">
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1 flex justify-between items-center gap-2">
        <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{label}</span>
        <span className="text-gray-200 text-sm font-medium truncate">{value || "Not provided"}</span>
      </div>
    </div>
  );

  const getReadinessBadge = (status) => {
    switch (status) {
      case "READY":
        return <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">Ready / Optimal</span>;
      case "NEEDS_IMPROVEMENT":
        return <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider">Needs Improvement</span>;
      case "FATIGUED":
        return <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-full text-xs font-bold uppercase tracking-wider">Fatigued / Rest Needed</span>;
      case "INJURY_RISK":
        return <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full text-xs font-bold uppercase tracking-wider">Injury Risk Warning</span>;
      default:
        return <span className="px-3 py-1 bg-gray-500/10 border border-gray-500/30 text-gray-400 rounded-full text-xs font-bold uppercase tracking-wider">Pending Evaluation</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-16 relative z-10">

        {/* Top Navigation / Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate("/coach/athletes")}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-semibold transition-all cursor-pointer group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back to Athletes
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={async () => {
                try {
                  await api.put(`/performance/${athleteId}/verify?coachId=${coachId}`);
                  toast.success("Officially endorsed athlete performance ratings! ✔");
                  fetchAthleteDetails();
                } catch (err) {
                  toast.error(err.response?.data || "Failed to endorse ratings.");
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <FaCheckCircle className="text-sm text-emerald-400" />
              Endorse Ratings as Official
            </button>
            <button
              onClick={() => setIsEvalModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-peach text-black font-bold text-xs uppercase tracking-wider hover:bg-brand-peach/90 transition-all cursor-pointer shadow-lg shadow-brand-peach/20"
            >
              <FaClipboardCheck className="text-sm" />
              Evaluate Performance
            </button>
            <button
              onClick={() => navigate(`/coach/reports?athleteId=${athleteId}`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-peach/10 hover:bg-brand-peach/20 border border-brand-peach/30 text-brand-peach text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <FaFileAlt className="text-xs" />
              Generate Athlete Report
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ATHLETE HEADER CARD                                                       */}
        {/* ========================================================================= */}
        <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-peach/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-xl">
              {data.profileImage ? (
                <img src={data.profileImage} alt={data.fullName} className="w-full h-full object-cover" />
              ) : (
                <FaUser className="text-gray-500 text-4xl" />
              )}
            </div>

            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {data.fullName}
                </h1>
                {data.sport && (
                  <span className="px-3.5 py-1 bg-brand-peach/10 border border-brand-peach/20 text-brand-peach rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <FaFutbol className="text-xs" />
                    {data.sport} {data.position ? `· ${data.position}` : ""}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-400 pt-1">
                {data.email && (
                  <span className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-600" />
                    {data.email}
                  </span>
                )}
                {data.phone && (
                  <span className="flex items-center gap-2">
                    <FaPhone className="text-gray-600" />
                    {data.phone}
                  </span>
                )}
                {(data.city || data.state || data.country) && (
                  <span className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-600" />
                    {[data.city, data.state, data.country].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COACH EVALUATION & READINESS ASSESSMENT CARD                              */}
        {/* ========================================================================= */}
        <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-peach/10 text-brand-peach rounded-xl border border-brand-peach/20">
                  <FaClipboardCheck className="text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Coach Performance Evaluation</h2>
                  <p className="text-xs text-gray-400">Assessed by Coach {evalData?.coachName || storedUser.fullName || "Coach"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getReadinessBadge(evalData?.readinessStatus)}
              <button
                onClick={() => setIsEvalModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold border border-white/10 transition-all cursor-pointer"
              >
                {evalData ? "Update Evaluation" : "Set Evaluation"}
              </button>
            </div>
          </div>

          {evalData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-white/5">
              {/* Feedback Note */}
              <div className="md:col-span-2 space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <FaCommentDots className="text-brand-peach" /> Coach Feedback & Areas of Focus
                </p>
                <p className="text-sm text-gray-300 bg-white/[0.03] p-4 rounded-2xl border border-white/5 italic leading-relaxed">
                  "{evalData.coachFeedback || "No custom evaluation notes entered yet."}"
                </p>
              </div>

              {/* Target Targets Summary */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <FaBullseye className="text-cyan-400" /> Target Benchmarks
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex justify-between">
                    <span className="text-gray-400">Speed Target:</span>
                    <span className="font-bold text-blue-400">{evalData.targetSpeed ?? "—"}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex justify-between">
                    <span className="text-gray-400">Strength:</span>
                    <span className="font-bold text-brand-peach">{evalData.targetStrength ?? "—"}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex justify-between">
                    <span className="text-gray-400">Endurance:</span>
                    <span className="font-bold text-rose-400">{evalData.targetEndurance ?? "—"}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex justify-between">
                    <span className="text-gray-400">Agility:</span>
                    <span className="font-bold text-yellow-400">{evalData.targetAgility ?? "—"}%</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border-t border-white/5 text-gray-500 text-xs">
              No coach evaluation logged yet for this athlete. Click <strong>Evaluate Performance</strong> above to set readiness status and performance targets.
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* PERSONAL, PHYSICAL & BIO SECTION                                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal & Physical Info */}
          <div className="glass-card rounded-3xl p-7 border border-white/5 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1.5 h-6 bg-brand-peach rounded-full"></div>
                <h2 className="text-lg font-bold text-white tracking-wide">Personal Details</h2>
              </div>
              <div className="space-y-1">
                <DetailItem icon={FaUser} label="Age" value={data.age ? `${data.age} years` : null} />
                <DetailItem icon={FaUser} label="Gender" value={data.gender} />
                <DetailItem icon={FaRuler} label="Height" value={data.height ? `${data.height} cm` : null} />
                <DetailItem icon={FaWeight} label="Weight" value={data.weight ? `${data.weight} kg` : null} />
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="glass-card rounded-3xl p-7 border border-white/5 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1.5 h-6 bg-blue-400 rounded-full"></div>
                <h2 className="text-lg font-bold text-white tracking-wide">Location & Contact</h2>
              </div>
              <div className="space-y-1">
                <DetailItem icon={FaEnvelope} label="Email" value={data.email} />
                <DetailItem icon={FaPhone} label="Phone" value={data.phone} />
                <DetailItem icon={FaMapMarkerAlt} label="City" value={data.city} />
                <DetailItem icon={FaMapMarkerAlt} label="State / Country" value={[data.state, data.country].filter(Boolean).join(", ")} />
              </div>
            </div>
          </div>

          {/* Athlete Bio */}
          <div className="glass-card rounded-3xl p-7 border border-white/5 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-6 bg-emerald-400 rounded-full"></div>
              <h2 className="text-lg font-bold text-white tracking-wide">Athlete Bio</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {data.bio || "No athlete biography provided yet."}
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PERFORMANCE METRICS SECTION                                               */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-7 bg-brand-peach rounded-full"></div>
              <h2 className="text-2xl font-bold text-white tracking-wide">Performance Overview</h2>
            </div>
            {evalData && (
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <FaBullseye className="text-brand-peach" /> Target indicators shown on bars
              </span>
            )}
          </div>

          {/* Overall Performance Card */}
          <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-brand-peach/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Calculated Overall Score
                </p>
                <h3 className="text-5xl sm:text-6xl font-black text-white mt-2">
                  {data.overallScore ?? 0}
                  <span className="text-2xl text-brand-peach font-bold">%</span>
                </h3>
                <p className="text-gray-500 text-sm mt-1">Based on speed, strength, endurance & agility ratings</p>
              </div>

              <div className="w-32 h-32 rounded-full border-8 border-white/5 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 rounded-full border-8 border-brand-peach transition-all duration-1000"
                  style={{ opacity: Number(data.overallScore) > 0 ? 1 : 0.2 }}
                />
                <span className="text-2xl font-black text-white">{data.overallScore ?? 0}%</span>
              </div>
            </div>
          </div>

          {/* 4 Metric Breakdown Cards with Coach Target Benchmarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((m) => (
              <div key={m.title} className="glass-card rounded-2xl p-6 border border-white/5 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{m.title}</p>
                    <p className={`text-3xl font-black mt-1 ${m.color}`}>{m.value}%</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-white/5 text-xl ${m.color}`}>
                    {m.icon}
                  </div>
                </div>

                {/* Target overlay indicator */}
                {m.target != null && (
                  <div className="flex items-center justify-between text-[11px] font-medium text-gray-400 mb-2">
                    <span>Target:</span>
                    <span className="font-bold text-white">{m.target}%</span>
                  </div>
                )}

                <div className="h-2 bg-white/5 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full ${m.bar} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min(Math.max(m.value, 0), 100)}%` }}
                  />
                  {m.target != null && (
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white border-l border-black shadow"
                      style={{ left: `${Math.min(Math.max(m.target, 0), 100)}%` }}
                      title={`Coach Target: ${m.target}%`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PERFORMANCE PROGRESSION (READ-ONLY CHART)                                  */}
        {/* ========================================================================= */}
        <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                <FaChartLine />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Performance Progression</h3>
                <p className="text-xs text-gray-400 mt-0.5">Historical overall performance snapshots</p>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <PerformanceChart historyData={data.performanceHistory || []} />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COMBINE DRILLS & PROOF CERTIFICATION GATE                                  */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-7 bg-brand-peach rounded-full"></div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                  <FaShieldAlt className="text-brand-peach" />
                  <span>Combine Drill Submissions & Certification</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Proof-backed combine PR tests audited and certified for external scouting
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: "ALL", label: `All (${drills.length})` },
                {
                  id: "PENDING",
                  label: `🟡 Pending (${drills.filter(d => !d.isCoachVerified && d.verificationStatus === "PENDING").length})`
                },
                {
                  id: "APPROVED",
                  label: `🟢 Certified (${drills.filter(d => d.isCoachVerified || d.verificationStatus === "APPROVED").length})`
                },
                {
                  id: "REJECTED",
                  label: `🔴 Re-test (${drills.filter(d => d.verificationStatus === "REJECTED").length})`
                }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setDrillsFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    drillsFilter === f.id
                      ? "bg-brand-peach text-black shadow-md shadow-brand-peach/20"
                      : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {drillsLoading ? (
            <div className="glass-card rounded-3xl p-8 text-center border border-white/5">
              <div className="w-8 h-8 border-2 border-brand-peach border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-400">Loading combine submissions...</p>
            </div>
          ) : drills.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 border border-white/5 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-2xl text-gray-600">
                <FaTrophy />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">No Combine Drills Logged</h3>
              <p className="text-gray-500 text-sm">This athlete has not submitted any 40-yd dash, vertical jump, or 1RM test results yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drills
                .filter(d => {
                  if (drillsFilter === "PENDING") return !d.isCoachVerified && d.verificationStatus === "PENDING";
                  if (drillsFilter === "APPROVED") return d.isCoachVerified || d.verificationStatus === "APPROVED";
                  if (drillsFilter === "REJECTED") return d.verificationStatus === "REJECTED";
                  return true;
                })
                .map(drill => (
                  <div
                    key={drill.id}
                    className="glass-card rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between hover:border-brand-peach/20 transition-all"
                  >
                    <div>
                      {/* Card Top Row */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 text-gray-300 border border-white/10">
                          {drill.category || "COMBINE"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {drill.tierBadge || "Varsity"} ({drill.percentile || 75}th%)
                        </span>
                      </div>

                      {/* Drill Title & Value */}
                      <h4 className="text-lg font-black text-white leading-tight">
                        {drill.drillName}
                      </h4>

                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white font-mono">
                          {drill.value}
                        </span>
                        <span className="text-base font-bold text-brand-peach">
                          {drill.unit}
                        </span>
                        {drill.isPersonalRecord && (
                          <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase">
                            <FaTrophy className="text-[9px]" />
                            <span>PR</span>
                          </span>
                        )}
                      </div>

                      {/* Athlete Notes */}
                      {drill.notes && (
                        <p className="text-xs text-gray-400 mt-2 bg-black/20 p-2.5 rounded-xl border border-white/5 italic">
                          "{drill.notes}"
                        </p>
                      )}

                      {/* Proof URL Button */}
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                        {drill.proofUrl ? (
                          <a
                            href={getMediaUrl(drill.proofUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-peach/10 hover:bg-brand-peach hover:text-black text-brand-peach font-bold border border-brand-peach/30 transition-all text-xs"
                            title="Open video proof link"
                          >
                            <FaVideo className="text-xs" />
                            <span>Watch Video Proof</span>
                            <FaExternalLinkAlt className="text-[10px]" />
                          </a>
                        ) : (
                          <span className="text-gray-500 italic text-xs">No video link attached</span>
                        )}

                        <span className="text-gray-500 font-mono text-[11px]">
                          {drill.recordedAt ? new Date(drill.recordedAt).toLocaleDateString() : ""}
                        </span>
                      </div>

                      {/* Verification Status Banner */}
                      <div className="mt-4">
                        {drill.isCoachVerified || drill.verificationStatus === "APPROVED" ? (
                          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                            <div className="flex items-center gap-1.5 font-bold">
                              <FaCheckCircle />
                              <span>Certified by Coach {drill.verifiedByCoachName || "You"}</span>
                            </div>
                            {drill.verifiedAt && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Certified on {new Date(drill.verifiedAt).toLocaleDateString()}
                              </p>
                            )}
                            {drill.coachFeedback && (
                              <p className="text-[11px] text-emerald-300/80 mt-1 italic">
                                Note: "{drill.coachFeedback}"
                              </p>
                            )}
                          </div>
                        ) : drill.verificationStatus === "REJECTED" ? (
                          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                            <div className="flex items-center gap-1.5 font-bold">
                              <FaExclamationTriangle />
                              <span>Re-test Requested</span>
                            </div>
                            {drill.coachFeedback && (
                              <p className="text-[11px] text-rose-300 mt-1 italic">
                                Feedback: "{drill.coachFeedback}"
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-bold">
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                              <span>Pending Your Audit</span>
                            </span>
                            <span className="text-[10px] text-amber-400/80 font-mono">Gate Quarantined</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-5 pt-3 border-t border-white/5">
                      <button
                        onClick={() => handleQuickApprove(drill)}
                        className="py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 text-emerald-400 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Certify this record for the Talent Passport"
                      >
                        <FaCheckCircle className="text-xs" />
                        <span>{drill.verificationStatus === "APPROVED" ? "Re-Certify" : "Certify"}</span>
                      </button>

                      <button
                        onClick={() => {
                          setReviewModalDrill(drill);
                          setReviewStatus("REJECTED");
                          setReviewFeedback(drill.coachFeedback || "");
                        }}
                        className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Request athlete re-test with feedback"
                      >
                        <FaTimes className="text-xs" />
                        <span>Re-test Note</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* ACHIEVEMENTS SECTION                                                      */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 bg-yellow-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Athlete Achievements</h2>
          </div>

          {!data.achievements || data.achievements.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 border border-white/5 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-2xl text-gray-600">
                <FaTrophy />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">No Achievements Recorded Yet</h3>
              <p className="text-gray-500 text-sm">This athlete has not logged any certificates or trophies.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="glass-card rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-yellow-400/20 transition-all flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-3xl rounded-full pointer-events-none group-hover:bg-yellow-400/10 transition-all" />

                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-yellow-400/10 text-yellow-400 rounded-2xl border border-yellow-400/20 text-xl">
                        {ach.icon ? (
                          <span className="text-xl">{ach.icon}</span>
                        ) : (
                          <FaMedal />
                        )}
                      </div>
                      {ach.level && (
                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-full text-xs font-semibold uppercase tracking-wider">
                          {ach.level}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-white font-bold text-lg leading-snug">{ach.title}</h4>
                      {ach.category && (
                        <p className="text-yellow-400/80 text-xs font-semibold uppercase tracking-wider mt-0.5">
                          {ach.category}
                        </p>
                      )}
                    </div>

                    {ach.description && (
                      <p className="text-gray-400 text-sm leading-relaxed">{ach.description}</p>
                    )}
                  </div>

                  {ach.date && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-gray-500 relative z-10">
                      <FaCalendarAlt />
                      <span>{new Date(ach.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Coach Evaluation Modal */}
      <CoachEvaluationModal
        isOpen={isEvalModalOpen}
        onClose={() => setIsEvalModalOpen(false)}
        athleteId={athleteId}
        athleteName={data?.fullName}
        initialEvaluation={data?.coachEvaluation}
        onSaved={fetchAthleteDetails}
      />

      {/* Combine Review & Rejection Modal */}
      {reviewModalDrill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card max-w-lg w-full rounded-3xl p-7 border border-white/10 shadow-2xl relative overflow-hidden space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-brand-peach text-lg" />
                <h3 className="text-lg font-bold text-white">Review Combine Attempt</h3>
              </div>
              <button
                onClick={() => setReviewModalDrill(null)}
                className="text-gray-400 hover:text-white p-2"
              >
                <FaTimes />
              </button>
            </div>

            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Attempt Detail</p>
              <h4 className="text-xl font-black text-white">{reviewModalDrill.drillName}</h4>
              <p className="text-2xl font-black text-brand-peach font-mono">
                {reviewModalDrill.value} {reviewModalDrill.unit}
              </p>
              {reviewModalDrill.proofUrl && (
                <a
                  href={getMediaUrl(reviewModalDrill.proofUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-brand-peach hover:underline font-bold mt-1"
                >
                  <FaVideo />
                  <span>Review Proof Link</span>
                  <FaExternalLinkAlt className="text-[10px]" />
                </a>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Certification Decision
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewStatus("APPROVED")}
                  className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    reviewStatus === "APPROVED"
                      ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                      : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  <FaCheckCircle />
                  <span>Approve & Certify</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReviewStatus("REJECTED")}
                  className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    reviewStatus === "REJECTED"
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                      : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  <FaTimes />
                  <span>Request Re-test</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Coaching Feedback / Audit Note
              </label>
              <textarea
                rows="3"
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                placeholder={
                  reviewStatus === "APPROVED"
                    ? "Optional certification note (e.g., 'Clean footwork and certified laser timing.')"
                    : "Explain why re-test is required (e.g., 'Foot crossed the cone before timer stopped; re-record with timing gate visible.')"
                }
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-brand-peach/50 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setReviewModalDrill(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={reviewSubmitting}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  reviewStatus === "APPROVED"
                    ? "bg-emerald-500 text-black hover:bg-emerald-400"
                    : "bg-rose-500 text-white hover:bg-rose-400"
                }`}
              >
                {reviewSubmitting ? "Submitting..." : reviewStatus === "APPROVED" ? "Certify Attempt ✔" : "Send Re-test Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
