import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import RecentActivity from "../components/dashboard/RecentActivity";
import QuickActions from "../components/dashboard/QuickActions";
import {
  FaRunning,
  FaTrophy,
  FaEye,
  FaDumbbell,
} from "react-icons/fa";
import AthleteProfileCard from "../components/dashboard/AthleteProfileCard";
import UpcomingTraining from "../components/dashboard/UpcomingTraining";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-10 relative z-10">

        <div className="relative">
          <div className="absolute -left-10 -top-10 w-64 h-64 bg-brand-peach/10 blur-[80px] rounded-full pointer-events-none" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
            Welcome Back 👋
          </h1>
          <p className="text-gray-400 mt-3 text-lg font-medium">
            Track your performance and reach your next milestone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Performance"
            value="92%"
            icon={<FaRunning />}
            color="text-blue-500"
          />
          <StatCard
            title="Achievements"
            value="14"
            icon={<FaTrophy />}
            color="text-yellow-400"
          />
          <StatCard
            title="Scouts Viewed"
            value="28"
            icon={<FaEye />}
            color="text-green-500"
          />
          <StatCard
            title="Training Sessions"
            value="53"
            icon={<FaDumbbell />}
            color="text-brand-peach"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <RecentActivity />
          <AthleteProfileCard />
          <UpcomingTraining />
          <QuickActions />
        </div>

      </div>
    </DashboardLayout>
  );
}