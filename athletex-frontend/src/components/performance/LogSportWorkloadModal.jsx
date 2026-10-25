import { useState } from "react";
import {
  FaTimes,
  FaBolt,
  FaFire,
  FaRunning,
  FaShieldAlt,
  FaCheck,
  FaCalendarAlt
} from "react-icons/fa";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function LogSportWorkloadModal({
  isOpen,
  onClose,
  userId,
  initialSport = "CRICKET",
  onSuccess
}) {
  const [sport, setSport] = useState(initialSport);
  const [sessionType, setSessionType] = useState("MATCH");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [rpe, setRpe] = useState(7);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Cricket fast bowling fields
  const [matchOvers, setMatchOvers] = useState("");
  const [practiceOvers, setPracticeOvers] = useState("");
  const [bowlingSpeedKmh, setBowlingSpeedKmh] = useState("");

  // Football GPS fields
  const [totalDistanceKm, setTotalDistanceKm] = useState("");
  const [highSpeedRunningMeters, setHighSpeedRunningMeters] = useState("");
  const [sprintDistanceMeters, setSprintDistanceMeters] = useState("");
  const [maxVelocityKmh, setMaxVelocityKmh] = useState("");
  const [accelerationsCount, setAccelerationsCount] = useState("");
  const [minutesPlayed, setMinutesPlayed] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error("User session missing.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        sport,
        date,
        sessionType,
        rpe: Number(rpe) || 7,
        notes: notes.trim()
      };

      if (sport === "CRICKET") {
        const mOvers = parseFloat(matchOvers) || 0;
        const pOvers = parseFloat(practiceOvers) || 0;
        if (mOvers === 0 && pOvers === 0) {
          toast.error("Please enter at least match overs or practice overs bowled.");
          setSubmitting(false);
          return;
        }
        payload.matchOvers = mOvers;
        payload.practiceOvers = pOvers;
        if (bowlingSpeedKmh) payload.bowlingSpeedKmh = parseFloat(bowlingSpeedKmh);
      } else {
        if (!totalDistanceKm && !minutesPlayed) {
          toast.error("Please enter total distance (km) or minutes played.");
          setSubmitting(false);
          return;
        }
        if (totalDistanceKm) payload.totalDistanceKm = parseFloat(totalDistanceKm);
        if (highSpeedRunningMeters) payload.highSpeedRunningMeters = parseFloat(highSpeedRunningMeters);
        if (sprintDistanceMeters) payload.sprintDistanceMeters = parseFloat(sprintDistanceMeters);
        if (maxVelocityKmh) payload.maxVelocityKmh = parseFloat(maxVelocityKmh);
        if (accelerationsCount) payload.accelerationsCount = parseInt(accelerationsCount, 10);
        if (minutesPlayed) payload.minutesPlayed = parseInt(minutesPlayed, 10);
      }

      await api.post(`/sports/workload/${userId}`, payload);

      toast.success(
        sport === "CRICKET"
          ? "🏏 Bowling spell logged & lumbar bone stress updated!"
          : "⚽ Match GPS session logged & sprint exposure updated!",
        { icon: "⚡", duration: 4500 }
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to log sport workload:", err);
      toast.error(err.response?.data?.message || "Failed to log sport workload.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-peach/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-peach animate-pulse" />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-peach">
                Sport-Specific Workload Hub
              </p>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {sport === "CRICKET" ? "Log Cricket Bowling Spell" : "Log Football Match & GPS"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <FaTimes />
          </button>
        </div>

        {/* Sport Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 mt-5 p-1 bg-black/40 rounded-2xl border border-white/5 relative z-10">
          <button
            type="button"
            onClick={() => setSport("CRICKET")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              sport === "CRICKET"
                ? "bg-brand-peach text-black shadow-lg shadow-brand-peach/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span>🏏 Cricket Fast Bowling</span>
          </button>
          <button
            type="button"
            onClick={() => setSport("FOOTBALL")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              sport === "FOOTBALL"
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span>⚽ Football / GPS Hub</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-5 relative z-10">
          {/* Date & Session Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FaCalendarAlt className="text-brand-peach text-xs" />
                <span>Session Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-brand-peach focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Session Type
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-brand-peach focus:outline-none"
              >
                <option value="MATCH">Official Match</option>
                <option value="NETS">Nets / Practice</option>
                <option value="TRAINING">High-Intensity Training</option>
                <option value="RECOVERY">Deload / Recovery</option>
              </select>
            </div>
          </div>

          {/* CRICKET FIELDS */}
          {sport === "CRICKET" && (
            <div className="bg-amber-500/5 rounded-2xl p-4 border border-amber-500/20 space-y-3.5">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-amber-400 text-sm" />
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Lumbar Pars Stress Fracture Safeguard Inputs
                </h4>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Cricket Australia & ECB research proves logging daily match and practice overs calculates the rolling 7:28 ACWR to prevent lower back bone stress fractures.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                    Match Overs
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 10.0"
                    value={matchOvers}
                    onChange={(e) => setMatchOvers(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">Full run-up match</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                    Practice / Net Overs
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 6.0"
                    value={practiceOvers}
                    onChange={(e) => setPracticeOvers(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">Net bowling volume</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                    Peak Speed (km/h)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="60"
                    max="170"
                    placeholder="e.g. 138.5"
                    value={bowlingSpeedKmh}
                    onChange={(e) => setBowlingSpeedKmh(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">Radar / Speedgun</span>
                </div>
              </div>
            </div>
          )}

          {/* FOOTBALL FIELDS */}
          {sport === "FOOTBALL" && (
            <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/20 space-y-3.5">
              <div className="flex items-center gap-2">
                <FaRunning className="text-emerald-400 text-sm" />
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  GPS Wearables & Match Intensity Metrics
                </h4>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Log match data from Catapult, STATSports, Apple Watch, or manual pitch tracking to verify High-Speed Running (HSR &gt; 19.8 km/h) and sprint velocity exposures.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                    Total Distance (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 10.4"
                    value={totalDistanceKm}
                    onChange={(e) => setTotalDistanceKm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                    High Speed Running (m)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 750"
                    value={highSpeedRunningMeters}
                    onChange={(e) => setHighSpeedRunningMeters(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-emerald-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">&gt; 19.8 km/h</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                    Sprint Distance (m)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 280"
                    value={sprintDistanceMeters}
                    onChange={(e) => setSprintDistanceMeters(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-emerald-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">&gt; 25.2 km/h</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                    Peak Velocity (km/h)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 33.2"
                    value={maxVelocityKmh}
                    onChange={(e) => setMaxVelocityKmh(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                    Accelerations (&gt;3m/s²)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 42"
                    value={accelerationsCount}
                    onChange={(e) => setAccelerationsCount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                    Minutes Played
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    placeholder="e.g. 90"
                    value={minutesPlayed}
                    onChange={(e) => setMinutesPlayed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Effort RPE Slider */}
          <div className="bg-black/30 rounded-2xl p-3.5 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <FaFire className="text-amber-400 text-xs" />
                <span>Rate of Perceived Exertion (RPE 1-10)</span>
              </label>
              <span className="text-xs font-black text-brand-peach px-2 py-0.5 rounded-lg bg-brand-peach/10 border border-brand-peach/20">
                {rpe} / 10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={rpe}
              onChange={(e) => setRpe(e.target.value)}
              className="w-full accent-brand-peach cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-semibold">
              <span>1 (Very Light)</span>
              <span>5 (Moderate)</span>
              <span>7 (Hard/Match)</span>
              <span>10 (Maximum All-Out)</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Tactical / Biomechanical Notes
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 5-step run up feeling smooth, bowled 2 overs at death; turf pitch..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-gray-500 focus:border-brand-peach focus:outline-none resize-none"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-peach text-black text-xs font-black uppercase tracking-wider hover:bg-brand-peach/90 shadow-lg shadow-brand-peach/20 transition-all disabled:opacity-50"
            >
              <FaCheck className="text-xs" />
              <span>{submitting ? "Saving Workload..." : "Log Sport Session"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
