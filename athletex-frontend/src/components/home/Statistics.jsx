export default function Statistics() {
  const metrics = [
    { value: "250+", label: "ACTIVE SCOUTS" },
    { value: "40K+", label: "PRO SCOUTINGS" },
    { value: "99%", label: "PLACEMENT RATE" },
    { value: "2.1M", label: "METRIC POINTS VERIFIED" },
  ];

  return (
    <section className="bg-brand-dark/95 border-y border-white/5 py-8 md:py-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row flex-wrap items-center justify-between gap-6 md:gap-4 text-center">
          {metrics.map((metric, idx) => (
            <div key={idx} className="flex items-center w-full md:w-auto justify-center">
              <div className="flex items-baseline md:items-center gap-3">
                <span className="text-xl md:text-2xl font-sans font-bold text-brand-peach">
                  {metric.value}
                </span>
                <span className="text-[10px] md:text-[11px] font-sans font-bold tracking-[0.2em] text-gray-400">
                  {metric.label}
                </span>
              </div>
              
              {/* Divider slash shown after each item except the last one (on desktop) */}
              {idx < metrics.length - 1 && (
                <span className="hidden md:inline-block ml-8 lg:ml-16 text-brand-peach/30 font-sans font-light text-sm select-none">
                  /
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}