import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import ProfileHeader from "../components/profile/ProfileHeader";
import PersonalInfoCard from "../components/profile/PersonalInfoCard";
import BioCard from "../components/profile/BioCard";
import TalentPassportModal from "../components/profile/TalentPassportModal";
import { motion } from "framer-motion";
import { FiTrendingUp, FiCrosshair, FiStar, FiUsers, FiEye, FiTarget, FiZap, FiAward, FiShield } from "react-icons/fi";
import { FaIdCard, FaDumbbell, FaTrophy, FaUserCheck } from "react-icons/fa";

const StatCard = ({ title, value, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-[#161A20]/80 backdrop-blur-md p-6 rounded-3xl border border-white/5 flex flex-col relative overflow-hidden group shadow-2xl"
  >
    <div className="absolute top-0 right-0 p-4 opacity-[0.03] transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
      <Icon size={120} className="text-white" />
    </div>
    
    <div className="flex items-center gap-3 mb-4 relative z-10">
      <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-brand-peach group-hover:bg-brand-peach/10 group-hover:border-brand-peach/20 transition-colors">
        <Icon size={20} />
      </div>
      <h3 className="text-gray-400 font-semibold tracking-wider uppercase text-xs">{title}</h3>
    </div>
    
    <div className="relative z-10 mt-auto">
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  </motion.div>
);

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [assignedCoach, setAssignedCoach] = useState(null);
  const [scoutViewsCount, setScoutViewsCount] = useState(42);
  const [showPassport, setShowPassport] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
    }
  }, []);

  const fetchProfileData = async () => {
    try {
      const [profileRes, perfRes, achRes, coachRes] = await Promise.all([
        api.get(`/users/profile/${user.id}`).catch(() => ({ data: user })),
        api.get(`/performance/${user.id}`).catch(() => ({ data: null })),
        api.get(`/achievements/athlete/${user.id}`).catch(() => ({ data: [] })),
        api.get(`/coach/assignments/athlete/${user.id}/coach-details`).catch(() => ({ data: null }))
      ]);

      setProfile(profileRes.data || user);
      setPerformance(perfRes.data);
      setAchievements(achRes.data || []);
      setAssignedCoach(coachRes.data);
    } catch (error) {
      console.error("Failed to load full profile:", error);
    }
  };

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
            <h1 className="text-gray-400 font-medium animate-pulse">Loading Dynamic Profile...</h1>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Dynamic Sport-Specific Metric Determination
  const sport = profile.sport || "Track & Field";
  const sportLower = sport.toLowerCase();
  
  const overallScore = performance?.overallScore || 86;
  const verifiedCount = achievements.filter(a => a.isVerified).length;
  const totalAchievements = achievements.length;

  let dynamicMetrics = [];

  if (sportLower.includes("sprint") || sportLower.includes("track") || sportLower.includes("run")) {
    dynamicMetrics = [
      { title: "Athletic Score", value: `${overallScore}`, icon: FiStar, delay: 0.1 },
      { title: "Top Speed", value: `${performance?.speed ? (performance.speed * 0.41).toFixed(1) : "34.5"} km/h`, icon: FiZap, delay: 0.2 },
      { title: "Verified Badges", value: `${verifiedCount}`, icon: FiShield, delay: 0.3 },
      { title: "Milestones", value: `${totalAchievements}`, icon: FiAward, delay: 0.4 },
      { title: "Scout Views", value: `${scoutViewsCount}`, icon: FiEye, delay: 0.5 },
      { title: "Agility Index", value: `${performance?.agility || 88}`, icon: FiTarget, delay: 0.6 }
    ];
  } else if (sportLower.includes("football") || sportLower.includes("soccer")) {
    dynamicMetrics = [
      { title: "Player Rating", value: `${overallScore}`, icon: FiStar, delay: 0.1 },
      { title: "Pace Rating", value: `${performance?.speed || 88}`, icon: FiZap, delay: 0.2 },
      { title: "Physicality", value: `${performance?.strength || 82}`, icon: FiCrosshair, delay: 0.3 },
      { title: "Verified Trophies", value: `${verifiedCount}`, icon: FiAward, delay: 0.4 },
      { title: "Scout Views", value: `${scoutViewsCount}`, icon: FiEye, delay: 0.5 },
      { title: "Stamina Index", value: `${performance?.endurance || 89}`, icon: FiTrendingUp, delay: 0.6 }
    ];
  } else if (sportLower.includes("weight") || sportLower.includes("power") || sportLower.includes("gym")) {
    dynamicMetrics = [
      { title: "Strength Index", value: `${performance?.strength || 92}`, icon: FiStar, delay: 0.1 },
      { title: "Peak Wattage", value: `${overallScore * 12} W`, icon: FiZap, delay: 0.2 },
      { title: "Verified Records", value: `${verifiedCount}`, icon: FiShield, delay: 0.3 },
      { title: "Milestones", value: `${totalAchievements}`, icon: FiAward, delay: 0.4 },
      { title: "Scout Views", value: `${scoutViewsCount}`, icon: FiEye, delay: 0.5 },
      { title: "Stamina Score", value: `${performance?.endurance || 79}`, icon: FiTrendingUp, delay: 0.6 }
    ];
  } else {
    dynamicMetrics = [
      { title: "Overall Rating", value: `${overallScore}`, icon: FiStar, delay: 0.1 },
      { title: "Speed Score", value: `${performance?.speed || 85}`, icon: FiZap, delay: 0.2 },
      { title: "Strength Score", value: `${performance?.strength || 82}`, icon: FiCrosshair, delay: 0.3 },
      { title: "Verified Badges", value: `${verifiedCount}`, icon: FiShield, delay: 0.4 },
      { title: "Scout Views", value: `${scoutViewsCount}`, icon: FiEye, delay: 0.5 },
      { title: "Agility Score", value: `${performance?.agility || 84}`, icon: FiTarget, delay: 0.6 }
    ];
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Profile Header */}
        <ProfileHeader profile={profile} />

        {/* Dynamic Career Overview & Talent Passport */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="pt-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-8 bg-brand-peach rounded-full"></div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-wide">Dynamic Career Overview</h2>
                <p className="text-xs text-gray-400">Sport-tailored performance telemetry for {sport}</p>
              </div>
            </div>
            <button
              onClick={() => setShowPassport(!showPassport)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-peach to-orange-500 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-95 shadow-lg shadow-brand-peach/20 transition-all self-start sm:self-auto"
            >
              <FaIdCard className="text-sm" />
              <span>Digital Talent Passport</span>
            </button>
          </div>
          
          {/* Dynamic Metric Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {dynamicMetrics.map((item, idx) => (
              <StatCard key={idx} title={item.title} value={item.value} icon={item.icon} delay={item.delay} />
            ))}
          </div>
        </motion.div>

        {/* Main Info Cards & Assigned Coach Card */}
        <div className="grid lg:grid-cols-3 gap-8 pt-6">
          <div className="lg:col-span-2 space-y-8">
            <PersonalInfoCard profile={profile} />

            {/* Assigned Coach Profile Card */}
            {assignedCoach && (
              <div className="bg-[#161A20]/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
                      <FaUserCheck className="text-lg" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Assigned Coach</h3>
                      <p className="text-xs text-gray-400">Official Roster Supervisor</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                    Active Coach
                  </span>
                </div>

                <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-lg">
                    {assignedCoach.fullName?.charAt(0) || "C"}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white">{assignedCoach.fullName}</h4>
                    <p className="text-xs text-gray-400">{assignedCoach.specialization || "Head Athletics Coach"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-8">
            <BioCard profile={profile} />

            {/* Verified Achievements Showcase */}
            <div className="bg-[#161A20]/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-brand-peach/20 text-brand-peach">
                  <FaTrophy className="text-lg" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Verified Trophies</h3>
                  <p className="text-xs text-gray-400">{achievements.length} Achievements Logged</p>
                </div>
              </div>

              {achievements.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No verified achievements logged yet.</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                  {achievements.slice(0, 4).map((ach) => (
                    <div key={ach.id} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">{ach.title}</p>
                        <p className="text-[10px] text-gray-400">{ach.level || "Regional"}</p>
                      </div>
                      {ach.isVerified && (
                        <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Verified
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Talent Passport Modal */}
      <TalentPassportModal
        isOpen={showPassport}
        onClose={() => setShowPassport(false)}
        athlete={profile}
        performance={{
          overallScore: performance?.overallScore || 88,
          speed: performance?.speed || 85,
          strength: performance?.strength || 82,
          endurance: performance?.endurance || 90,
          agility: performance?.agility || 84
        }}
      />
    </DashboardLayout>
  );
}