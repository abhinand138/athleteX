import { useEffect, useState, useRef } from "react";
import { FaBell, FaCheck, FaDumbbell, FaTrophy, FaBullhorn, FaChartLine, FaExclamationTriangle, FaInfoCircle, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Topbar() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isCoach = user.role === "COACH";

  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/notifications/me/unread/count");
      setUnreadCount(Number(res.data) || 0);
    } catch (err) {
      console.error("Failed to fetch unread notifications count:", err);
    }
  };

  const handleToggleDropdown = async () => {
    const nextState = !dropdownOpen;
    setDropdownOpen(nextState);
    if (nextState) {
      setLoading(true);
      try {
        const res = await api.get("/notifications/me");
        setRecentNotifications((res.data || []).slice(0, 5));
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setRecentNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notifications/me/read-all");
      setRecentNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    setDropdownOpen(false);

    if (notification.referenceType === "TRAINING") {
      navigate(isCoach ? "/coach/training" : "/training");
    } else if (notification.referenceType === "ACHIEVEMENT") {
      navigate(isCoach ? "/coach/achievements" : "/achievements");
    } else if (notification.referenceType === "PERFORMANCE") {
      navigate(isCoach ? "/coach/analytics" : "/performance");
    } else {
      navigate(isCoach ? "/coach/notifications" : "/athlete/notifications");
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
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const getNotificationIcon = (type) => {
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
      case "ATHLETE_ATTENTION":
        return <FaExclamationTriangle className="text-red-400" />;
      default:
        return <FaInfoCircle className="text-blue-400" />;
    }
  };

  return (
    <header className="h-24 bg-brand-dark/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-30 shadow-sm print:hidden">

      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          {isCoach ? "Coach Hub" : "Dashboard"}
        </h1>
        <p className="text-brand-peach text-sm font-semibold tracking-wider uppercase mt-1">
          Welcome back, {user.fullName || "User"} 👋
        </p>
      </div>

      <div className="flex items-center gap-6">

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleToggleDropdown}
            className={`relative text-gray-400 hover:text-brand-peach transition-all p-2.5 rounded-full hover:bg-white/5 cursor-pointer ${
              dropdownOpen ? "bg-white/10 text-brand-peach" : ""
            }`}
            title="Notifications"
          >
            <FaBell className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-brand-peach text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-pulse border-2 border-brand-dark">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Card */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-[#0e1014] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 overflow-hidden animate-fadeIn">
              {/* Dropdown Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-brand-peach/10 text-brand-peach text-[10px] font-extrabold border border-brand-peach/20">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] font-semibold text-gray-400 hover:text-brand-peach transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {loading ? (
                  <div className="p-6 text-center text-xs text-gray-400 animate-pulse">
                    Loading notifications...
                  </div>
                ) : recentNotifications.length === 0 ? (
                  <div className="p-8 text-center space-y-1">
                    <p className="text-sm font-bold text-white">You're all caught up</p>
                    <p className="text-xs text-gray-400">No new notifications at this time.</p>
                  </div>
                ) : (
                  recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3.5 flex items-start gap-3 hover:bg-white/5 transition-colors cursor-pointer group ${
                        !n.read ? "bg-brand-peach/[0.03]" : ""
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-white/5 text-base shrink-0 mt-0.5">
                        {getNotificationIcon(n.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-bold truncate ${!n.read ? "text-white" : "text-gray-300"}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {formatTimeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5 leading-snug">
                          {n.message}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-brand-peach shrink-0 mt-1.5 shadow-[0_0_8px_#ee9b74]"></span>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="p-3 border-t border-white/5 bg-black/20 text-center">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate(isCoach ? "/coach/notifications" : "/athlete/notifications");
                  }}
                  className="inline-flex items-center justify-center gap-2 text-xs font-bold text-brand-peach hover:text-brand-peach/80 transition-colors w-full py-1.5 cursor-pointer"
                >
                  View All Notifications
                  <FaArrowRight className="text-[10px]" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-10 w-px bg-white/10 mx-2"></div>

        <img
          src={user?.profileImage || "https://i.pravatar.cc/100?img=11"}
          className="w-12 h-12 rounded-full border-2 border-brand-peach/50 hover:border-brand-peach transition-colors shadow-lg cursor-pointer object-cover"
          alt="Profile"
          onClick={() => navigate(isCoach ? "/settings" : "/profile")}
        />

      </div>

    </header>
  );
}