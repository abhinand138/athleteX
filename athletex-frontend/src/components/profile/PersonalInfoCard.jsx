import { motion } from "framer-motion";
import { FiPhone, FiTarget, FiActivity, FiCalendar, FiUser, FiMaximize2, FiMapPin, FiGlobe, FiMap } from "react-icons/fi";
import { FaWeightHanging } from "react-icons/fa";

export default function PersonalInfoCard({ profile }) {
  const infoItems = [
    { title: "Phone", value: profile.phone, icon: FiPhone },
    { title: "Sport", value: profile.sport, icon: FiTarget },
    { title: "Position", value: profile.position, icon: FiActivity },
    { title: "Age", value: profile.age ? `${profile.age} yrs` : "", icon: FiCalendar },
    { title: "Gender", value: profile.gender, icon: FiUser },
    { title: "Height", value: profile.height, icon: FiMaximize2 },
    { title: "Weight", value: profile.weight, icon: FaWeightHanging },
    { title: "City", value: profile.city, icon: FiMapPin },
    { title: "State", value: profile.state, icon: FiMap },
    { title: "Country", value: profile.country, icon: FiGlobe },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-[#161A20]/80 backdrop-blur-md rounded-3xl border border-white/5 p-8 shadow-2xl relative overflow-hidden h-full"
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-peach/5 rounded-full blur-[80px] -z-10"></div>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-1.5 h-8 bg-brand-peach rounded-full"></div>
        <h2 className="text-2xl font-bold text-white tracking-wide">
          Personal Information
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {infoItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div 
              key={index}
              whileHover={{ scale: 1.02, y: -2 }}
              className="group bg-[#0F1115]/50 p-5 rounded-2xl border border-white/5 hover:border-brand-peach/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/5 group-hover:bg-brand-peach/10 rounded-lg transition-colors">
                  <Icon className="text-gray-400 group-hover:text-brand-peach text-lg transition-colors" />
                </div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  {item.title}
                </p>
              </div>
              <h3 className="text-white font-bold text-lg px-1 truncate">
                {item.value || <span className="text-gray-600 font-normal">Not set</span>}
              </h3>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}