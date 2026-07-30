import { motion } from "framer-motion";


export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center pt-24 overflow-hidden bg-brand-dark grid-bg"
    >
      {/* Radial Glow Overlay */}
      <div className="absolute inset-0 radial-glow z-0 pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative max-w-5xl mx-auto px-6 md:px-12 flex flex-col items-center text-center z-10">
        
        {/* AthleteX Badge/Logo Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 p-3 w-16 h-16 bg-[#0c0c0e]/95 border border-white/10 hover:border-brand-peach/40 shadow-2xl rounded-lg flex items-center justify-center transition-all duration-300 group"
        >
          {/* Stylized X Icon */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Left Diagonal bar (Blue/Purple) */}
            <span className="absolute w-2 h-full bg-blue-500 rounded-sm transform rotate-45 translate-x-[-1px]" />
            {/* Right Diagonal bar (Peach) */}
            <span className="absolute w-2 h-full bg-brand-peach rounded-sm transform -rotate-45 translate-x-[1px]" />
            {/* Small center overlay to make it look interlocking */}
            <span className="absolute w-3 h-3 bg-[#0c0c0e] transform rotate-45 scale-75 group-hover:scale-50 transition-transform duration-300" />
            {/* Mini X text in center */}
            <span className="absolute text-[8px] font-sans font-black text-white">AX</span>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-7xl font-serif font-medium leading-[1.15] text-white tracking-wide"
        >
          ELEVATE YOUR GAME. <br />
          <span className="text-brand-peach">GET DISCOVERED.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 md:mt-8 text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl font-sans font-light leading-relaxed tracking-wide"
        >
          The most advanced recruitment platform connecting elite athletes with world-class scouts through verified data and performance analytics.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <a
            href="#register-athlete"
            className="px-8 py-4 bg-brand-peach hover:bg-brand-peach/90 text-brand-dark font-sans font-bold text-xs tracking-[0.2em] rounded-sm transition-all duration-300 hover:scale-[1.03] text-center"
          >
            SIGN UP AS ATHLETE
          </a>
          <a
            href="#register-scout"
            className="px-8 py-4 border border-white/20 hover:border-brand-peach text-white hover:text-brand-peach font-sans font-semibold text-xs tracking-[0.2em] rounded-sm transition-all duration-300 hover:bg-brand-peach/5 text-center"
          >
            JOIN AS SCOUT
          </a>
        </motion.div>

      </div>

      {/* Right Vertical Sidebar Text */}
      <div className="absolute right-6 md:right-10 bottom-24 hidden lg:block z-10 pointer-events-none">
        <div 
          className="text-[9px] font-sans font-bold tracking-[0.4em] text-gray-600 uppercase select-none"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          ESTABLISHED MMXXIV <span className="text-gray-700 mx-2">/</span> GLOBAL RECRUITMENT
        </div>
      </div>
    </section>
  );
}