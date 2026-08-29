import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import ProfileHeader from "../components/profile/ProfileHeader";
import PersonalInfoCard from "../components/profile/PersonalInfoCard";
import BioCard from "../components/profile/BioCard";
import TalentPassportModal from "../components/profile/TalentPassportModal";
import { motion } from "framer-motion";
import { FiTrendingUp, FiCrosshair, FiStar, FiUsers, FiEye, FiTarget } from "react-icons/fi";
import { FaIdCard } from "react-icons/fa";

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
  const [showPassport, setShowPassport] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/users/profile/${user.id}`);
      setProfile(response.data);
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
            <h1 className="text-gray-400 font-medium animate-pulse">Loading Premium Profile...</h1>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Profile Header */}
        <ProfileHeader profile={profile} />

        {/* Career Overview & Passport Button */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="pt-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-8 bg-brand-peach rounded-full"></div>
              <h2 className="text-2xl font-bold text-white tracking-wide">Career Overview</h2>
            </div>
            <button
              onClick={() => setShowPassport(!showPassport)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-peach to-orange-500 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-95 shadow-lg shadow-brand-peach/20 transition-all self-start sm:self-auto"
            >
              <FaIdCard className="text-sm" />
              <span>Digital Talent Passport</span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Matches" value="84" icon={FiTarget} delay={0.1} />
            <StatCard title="Goals" value="32" icon={FiCrosshair} delay={0.2} />
            <StatCard title="Assists" value="18" icon={FiTrendingUp} delay={0.3} />
            <StatCard title="Rating" value="9.2" icon={FiStar} delay={0.4} />
            <StatCard title="Followers" value="1.2k" icon={FiUsers} delay={0.5} />
            <StatCard title="Scout Views" value="342" icon={FiEye} delay={0.6} />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 pt-6">
          <div className="lg:col-span-2">
            <PersonalInfoCard profile={profile} />
          </div>
          <div className="lg:col-span-1">
            <BioCard profile={profile} />
          </div>
        </div>
      </div>

      {/* Talent Passport Modal */}
      <TalentPassportModal
        isOpen={showPassport}
        onClose={() => setShowPassport(false)}
        athlete={profile}
        performance={{
          overallScore: 88,
          speed: 85,
          strength: 82,
          endurance: 90,
          agility: 84
        }}
      />
    </DashboardLayout>
  );
}