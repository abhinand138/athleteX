import profile from "../../assets/images/profile.jpg";

export default function AthleteProfileCard({ user }) {

  console.log("AthleteProfileCard user:", user);

  return (
    <div className="glass-card rounded-2xl p-8 shadow-xl relative overflow-hidden group">

      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-peach/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-brand-peach/10 transition-colors duration-500" />

      <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-6 relative z-10">
        Athlete Profile
      </h2>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">

        {/* Profile Image */}
        <div className="relative">

          <div className="absolute -inset-1 bg-gradient-to-r from-brand-peach to-transparent rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

          <img
            src={user?.profileImage || profile}
            alt={user?.fullName || "Profile"}
            className="relative w-24 h-24 rounded-full border border-white/10 object-cover shadow-2xl"
          />

        </div>

        {/* User Information */}
        <div className="text-center sm:text-left">

          <h2 className="text-white text-2xl font-extrabold tracking-tight mb-1">
            {user?.fullName || "Loading..."}
          </h2>

          <p className="text-gray-400 font-medium mb-3">
            {user?.email || "Loading..."}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">

            <span className="px-4 py-1.5 rounded-full bg-brand-peach/10 border border-brand-peach/20 text-brand-peach text-xs font-bold uppercase tracking-wider shadow-inner">
              {user?.role || "ATHLETE"}
            </span>

            <span className="text-gray-500 text-sm font-mono flex items-center gap-2">

              <span className="w-1.5 h-1.5 rounded-full bg-brand-peach"></span>

              {user?.phone || "Loading..."}

            </span>

          </div>

        </div>

      </div>

    </div>
  );
}