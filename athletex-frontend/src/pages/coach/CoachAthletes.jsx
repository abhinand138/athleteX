import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaFutbol,
  FaMapMarkerAlt,
  FaSearch,
  FaTrash,
  FaEye,
  FaUserPlus,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function CoachAthletes() {
  const [athletes, setAthletes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [confirmUnassign, setConfirmUnassign] = useState(null); // athleteId to unassign
  
  // Assign Modal States
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableAthletes, setAvailableAthletes] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const [assigningId, setAssigningId] = useState(null);
  const [assignNotification, setAssignNotification] = useState(null); // { type: 'success'|'error', text: '' }

  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const coachId = storedUser?.id;

  useEffect(() => {
    if (!coachId || storedUser.role !== "COACH") {
      setError("Access denied. Please login as a coach.");
      setLoading(false);
      return;
    }
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/coach/assignments/coach/${coachId}`);
      setAthletes(response.data);
      setFiltered(response.data);
    } catch (err) {
      setError(err.response?.data || "Failed to load athletes.");
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = async () => {
    setShowAssignModal(true);
    setLoadingAvailable(true);
    setAssignSearch("");
    setAssignNotification(null);
    try {
      const response = await api.get(`/coach/assignments/available/${coachId}`);
      setAvailableAthletes(response.data || []);
    } catch (err) {
      console.error("Failed to load available athletes:", err);
      setAssignNotification({
        type: "error",
        text: err.response?.data || "Failed to load available athletes. Please try again."
      });
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleAssignAthlete = async (athleteId, athleteName) => {
    setAssigningId(athleteId);
    setAssignNotification(null);
    try {
      await api.post(`/coach/assignments/${coachId}/${athleteId}`);
      setAssignNotification({
        type: "success",
        text: `Successfully assigned ${athleteName || "athlete"} to your roster!`
      });
      // Remove from available list immediately in state
      setAvailableAthletes((prev) => prev.filter((a) => a.id !== athleteId));
      // Refresh the main assigned athletes list in the background
      const res = await api.get(`/coach/assignments/coach/${coachId}`);
      setAthletes(res.data);
      setFiltered(res.data);
    } catch (err) {
      setAssignNotification({
        type: "error",
        text: err.response?.data || "Failed to assign athlete."
      });
    } finally {
      setAssigningId(null);
    }
  };

  const handleSearch = (e) => {
    const q = e.target.value.toLowerCase().trim();
    setSearch(e.target.value);
    setFiltered(
      athletes.filter(
        (a) =>
          a.fullName?.toLowerCase().includes(q) ||
          a.email?.toLowerCase().includes(q) ||
          a.sport?.toLowerCase().includes(q) ||
          a.position?.toLowerCase().includes(q) ||
          a.city?.toLowerCase().includes(q)
      )
    );
  };

  const handleUnassign = async (athleteId) => {
    try {
      await api.delete(`/coach/assignments/${coachId}/${athleteId}`);
      setConfirmUnassign(null);
      fetchAthletes();
    } catch (err) {
      alert(err.response?.data || "Failed to unassign athlete.");
    }
  };

  const filteredAvailable = availableAthletes.filter((a) => {
    const q = assignSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      a.fullName?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.sport?.toLowerCase().includes(q) ||
      a.position?.toLowerCase().includes(q) ||
      a.city?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium animate-pulse">Loading your athletes...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="glass-card rounded-2xl p-8 border border-red-500/20 text-center max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <h2 className="text-xl font-bold text-white mb-3">Error</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12 relative z-10">

        {/* Header with Assign Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
          <div className="relative">
            <div className="absolute -left-10 -top-10 w-64 h-64 bg-brand-peach/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-4 mb-2">
              <div className="w-1.5 h-8 bg-brand-peach rounded-full"></div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
                My Athletes
              </h1>
            </div>
            <p className="text-gray-400 text-lg font-medium ml-5">
              {athletes.length} athlete{athletes.length !== 1 ? "s" : ""} in your roster
            </p>
          </div>

          <button
            onClick={openAssignModal}
            className="flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-brand-peach to-orange-500 hover:from-brand-peach/90 hover:to-orange-500/90 text-black font-bold rounded-2xl shadow-[0_0_25px_rgba(255,123,84,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            <FaUserPlus className="text-lg" />
            Assign Athlete
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder={
              athletes.length === 0
                ? "No athletes assigned yet (click '+ Assign Athlete' to add)"
                : "Search your roster by name, email or sport..."
            }
            value={search}
            onChange={handleSearch}
            disabled={athletes.length === 0}
            className="w-full bg-[#111317] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-peach/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Empty State */}
        {filtered.length === 0 && !loading && (
          <div className="glass-card rounded-3xl p-12 border border-white/5 shadow-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-brand-peach/10 border border-brand-peach/20 flex items-center justify-center mx-auto mb-6 text-3xl text-brand-peach">
              <FaUserPlus />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {athletes.length === 0 ? "Your Roster is Empty" : "No athletes match your search"}
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6 text-sm">
              {athletes.length === 0
                ? "You haven't assigned Anand or Abhinand MA to your roster yet. Click the button below to assign them!"
                : "Try searching with a different name, email, or sport."}
            </p>
            {athletes.length === 0 && (
              <button
                onClick={openAssignModal}
                className="inline-flex items-center gap-3 px-7 py-3.5 bg-gradient-to-r from-brand-peach to-orange-500 text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,123,84,0.3)] cursor-pointer"
              >
                <FaUserPlus className="text-lg" />
                Assign Athlete to Roster
              </button>
            )}
          </div>
        )}

        {/* Athlete Cards Grid */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((athlete) => (
              <div
                key={athlete.id}
                className="glass-card rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-brand-peach/20 transition-all"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-peach/5 blur-3xl rounded-full pointer-events-none group-hover:bg-brand-peach/10 transition-all" />

                {/* Avatar + Name */}
                <div className="flex items-center gap-4 mb-5 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {athlete.profileImage ? (
                      <img src={athlete.profileImage} alt={athlete.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <FaUser className="text-gray-500 text-xl" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg leading-tight">{athlete.fullName}</h3>
                    {athlete.sport && (
                      <p className="text-brand-peach text-sm font-medium flex items-center gap-1.5 mt-0.5">
                        <FaFutbol className="text-xs" />
                        {athlete.sport}{athlete.position ? ` · ${athlete.position}` : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 relative z-10 mb-5">
                  {athlete.email && (
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                      <FaEnvelope className="text-gray-600 shrink-0" />
                      <span className="truncate">{athlete.email}</span>
                    </div>
                  )}
                  {athlete.phone && (
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                      <FaPhone className="text-gray-600 shrink-0" />
                      <span>{athlete.phone}</span>
                    </div>
                  )}
                  {(athlete.city || athlete.state || athlete.country) && (
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                      <FaMapMarkerAlt className="text-gray-600 shrink-0" />
                      <span>{[athlete.city, athlete.state, athlete.country].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 relative z-10">
                  <button
                    onClick={() => navigate(`/coach/athletes/${athlete.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/10 text-gray-300 font-semibold text-sm hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer"
                  >
                    <FaEye className="text-xs" />
                    View Profile
                  </button>
                  <button
                    onClick={() => setConfirmUnassign(athlete.id)}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-500/20 text-red-400 font-semibold text-sm hover:bg-red-500/10 hover:border-red-500/40 transition-all cursor-pointer"
                  >
                    <FaTrash className="text-xs" />
                    Unassign
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ASSIGN ATHLETE MODAL                                                      */}
        {/* ========================================================================= */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="glass-card bg-[#111317]/95 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-peach/10 blur-[90px] rounded-full pointer-events-none" />

              {/* Modal Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-peach/10 text-brand-peach rounded-2xl border border-brand-peach/20">
                    <FaUserPlus className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-wide">Assign Athlete</h2>
                    <p className="text-gray-400 text-sm">Select registered athletes to add to your coaching roster</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <FaTimes size={18} />
                </button>
              </div>

              {/* Notification Banner */}
              {assignNotification && (
                <div
                  className={`mt-4 p-3.5 rounded-xl flex items-center gap-3 text-sm font-medium border relative z-10 ${
                    assignNotification.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}
                >
                  {assignNotification.type === "success" ? (
                    <FaCheckCircle className="shrink-0 text-base" />
                  ) : (
                    <FaExclamationCircle className="shrink-0 text-base" />
                  )}
                  <span>{assignNotification.text}</span>
                </div>
              )}

              {/* Search Inside Modal */}
              <div className="my-5 relative z-10">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search available athletes by name, email or sport..."
                    value={assignSearch}
                    onChange={(e) => setAssignSearch(e.target.value)}
                    className="w-full bg-[#181b22] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-peach/50 transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Available Athletes List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 relative z-10 scrollbar-thin scrollbar-thumb-white/10">
                {loadingAvailable ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-8 h-8 border-3 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-400 text-sm">Finding available athletes...</p>
                  </div>
                ) : filteredAvailable.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <FaUser className="text-3xl mx-auto mb-2 opacity-30" />
                    <p className="text-base font-semibold text-gray-400">
                      {assignSearch ? "No matching athletes found." : "No available athletes to assign."}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {assignSearch
                        ? "Try searching with a different name or sport."
                        : "All registered athletes have already been assigned to your roster, or no athlete accounts exist."}
                    </p>
                  </div>
                ) : (
                  filteredAvailable.map((athlete) => (
                    <div
                      key={athlete.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-[#161a22]/80 border border-white/5 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-3">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {athlete.profileImage ? (
                            <img
                              src={athlete.profileImage}
                              alt={athlete.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FaUser className="text-gray-500 text-lg" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-white font-bold text-sm truncate">{athlete.fullName}</h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400 mt-0.5">
                            {athlete.sport && (
                              <span className="text-brand-peach font-medium">
                                {athlete.sport} {athlete.position ? `(${athlete.position})` : ""}
                              </span>
                            )}
                            {athlete.email && (
                              <span className="text-gray-500 truncate max-w-[180px]">{athlete.email}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAssignAthlete(athlete.id, athlete.fullName)}
                        disabled={assigningId === athlete.id}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-peach hover:bg-brand-peach/90 active:scale-95 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 shrink-0 cursor-pointer shadow-md"
                      >
                        {assigningId === athlete.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                            Assigning...
                          </>
                        ) : (
                          <>
                            <FaUserPlus />
                            Assign
                          </>
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-5 pt-4 border-t border-white/10 flex justify-end relative z-10">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-300 font-semibold text-sm hover:bg-white/5 transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Unassign Dialog */}
        {confirmUnassign && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="glass-card rounded-2xl p-8 border border-white/10 shadow-2xl max-w-md w-full relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500 rounded-t-2xl"></div>
              <h3 className="text-xl font-bold text-white mb-3">Remove Athlete?</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to remove this athlete from your roster? This will not delete their account.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmUnassign(null)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 font-bold hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUnassign(confirmUnassign)}
                  className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
