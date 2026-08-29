import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaUserTie, FaEnvelope, FaPhone, FaMapMarkerAlt, FaDumbbell, FaCheckCircle, FaUserCheck } from "react-icons/fa";
import api from "../../services/api";

export default function MyCoachCard({ athleteId }) {
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (athleteId) {
      fetchCoachDetails();
    }
  }, [athleteId]);

  const fetchCoachDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/coach/assignments/athlete/${athleteId}/coach-details`);
      setCoach(res.data);
    } catch (err) {
      // Not assigned or error
      setCoach(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-white/5 animate-pulse flex items-center justify-center min-h-[160px]">
        <div className="w-8 h-8 border-2 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 text-xl">
            <FaUserTie />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No Coach Assigned</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Your profile is visible in the Athlete roster. Coaches can assign you to their training programs.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden group shadow-xl">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-brand-peach/15 to-orange-500/10 blur-[40px] rounded-full pointer-events-none group-hover:from-brand-peach/25 transition-all duration-700" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-peach/20 to-orange-500/20 border border-brand-peach/30 flex items-center justify-center text-brand-peach font-extrabold text-xl shadow-lg">
              {coach.profileImage ? (
                <img src={coach.profileImage} alt={coach.fullName} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                coach.fullName?.charAt(0) || "C"
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0e1014] flex items-center justify-center text-[9px] text-black font-bold">
              <FaCheckCircle />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">{coach.fullName}</h3>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md bg-brand-peach/10 text-brand-peach border border-brand-peach/20 flex items-center gap-1">
                <FaUserCheck className="text-[9px]" /> Assigned Coach
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex flex-wrap items-center gap-3">
              {coach.sport && <span>Sport: <strong className="text-gray-200">{coach.sport}</strong></span>}
              {coach.city && (
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-brand-peach text-[10px]" /> {coach.city}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Contact Links */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0">
          {coach.email && (
            <a
              href={`mailto:${coach.email}`}
              title="Email Coach"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-brand-peach/20 border border-white/10 hover:border-brand-peach/30 text-gray-300 hover:text-brand-peach text-sm transition-all"
            >
              <FaEnvelope />
            </a>
          )}
          {coach.phone && (
            <a
              href={`tel:${coach.phone}`}
              title="Call Coach"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/30 text-gray-300 hover:text-emerald-400 text-sm transition-all"
            >
              <FaPhone />
            </a>
          )}
          <Link
            to="/training"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-peach to-orange-500 text-black text-xs font-bold hover:opacity-95 transition-all shadow-md shadow-brand-peach/20 flex items-center gap-1.5"
          >
            <FaDumbbell /> View Training
          </Link>
        </div>
      </div>
    </div>
  );
}
