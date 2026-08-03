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
      className="bg-[#111317] border border-white/5 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex justify-between items-center">

        <div>
          <p className="text-gray-400 text-sm">
            {title}
          </p>

          <h2 className="text-4xl font-bold text-white mt-3">
            {value}
          </h2>
        </div>

        <div className={`text-4xl ${color}`}>
          {icon}
        </div>

      </div>
    </motion.div>
  );
}