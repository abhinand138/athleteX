import { motion } from "framer-motion";
import { FiTrendingUp, FiShield, FiCheck } from "react-icons/fi";

export default function AnalyticsFeatures() {
  // Coordinates calculation for 5-sided Radar Chart
  // Center is (150, 150), Radius is 100
  const center = 150;
  const maxVal = 100;
  const radius = 100;
  const numSides = 5;

  // Pentagon points helper
  const getPentagonPoints = (r) => {
    const points = [];
    for (let i = 0; i < numSides; i++) {
      const angle = (i * 2 * Math.PI) / numSides - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  };

  // Athlete Stats (Speed, Strength, Endurance, Agility, Skill)
  // Let's use values: Speed=95, Strength=82, Endurance=90, Agility=85, Skill=76
  const athleteStats = [95, 82, 90, 85, 76];
  const getStatsPoints = () => {
    const points = [];
    for (let i = 0; i < numSides; i++) {
      const angle = (i * 2 * Math.PI) / numSides - Math.PI / 2;
      const r = (athleteStats[i] / maxVal) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  };

  // Axes lines helper
  const getAxes = () => {
    const lines = [];
    for (let i = 0; i < numSides; i++) {
      const angle = (i * 2 * Math.PI) / numSides - Math.PI / 2;
      const x2 = center + radius * Math.cos(angle);
      const y2 = center + radius * Math.sin(angle);
      lines.push({ x1: center, y1: center, x2, y2 });
    }
    return lines;
  };

  return (
    <section id="analytics" className="py-24 bg-[#080809] px-6 md:px-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 radial-glow z-0 pointer-events-none opacity-40" />

      <div className="relative max-w-7xl mx-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Column: Custom SVG Radar Chart */}
        <div className="lg:col-span-6 flex justify-center relative w-full max-w-[400px] md:max-w-[480px] mx-auto py-8">
          
          {/* Radar Chart Container */}
          <div className="relative w-[300px] h-[300px]">
            {/* SVG Elements */}
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {/* Concentric Pentagon Rings */}
              {[20, 40, 60, 80, 100].map((r) => (
                <polygon
                  key={r}
                  points={getPentagonPoints(r)}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                />
              ))}

              {/* Axis Lines */}
              {getAxes().map((line, idx) => (
                <line
                  key={idx}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              ))}

              {/* actual stats polygon */}
              <polygon
                points={getStatsPoints()}
                fill="rgba(238, 155, 116, 0.15)"
                stroke="#EE9B74"
                strokeWidth="2"
                className="transition-all duration-500 hover:fill-rgba(238, 155, 116, 0.25)"
              />

              {/* Vertex points dots */}
              {athleteStats.map((stat, idx) => {
                const angle = (idx * 2 * Math.PI) / numSides - Math.PI / 2;
                const r = (stat / maxVal) * radius;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#EE9B74"
                    stroke="#080809"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>

            {/* Float Badges linked to vertices */}
            {/* Badge 1: Top Left Speed */}
            <div className="absolute top-[-10px] left-[-30px] sm:left-[-60px] bg-[#0c0c0e]/90 border border-brand-peach/30 backdrop-blur-md px-3.5 py-1.5 rounded-sm flex items-center gap-2 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-peach animate-pulse" />
              <span className="text-[9px] font-sans font-bold tracking-wider text-gray-200">
                SPEED: 95th PERCENTILE
              </span>
            </div>

            {/* Badge 2: Bottom Right Gravity */}
            <div className="absolute bottom-[20px] right-[-30px] sm:right-[-60px] bg-[#0c0c0e]/90 border border-blue-500/30 backdrop-blur-md px-3.5 py-1.5 rounded-sm flex items-center gap-2 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-sans font-bold tracking-wider text-gray-200">
                GRAVITATIONAL: 92%
              </span>
            </div>
          </div>

        </div>

        {/* Right Column: Features List */}
        <div className="lg:col-span-6 flex flex-col gap-12">
          
          {/* Advanced Analytics */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex gap-5 items-start"
          >
            {/* Icon Column */}
            <div className="flex-shrink-0 w-12 h-12 bg-brand-peach/10 border border-brand-peach/30 text-brand-peach flex items-center justify-center rounded-sm">
              <FiTrendingUp className="text-xl" />
            </div>

            {/* Details Column */}
            <div>
              <h3 className="text-sm font-sans font-black tracking-[0.2em] text-white uppercase mb-3">
                ADVANCED ANALYTICS
              </h3>
              <p className="text-gray-400 font-sans font-light text-xs sm:text-sm leading-relaxed mb-4">
                We don't just track stats; we predict outcomes. Our proprietary AI analyzes biomechanics and in-game decision making to provide a "Prospect Pro" score that scouts trust.
              </p>

              {/* Checked bullets */}
              <div className="flex flex-col gap-2.5">
                {[
                  "BIOMETRIC SIGNATURE MAPPING",
                  "COMPARATIVE LEAGUE BENCHMARKING"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-4 h-4 bg-brand-peach/10 text-brand-peach border border-brand-peach/30 rounded-full flex items-center justify-center text-[10px]">
                      <FiCheck />
                    </span>
                    <span className="text-[9px] font-sans font-bold tracking-[0.15em] text-gray-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Verified Footage */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex gap-5 items-start"
          >
            {/* Icon Column */}
            <div className="flex-shrink-0 w-12 h-12 bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center rounded-sm">
              <FiShield className="text-xl" />
            </div>

            {/* Details Column */}
            <div>
              <h3 className="text-sm font-sans font-black tracking-[0.2em] text-white uppercase mb-3">
                VERIFIED FOOTAGE
              </h3>
              <p className="text-gray-400 font-sans font-light text-xs sm:text-sm leading-relaxed mb-4">
                No more grainy home videos. Every highlight on AthleteX is tagged, timestamped, and verified by our regional evaluation teams to ensure authenticity.
              </p>

              {/* Checked bullets */}
              <div className="flex flex-col gap-2.5">
                {[
                  "ANY 4K CAMERA PRO FOOTAGE APPROVED",
                  "FRAME-BY-FRAME GAIT METRICS REPORT"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-4 h-4 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full flex items-center justify-center text-[10px]">
                      <FiCheck />
                    </span>
                    <span className="text-[9px] font-sans font-bold tracking-[0.15em] text-gray-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
