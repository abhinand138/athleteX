import { motion } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";

export default function BioCard({ profile }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[#161A20]/80 backdrop-blur-md rounded-3xl border border-white/5 p-8 md:p-10 shadow-2xl relative overflow-hidden h-full flex flex-col"
    >
      <FaQuoteLeft className="absolute top-8 right-8 text-white/5 text-6xl" />
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-1.5 h-8 bg-brand-peach rounded-full"></div>
        <h2 className="text-2xl font-bold text-white tracking-wide">
          Athlete Bio
        </h2>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center">
        {profile.bio ? (
          <p className="text-gray-300 leading-relaxed text-lg font-medium italic">
            "{profile.bio}"
          </p>
        ) : (
          <div className="py-8 text-center bg-[#0F1115]/50 rounded-2xl border border-dashed border-white/10">
            <p className="text-gray-500 italic">No athlete bio added yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}