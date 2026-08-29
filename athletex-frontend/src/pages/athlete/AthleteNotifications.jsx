import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import {
  FaBell,
  FaBullhorn,
  FaCheckDouble,
  FaTrash,
  FaDumbbell,
  FaTrophy,
  FaChartLine,
  FaInfoCircle,
  FaClock
} from "react-icons/fa";

export default function AthleteNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const athleteId = storedUser?.id;

  useEffect(() => {
    if (!athleteId) {
      setError("Please login to view your notifications.");
      setLoading(false);
      return;
    }
    fetchNotifications();
  }, [athleteId]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/notifications/me");
      setNotifications(res.data || []);
    } catch (err) {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notifications/me/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    try {
      await api.delete("/notifications/me/clear");
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  const handleNotificationNavigation = (n) => {
    if (!n.read) {
      handleMarkAsRead(n.id);
    }
    if (n.referenceType === "TRAINING") {
      navigate("/training");
    } else if (n.referenceType === "ACHIEVEMENT") {
      navigate("/achievements");
    } else if (n.referenceType === "PERFORMANCE") {
      navigate("/performance");
    }
  };

  const getFilteredNotifications = () => {
    switch (activeFilter) {
      case "UNREAD":
        return notifications.filter((n) => !n.read);
      case "TRAINING":
        return notifications.filter((n) =>
          n.type === "TRAINING_ASSIGNED" ||
          n.type === "TRAINING_COMPLETED" ||
          n.type === "TRAINING_CANCELLED"
        );
      case "ACHIEVEMENTS":
        return notifications.filter((n) => n.type === "ACHIEVEMENT_UNLOCKED");
      case "ANNOUNCEMENTS":
        return notifications.filter((n) => n.type === "COACH_ANNOUNCEMENT");
      default:
        return notifications;
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const getIcon = (type) => {
    switch (type) {
      case "TRAINING_ASSIGNED":
      case "TRAINING_COMPLETED":
      case "TRAINING_CANCELLED":
        return <FaDumbbell className="text-cyan-400" />;
      case "ACHIEVEMENT_UNLOCKED":
        return <FaTrophy className="text-yellow-400" />;
      case "PERFORMANCE_UPDATED":
        return <FaChartLine className="text-emerald-400" />;
      case "COACH_ANNOUNCEMENT":
        return <FaBullhorn className="text-brand-peach" />;
      default:
        return <FaInfoCircle className="text-blue-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredList = getFilteredNotifications();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-16 relative z-10">

        {/* ========================================================================= */}
        {/* HEADER & ACTION BUTTONS                                                   */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative">
            <div className="absolute -left-10 -top-10 w-64 h-64 bg-brand-peach/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-3.5 mb-2">
              <div className="w-1.5 h-8 bg-brand-peach rounded-full"></div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
                My Notifications
              </h1>
            </div>
            <p className="text-gray-400 text-base font-medium ml-5">
              Stay updated with workouts, milestones, and announcements from your coach
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <FaCheckDouble className="text-brand-peach" />
                Mark All Read
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <FaTrash />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FILTER TABS                                                               */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "ALL", label: `All (${notifications.length})` },
            { id: "UNREAD", label: `Unread (${unreadCount})` },
            { id: "TRAINING", label: "Training" },
            { id: "ACHIEVEMENTS", label: "Achievements" },
            { id: "ANNOUNCEMENTS", label: "Announcements" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === tab.id
                  ? "bg-brand-peach text-black shadow-md shadow-brand-peach/20"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* NOTIFICATION FEED                                                         */}
        {/* ========================================================================= */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
              <p className="text-gray-400 text-xs font-medium animate-pulse">Loading notification alerts...</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass-card rounded-2xl p-6 border border-red-500/20 text-center max-w-md mx-auto">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 border border-white/5 text-center max-w-lg mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-2xl text-gray-500">
              <FaBell />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">You're All Caught Up</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              {activeFilter === "UNREAD"
                ? "You have no unread notifications."
                : "New training assignments, achievements, and coach announcements will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationNavigation(n)}
                className={`glass-card rounded-2xl p-5 border transition-all cursor-pointer relative overflow-hidden flex items-start gap-4 group ${
                  !n.read
                    ? "border-brand-peach/30 bg-gradient-to-r from-brand-peach/[0.06] to-transparent shadow-lg"
                    : "border-white/5 hover:border-white/20"
                }`}
              >
                {/* Glowing Unread Indicator Bar */}
                {!n.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-peach shadow-[0_0_10px_#ee9b74]"></div>
                )}

                <div className="p-3.5 rounded-2xl bg-white/5 text-xl shrink-0 border border-white/5 mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className={`text-sm font-bold tracking-tight ${!n.read ? "text-white" : "text-gray-300"}`}>
                        {n.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        {n.type?.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                        <FaClock className="text-[10px]" />
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed max-w-4xl">
                    {n.message}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-gray-500">
                      {n.senderName ? `From: Coach ${n.senderName}` : ""}
                    </span>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(n.id, e)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-all cursor-pointer"
                        title="Delete notification"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
