import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import RecentActivity from "../components/dashboard/RecentActivity";
import QuickActions from "../components/dashboard/QuickActions";
import AthleteProfileCard from "../components/dashboard/AthleteProfileCard";
import UpcomingTraining from "../components/dashboard/UpcomingTraining";

import {
  FaRunning,
  FaTrophy,
  FaEye,
  FaDumbbell,
} from "react-icons/fa";

import api from "../services/api";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      <div className="space-y-10 relative z-10">

        {/* ============================= */}
        {/* WELCOME SECTION */}
        {/* ============================= */}

        <div className="relative">

          <div className="absolute -left-10 -top-10 w-64 h-64 bg-brand-peach/10 blur-[80px] rounded-full pointer-events-none" />

          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
            Welcome Back, {dashboard.fullName || "Athlete"} 👋
          </h1>

          <p className="text-gray-400 mt-3 text-lg font-medium">
            Track your performance and reach your next milestone.
          </p>

        </div>

        {/* ============================= */}
        {/* STATISTICS */}
        {/* ============================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

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
            value={dashboard.scoutsViewed}
            icon={<FaEye />}
            color="text-green-500"
          />

          <StatCard
            title="Training Sessions"
            value={dashboard.trainingSessions}
            icon={<FaDumbbell />}
            color="text-brand-peach"
          />

        </div>

        {/* ============================= */}
        {/* DASHBOARD CONTENT */}
        {/* ============================= */}

        <div className="grid lg:grid-cols-2 gap-6">

         <RecentActivity
        activities={dashboard.recentActivities || []}
        />

          {/* Dynamic Athlete Profile */}
          <AthleteProfileCard
            user={dashboard}
          />

          <UpcomingTraining
            sessions={dashboard.upcomingTraining || []}
            onComplete={fetchDashboard}
          />

          <QuickActions />

        </div>

      </div>

    </DashboardLayout>
  );
}