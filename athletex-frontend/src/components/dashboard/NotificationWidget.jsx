import { useEffect, useState } from "react";
import { FaBell, FaArrowRight, FaDumbbell, FaTrophy, FaBullhorn, FaChartLine, FaInfoCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function NotificationWidget() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isCoach = user.role === "COACH";

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        api.get("/notifications/me"),
        api.get("/notifications/me/unread/count")
      ]);
      setNotifications((listRes.data || []).slice(0, 3));
      setUnreadCount(Number(countRes.data) || 0);
    } catch (err) {
      console.error("Failed to load notifications widget:", err);
    } finally {
      setLoading(false);
    }
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

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const mins = Math.floor((now - date) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="glass-card rounded-3xl p-7 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
      <div className="absolute right-0 top-0 w-64 h-64 bg-brand-peach/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-brand-peach/10 transition-colors" />

      <div>
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-peach/10 text-brand-peach">
              <FaBell />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Notifications</h2>
              <p className="text-xs text-gray-400">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}` : "All caught up"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-brand-peach/10 border border-brand-peach/20 text-brand-peach text-[10px] font-black uppercase tracking-wider">
              {unreadCount} New
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-gray-500 animate-pulse">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-500">
            No recent notifications. New alerts will appear here.
          </div>
        ) : (
          <div className="space-y-2.5 mb-5 relative z-10">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => navigate(isCoach ? "/coach/notifications" : "/athlete/notifications")}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  !n.read
                    ? "bg-brand-peach/[0.04] border-brand-peach/20 hover:border-brand-peach/40"
                    : "bg-white/5 border-white/5 hover:border-white/10"
                }`}
              >
                <div className="p-2 rounded-xl bg-white/5 text-sm shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs font-bold truncate ${!n.read ? "text-white" : "text-gray-300"}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-gray-500 shrink-0">{formatTime(n.createdAt)}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate(isCoach ? "/coach/notifications" : "/athlete/notifications")}
        className="flex items-center justify-center gap-2.5 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer relative z-10 w-full group/btn"
      >
        View All Notifications
        <FaArrowRight className="text-[10px] group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
