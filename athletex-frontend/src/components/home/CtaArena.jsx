import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function CtaArena() {
  const scoutsAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=100&auto=format&fit=crop"
  ];

  return (
    <section className="bg-brand-peach py-20 px-6 md:px-12 text-[#080809] text-center relative overflow-hidden">
      {/* Decorative radial glows */}
      <div className="absolute inset-0 bg-radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%) pointer-events-none" />

      <div className="relative max-w-4xl mx-auto z-10 flex flex-col items-center">
        
        {/* Main Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium tracking-wide uppercase leading-tight"
        >
          READY TO ENTER THE ARENA?
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-4 text-[10px] sm:text-xs md:text-sm font-sans font-bold tracking-[0.2em] text-[#080809]/80 uppercase max-w-xl leading-relaxed"
        >
          THE NEXT GENERATION OF ELITE SPORTS RECRUITMENT STARTS HERE
        </motion.p>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
         <Link
         to="/login"
         className="px-10 py-4 bg-[#080809] hover:bg-[#080809]/90 text-white font-sans font-bold text-xs tracking-[0.25em] rounded-sm transition-all duration-300 hover:scale-105 inline-block shadow-xl"
         >
        GET STARTED
        </Link>
        </motion.div>

        {/* Avatars group + Scout info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center"
        >
          {/* Overlapping Circles */}
          <div className="flex -space-x-3.5">
            {scoutsAvatars.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Scout avatar ${idx + 1}`}
                className="w-8 h-8 rounded-full border-2 border-brand-peach object-cover shadow-md"
              />
            ))}
          </div>
          {/* Text */}
          <span className="text-[10px] font-sans font-bold tracking-widest text-[#080809]/95 uppercase">
            JOINED BY 450+ SCOUTS THIS WEEK
          </span>
        </motion.div>

      </div>
    </section>
  );
}
