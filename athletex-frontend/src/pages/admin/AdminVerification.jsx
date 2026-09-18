import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { getErrorMessage } from "../../utils/errorHandler";
import {
  FaUserTie,
  FaCheck,
  FaTimes,
  FaShieldAlt,
  FaAward,
  FaBriefcase,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaExclamationCircle,
  FaUserCheck,
  FaUserClock
} from "react-icons/fa";

export default function AdminVerification() {
  const [pendingCoaches, setPendingCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingCoaches();
  }, []);

  const fetchPendingCoaches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/coaches/pending");
      setPendingCoaches(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load pending coach applications."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCoach = async (coachId, coachName, status) => {
    setProcessingId(coachId);
    try {
      await api.put(`/admin/coaches/${coachId}/verify`, { status });
      if (status === "APPROVED") {
        toast.success(`Approved ${coachName}'s Coach Credentials! 🏅`);
      } else {
        toast.error(`Rejected ${coachName}'s Coach Application.`);
      }
      fetchPendingCoaches();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update coach status."));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium animate-pulse">Loading Pending Coach Credentials...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-16 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-8 bg-amber-400 rounded-full"></div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight">
                Coach Verification Queue
              </h1>
            </div>
            <p className="text-gray-400 text-base font-medium ml-5">
              Review credential submissions and grant official certified Coach status
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold self-start sm:self-auto">
            <FaUserClock className="text-amber-400 text-sm animate-pulse" />
            <span>{pendingCoaches.length} Applications Pending</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Applications List */}
        {pendingCoaches.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 text-center border border-white/5 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl mx-auto">
              <FaUserCheck />
            </div>
            <h3 className="text-xl font-bold text-white">All Applications Reviewed!</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              There are no pending coach verification requests in the queue right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingCoaches.map((c) => (
              <div
                key={c.id}
                className="glass-card rounded-3xl p-7 border border-amber-500/20 shadow-2xl space-y-5 relative overflow-hidden group hover:border-amber-500/40 transition-all"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

                {/* Top Coach Info Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-2xl font-bold overflow-hidden shrink-0">
                      {c.profileImage ? (
                        <img src={c.profileImage} alt={c.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <FaUserTie />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-white group-hover:text-amber-400 transition-colors">
                        {c.fullName}
                      </h2>
                      <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mt-0.5">
                        {c.title || c.sport || "Coach Applicant"}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    PENDING REVIEW
                  </span>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-500" />
                    <span className="truncate font-mono">{c.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-500" />
                    <span className="font-mono">{c.phone || "N/A"}</span>
                  </div>
                </div>

                {/* Credentials & Details Box */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-1">
                      <FaBriefcase className="text-brand-peach" /> Specialization
                    </span>
                    <p className="text-white font-medium">{c.specialization || "General Coaching & Athletics"}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-1">
                      <FaAward className="text-emerald-400" /> Certifications & Licenses
                    </span>
                    <p className="text-white font-medium">{c.certifications || "Credentials Pending Verification"}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-gray-400">
                    <span>Experience Level: <strong className="text-white">{c.experienceYears || 1} Years</strong></span>
                    <span>City: <strong className="text-white">{c.city || "N/A"}</strong></span>
                  </div>
                </div>

                {/* Verification Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    disabled={processingId === c.id}
                    onClick={() => handleVerifyCoach(c.id, c.fullName, "REJECTED")}
                    className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FaTimes /> Reject
                  </button>

                  <button
                    disabled={processingId === c.id}
                    onClick={() => handleVerifyCoach(c.id, c.fullName, "APPROVED")}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-extrabold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <FaCheck /> Approve Credentials
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
