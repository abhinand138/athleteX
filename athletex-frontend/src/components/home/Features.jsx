import {
  FaRunning,
  FaRobot,
  FaChartLine,
  FaUsers,
  FaTrophy,
  FaShieldAlt,
} from "react-icons/fa";

import FeatureCard from "./FeatureCard";

export default function Features() {
  return (
    <section
      id="features"
      className="bg-slate-950 py-24 px-8"
    >
      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl text-center font-bold text-white">
          Platform Features
        </h1>

        <p className="text-center text-gray-400 mt-5 mb-16">
          Everything an athlete, coach and academy needs in one platform.
        </p>

        <div className="grid md:grid-cols-3 gap-8">

          <FeatureCard
            icon={<FaRunning />}
            title="Athlete Profile"
            description="Create a professional athlete profile with achievements, certificates and performance."
          />

          <FeatureCard
            icon={<FaRobot />}
            title="AI Analysis"
            description="Receive AI-powered recommendations to improve training and performance."
          />

          <FeatureCard
            icon={<FaChartLine />}
            title="Performance Tracking"
            description="Track match statistics and monitor growth over time."
          />

          <FeatureCard
            icon={<FaUsers />}
            title="Coach Dashboard"
            description="Manage athletes, evaluate performances and assign training plans."
          />

          <FeatureCard
            icon={<FaTrophy />}
            title="Talent Discovery"
            description="Enable recruiters to identify promising athletes using performance data."
          />

          <FeatureCard
            icon={<FaShieldAlt />}
            title="Secure Platform"
            description="JWT authentication with role-based access for secure management."
          />

        </div>

      </div>
    </section>
  );
}