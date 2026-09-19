import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { getErrorMessage } from "../../utils/errorHandler";
import {
  FaUserFriends,
  FaSearch,
  FaUserTie,
  FaUser,
  FaCalendarAlt,
  FaExclamationCircle,
  FaPlus,
  FaTimes,
  FaTrash,
  FaCheckCircle,
  FaExchangeAlt,
  FaDownload
} from "react-icons/fa";

export default function AdminRosters() {
  const [assignments, setAssignments] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [athletes, setAthletes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Create Assignment Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [selectedAthleteId, setSelectedAthleteId] = useState("");
  const [creating, setCreating] = useState(false);

  // Terminate Assignment State
  const [terminatingAssignment, setTerminatingAssignment] = useState(null);
  const [terminating, setTerminating] = useState(false);

  useEffect(() => {
    fetchRostersAndUsers();
  }, []);

  const handleExportCsv = async () => {
    try {
      const response = await api.get("/admin/export/rosters", { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", "athletex_rosters_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Roster pairings exported successfully! 📥");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to export roster pairings."));
    }
  };

  const fetchRostersAndUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rostersRes, coachesRes, athletesRes] = await Promise.all([
        api.get("/admin/rosters"),
        api.get("/admin/users?role=COACH"),
        api.get("/admin/users?role=ATHLETE")
      ]);

      setAssignments(rostersRes.data || []);
      setCoaches(coachesRes.data || []);
      setAthletes(athletesRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load platform roster assignments."));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCoachId || !selectedAthleteId) {
      toast.error("Please select both a Coach and an Athlete.");
      return;
    }

    setCreating(true);
    try {
      await api.post("/admin/assignments", {
        coachId: selectedCoachId,
        athleteId: selectedAthleteId
      });

      toast.success("Roster assignment created successfully! 🤝");
      setShowCreateModal(false);
      setSelectedCoachId("");
      setSelectedAthleteId("");
      fetchRostersAndUsers();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create roster assignment."));
    } finally {
      setCreating(false);
    }
  };

  const handleTerminateAssignment = async () => {
    if (!terminatingAssignment) return;

    setTerminating(true);
    try {
      await api.delete(`/admin/assignments/${terminatingAssignment.assignmentId}`);
      toast.success("Roster pairing terminated successfully! ✂️");
      setTerminatingAssignment(null);
      fetchRostersAndUsers();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to terminate assignment."));
    } finally {
      setTerminating(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      a.coachName?.toLowerCase().includes(q) ||
      a.athleteName?.toLowerCase().includes(q) ||
      a.sport?.toLowerCase().includes(q) ||
      a.athleteEmail?.toLowerCase().includes(q) ||
      a.coachEmail?.toLowerCase().includes(q)
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
              Governance panel for active Coach ↔ Athlete assignments and manual roster pairings
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-peach/10 border border-brand-peach/20 text-brand-peach hover:bg-brand-peach hover:text-black font-bold text-xs transition-all cursor-pointer shadow-sm"
              title="Export Roster Pairings as CSV"
            >
              <FaDownload />
              <span>Export CSV</span>
            </button>

            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-300 text-xs font-mono font-bold">
              <FaUserFriends className="text-brand-peach text-sm" />
              <span>{filteredAssignments.length} Active Pairings</span>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-peach text-black font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(238,155,116,0.3)] cursor-pointer"
            >
              <FaPlus />
              <span>New Pairing</span>
            </button>
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
            placeholder="Search by coach or athlete name, email, sport..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111317] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-peach/50 transition-colors text-sm"
          />
        </div>

        {/* Grid of Roster Pairings */}
        {filteredAssignments.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center border border-white/5 space-y-4">
            <p className="text-gray-500 font-medium">No active roster pairings found.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-brand-peach hover:bg-white/10 font-bold text-xs transition-all cursor-pointer"
            >
              <FaPlus /> Create First Roster Pairing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((a) => (
              <div
                key={a.assignmentId}
                className="glass-card rounded-3xl p-6 border border-white/5 shadow-2xl space-y-4 relative overflow-hidden group hover:border-brand-peach/30 transition-all flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-peach/5 blur-3xl rounded-full pointer-events-none group-hover:bg-brand-peach/10 transition-all" />

                <div className="space-y-4">
                  {/* Coach info */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                        <FaUserTie />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Coach</span>
                        <p className="text-white font-bold text-sm">{a.coachName}</p>
                        {a.coachEmail && <p className="text-[11px] text-gray-500 font-mono">{a.coachEmail}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Transfer / Pairing Indicator */}
                  <div className="flex justify-center text-brand-peach text-xs">
                    <div className="p-1.5 rounded-full bg-white/5 border border-white/10">
                      <FaExchangeAlt />
                    </div>
                  </div>

                  {/* Athlete info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
                      <FaUser />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Assigned Athlete</span>
                      <p className="text-white font-bold text-sm">{a.athleteName}</p>
                      <p className="text-xs text-gray-400">{a.sport || "Athlete"}</p>
                    </div>
                  </div>
                </div>

                {/* Assignment Timestamp & Action */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <FaCalendarAlt className="text-brand-peach text-xs" />
                    {a.assignedAt ? new Date(a.assignedAt).toLocaleDateString() : "Active"}
                  </span>
                  
                  <button
                    onClick={() => setTerminatingAssignment(a)}
                    className="px-2.5 py-1 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                    title="Terminate Roster Pairing"
                  >
                    <FaTrash className="text-[10px]" /> Terminate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Assignment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="glass-card bg-[#111317]/95 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-peach/10 blur-[90px] rounded-full pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-peach/10 text-brand-peach rounded-2xl border border-brand-peach/20 text-xl">
                    <FaUserFriends />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Manual Roster Pairing</h2>
                    <p className="text-gray-400 text-xs">Assign an Athlete to a Certified Coach</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleCreateAssignmentSubmit} className="mt-5 space-y-4 relative z-10">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Select Coach *
                  </label>
                  <select
                    required
                    value={selectedCoachId}
                    onChange={(e) => setSelectedCoachId(e.target.value)}
                    className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 font-bold"
                  >
                    <option value="">-- Choose Coach --</option>
                    {coaches.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.sport || "Coach"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Select Athlete *
                  </label>
                  <select
                    required
                    value={selectedAthleteId}
                    onChange={(e) => setSelectedAthleteId(e.target.value)}
                    className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 font-bold"
                  >
                    <option value="">-- Choose Athlete --</option>
                    {athletes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.fullName} ({a.sport || "Athlete"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400 leading-relaxed">
                  ℹ️ If this athlete is currently assigned to another coach, their prior pairing will be deactivated automatically.
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-3 rounded-xl bg-brand-peach text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg"
                  >
                    {creating ? "Assigning..." : "Create Pairing"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Terminate Assignment Confirmation Modal */}
        {terminatingAssignment && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="glass-card bg-[#111317]/95 border border-red-500/20 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[90px] rounded-full pointer-events-none" />

              <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 text-2xl">
                  <FaExclamationCircle />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Terminate Roster Pairing</h2>
                  <p className="text-gray-400 text-xs">Unassign Athlete from Coach</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Are you sure you want to terminate the roster pairing between Coach <strong className="text-emerald-400">{terminatingAssignment.coachName}</strong> and Athlete <strong className="text-blue-400">{terminatingAssignment.athleteName}</strong>?
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTerminatingAssignment(null)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={terminating}
                    onClick={handleTerminateAssignment}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-red-500/20"
                  >
                    {terminating ? "Terminating..." : "Terminate Pairing"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
