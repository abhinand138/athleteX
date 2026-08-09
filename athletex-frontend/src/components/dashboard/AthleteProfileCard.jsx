import profile from "../../assets/images/profile.jpg";

export default function AthleteProfileCard({ user }) {
  return (
    <div className="glass-card rounded-2xl p-8 shadow-xl relative overflow-hidden group">
      
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-peach/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-brand-peach/10 transition-colors duration-500" />

      <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-6 relative z-10">
        Athlete Profile
      </h2>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-peach to-transparent rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
          <img
            src={profile}
            alt="Profile"
            className="relative w-24 h-24 rounded-full border border-white/10 object-cover shadow-2xl"
          />
        </div>

        <div className="text-center sm:text-left">
          <h2 className="text-white text-2xl font-extrabold tracking-tight mb-1">
            {user?.fullName || "Elite Athlete"}
          </h2>

          <p className="text-gray-400 font-medium mb-3">
            {user?.email || "athlete@example.com"}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
            <span className="px-4 py-1.5 rounded-full bg-brand-peach/10 border border-brand-peach/20 text-brand-peach text-xs font-bold uppercase tracking-wider shadow-inner">
              {user?.role || "Athlete"}
            </span>
            <span className="text-gray-500 text-sm font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-peach"></span>
              {user?.phone || "+1 (555) 123-4567"}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}