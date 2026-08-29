import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHeartbeat,
  FaBed,
  FaBolt,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaSmile,
  FaMeh,
  FaFrown
} from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function DailyReadinessWidget({ athleteId }) {
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCheckinForm, setShowCheckinForm] = useState(false);

  const [sleep, setSleep] = useState(4);
  const [soreness, setSoreness] = useState(2);
  const [energy, setEnergy] = useState(4);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (athleteId) {
      fetchTodayCheckin();
    }
  }, [athleteId]);

  const fetchTodayCheckin = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/wellness/today/${athleteId}`);
      if (res.data && res.data.readinessScore) {
        setTodayCheckin(res.data);
      } else {
        setTodayCheckin(null);
      }
    } catch (err) {
      setTodayCheckin(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCheckin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post("/wellness", {
        userId: athleteId,
        sleepQuality: Number(sleep),
        muscleSoreness: Number(soreness),
        energyLevel: Number(energy),
        notes: notes.trim()
      });
      setTodayCheckin(res.data);
      setShowCheckinForm(false);
      toast.success(`Readiness Score: ${res.data.readinessScore}% Logged! ⚡`);
    } catch (err) {
      toast.error("Failed to log readiness check-in.");
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return { label: "Optimal Readiness", color: "text-emerald-400", advice: "Prime state for high-intensity training!" };
    if (score >= 60) return { label: "Moderate Readiness", color: "text-brand-peach", advice: "Good capacity for steady workout volume." };
    return { label: "Recovery Suggested", color: "text-rose-400", advice: "High fatigue detected. Prioritize recovery." };
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-white/5 animate-pulse min-h-[140px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
      </div>
    );
  }

  const scoreInfo = todayCheckin ? getScoreStatus(todayCheckin.readinessScore) : null;

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[40px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-lg">
            <FaHeartbeat />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Daily Readiness</h3>
            <p className="text-[11px] text-gray-400">Bio-feedback & training readiness</p>
          </div>
        </div>

        {todayCheckin ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
              {todayCheckin.readinessScore}%
            </span>
            <button
              onClick={() => setShowCheckinForm(!showCheckinForm)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-xs"
              title="Update Check-in"
            >
              {showCheckinForm ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCheckinForm(!showCheckinForm)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black text-xs font-bold hover:opacity-95 transition-all shadow-md shadow-cyan-500/20"
          >
            Check-In (10s)
          </button>
        )}
      </div>

      {/* When checkin already submitted & form collapsed */}
      {todayCheckin && !showCheckinForm && (
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className={`font-bold ${scoreInfo.color}`}>● {scoreInfo.label}</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-300 italic">{scoreInfo.advice}</span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">Today's Check-in Complete</span>
        </div>
      )}

      {/* Checkin Form (Expandable) */}
      <AnimatePresence>
        {(showCheckinForm || !todayCheckin) && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmitCheckin}
            className="mt-5 pt-4 border-t border-white/10 space-y-4 relative z-10"
          >
            <p className="text-xs text-gray-300 font-semibold">How are you feeling today?</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Sleep Quality */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1.5"><FaBed className="text-cyan-400" /> Sleep</span>
                  <span className="font-bold text-white">{sleep} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={sleep}
                  onChange={(e) => setSleep(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[9px] text-gray-500">
                  <span>Poor</span>
                  <span>Deep</span>
                </div>
              </div>

              {/* Muscle Soreness */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1.5"><FaHeartbeat className="text-rose-400" /> Soreness</span>
                  <span className="font-bold text-white">{soreness} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={soreness}
                  onChange={(e) => setSoreness(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
                <div className="flex justify-between text-[9px] text-gray-500">
                  <span>None</span>
                  <span>High</span>
                </div>
              </div>

              {/* Energy Level */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1.5"><FaBolt className="text-amber-400" /> Energy</span>
                  <span className="font-bold text-white">{energy} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={energy}
                  onChange={(e) => setEnergy(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-[9px] text-gray-500">
                  <span>Tired</span>
                  <span>Peak</span>
                </div>
              </div>
            </div>

            {/* Notes input */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional daily wellness note (e.g. hydrated well, 8hrs sleep)..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold text-xs hover:opacity-95 transition-all shadow-md disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Check-in"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
