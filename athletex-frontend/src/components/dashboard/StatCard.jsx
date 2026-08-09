import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  icon,
  color = "text-brand-peach",
}) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className="glass-card glass-card-hover rounded-2xl p-6 shadow-xl relative overflow-hidden group"
    >
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none radial-glow" />

      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-2">
            {title}
          </p>

          <h2 className="text-4xl font-extrabold text-white mt-1 drop-shadow-md">
            {value}
          </h2>
        </div>

        <div className={`text-4xl p-3 bg-white/5 rounded-xl ${color} shadow-inner`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}