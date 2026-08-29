import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  FaCheckCircle,
  FaShieldAlt,
  FaTrophy,
  FaUserCheck,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaRunning,
  FaDumbbell,
  FaHeartbeat,
  FaBolt
} from "react-icons/fa";

export default function PublicVerificationPage() {
  const { athleteId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (athleteId) {
      fetchVerificationData();
    }
  }, [athleteId]);

  const fetchVerificationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://localhost:8080/api/public/verify/${athleteId}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data || "Verification record not found or invalid QR code.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] text-white flex flex-col justify-center items-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium animate-pulse text-sm">Authenticating QR Verification Seal...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0c10] text-white flex flex-col justify-center items-center p-6">
        <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-red-500/20 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto text-2xl">
            <FaExclamationTriangle />
          </div>
          <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
          <p className="text-gray-400 text-sm">{error || "This athlete verification passport could not be located."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white py-12 px-4 sm:px-6 relative overflow-hidden font-sans">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">

        {/* Top Verification Header Badge */}
        <div className="glass-card bg-[#12151e]/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest mb-4">
            <FaCheckCircle className="text-emerald-400 text-sm" />
            <span>OFFICIAL ATHLETEX VERIFIED PASSPORT</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {data.fullName}
          </h1>
          <p className="text-gray-400 text-sm font-semibold mt-1">
            {data.sport || "Professional Athlete"} {data.position ? `• ${data.position}` : ""}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-gray-300">
            {data.city && <span className="px-3 py-1 bg-white/5 rounded-xl border border-white/10">📍 {data.city}, {data.state || data.country}</span>}
            {data.age && <span className="px-3 py-1 bg-white/5 rounded-xl border border-white/10">🎂 Age: {data.age}</span>}
            {data.height && <span className="px-3 py-1 bg-white/5 rounded-xl border border-white/10">📏 Height: {data.height} cm</span>}
            {data.weight && <span className="px-3 py-1 bg-white/5 rounded-xl border border-white/10">⚖️ Weight: {data.weight} kg</span>}
          </div>
        </div>

        {/* Verified Performance Rating Breakdown */}
        <div className="glass-card bg-[#12151e]/80 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaShieldAlt className="text-brand-peach" /> Verified Performance Ratings
            </h2>
            <div className="text-right">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Overall Score</span>
              <p className="text-2xl font-black text-brand-peach">{data.overallScore} / 100</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <FaRunning className="text-blue-400 mx-auto text-xl mb-1" />
              <span className="text-[10px] text-gray-400 uppercase font-bold">Speed</span>
              <p className="text-lg font-extrabold text-white mt-1">{data.speed}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <FaDumbbell className="text-amber-400 mx-auto text-xl mb-1" />
              <span className="text-[10px] text-gray-400 uppercase font-bold">Strength</span>
              <p className="text-lg font-extrabold text-white mt-1">{data.strength}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <FaHeartbeat className="text-red-400 mx-auto text-xl mb-1" />
              <span className="text-[10px] text-gray-400 uppercase font-bold">Endurance</span>
              <p className="text-lg font-extrabold text-white mt-1">{data.endurance}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <FaBolt className="text-purple-400 mx-auto text-xl mb-1" />
              <span className="text-[10px] text-gray-400 uppercase font-bold">Agility</span>
              <p className="text-lg font-extrabold text-white mt-1">{data.agility}</p>
            </div>
          </div>
        </div>

        {/* Coach Verified Achievements List */}
        <div className="glass-card bg-[#12151e]/80 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaTrophy className="text-amber-400" /> Endorsed Achievements
              </h2>
              <p className="text-xs text-gray-400 mt-1">Officially verified by assigned certified coaches</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
              {data.totalVerifiedAchievements} Verified
            </span>
          </div>

          {data.verifiedAchievements.length === 0 ? (
            <div className="py-8 text-center text-gray-500 font-medium text-sm">
              No coach-verified achievements registered yet.
            </div>
          ) : (
            <div className="space-y-4">
              {data.verifiedAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 text-sm">✔</span>
                        <h3 className="font-bold text-white text-base">{ach.title}</h3>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{ach.description}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                      {ach.category || "General"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <FaUserCheck className="text-emerald-400 text-xs" />
                      Verified by <strong className="text-gray-300">{ach.verifiedByCoachName || "Certified Coach"}</strong>
                    </span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <FaCalendarAlt className="text-brand-peach text-xs" />
                      {ach.verifiedAt ? new Date(ach.verifiedAt).toLocaleDateString() : (ach.date || "Verified")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Seal */}
        <div className="text-center pt-4 pb-8 text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-400">AthleteX Performance Governance Engine • Cryptographic Verification Token</p>
          <p className="font-mono text-[10px]">ID: {data.athleteId}</p>
        </div>

      </div>
    </div>
  );
}
