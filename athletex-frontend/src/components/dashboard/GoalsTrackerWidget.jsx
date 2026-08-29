import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBullseye,
  FaPlus,
  FaCheckCircle,
  FaTimes,
  FaCalendarAlt,
  FaFire,
  FaTrash,
  FaTrophy
} from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function GoalsTrackerWidget({ athleteId }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [updatingGoal, setUpdatingGoal] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("SPEED");
  const [targetValue, setTargetValue] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [unit, setUnit] = useState("kg");
  const [targetDate, setTargetDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (athleteId) {
      fetchGoals();
    }
  }, [athleteId]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/goals/user/${athleteId}`);
      setGoals(res.data || []);
    } catch (err) {
      console.error("Failed to load goals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title.trim() || !targetValue) {
      toast.error("Please enter a goal title and target value.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/goals", {
        userId: athleteId,
        title: title.trim(),
        category,
        targetValue: Number(targetValue),
        currentValue: Number(currentValue || 0),
        unit: unit.trim(),
        targetDate: targetDate || null
      });

      setGoals((prev) => [res.data, ...prev]);
      setShowAddModal(false);
      setTitle("");
      setTargetValue("");
      setCurrentValue("");
      setTargetDate("");
      toast.success("Target goal created! 🎯");
    } catch (err) {
      toast.error(err.response?.data || "Failed to create goal.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (goal) => {
    try {
      const updatedStatus = !goal.completed;
      const res = await api.put(`/goals/${goal.id}`, {
        userId: athleteId,
        completed: updatedStatus,
        currentValue: updatedStatus ? goal.targetValue : goal.currentValue
      });

      setGoals((prev) => prev.map((g) => (g.id === goal.id ? res.data : g)));
      if (updatedStatus) {
        toast.success("Goal Accomplished! Amazing work! 🎉🏆");
      } else {
        toast.success("Goal marked as in-progress.");
      }
    } catch (err) {
      toast.error("Failed to update goal.");
    }
  };

  const handleDeleteGoal = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/goals/${id}?userId=${athleteId}`);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast.success("Goal deleted.");
    } catch (err) {
      toast.error("Failed to delete goal.");
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!updatingGoal) return;

    try {
      const newCurrent = Number(currentValue);
      const isNowCompleted = newCurrent >= updatingGoal.targetValue;
      const res = await api.put(`/goals/${updatingGoal.id}`, {
        userId: athleteId,
        currentValue: newCurrent,
        completed: isNowCompleted
      });

      setGoals((prev) => prev.map((g) => (g.id === updatingGoal.id ? res.data : g)));
      setUpdatingGoal(null);
      if (isNowCompleted) {
        toast.success("Target reached! Goal accomplished! 🏆");
      } else {
        toast.success("Progress updated!");
      }
    } catch (err) {
      toast.error("Failed to update progress.");
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden shadow-xl space-y-5">
      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 blur-[40px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-lg">
            <FaBullseye />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Personal Goals</h3>
            <p className="text-[11px] text-gray-400">Target milestones & self-improvement</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-peach/10 hover:bg-brand-peach border border-brand-peach/30 hover:border-brand-peach text-brand-peach hover:text-black text-xs font-bold transition-all shadow-md"
        >
          <FaPlus className="text-[10px]" /> Add Goal
        </button>
      </div>

      {/* Goal List */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-8 text-gray-500 space-y-1">
          <FaBullseye className="mx-auto text-2xl opacity-40 text-gray-400" />
          <p className="text-xs font-semibold">No personal goals set yet</p>
          <p className="text-[11px] text-gray-600">Set a target benchmark to track your athletic growth.</p>
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {goals.map((g) => {
            const percent = Math.min(100, Math.max(0, Math.round(((g.currentValue || 0) / (g.targetValue || 1)) * 100)));
            const isDone = g.completed;

            return (
              <div
                key={g.id}
                className={`p-4 rounded-xl border transition-all ${
                  isDone
                    ? "bg-emerald-500/[0.04] border-emerald-500/20"
                    : "bg-white/[0.02] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleComplete(g)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center text-xs transition-colors flex-shrink-0 ${
                        isDone
                          ? "bg-emerald-500 border-emerald-400 text-black"
                          : "border-white/20 hover:border-emerald-400 text-transparent"
                      }`}
                      title={isDone ? "Mark as In-Progress" : "Mark as Accomplished"}
                    >
                      <FaCheckCircle />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-brand-peach">
                          {g.category || "GENERAL"}
                        </span>
                        <h4 className={`text-xs font-bold truncate ${isDone ? "text-gray-400 line-through" : "text-white"}`}>
                          {g.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1">
                        <span>Progress: <strong className="text-white">{g.currentValue || 0}</strong> / {g.targetValue} {g.unit || ""}</span>
                        {g.targetDate && (
                          <span className="flex items-center gap-1 text-[10px] text-gray-500">
                            <FaCalendarAlt className="text-brand-peach text-[9px]" /> {g.targetDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setUpdatingGoal(g);
                        setCurrentValue(g.currentValue || 0);
                      }}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10px] font-bold transition-colors"
                      title="Update Value"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDeleteGoal(g.id, e)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 text-[10px] transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                    <span>Completion</span>
                    <span className={`font-bold ${isDone ? "text-emerald-400" : "text-brand-peach"}`}>{percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${
                        isDone
                          ? "bg-emerald-400"
                          : "bg-gradient-to-r from-brand-peach to-amber-400"
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-[#0e1015] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FaBullseye className="text-brand-peach" /> Add Target Goal
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 100m Sprint Sub-11s, Bench Press 100kg"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-peach"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-peach cursor-pointer"
                    >
                      <option value="SPEED" className="bg-[#0e1014]">Speed</option>
                      <option value="STRENGTH" className="bg-[#0e1014]">Strength</option>
                      <option value="ENDURANCE" className="bg-[#0e1014]">Endurance</option>
                      <option value="AGILITY" className="bg-[#0e1014]">Agility</option>
                      <option value="GENERAL" className="bg-[#0e1014]">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="kg, s, km, reps"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-peach"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
                      Current Value
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={currentValue}
                      onChange={(e) => setCurrentValue(e.target.value)}
                      placeholder="e.g. 70"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-peach"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
                      Target Value
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-peach"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-peach"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 text-gray-300 font-semibold text-xs hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-peach to-orange-500 text-black font-bold text-xs hover:opacity-95 shadow-md shadow-brand-peach/20"
                  >
                    {submitting ? "Creating..." : "Save Goal"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Update Progress Modal */}
      <AnimatePresence>
        {updatingGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUpdatingGoal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-sm bg-[#0e1015] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-base font-bold text-white">Update Progress: {updatingGoal.title}</h3>
              <form onSubmit={handleUpdateProgress} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Current Logged Value ({updatingGoal.unit || ""})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-peach"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Target is {updatingGoal.targetValue} {updatingGoal.unit || ""}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUpdatingGoal(null)}
                    className="flex-1 py-2 rounded-xl border border-white/10 text-gray-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-brand-peach text-black text-xs font-bold shadow-md shadow-brand-peach/20"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
