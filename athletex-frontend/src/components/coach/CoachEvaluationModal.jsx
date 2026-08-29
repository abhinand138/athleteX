import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaClipboardCheck, FaHeartbeat, FaRunning, FaDumbbell, FaBolt, FaSave } from "react-icons/fa";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function CoachEvaluationModal({
  isOpen,
  onClose,
  athleteId,
  athleteName,
  initialEvaluation,
  onSaved
}) {
  const [readinessStatus, setReadinessStatus] = useState("READY");
  const [coachFeedback, setCoachFeedback] = useState("");
  const [targetSpeed, setTargetSpeed] = useState(80);
  const [targetStrength, setTargetStrength] = useState(80);
  const [targetEndurance, setTargetEndurance] = useState(80);
  const [targetAgility, setTargetAgility] = useState(80);
  const [saving, setSaving] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const coachId = storedUser?.id;

  useEffect(() => {
    if (initialEvaluation) {
      setReadinessStatus(initialEvaluation.readinessStatus || "READY");
      setCoachFeedback(initialEvaluation.coachFeedback || "");
      setTargetSpeed(initialEvaluation.targetSpeed || 80);
      setTargetStrength(initialEvaluation.targetStrength || 80);
      setTargetEndurance(initialEvaluation.targetEndurance || 80);
      setTargetAgility(initialEvaluation.targetAgility || 80);
    } else {
      setReadinessStatus("READY");
      setCoachFeedback("");
      setTargetSpeed(80);
      setTargetStrength(80);
      setTargetEndurance(80);
      setTargetAgility(80);
    }
  }, [initialEvaluation, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!athleteId) return;

    setSaving(true);
    try {
      const payload = {
        coachId,
        athleteId,
        readinessStatus,
        coachFeedback,
        targetSpeed: Number(targetSpeed),
        targetStrength: Number(targetStrength),
        targetEndurance: Number(targetEndurance),
        targetAgility: Number(targetAgility)
      };

      const res = await api.post("/coach/athletes/evaluation", payload);
      toast.success("Coach performance evaluation saved!");
      if (onSaved) onSaved(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data || "Failed to save evaluation.");
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { value: "READY", label: "Ready / Optimal", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    { value: "NEEDS_IMPROVEMENT", label: "Needs Improvement", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    { value: "FATIGUED", label: "Fatigued / Rest Needed", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    { value: "INJURY_RISK", label: "Injury Risk", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="glass-card w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <FaTimes />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-brand-peach/10 text-brand-peach border border-brand-peach/20 text-xl">
              <FaClipboardCheck />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Coach Performance Evaluation</h2>
              <p className="text-xs text-gray-400">Assessing {athleteName || "Athlete"}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Readiness Status Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Athletic Readiness Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setReadinessStatus(opt.value)}
                    className={`p-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                      readinessStatus === opt.value
                        ? `${opt.color} shadow-lg`
                        : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {readinessStatus === opt.value && <span className="w-2 h-2 rounded-full bg-current" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Metric Sliders */}
            <div className="space-y-4 pt-2 border-t border-white/5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                Coach Performance Targets (%)
              </label>

              {/* Speed Target */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-300 flex items-center gap-1.5">
                    <FaRunning className="text-blue-400" /> Speed Target
                  </span>
                  <span className="font-bold text-blue-400">{targetSpeed}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={targetSpeed}
                  onChange={(e) => setTargetSpeed(e.target.value)}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-400"
                />
              </div>

              {/* Strength Target */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-300 flex items-center gap-1.5">
                    <FaDumbbell className="text-brand-peach" /> Strength Target
                  </span>
                  <span className="font-bold text-brand-peach">{targetStrength}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={targetStrength}
                  onChange={(e) => setTargetStrength(e.target.value)}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-peach"
                />
              </div>

              {/* Endurance Target */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-300 flex items-center gap-1.5">
                    <FaHeartbeat className="text-rose-400" /> Endurance Target
                  </span>
                  <span className="font-bold text-rose-400">{targetEndurance}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={targetEndurance}
                  onChange={(e) => setTargetEndurance(e.target.value)}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
              </div>

              {/* Agility Target */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-300 flex items-center gap-1.5">
                    <FaBolt className="text-yellow-400" /> Agility Target
                  </span>
                  <span className="font-bold text-yellow-400">{targetAgility}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={targetAgility}
                  onChange={(e) => setTargetAgility(e.target.value)}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                />
              </div>
            </div>

            {/* Coach Feedback Note */}
            <div className="pt-2 border-t border-white/5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Coach Feedback & Development Notes
              </label>
              <textarea
                rows="4"
                placeholder="Enter technical guidance, tactical recommendations, or areas of focus for this athlete..."
                value={coachFeedback}
                onChange={(e) => setCoachFeedback(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-peach transition-colors resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-peach text-black text-xs font-bold hover:bg-brand-peach/90 transition-all shadow-lg shadow-brand-peach/20 disabled:opacity-50"
              >
                <FaSave />
                <span>{saving ? "Saving..." : "Save Evaluation"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
