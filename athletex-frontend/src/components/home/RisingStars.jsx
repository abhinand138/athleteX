import { motion } from "framer-motion";

export default function RisingStars() {
  const athletes = [
    {
      name: "MARCUS VANCE",
      role: "QB / CLASS OF '25",
      image: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?q=80&w=600&auto=format&fit=crop",
      stats: [
        { label: "40 YD DASH", value: "4.42s" },
        { label: "VERTICAL", value: '38.5"' }
      ]
    },
    {
      name: "ELENA RODRIGUEZ",
      role: "SPRINTER / CLASS OF '24",
      image: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=600&auto=format&fit=crop",
      stats: [
        { label: "100M DASH", value: "11.08s" },
        { label: "REACTION TIME", value: "0.14s" }
      ]
    },
    {
      name: "JORDAN SMITH",
      role: "SF / CLASS OF '26",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop",
      stats: [
        { label: "HEIGHT", value: "6'7\"" },
        { label: "VERTICAL REACH", value: '32"' }
      ]
    },
    {
      name: "TYLER CHEN",
      role: "P / CLASS OF '25",
      image: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?q=80&w=600&auto=format&fit=crop",
      stats: [
        { label: "FASTBALL VELO", value: "94.5 MPH" },
        { label: "SPIN RATE", value: "2450 RPM" }
      ]
    }
  ];

  return (
    <section id="talent" className="py-24 bg-[#080809] px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <span className="text-[11px] font-sans font-bold tracking-[0.25em] text-brand-peach block mb-2">
              FEATURED PROSPECTS
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-white tracking-wide">
              RISING STARS
            </h2>
          </div>
          <a
            href="#all-talent"
            className="text-[11px] font-sans font-bold tracking-[0.2em] text-white hover:text-brand-peach transition-colors duration-300 underline underline-offset-8 decoration-white/20 hover:decoration-brand-peach uppercase"
          >
            VIEW ALL TALENT
          </a>
        </div>

        {/* Athlete Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {athletes.map((athlete, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group relative h-[450px] w-full bg-[#0c0c0e] rounded-sm overflow-hidden border border-white/5 hover:border-brand-peach/30 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-peach/5 flex flex-col justify-end"
            >
              {/* Athlete Background Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={athlete.image}
                  alt={athlete.name}
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 contrast-[1.05] brightness-[0.85] group-hover:brightness-[0.95] group-hover:scale-105 transition-all duration-700 ease-in-out"
                />
                {/* Linear Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
              </div>

              {/* Card Details Overlay */}
              <div className="relative z-10 p-6 flex flex-col w-full">
                
                {/* Positional Badge */}
                <div className="mb-3">
                  <span className="inline-block bg-brand-peach text-brand-dark font-sans font-bold text-[9px] tracking-[0.15em] px-2.5 py-1 rounded-[2px] uppercase">
                    {athlete.role}
                  </span>
                </div>

                {/* Athlete Name */}
                <h3 className="text-xl md:text-2xl font-serif text-white tracking-wide group-hover:text-brand-peach transition-colors duration-300">
                  {athlete.name}
                </h3>

                {/* Divider Line */}
                <div className="w-full h-[1px] bg-white/10 my-4 group-hover:bg-brand-peach/20 transition-colors duration-300" />

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-4">
                  {athlete.stats.map((stat, sIdx) => (
                    <div key={sIdx}>
                      <span className="block text-[8px] font-sans font-bold tracking-[0.15em] text-gray-500 uppercase">
                        {stat.label}
                      </span>
                      <span className="text-sm font-sans font-medium text-gray-300 group-hover:text-white transition-colors duration-300">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
