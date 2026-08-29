import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import {
  FaUsers,
  FaUserFriends,
  FaUserTie,
  FaUserShield,
  FaDumbbell,
  FaTrophy,
  FaShieldAlt,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAthletes: 0,
    totalCoaches: 0,
    totalAdmins: 0,
    totalTrainings: 0,
    totalAchievements: 0,
    totalAssignments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data || {});
    } catch (err) {
      setError(err.response?.data || "Failed to load platform statistics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium animate-pulse">Initializing Admin Governance Engine...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const athletePct = stats.totalUsers > 0 ? Math.round((stats.totalAthletes / stats.totalUsers) * 100) : 0;
  const coachPct = stats.totalUsers > 0 ? Math.round((stats.totalCoaches / stats.totalUsers) * 100) : 0;
  const adminPct = stats.totalUsers > 0 ? Math.round((stats.totalAdmins / stats.totalUsers) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-16 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          <div className="relative">
            <div className="absolute -left-10 -top-10 w-64 h-64 bg-red-500/10 blur-[90px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-3.5 mb-2">
              <div className="w-1.5 h-8 bg-brand-peach rounded-full"></div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight">
                Admin Console
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1.5">
                <FaShieldAlt /> System Owner
              </span>
            </div>
            <p className="text-gray-400 text-base font-medium ml-5">
              Welcome back, <span className="text-white font-bold">{storedUser.fullName || "Admin"}</span>. Platform governance system active.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/users"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-peach text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(238,155,116,0.3)] cursor-pointer"
            >
              <FaUsers />
              Manage Users
            </Link>
            <Link
              to="/admin/rosters"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all cursor-pointer"
            >
              <FaUserFriends />
              View Pairings
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Main KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="glass-card rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-brand-peach/30 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-peach/10 blur-3xl rounded-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Platform Accounts</span>
              <div className="p-3 bg-brand-peach/10 text-brand-peach rounded-2xl border border-brand-peach/20 text-xl">
                <FaUsers />
              </div>
            </div>
            <p className="text-4xl font-black text-white mt-4 tracking-tight">{stats.totalUsers}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">Registered Platform Users</p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Active Athletes</span>
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 text-xl">
                <FaUsers />
              </div>
            </div>
            <p className="text-4xl font-black text-white mt-4 tracking-tight">{stats.totalAthletes}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">{athletePct}% of total platform accounts</p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Certified Coaches</span>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 text-xl">
                <FaUserTie />
              </div>
            </div>
            <p className="text-4xl font-black text-white mt-4 tracking-tight">{stats.totalCoaches}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">{coachPct}% of total platform accounts</p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Roster Assignments</span>
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20 text-xl">
                <FaUserFriends />
              </div>
            </div>
            <p className="text-4xl font-black text-white mt-4 tracking-tight">{stats.totalAssignments}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">Active Coach ↔ Athlete Pairings</p>
          </div>

        </div>

        {/* User Distribution & Activity Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Platform Role Breakdown */}
          <div className="glass-card rounded-3xl p-7 border border-white/5 shadow-2xl space-y-6 lg:col-span-2 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white">Platform User Composition</h2>
                <p className="text-gray-400 text-xs mt-1">Role distribution across AthleteX</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-mono font-bold">
                {stats.totalUsers} Total Accounts
              </span>
            </div>

            <div className="space-y-5">
              {/* Athletes Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                    Athletes ({stats.totalAthletes})
                  </span>
                  <span className="text-gray-300">{athletePct}%</span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000"
                    style={{ width: `${athletePct}%` }}
                  ></div>
                </div>
              </div>

              {/* Coaches Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    Coaches ({stats.totalCoaches})
                  </span>
                  <span className="text-gray-300">{coachPct}%</span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                    style={{ width: `${coachPct}%` }}
                  ></div>
                </div>
              </div>

              {/* Admins Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                    Administrators ({stats.totalAdmins})
                  </span>
                  <span className="text-gray-300">{adminPct}%</span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-1000"
                    style={{ width: `${adminPct}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Sub-KPIs */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 text-lg">
                  <FaDumbbell />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Training Plans</p>
                  <p className="text-2xl font-black text-white">{stats.totalTrainings}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-yellow-400/10 text-yellow-400 text-lg">
                  <FaTrophy />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Achievements Logged</p>
                  <p className="text-2xl font-black text-white">{stats.totalAchievements}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Status & Security Card */}
          <div className="glass-card rounded-3xl p-7 border border-white/5 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <FaShieldAlt className="text-emerald-400" /> System Health
                </h2>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  HEALTHY
                </span>
              </div>

              <ul className="space-y-3.5 text-xs text-gray-300">
                <li className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-semibold">Stateless JWT Security</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <FaCheckCircle className="text-[10px]" /> ACTIVE
                  </span>
                </li>
                <li className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-semibold">MongoDB Database</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <FaCheckCircle className="text-[10px]" /> CONNECTED
                  </span>
                </li>
                <li className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-semibold">REST Controller Engine</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <FaCheckCircle className="text-[10px]" /> ONLINE
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-brand-peach/5 border border-brand-peach/10 space-y-2">
              <p className="text-xs font-bold text-brand-peach">Governance Quick Action</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                As an Admin, you can update user roles, toggle account access, or audit roster pairings.
              </p>
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-peach hover:underline pt-1"
              >
                Open User Directory <FaArrowRight className="text-[10px]" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
