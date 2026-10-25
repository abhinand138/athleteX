import { useState, useEffect } from "react";
import {
  FaTimes,
  FaTrophy,
  FaRunning,
  FaDumbbell,
  FaHeartbeat,
  FaBolt,
  FaExternalLinkAlt,
  FaCheck,
  FaFire
} from "react-icons/fa";
import api from "../../services/api";
import toast from "react-hot-toast";

// Standard Athletic Combine Drill Catalog
export const DRILL_CATALOG = [
  // Speed & Sprinting
  {
    code: "40_YARD_DASH",
    name: "40-Yard Dash",
    category: "SPEED",
    defaultUnit: "s",
    lowerIsBetter: true,
    benchmarkNote: "Elite: <4.40s | Varsity: ~4.75s",
    icon: FaRunning,
    color: "text-amber-400"
  },
  {
    code: "100M_SPRINT",
    name: "100m Sprint",
    category: "SPEED",
    defaultUnit: "s",
    lowerIsBetter: true,
    benchmarkNote: "Elite: <10.60s | Varsity: ~11.50s",
    icon: FaBolt,
    color: "text-amber-400"
  },
  {
    code: "CRICKET_22YD_PITCH_SPRINT",
    name: "🏏 22-Yard Pitch Sprint (Padded)",
    category: "SPEED",
    defaultUnit: "s",
    lowerIsBetter: true,
    benchmarkNote: "Elite: <2.85s | National: ~3.05s | Varsity: ~3.20s",
    icon: FaBolt,
    color: "text-amber-400"
  },
  {
    code: "BOWLING_SPEED_KMH",
    name: "🏏 Fast Bowling Radar Speed",
    category: "SPEED",
    defaultUnit: "km/h",
    lowerIsBetter: false,
    benchmarkNote: "Express: >=145 km/h | Fast: >=138 km/h | Medium: ~125 km/h",
    icon: FaFire,
    color: "text-rose-400"
  },
  {
    code: "FOOTBALL_30M_SPRINT",
    name: "⚽ 30m Sprint (Laser Gates)",
    category: "SPEED",
    defaultUnit: "s",
    lowerIsBetter: true,
    benchmarkNote: "UCL / Premier Tier: <3.85s | Pro: ~4.05s | Varsity: ~4.25s",
    icon: FaRunning,
    color: "text-amber-400"
  },
  // Power & Strength
  {
    code: "VERTICAL_JUMP",
    name: "Vertical Jump",
    category: "STRENGTH",
    defaultUnit: "in",
    lowerIsBetter: false,
    benchmarkNote: "Elite: >=38\" | Varsity: ~28\"",
    icon: FaBolt,
    color: "text-purple-400"
  },
  {
    code: "BENCH_PRESS_1RM",
    name: "1RM Bench Press",
    category: "STRENGTH",
    defaultUnit: "kg",
    lowerIsBetter: false,
    benchmarkNote: "Elite: >=140kg | Varsity: ~95kg",
    icon: FaDumbbell,
    color: "text-purple-400"
  },
  {
    code: "SQUAT_1RM",
    name: "1RM Back Squat",
    category: "STRENGTH",
    defaultUnit: "kg",
    lowerIsBetter: false,
    benchmarkNote: "Elite: >=190kg | Varsity: ~130kg",
    icon: FaDumbbell,
    color: "text-purple-400"
  },
  {
    code: "DEADLIFT_1RM",
    name: "1RM Deadlift",
    category: "STRENGTH",
    defaultUnit: "kg",
    lowerIsBetter: false,
    benchmarkNote: "Elite: >=220kg | Varsity: ~150kg",
    icon: FaDumbbell,
    color: "text-purple-400"
  },
  // Agility & Direction Change
  {
    code: "PRO_AGILITY_5105",
    name: "Pro Agility (5-10-5 Shuttle)",
    category: "AGILITY",
    defaultUnit: "s",
    lowerIsBetter: true,
    benchmarkNote: "Elite: <4.15s | Varsity: ~4.50s",
    icon: FaBolt,
    color: "text-emerald-400"
  },
  {
    code: "FOOTBALL_505_AGILITY",
    name: "⚽ Football 505 Agility Test",
    category: "AGILITY",
    defaultUnit: "s",
    lowerIsBetter: true,
    benchmarkNote: "Elite Pro: <2.15s | Academy: ~2.30s",
    icon: FaBolt,
    color: "text-emerald-400"
  },
  {
    code: "ILLINOIS_AGILITY_TEST",
    name: "Illinois Agility Run",
    category: "AGILITY",
    defaultUnit: "s",
    lowerIsBetter: true,
    benchmarkNote: "Elite: <15.2s | Pro: ~16.1s | Varsity: ~17.2s",
    icon: FaRunning,
    color: "text-emerald-400"
  },
  {
    code: "L_DRILL_3CONE",
    name: "3-Cone L-Drill",
    category: "AGILITY",
    defaultUnit: "s",
    lowerIsBetter: true,
    benchmarkNote: "Elite: <6.95s | Varsity: ~7.40s",
    icon: FaRunning,
    color: "text-emerald-400"
  },
  // Aerobic & Endurance Combines
  {
    code: "BCCI_2KM_TIME_TRIAL",
    name: "🏏 BCCI 2km Time Trial",
    category: "ENDURANCE",
    defaultUnit: "min",
    lowerIsBetter: true,
    benchmarkNote: "Bowlers: <8:15 min | Batsmen: <8:30 min | Elite: <7:45 min",
    icon: FaHeartbeat,
    color: "text-rose-400"
  },
  {
    code: "YO_YO_IR1_CRICKET",
    name: "🏏⚽ Yo-Yo IR1 Test (Level)",
    category: "ENDURANCE",
    defaultUnit: "level",
    lowerIsBetter: false,
    benchmarkNote: "International Elite: >=19.5 | National Cutoff: 17.1",
    icon: FaHeartbeat,
    color: "text-rose-400"
  },
  {
    code: "BEEP_TEST",
    name: "Beep Test (Multi-Stage Shuttle)",
    category: "ENDURANCE",
    defaultUnit: "level",
    lowerIsBetter: false,
    benchmarkNote: "Elite: >=13.5 | Varsity: ~10.0",
    icon: FaHeartbeat,
    color: "text-rose-400"
  },
  {
    code: "FIVE_K_RUN",
    name: "5K Run",
    category: "ENDURANCE",
    defaultUnit: "min",
    lowerIsBetter: true,
    benchmarkNote: "Elite: <17.0 min | Varsity: ~21.0 min",
    icon: FaHeartbeat,
    color: "text-rose-400"
  },
  // Custom
  {
    code: "CUSTOM",
    name: "Custom Drill",
    category: "SPEED",
    defaultUnit: "",
    lowerIsBetter: false,
    benchmarkNote: "Custom drill metric",
    icon: FaTrophy,
    color: "text-brand-peach"
  }
];

