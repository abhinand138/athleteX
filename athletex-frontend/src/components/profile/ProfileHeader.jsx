import defaultProfileImg from "../../assets/images/profile.jpg";
import { FiMapPin, FiMail, FiEdit3 } from "react-icons/fi";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function ProfileHeader({ profile }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-[#161A20]/80 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl"
    >
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 h-40 bg-gradient-to-r from-brand-peach/20 via-brand-peach/5 to-transparent opacity-50 z-0"></div>
      
      <div className="relative z-10 p-8 pt-20 flex flex-col md:flex-row items-center md:items-end gap-8">
        
        <div className="relative group">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={profile.profileImage || defaultProfileImg}
            alt="Profile"
            className="w-40 h-40 rounded-full border-4 border-[#0F1115] shadow-xl object-cover ring-2 ring-brand-peach/50 bg-[#161A20]"
          />
        </div>

        <div className="flex-1 text-center md:text-left mb-2">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              {profile.fullName || "Athlete Name"}
            </h1>
            {profile.role && (
              <span className="px-3 py-1 bg-brand-peach/10 border border-brand-peach/20 text-brand-peach text-xs font-bold uppercase tracking-wider rounded-full self-center md:self-auto">
                {profile.role}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-400 font-medium">
            {profile.sport && profile.position && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-white/80">{profile.position} • {profile.sport}</span>
              </div>
            )}
            
            {(profile.city || profile.country) && (
              <div className="flex items-center gap-1.5">
                <FiMapPin className="text-brand-peach/70" />
                <span>{[profile.city, profile.country].filter(Boolean).join(", ")}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <FiMail className="text-brand-peach/70" />
              <span>{profile.email}</span>
            </div>
          </div>
        </div>

        <div className="mb-2">
          <Link
            to="/profile/edit"
            className="flex items-center gap-2 bg-white/5 hover:bg-brand-peach hover:text-[#0F1115] text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg border border-white/10 hover:border-brand-peach"
          >
            <FiEdit3 />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}