import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
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
  FaMedal
} from "react-icons/fa";
import PerformanceChart from "../../components/performance/PerformanceChart";

export default function CoachAthleteProfile() {
  const { athleteId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const coachId = storedUser?.id;

  useEffect(() => {
    if (!coachId || storedUser.role !== "COACH") {
      setError("Access denied. Coach authentication required.");
      setLoading(false);
      return;
    }
    fetchAthleteDetails();
  }, [athleteId]);

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

  const metrics = [
    {
      title: "Speed",
      value: data.speed ?? 0,
      icon: <FaRunning />,
      color: "text-blue-400",
      bar: "bg-blue-400"
    },
    {
      title: "Strength",
      value: data.strength ?? 0,
      icon: <FaDumbbell />,
      color: "text-brand-peach",
      bar: "bg-brand-peach"
    },
    {
      title: "Endurance",
      value: data.endurance ?? 0,
      icon: <FaHeartbeat />,
      color: "text-red-400",
      bar: "bg-red-400"
    },
    {
      title: "Agility",
      value: data.agility ?? 0,
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/coach/reports?athleteId=${athleteId}`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-peach/10 hover:bg-brand-peach/20 border border-brand-peach/30 text-brand-peach text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <FaFileAlt className="text-xs" />
              Generate Athlete Report
            </button>
            <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3.5 py-2 rounded-xl border border-white/5 hidden sm:inline-block">
              Coach Monitoring Mode (Read-Only)
            </span>
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
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 bg-brand-peach rounded-full"></div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Performance Overview</h2>
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

          {/* 4 Metric Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((m) => (
              <div key={m.title} className="glass-card rounded-2xl p-6 border border-white/5 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{m.title}</p>
                    <p className={`text-3xl font-black mt-1 ${m.color}`}>{m.value}%</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-white/5 text-xl ${m.color}`}>
                    {m.icon}
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${m.bar} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min(Math.max(m.value, 0), 100)}%` }}
                  />
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
    </DashboardLayout>
  );
}