export default function LogDrillModal({
  isOpen,
  onClose,
  userId,
  initialDrillCode,
  existingPrs = [],
  onSuccess
}) {
  const [selectedDrillCode, setSelectedDrillCode] = useState(
    initialDrillCode || "40_YARD_DASH"
  );
  const [customName, setCustomName] = useState("");
  const [category, setCategory] = useState("SPEED");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("s");
  const [lowerIsBetter, setLowerIsBetter] = useState(true);
  const [notes, setNotes] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialDrillCode) {
      setSelectedDrillCode(initialDrillCode);
    }
  }, [initialDrillCode]);

  useEffect(() => {
    const drill = DRILL_CATALOG.find((d) => d.code === selectedDrillCode);
    if (drill && drill.code !== "CUSTOM") {
      setCategory(drill.category);
      setUnit(drill.defaultUnit);
      setLowerIsBetter(drill.lowerIsBetter);
    }
  }, [selectedDrillCode]);

  if (!isOpen) return null;

  const currentDrill = DRILL_CATALOG.find((d) => d.code === selectedDrillCode) || DRILL_CATALOG[0];

  // Find existing PR for selected drill
  const currentPr = existingPrs.find(
    (p) => p.drillCode === selectedDrillCode
  );

  // Check if entered value would beat the PR
  const numValue = parseFloat(value);
  let willBeNewPr = false;
  if (!isNaN(numValue) && numValue > 0) {
    if (!currentPr) {
      willBeNewPr = true;
    } else {
      if (lowerIsBetter) {
        willBeNewPr = numValue < currentPr.bestValue;
      } else {
        willBeNewPr = numValue > currentPr.bestValue;
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
      toast.error("Please enter a valid positive number for your drill result.");
      return;
    }

    const drillName = selectedDrillCode === "CUSTOM"
      ? (customName.trim() || "Custom Drill")
      : currentDrill.name;

    try {
      setSaving(true);
      const payload = {
        drillCode: selectedDrillCode === "CUSTOM" ? `CUSTOM_${Date.now()}` : selectedDrillCode,
        drillName,
        category,
        value: parseFloat(value),
        unit: unit.trim() || "s",
        lowerIsBetter,
        notes: notes.trim(),
        proofUrl: proofUrl.trim()
      };

      const res = await api.post(`/performance/${userId}/drills`, payload);

      if (res.data?.isPersonalRecord) {
        toast.success(`🏆 NEW PERSONAL RECORD! ${drillName}: ${res.data.value} ${res.data.unit}`, {
          duration: 4500,
          icon: "🔥"
        });
      } else {
        toast.success(`Attempt logged for ${drillName}: ${res.data.value} ${res.data.unit}`);
      }

      if (onSuccess) {
        onSuccess(res.data);
      }
      onClose();
    } catch (err) {
      console.error("Failed to log drill:", err);
      toast.error(err.response?.data?.message || "Failed to log drill attempt.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-peach/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-peach/10 border border-brand-peach/20 flex items-center justify-center text-brand-peach text-lg">
              <FaTrophy />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-wide">
                Log Combine Test / Drill
              </h3>
              <p className="text-xs text-gray-400">
                Record your official attempts, benchmark times, and personal records.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5 relative z-10">
          {/* Drill Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Select Combine Drill
            </label>
            <select
              value={selectedDrillCode}
              onChange={(e) => setSelectedDrillCode(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-brand-peach/50 transition-colors"
            >
              <optgroup label="⚡ Speed & Acceleration">
                <option value="40_YARD_DASH">40-Yard Dash (s)</option>
                <option value="100M_SPRINT">100m Sprint (s)</option>
              </optgroup>
              <optgroup label="🏋️ Strength & Explosive Power">
                <option value="VERTICAL_JUMP">Vertical Jump (inches)</option>
                <option value="BENCH_PRESS_1RM">1RM Bench Press (kg)</option>
                <option value="SQUAT_1RM">1RM Back Squat (kg)</option>
                <option value="DEADLIFT_1RM">1RM Deadlift (kg)</option>
              </optgroup>
              <optgroup label="🌪️ Agility & Shuttle">
                <option value="PRO_AGILITY_5105">Pro Agility 5-10-5 Shuttle (s)</option>
                <option value="L_DRILL_3CONE">3-Cone L-Drill (s)</option>
              </optgroup>
              <optgroup label="🏃 Endurance & Capacity">
                <option value="BEEP_TEST">Beep Test (Level)</option>
                <option value="FIVE_K_RUN">5K Run (minutes)</option>
              </optgroup>
              <optgroup label="✨ Custom Drill">
                <option value="CUSTOM">Custom Drill...</option>
              </optgroup>
            </select>
          </div>

          {/* If Custom selected */}
          {selectedDrillCode === "CUSTOM" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Drill Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Standing Broad Jump"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-peach/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-peach/50"
                >
                  <option value="SPEED">Speed</option>
                  <option value="STRENGTH">Strength</option>
                  <option value="ENDURANCE">Endurance</option>
                  <option value="AGILITY">Agility</option>
                </select>
              </div>
            </div>
          )}

          {/* Benchmark Hint & Current PR target */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-gray-400">Standard Norms: </span>
              <span className="text-gray-200 font-medium">{currentDrill.benchmarkNote}</span>
            </div>
            {currentPr ? (
              <div className="flex items-center gap-1.5 text-brand-peach font-semibold bg-brand-peach/10 px-2.5 py-1 rounded-lg">
                <FaTrophy className="text-xs" />
                <span>Target to Beat: {currentPr.bestValue} {currentPr.unit}</span>
              </div>
            ) : (
              <div className="text-gray-400 italic">
                No previous PR set yet
              </div>
            )}
          </div>

          {/* Value and Unit */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Attempt Result Value *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder={currentDrill.lowerIsBetter ? "e.g. 4.45" : "e.g. 34.0"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-2xl font-black text-white focus:outline-none focus:border-brand-peach/50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-200 focus:outline-none focus:border-brand-peach/50 text-center"
                required
              />
            </div>
          </div>

          {/* Lower is better toggle for custom drills */}
          {selectedDrillCode === "CUSTOM" && (
            <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
              <input
                type="checkbox"
                id="lowerBetterToggle"
                checked={lowerIsBetter}
                onChange={(e) => setLowerIsBetter(e.target.checked)}
                className="w-4 h-4 rounded text-brand-peach bg-black border-white/20 focus:ring-brand-peach"
              />
              <label htmlFor="lowerBetterToggle" className="text-xs text-gray-300">
                Lower time is better (checked for sprints & timed runs; unchecked for weights & jumps)
              </label>
            </div>
          )}

          {/* Live PR Prediction Banner */}
          {willBeNewPr && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-brand-peach/20 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300 font-bold animate-pulse">
              <FaFire className="text-base text-amber-400" />
              <span>
                🔥 NEW ALL-TIME PERSONAL RECORD! Saving this attempt will set your new personal best!
              </span>
            </div>
          )}

          {/* Video or Activity Proof URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
              <span>Proof Link (Optional)</span>
              <FaExternalLinkAlt className="text-[10px] text-gray-500" />
            </label>
            <input
              type="url"
              placeholder="https://youtu.be/... or Strava / Garmin workout URL"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-brand-peach/50"
            />
            <p className="text-[11px] text-brand-peach/80 mt-1 flex items-center gap-1">
              <span>🛡️ Attaching video/timing proof is required for your coach to certify this milestone on your public Talent Passport.</span>
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Attempt Notes / Conditions
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Field turf, new cleats, 3rd set after rest..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-brand-peach/50 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-peach text-black text-xs font-bold uppercase tracking-wider hover:bg-brand-peach/90 transition-all shadow-lg shadow-brand-peach/20 disabled:opacity-50"
            >
              {saving ? (
                "Logging..."
              ) : (
                <>
                  <FaCheck />
                  Save Combine Attempt
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
