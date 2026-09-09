import { useEffect, useState, useRef } from "react";
import {
  FaBell,
  FaCheck,
  FaDumbbell,
  FaTrophy,
  FaBullhorn,
  FaChartLine,
  FaExclamationTriangle,
  FaInfoCircle,
  FaArrowRight,
  FaCamera,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaPlus
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { uploadProfilePhotoFromDevice } from "../../utils/profilePhotoUpload";

export default function Topbar() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const profileMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}")
  );

  const isCoach = currentUser?.role === "COACH";

  useEffect(() => {
    const handleUserUpdated = () => {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      setCurrentUser(stored);
    };
    window.addEventListener("user-profile-updated", handleUserUpdated);
    return () => window.removeEventListener("user-profile-updated", handleUserUpdated);
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    if (!currentUser?.id) return;
    try {
      const res = await api.get(`/notifications/unread-count?userId=${currentUser.id}`);
      setUnreadCount(Number(res.data?.unreadCount) || 0);
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
        const res = await api.get(`/notifications?userId=${currentUser.id}`);
        setRecentNotifications((res.data || []).slice(0, 5));
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkSingleRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read?userId=${currentUser.id}`);
      setRecentNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark single notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put(`/notifications/read-all?userId=${currentUser.id}`);
      setRecentNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && currentUser?.id) {
      uploadProfilePhotoFromDevice(file, currentUser.id, (newImg) => {
        setCurrentUser((prev) => ({ ...prev, profileImage: newImg }));
        setProfileMenuOpen(false);
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const hasCustomPhoto =
    currentUser?.profileImage &&
    !currentUser.profileImage.includes("pravatar.cc") &&
    !currentUser.profileImage.includes("profile.jpg");

  const getNotificationIcon = (type) => {
    switch (type) {
      case "TRAINING":
      case "TRAINING_ASSIGNED":
        return <FaDumbbell className="text-amber-400 text-sm" />;
      case "ACHIEVEMENT":
      case "ACHIEVEMENT_UNLOCKED":
        return <FaTrophy className="text-yellow-400 text-sm" />;
      case "COACH_ANNOUNCEMENT":
      case "SYSTEM":
        return <FaBullhorn className="text-brand-peach text-sm" />;
      case "PERFORMANCE":
      case "VERIFICATION":
        return <FaChartLine className="text-emerald-400 text-sm" />;
      case "ALERT":
        return <FaExclamationTriangle className="text-rose-400 text-sm" />;
      default:
        return <FaInfoCircle className="text-blue-400 text-sm" />;
    }
  };

  return (
    <header className="h-20 bg-brand-dark/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Search Input */}
      <div className="relative w-72">
        <input
          type="text"
          placeholder="Search metrics, workouts, athletes..."
          className="w-full bg-[#111317] border border-white/5 rounded-xl px-4 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-brand-peach transition-colors"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 relative">
        {/* Hidden File Input for Device Photo Upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSelect}
        />

        {/* Notifications Icon & Popover */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleToggleDropdown}
            className="p-3 bg-[#111317] border border-white/5 rounded-xl text-gray-300 hover:text-brand-peach hover:border-brand-peach/30 transition-all relative cursor-pointer"
            aria-label="Notifications"
          >
            <FaBell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-peach text-brand-dark text-xs font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#111317] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-peach/20 text-brand-peach border border-brand-peach/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-gray-400 hover:text-brand-peach transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <FaCheck className="text-[10px]" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {loading ? (
                  <div className="p-6 text-center text-xs text-gray-400">Loading notifications...</div>
                ) : recentNotifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">
                    <FaBell className="mx-auto text-2xl text-gray-600 mb-2" />
                    No notifications yet.
                  </div>
                ) : (
                  recentNotifications.map((n) => {
                    const isRead = n.isRead || n.read;
                    return (
                      <div
                        key={n.id}
                        className={`p-3.5 hover:bg-white/5 transition-colors cursor-pointer flex items-start gap-3 ${
                          !isRead ? "bg-white/[0.02]" : "opacity-75"
                        }`}
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate(isCoach ? "/coach/notifications" : "/athlete/notifications");
                        }}
                      >
                        <div className="mt-0.5 p-2 rounded-lg bg-black/40 border border-white/5 shrink-0">
                          {getNotificationIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs ${!isRead ? "font-bold text-white" : "font-medium text-gray-300"} truncate`}>
                            {n.title}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                        {!isRead && (
                          <button
                            onClick={(e) => handleMarkSingleRead(n.id, e)}
                            title="Mark as read"
                            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          >
                            <FaCheck size={10} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

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

        <div className="h-10 w-px bg-white/10 mx-1"></div>

        {/* Profile Avatar & Interactive Menu */}
        <div className="relative" ref={profileMenuRef}>
          <div
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            className="relative cursor-pointer group"
          >
            {hasCustomPhoto ? (
              <img
                src={currentUser.profileImage}
                className="w-11 h-11 rounded-full border-2 border-brand-peach/50 hover:border-brand-peach transition-all shadow-lg object-cover"
                alt="Profile"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-brand-peach/30 to-orange-500/30 border-2 border-brand-peach/50 hover:border-brand-peach flex items-center justify-center text-brand-peach font-black text-base shadow-lg transition-all group-hover:scale-105">
                {currentUser?.fullName?.charAt(0) || "U"}
              </div>
            )}

            {/* Direct Camera / Add Badge */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              title="Add profile photo from device"
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand-peach text-brand-dark flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
              <FaCamera className="text-[9px]" />
            </button>
          </div>

          {/* Profile Dropdown Menu */}
          {profileMenuOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-[#111317] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Header */}
              <div className="p-4 border-b border-white/5 bg-black/30">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser?.fullName || "User"}
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {currentUser?.email}
                </p>
                <div className="mt-1.5">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-brand-peach/10 text-brand-peach text-[10px] font-bold uppercase tracking-wider">
                    {currentUser?.role || "ATHLETE"}
                  </span>
                </div>
              </div>

              {/* Actions List */}
              <div className="p-2 space-y-1">
                {/* 1. Add / Change Photo from Device */}
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-brand-peach hover:bg-brand-peach/10 transition-colors cursor-pointer text-left"
                >
                  <FaCamera size={13} />
                  <span>{hasCustomPhoto ? "Change Photo from Device" : "Add Profile Photo"}</span>
                </button>

                {/* 2. View Profile */}
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate(isCoach ? "/coach/profile" : "/profile");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                  <FaUser size={13} />
                  <span>View Profile</span>
                </button>

                {/* 3. Settings */}
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate("/settings");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                  <FaCog size={13} />
                  <span>Account Settings</span>
                </button>
              </div>

              {/* Sign Out */}
              <div className="p-2 border-t border-white/5 bg-black/20">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                >
                  <FaSignOutAlt size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}