import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { FaUsers, FaCalendarAlt, FaChartLine, FaUserFriends, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-[0.03] transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
      <div className={`text-9xl ${color}`}>{icon}</div>
    </div>
    <div className="flex items-center gap-4 mb-4 relative z-10">
      <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${color} group-hover:bg-white/10 transition-colors`}>
        {icon}
      </div>
      <h3 className="text-gray-400 font-semibold tracking-wider uppercase text-xs">{title}</h3>
    </div>
    <div className="relative z-10">
      <p className="text-4xl font-black text-white">{value}</p>
    </div>
  </div>
);

export default function CoachDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) { setError("Session expired. Please login again."); setLoading(false); return; }
        const user = JSON.parse(storedUser);
        if (!user?.id) { setError("Invalid session. Please login again."); setLoading(false); return; }
        if (user.role !== "COACH") { setError("Access denied. Not a coach."); setLoading(false); return; }
        const response = await api.get(`/coach/dashboard/${user.id}`);
        setDashboard(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
            <h1 className="text-gray-400 font-medium animate-pulse">Loading your coach dashboard...</h1>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !dashboard) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="glass-card rounded-2xl p-8 border border-red-500/20 text-center max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <h2 className="text-xl font-bold text-white mb-3">Access Error</h2>
            <p className="text-gray-400">{error || "An unknown error occurred."}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10 pb-12 relative z-10">

        {/* Header */}
        <div className="relative">
          <div className="absolute -left-10 -top-10 w-64 h-64 bg-brand-peach/10 blur-[80px] rounded-full pointer-events-none" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
            Welcome Coach, {dashboard.fullName || "User"} 👋
          </h1>
          <p className="text-gray-400 mt-3 text-lg font-medium">
            Manage your athletes and monitor their progress.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Athletes" value={dashboard.totalAthletes || 0} icon={<FaUsers />} color="text-blue-500" />
          <StatCard title="Upcoming Training" value={dashboard.upcomingTraining || 0} icon={<FaCalendarAlt />} color="text-brand-peach" />
          <StatCard title="Average Performance" value={`${dashboard.averagePerformance || 0}%`} icon={<FaChartLine />} color="text-emerald-500" />
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* My Athletes */}
          <div className="glass-card rounded-3xl p-7 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute right-0 top-0 w-64 h-64 bg-brand-peach/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-brand-peach/10 transition-colors" />
            <div className="flex items-center gap-4 relative z-10 mb-6">
              <div className="p-3.5 rounded-2xl bg-brand-peach/10 border border-brand-peach/20 text-brand-peach text-2xl shrink-0">
                <FaUserFriends />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white truncate">My Athletes</h2>
                <p className="text-gray-400 text-xs mt-0.5">View & manage roster</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/coach/athletes")}
              className="flex items-center justify-center gap-2.5 px-5 py-2.5 bg-brand-peach text-black font-bold text-xs rounded-xl hover:bg-brand-peach/90 transition-all cursor-pointer relative z-10 group"
            >
              View Athletes
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Performance Analytics Preview */}
          <div className="glass-card rounded-3xl p-7 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
            <div className="flex items-center gap-4 relative z-10 mb-6">
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-2xl shrink-0">
                <FaChartLine />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white truncate">Analytics</h2>
                <p className="text-gray-400 text-xs mt-0.5">Progression & insights</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/coach/analytics")}
              className="flex items-center justify-center gap-2.5 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer relative z-10 group"
            >
              View Analytics
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Performance Reports Preview */}
          <div className="glass-card rounded-3xl p-7 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
            <div className="flex items-center gap-4 relative z-10 mb-6">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-2xl shrink-0">
                <FaCalendarAlt />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white truncate">Reports</h2>
                <p className="text-gray-400 text-xs mt-0.5">Export PDF & CSV</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/coach/reports")}
              className="flex items-center justify-center gap-2.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer relative z-10 group"
            >
              Generate Reports
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Coach Overview */}
        <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-1.5 h-8 bg-brand-peach rounded-full"></div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Coach Intelligence Hub</h2>
          </div>
          <div className="relative z-10">
            <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
              Monitor your assigned athletes, schedule custom training sessions, recognize milestones with achievements, and leverage high-fidelity analytics to optimize athletic performance across your roster.
            </p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
