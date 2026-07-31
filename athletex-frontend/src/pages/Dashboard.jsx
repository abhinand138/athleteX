import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import RecentActivity from "../components/dashboard/RecentActivity";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  return (
    <DashboardLayout>

      <div className="space-y-8">

        <div>
          <h1 className="text-4xl font-bold text-white">
            Welcome Back 👋
          </h1>

          <p className="text-gray-400 mt-2">
            Track your performance and reach your next milestone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          <StatCard title="Performance" value="92%" />

          <StatCard title="Achievements" value="14" />

          <StatCard title="Scouts Viewed" value="28" />

          <StatCard title="Training Sessions" value="53" />

        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          <RecentActivity />

          <QuickActions />

        </div>

      </div>

    </DashboardLayout>
  );
}