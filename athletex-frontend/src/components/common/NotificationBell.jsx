import { useEffect, useState, useRef } from "react";
import { FaBell, FaCheckDouble, FaCircle, FaExternalLinkAlt, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 10000); // Poll every 10 seconds
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/notifications/unread-count?userId=${user.id}`);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      // Non-blocking
    }
  };

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/notifications?userId=${user.id}`);
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id, link) => {
    try {
      await api.put(`/notifications/${id}/read?userId=${user.id}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      fetchUnreadCount();
      if (link) {
        setIsOpen(false);
        navigate(link);
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put(`/notifications/read-all?userId=${user.id}`);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  if (!user?.id) return null;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer shadow-lg"
        title="In-App Notifications"
      >
        <FaBell className="text-lg text-gray-300 hover:text-brand-peach transition-colors" />

        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-peach text-black text-[10px] font-black flex items-center justify-center animate-bounce shadow-lg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-card bg-[#11131a]/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <FaBell className="text-brand-peach text-sm" />
              <h3 className="font-bold text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-peach/10 text-brand-peach border border-brand-peach/20">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-brand-peach hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <FaCheckDouble className="text-[10px]" /> Read All
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* List Area */}
          <div className="max-h-80 overflow-y-auto divide-y divide-white/5 scrollbar-thin">
            {loading ? (
              <div className="p-8 text-center text-gray-500 text-xs font-medium animate-pulse">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs font-medium space-y-1">
                <p className="text-gray-400 font-bold">No Notifications</p>
                <p className="text-[11px] text-gray-500">You are all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id, n.link)}
                  className={`p-4 transition-colors cursor-pointer hover:bg-white/[0.04] flex items-start gap-3 relative ${
                    !n.isRead ? "bg-white/[0.02]" : "opacity-75"
                  }`}
                >
                  {/* Unread Indicator Dot */}
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-brand-peach mt-1.5 shrink-0 animate-pulse" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-bold truncate ${!n.isRead ? "text-white" : "text-gray-300"}`}>
                        {n.title}
                      </h4>
                      <span className="text-[9px] font-mono text-gray-500 shrink-0">
                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>

                    {n.link && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-brand-peach font-bold mt-2 hover:underline">
                        <span>View Details</span> <FaExternalLinkAlt className="text-[8px]" />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
}
