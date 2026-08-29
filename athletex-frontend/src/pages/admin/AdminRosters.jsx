import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import {
  FaUserFriends,
  FaSearch,
  FaUserTie,
  FaUser,
  FaCalendarAlt,
  FaExclamationCircle
} from "react-icons/fa";

export default function AdminRosters() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/assignments");
      setAssignments(res.data || []);
    } catch (err) {
      setError(err.response?.data || "Failed to load roster assignments.");
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      a.coachName?.toLowerCase().includes(q) ||
      a.athleteName?.toLowerCase().includes(q) ||
      a.sport?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium animate-pulse">Loading Platform Roster Pairings...</p>
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
              <div className="w-1.5 h-8 bg-brand-peach rounded-full"></div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight">
                Platform Rosters
              </h1>
            </div>
            <p className="text-gray-400 text-base font-medium ml-5">
              System-wide active Coach ↔ Athlete assignments
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-gray-300 text-xs font-mono font-bold self-start sm:self-auto">
            <FaUserFriends className="text-brand-peach text-sm" />
            <span>{filteredAssignments.length} Active Pairings</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by coach or athlete name, sport..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111317] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-peach/50 transition-colors text-sm"
          />
        </div>

        {/* Grid of Roster Pairings */}
        {filteredAssignments.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center border border-white/5">
            <p className="text-gray-500 font-medium">No active roster pairings found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((a) => (
              <div
                key={a.assignmentId}
                className="glass-card rounded-3xl p-6 border border-white/5 shadow-2xl space-y-4 relative overflow-hidden group hover:border-brand-peach/30 transition-all"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-peach/5 blur-3xl rounded-full pointer-events-none group-hover:bg-brand-peach/10 transition-all" />

                {/* Coach info */}
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                    <FaUserTie />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Coach</span>
                    <p className="text-white font-bold text-base">{a.coachName}</p>
                  </div>
                </div>

                {/* Athlete info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
                    <FaUser />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Assigned Athlete</span>
                    <p className="text-white font-bold text-base">{a.athleteName}</p>
                    <p className="text-xs text-gray-500">{a.sport || "Athlete"}</p>
                  </div>
                </div>

                {/* Assignment Timestamp */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1.5 font-mono">
                    <FaCalendarAlt className="text-brand-peach text-xs" />
                    {a.assignedAt ? new Date(a.assignedAt).toLocaleDateString() : "Assigned"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ACTIVE
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
