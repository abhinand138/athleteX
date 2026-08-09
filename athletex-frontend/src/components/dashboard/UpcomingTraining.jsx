export default function UpcomingTraining() {
  const sessions = [
    { title: "Sprint Practice", time: "Today • 6:00 PM", category: "Speed" },
    { title: "Strength Training", time: "Tomorrow • 8:00 AM", category: "Power" }
  ];

  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-peach/5 blur-[40px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:bg-brand-peach/10 transition-colors duration-700" />

      <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-6 relative z-10">
        Upcoming Training
      </h2>

      <div className="space-y-4 relative z-10">
        {sessions.map((session, index) => (
          <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-brand-peach/30 transition-all cursor-pointer group/item">
            <div>
              <p className="text-white font-semibold group-hover/item:text-brand-peach transition-colors">
                {session.title}
              </p>
              <span className="text-xs text-gray-500 font-mono mt-1 block">
                {session.time}
              </span>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase bg-brand-peach/10 text-brand-peach px-2 py-1 rounded border border-brand-peach/20">
              {session.category}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}