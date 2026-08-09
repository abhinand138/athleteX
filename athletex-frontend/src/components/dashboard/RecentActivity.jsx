export default function RecentActivity() {
  const activities = [
    { icon: "🏃", text: "Performance updated", time: "2 hours ago" },
    { icon: "🏅", text: "Achievement unlocked", time: "Yesterday" },
    { icon: "👨‍🏫", text: "Coach reviewed your profile", time: "2 days ago" },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-peach/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />

      <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-6">
        Recent Activity
      </h2>

      <ul className="space-y-4">
        {activities.map((item, index) => (
          <li key={index} className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:bg-brand-peach/10 group-hover:border-brand-peach/30 transition-colors">
              {item.icon}
            </div>
            <div>
              <p className="text-gray-200 font-medium group-hover:text-white transition-colors">{item.text}</p>
              <p className="text-xs text-gray-500 font-mono tracking-wide">{item.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}