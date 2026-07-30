import { motion } from "framer-motion";

export default function PathToPro() {
  const steps = [
    {
      num: "01",
      title: "CREATE PROFILE",
      description: "Input your bio, academic standing, and physical dimensions. Build your digital athletic identity."
    },
    {
      num: "02",
      title: "SHOWCASE TALENT",
      description: "Upload verified game footage and laboratory-grade performance metrics tracked by our partners."
    },
    {
      num: "03",
      title: "GET NOTICED",
      description: "Our algorithm pushes your profile to verified scouts looking for your specific skill set."
    }
  ];

  return (
    <section className="py-24 bg-[#0c0c0e] border-y border-white/5 px-6 md:px-12 text-center relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 radial-glow z-0 pointer-events-none opacity-40" />

      <div className="relative max-w-7xl mx-auto z-10">
        
        {/* Header Block */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-white tracking-wide uppercase">
            THE PATH TO PRO
          </h2>
          <p className="mt-4 text-gray-400 font-sans font-light text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            A streamlined ecosystem designed to bridge the gap between amateur potential and professional opportunity.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-12 mt-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="flex flex-col items-center group"
            >
              {/* Boxed Number Badge */}
              <div className="w-16 h-16 border border-brand-peach/40 group-hover:border-brand-peach flex items-center justify-center text-brand-peach font-serif text-2xl mb-6 transition-all duration-300 transform group-hover:scale-105 shadow-[0_0_15px_rgba(238,155,116,0.02)] group-hover:shadow-[0_0_20px_rgba(238,155,116,0.1)] rounded-[2px]">
                {step.num}
              </div>

              {/* Step Title */}
              <h3 className="text-sm font-sans font-bold tracking-[0.2em] text-white mb-3 group-hover:text-brand-peach transition-colors duration-300">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="text-gray-400 font-sans font-light text-xs sm:text-sm leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
