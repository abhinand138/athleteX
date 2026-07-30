import { motion } from "framer-motion";

export default function FeatureCard({
  icon,
  title,
  description,
}) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-slate-800 rounded-2xl p-8 shadow-xl hover:shadow-blue-600/30 duration-300"
    >
      <div className="text-5xl text-blue-500 mb-5">
        {icon}
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">
        {title}
      </h2>

      <p className="text-gray-300">
        {description}
      </p>
    </motion.div>
  );
}