import { useNavigate } from "react-router-dom";

export default function QuickActions() {

  const navigate = useNavigate();

  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">

      <div className="absolute top-0 left-0 w-32 h-32 bg-brand-peach/5 blur-[40px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:bg-brand-peach/10 transition-colors duration-700" />

      <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-6 relative z-10">
        Quick Actions
      </h2>

      <div className="flex flex-col gap-4 relative z-10">

        {/* Update Profile */}
        <button
          onClick={() => navigate("/profile")}
          className="relative w-full bg-brand-peach text-black py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs overflow-hidden group/btn shadow-[0_0_15px_rgba(238,155,116,0.3)] hover:shadow-[0_0_25px_rgba(238,155,116,0.5)] transition-shadow"
        >
          <span className="relative z-10">
            Update Profile
          </span>

          <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover/btn:scale-x-100 transform origin-left transition-transform duration-300 ease-out" />
        </button>


        {/* View Performance */}
        <button
          onClick={() => navigate("/performance")}
          className="w-full bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-inner"
        >
          View Performance
        </button>


        {/* Training Schedule */}
        <button
          onClick={() => navigate("/training")}
          className="w-full bg-white/5 border border-white/10 hover:border-green-500/50 hover:bg-green-500/10 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-inner"
        >
          Training Schedule
        </button>

      </div>

    </div>
  );
}