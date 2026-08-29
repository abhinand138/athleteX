import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCheck, FaDumbbell, FaClock, FaHeartbeat } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function WorkoutCompletionModal({ isOpen, onClose, training, onCompleted }) {
  const [rpe, setRpe] = useState(7);
  const [duration, setDuration] = useState(45);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !training) return null;

  const getRpeLabel = (val) => {
    if (val <= 2) return { text: "Very Light (Warm-up Pace)", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };
    if (val <= 4) return { text: "Light to Moderate", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" };
    if (val <= 6) return { text: "Moderate (Aerobic Work)", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" };
    if (val <= 8) return { text: "Hard (High Exertion)", color: "text-brand-peach", bg: "bg-brand-peach/10 border-brand-peach/30" };
    return { text: "Maximum Effort / Exhaustion", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" };
  };

  const rpeInfo = getRpeLabel(rpe);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      await api.put(`/training/${training.id}/complete`, {
        userId: storedUser?.id,
        rpe: Number(rpe),
        actualDurationMinutes: Number(duration),
        athleteFeedback: feedback.trim()
      });

      toast.success("Workout completed & feedback logged! 💪");
      if (onCompleted) {
        onCompleted(training.id);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data || "Failed to complete training session.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#0e1015] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden z-10"
        >
          {/* Header Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-peach/10 blur-[60px] rounded-full pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <FaTimes className="text-lg" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-peach/20 to-orange-500/20 border border-brand-peach/30 flex items-center justify-center text-brand-peach text-xl">
              <FaDumbbell />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Complete Workout</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {training.title} • <span className="text-brand-peach">{training.category || "General"}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* RPE Exertion Rating Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                  <FaHeartbeat className="text-brand-peach" /> Rating of Perceived Exertion (RPE)
                </label>
                <span className="text-base font-extrabold text-white px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/10">
                  {rpe} <span className="text-xs font-normal text-gray-400">/ 10</span>
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={rpe}
                onChange={(e) => setRpe(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-peach focus:outline-none"
              />

              {/* RPE dynamic badge */}
              <div className={`text-xs px-3 py-2 rounded-xl border flex items-center justify-between font-semibold ${rpeInfo.bg} ${rpeInfo.color}`}>
                <span>{rpeInfo.text}</span>
                <span className="text-[10px] opacity-75 font-mono">Borg Scale</span>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <FaClock className="text-brand-peach" /> Actual Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-peach transition-colors"
                placeholder="45"
              />
            </div>

            {/* Feedback / Post-Workout Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Workout Reflection / Notes (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-peach transition-colors resize-none"
                placeholder="How did you feel? Any fatigue, soreness, or accomplishments to note for your coach?"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-gray-300 font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-peach to-orange-500 text-black font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-brand-peach/20 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  "Logging..."
                ) : (
                  <>
                    <FaCheck /> Complete Workout
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
