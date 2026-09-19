import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { getErrorMessage } from "../../utils/errorHandler";
import {
  FaHistory,
  FaSearch,
  FaTrashAlt,
  FaShieldAlt,
  FaUserCheck,
  FaUserTimes,
  FaUserEdit,
  FaUserMinus,
  FaUserFriends,
  FaFilter,
  FaExclamationCircle,
  FaClock,
  FaInfoCircle
} from "react-icons/fa";

const ACTION_CATEGORIES = [
  { id: "ALL", label: "All Events" },
  { id: "COACH_VERIFIED", label: "Coach Approvals" },
  { id: "COACH_REJECTED", label: "Coach Rejections" },
  { id: "USER_ROLE_UPDATED", label: "Role Updates" },
  { id: "USER_DETAILS_UPDATED", label: "Profile Updates" },
  { id: "USER_DELETED", label: "User Deletions" },
  { id: "ROSTER_PAIRING_CREATED", label: "Pairings Created" },
  { id: "ROSTER_PAIRING_TERMINATED", label: "Pairings Terminated" }
];

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Clear Logs Modal
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/audit-logs");
      setLogs(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load admin audit activity history."));
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    setClearing(true);
    try {
      await api.delete("/admin/audit-logs");
      toast.success("Audit history logs cleared successfully! 🧹");
      setLogs([]);
      setShowClearModal(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to clear audit logs."));
    } finally {
      setClearing(false);
    }
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesCategory = selectedCategory === "ALL" || log.action === selectedCategory;

    const q = search.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch =
      log.action?.toLowerCase().includes(q) ||
      log.details?.toLowerCase().includes(q) ||
      log.performedByAdminName?.toLowerCase().includes(q) ||
      log.targetEntityName?.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  // KPI Calculations
  const totalEvents = logs.length;
  const verificationEvents = logs.filter((l) => l.action === "COACH_VERIFIED" || l.action === "COACH_REJECTED").length;
  const userManagementEvents = logs.filter(
    (l) => l.action === "USER_ROLE_UPDATED" || l.action === "USER_DETAILS_UPDATED" || l.action === "USER_DELETED"
  ).length;
  const rosterEvents = logs.filter((l) => l.action === "ROSTER_PAIRING_CREATED" || l.action === "ROSTER_PAIRING_TERMINATED").length;

  const getBadgeStyle = (action) => {
    switch (action) {
      case "COACH_VERIFIED":
        return {
          badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          icon: <FaUserCheck className="text-emerald-400" />,
          label: "COACH APPROVED"
        };
      case "COACH_REJECTED":
        return {
          badgeClass: "bg-red-500/10 text-red-400 border-red-500/20",
          icon: <FaUserTimes className="text-red-400" />,
          label: "COACH REJECTED"
        };
      case "USER_ROLE_UPDATED":
        return {
          badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          icon: <FaUserEdit className="text-purple-400" />,
          label: "ROLE CHANGED"
        };
      case "USER_DETAILS_UPDATED":
        return {
          badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          icon: <FaUserEdit className="text-blue-400" />,
          label: "PROFILE UPDATED"
        };
      case "USER_DELETED":
        return {
          badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          icon: <FaUserMinus className="text-rose-400" />,
          label: "USER DELETED"
        };
      case "ROSTER_PAIRING_CREATED":
        return {
          badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
          icon: <FaUserFriends className="text-cyan-400" />,
          label: "PAIRING CREATED"
        };
      case "ROSTER_PAIRING_TERMINATED":
        return {
          badgeClass: "bg-orange-500/10 text-orange-400 border-orange-500/20",
          icon: <FaUserFriends className="text-orange-400" />,
          label: "PAIRING TERMINATED"
        };
      default:
        return {
          badgeClass: "bg-gray-500/10 text-gray-400 border-gray-500/20",
          icon: <FaInfoCircle className="text-gray-400" />,
          label: action
        };
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "Recently";
    try {
      return new Date(ts).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return ts;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium animate-pulse">Loading Governance Audit Trail...</p>
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
              <div className="w-1.5 h-8 bg-purple-500 rounded-full"></div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight">
                Admin Audit History
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
                <FaShieldAlt /> System Trail
              </span>
            </div>
            <p className="text-gray-400 text-base font-medium ml-5">
              Immutable log of administrative events, account modifications, credentials reviews, and roster actions
            </p>
          </div>

          <div className="flex items-center gap-3">
            {logs.length > 0 && (
              <button
                onClick={() => setShowClearModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs transition-all cursor-pointer"
              >
                <FaTrashAlt />
                Clear Audit History
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Total Audit Events</span>
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20 text-xl">
                <FaHistory />
              </div>
            </div>
            <p className="text-4xl font-black text-white mt-4 tracking-tight">{totalEvents}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">Recorded Governance Actions</p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Verification Events</span>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 text-xl">
                <FaUserCheck />
              </div>
            </div>
            <p className="text-4xl font-black text-white mt-4 tracking-tight">{verificationEvents}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">Coach Approvals & Rejections</p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">User Management</span>
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 text-xl">
                <FaUserEdit />
              </div>
            </div>
            <p className="text-4xl font-black text-white mt-4 tracking-tight">{userManagementEvents}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">Role Updates, Edits & Deletions</p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Roster Events</span>
              <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20 text-xl">
                <FaUserFriends />
              </div>
            </div>
            <p className="text-4xl font-black text-white mt-4 tracking-tight">{rosterEvents}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">Pairings Created & Terminated</p>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="glass-card rounded-3xl p-6 border border-white/5 shadow-2xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="text"
                placeholder="Search logs by action, admin, target user, or details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                <FaFilter className="text-[10px]" /> Filter:
              </span>
              {ACTION_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                      : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Log Timeline */}
        {filteredLogs.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 text-center border border-white/5 space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-2xl mx-auto">
              <FaHistory />
            </div>
            <h3 className="text-xl font-bold text-white">No Audit History Logged</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              {logs.length === 0
                ? "No administrative governance actions have been recorded yet. Perform an action (e.g. verify a coach or update a role) to initiate the audit trail."
                : "No log records match your current search or filter criteria."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const badge = getBadgeStyle(log.action);
              return (
                <div
                  key={log.id}
                  className="glass-card rounded-3xl p-6 border border-white/5 hover:border-purple-500/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 shrink-0 mt-0.5">
                      {badge.icon}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${badge.badgeClass}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                          <FaClock className="text-[10px]" /> {formatTimestamp(log.timestamp)}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-white leading-relaxed">
                        {log.details}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-400 pt-1 font-mono">
                        <span>Admin: <strong className="text-gray-200 font-sans">{log.performedByAdminName || "System Admin"}</strong></span>
                        {log.targetEntityName && (
                          <span>Target: <strong className="text-purple-300 font-sans">{log.targetEntityName}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Clear Logs Confirmation Modal */}
        {showClearModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="glass-card bg-[#111317]/95 border border-red-500/20 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 text-2xl">
                  <FaTrashAlt />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Clear Audit History</h2>
                  <p className="text-gray-400 text-xs">Governance Action</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Are you sure you want to purge all recorded admin audit log history from MongoDB? This operation cannot be undone.
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowClearModal(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={clearing}
                    onClick={handleClearLogs}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-red-500/20"
                  >
                    {clearing ? "Clearing..." : "Purge Logs"}
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
