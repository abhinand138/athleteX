import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import RecentActivity from "../components/dashboard/RecentActivity";
import QuickActions from "../components/dashboard/QuickActions";
import AthleteProfileCard from "../components/dashboard/AthleteProfileCard";
import UpcomingTraining from "../components/dashboard/UpcomingTraining";
import NotificationWidget from "../components/dashboard/NotificationWidget";
import MyCoachCard from "../components/dashboard/MyCoachCard";
import DailyReadinessWidget from "../components/dashboard/DailyReadinessWidget";
import GoalsTrackerWidget from "../components/dashboard/GoalsTrackerWidget";
import TalentPassportModal from "../components/profile/TalentPassportModal";

import {
  FaRunning,
  FaTrophy,
  FaEye,
  FaDumbbell,
  FaIdCard,
  FaBolt,
  FaArrowRight,
} from "react-icons/fa";

import api from "../services/api";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [fitnessProfile, setFitnessProfile] = useState(null);

  const fetchDashboard = async () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setError("User session not found. Please login again.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);

      if (!user?.id) {
        setError("User ID not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await api.get(
        `/dashboard/${user.id}`
      );

      console.log("Dashboard data:", response.data);

      setDashboard(response.data);

      try {
        const fitRes = await api.get(`/performance/${user.id}/fitness-profile`);
        setFitnessProfile(fitRes.data);
      } catch (e) {
        // Non-blocking
      }

    } catch (error) {
      console.error("Dashboard API Error:", error);

      setError(
        error.response?.data?.message ||
        "Unable to load dashboard."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* Loading State */
  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-brand-peach/20 border-t-brand-peach rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 mt-5">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* Error State */
  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="bg-[#111317] border border-red-500/20 rounded-2xl p-8 text-center max-w-md">
            <h2 className="text-xl font-bold text-white">
              Dashboard Unavailable
            </h2>
            <p className="text-gray-400 mt-3">
              {error}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* Safety Check */
  if (!dashboard) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 relative z-10 pb-10">
        {/* ============================= */}
        {/* WELCOME & PASSPORT BAR */}
        {/* ============================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          <div className="relative">
            <div className="absolute -left-10 -top-10 w-64 h-64 bg-brand-peach/10 blur-[80px] rounded-full pointer-events-none" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-tight">
              Welcome Back, {dashboard.fullName || "Athlete"} 👋
            </h1>
            <p className="text-gray-400 mt-1 text-sm font-medium">
              Track your performance, log training feedback, and achieve new milestones.
            </p>
          </div>

          <button
            onClick={() => setShowPassportModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-peach to-orange-500 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-95 shadow-xl shadow-brand-peach/20 transition-all self-start md:self-auto"
          >
            <FaIdCard className="text-base" />
            <span>Talent Passport</span>
          </button>
        </div>

        {/* ============================= */}
        {/* BANISTER MATCH FORM & CONDITIONING BANNER */}
        {/* ============================= */}
        {fitnessProfile && (
          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/5 bg-gradient-to-r from-black/50 via-brand-peach/5 to-black/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-peach/10 border border-brand-peach/30 flex items-center justify-center text-brand-peach text-xl shrink-0">
                <FaBolt />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Match Readiness & Conditioning
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-peach/20 text-brand-peach font-bold">
                    {fitnessProfile.fitnessTier?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-white">
                    {fitnessProfile.formBadge}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    (Form: {fitnessProfile.formScore > 0 ? `+${fitnessProfile.formScore}` : fitnessProfile.formScore})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-gray-400 block uppercase font-medium">5-Pillar Score</span>
                <span className="text-lg font-black text-brand-peach">
                  {fitnessProfile.overallFitnessScore}{" "}
                  <span className="text-xs text-gray-500 font-normal">/ 100</span>
                </span>
              </div>
              <a
                href="/performance"
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition flex items-center gap-1.5"
              >
                <span>View Radar Profile</span>
                <FaArrowRight className="text-[10px] text-brand-peach" />
              </a>
            </div>
          </div>
        )}

        {/* ============================= */}
        {/* MY COACH & READINESS ROW */}
        {/* ============================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MyCoachCard athleteId={dashboard.id} />
          <DailyReadinessWidget athleteId={dashboard.id} />
        </div>

        {/* ============================= */}
        {/* STATISTICS */}
        {/* ============================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Performance"
            value={`${dashboard.performance || 0}%`}
            icon={<FaRunning />}
            color="text-blue-500"
          />
          <StatCard
            title="Achievements"
            value={dashboard.achievements || 0}
            icon={<FaTrophy />}
            color="text-yellow-400"
          />
          <StatCard
            title="Scouts Viewed"
            value={dashboard.scoutsViewed || 0}
            icon={<FaEye />}
            color="text-green-500"
          />
          <StatCard
            title="Training Sessions"
            value={dashboard.trainingSessions || 0}
            icon={<FaDumbbell />}
            color="text-brand-peach"
          />
        </div>

        {/* ============================= */}
        {/* DASHBOARD CONTENT & GOALS */}
        {/* ============================= */}
        <div className="grid lg:grid-cols-2 gap-6">
          <UpcomingTraining
            sessions={dashboard.upcomingTraining || []}
            onComplete={fetchDashboard}
          />
          <GoalsTrackerWidget athleteId={dashboard.id} />
          <NotificationWidget />
          <RecentActivity
            activities={dashboard.recentActivities || []}
          />
          <AthleteProfileCard
            user={dashboard}
          />
          <QuickActions />
        </div>
      </div>

      {/* Talent Passport Modal */}
      <TalentPassportModal
        isOpen={showPassportModal}
        onClose={() => setShowPassportModal(false)}
        athlete={dashboard}
        performance={{
          overallScore: dashboard.performance || 78,
          speed: 82,
          strength: 76,
          endurance: 80,
          agility: 75
        }}
      />
    </DashboardLayout>
  );
}