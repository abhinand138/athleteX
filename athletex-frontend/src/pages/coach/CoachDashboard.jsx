import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { FaUsers, FaCalendarAlt, FaChartLine } from "react-icons/fa";

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-[0.03] transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
      <div className={`text-9xl ${color}`}>{icon}</div>
    </div>
    
    <div className="flex items-center gap-4 mb-4 relative z-10">
      <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${color} group-hover:bg-white/10 transition-colors`}>
        {icon}
      </div>
      <h3 className="text-gray-400 font-semibold tracking-wider uppercase text-xs">
        {title}
      </h3>
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

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        
        if (!storedUser) {
          setError("Session expired or missing. Please login again.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);

        if (!user || !user.id) {
          setError("Invalid user session. Please login again.");
          setLoading(false);
          return;
        }

        if (user.role !== "COACH") {
          setError("Access denied. You do not have coach permissions.");
          setLoading(false);
          return;
        }

        const response = await api.get(`/coach/dashboard/${user.id}`);
        setDashboard(response.data);
      } catch (err) {
        console.error("Failed to load coach dashboard:", err);
        setError(err.response?.data?.message || "Failed to load dashboard data. Please try again later.");
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
        
        {/* Header Section */}
        <div className="relative">
          <div className="absolute -left-10 -top-10 w-64 h-64 bg-brand-peach/10 blur-[80px] rounded-full pointer-events-none" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
            Welcome Coach, {dashboard.fullName || "User"} 👋
          </h1>
          <p className="text-gray-400 mt-3 text-lg font-medium">
            Manage your athletes and monitor their progress.
          </p>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Athletes"
            value={dashboard.totalAthletes || 0}
            icon={<FaUsers />}
            color="text-blue-500"
          />
          <StatCard
            title="Upcoming Training"
            value={dashboard.upcomingTraining || 0}
            icon={<FaCalendarAlt />}
            color="text-brand-peach"
          />
          <StatCard
            title="Average Performance"
            value={`${dashboard.averagePerformance || 0}%`}
            icon={<FaChartLine />}
            color="text-emerald-500"
          />
        </div>

        {/* Overview Info Section */}
        <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-1.5 h-8 bg-brand-peach rounded-full"></div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Coach Overview</h2>
          </div>
          
          <div className="relative z-10">
            <p className="text-gray-400 text-lg leading-relaxed max-w-3xl">
              You can manage your athletes, training sessions, and performance from the Coach workspace. 
              These modules will be fully unlocked in the upcoming project phase. Stay tuned as we build 
              powerful tools to help you take your team to the next level.
            </p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
