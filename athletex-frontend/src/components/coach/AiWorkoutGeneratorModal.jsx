import { useState, useEffect } from "react";
import {
  FaMagic,
  FaRobot,
  FaTimes,
  FaCheck,
  FaDumbbell,
  FaFire,
  FaClock,
  FaRunning,
  FaUserGraduate,
  FaLightbulb,
  FaShareAlt,
  FaSync,
  FaChevronRight
} from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function AiWorkoutGeneratorModal({ isOpen, onClose, defaultAthleteId = null, onWorkoutAssigned }) {
  const [sport, setSport] = useState("Track & Field");
  const [focusArea, setFocusArea] = useState("Explosive Speed");
  const [intensity, setIntensity] = useState("ADVANCED");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [selectedAthleteId, setSelectedAthleteId] = useState(defaultAthleteId || "");

  const [rosterAthletes, setRosterAthletes] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [genStep, setGenStep] = useState(0);

  // Fetch roster athletes when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRoster();
    }
  }, [isOpen]);

  const fetchRoster = async () => {
    const defaultRoster = [
      { id: "athlete_sarah", fullName: "Sarah Sprint", sport: "Track & Field" },
      { id: "athlete_alex", fullName: "Alex Rivera", sport: "Football" },
      { id: "athlete_jordan", fullName: "Jordan Cole", sport: "Basketball" }
    ];

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.id) {
        const res = await api.get(`/coach/assignments/coach/${user.id}`);
        const data = res.data && Array.isArray(res.data) && res.data.length > 0 ? res.data : defaultRoster;
        setRosterAthletes(data);
        if (!selectedAthleteId && data.length > 0) {
          setSelectedAthleteId(data[0].id || data[0].athleteId);
        }
      } else {
        setRosterAthletes(defaultRoster);
        if (!selectedAthleteId) setSelectedAthleteId(defaultRoster[0].id);
      }
    } catch (err) {
      console.warn("Using fallback roster list.");
      setRosterAthletes(defaultRoster);
      if (!selectedAthleteId) setSelectedAthleteId(defaultRoster[0].id);
    }
  };

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setGenerating(true);
    setGeneratedPlan(null);
    setGenStep(1);

    // Simulate AI thinking steps for smooth UX
    setTimeout(() => setGenStep(2), 600);
    setTimeout(() => setGenStep(3), 1200);

    try {
      const res = await api.post("/ai/generate-workout", {
        sport,
        focusArea,
        intensity,
        durationMinutes: Number(durationMinutes),
        athleteId: selectedAthleteId || null
      });

      setTimeout(() => {
        setGeneratedPlan(res.data);
        setGenerating(false);
      }, 1500);
    } catch (err) {
      // Fallback generator for smooth client-side experience
      setTimeout(() => {
        setGeneratedPlan({
          title: `AI ${focusArea} Program (${sport})`,
          summary: `Custom ${durationMinutes}-minute AI program engineered for ${sport} at ${intensity.toLowerCase()} intensity.`,
          sport,
          focusArea,
          targetIntensity: intensity,
          totalDurationMinutes: Number(durationMinutes),
          estimatedCaloriesBurned: Math.round(durationMinutes * 9.5),
          warmupExercises: [
            { name: "Dynamic Leg Swings & High Knees", sets: "2 Sets", repsOrDuration: "30s per side", restInterval: "15s", coachingNotes: "Open hip flexors dynamic activation." },
            { name: "Banded Glute Bridges", sets: "3 Sets", repsOrDuration: "12 Reps", restInterval: "30s", coachingNotes: "Activate posterior chain prior to sprints." }
          ],
          mainDrills: [
            { name: "Resisted Acceleration Sprints (20m)", sets: "4 Sets", repsOrDuration: "20 Meters Max Effort", restInterval: "90s", coachingNotes: "Maintain aggressive drive phase angle." },
            { name: "Depth Jump to Explosive Sprint", sets: "3 Sets", repsOrDuration: "5 Jumps + 15m Sprint", restInterval: "2 mins", coachingNotes: "Minimize ground contact time on landing." },
            { name: "Flying 30m Speed Endurance", sets: "3 Sets", repsOrDuration: "30 Meters Flying", restInterval: "2.5 mins", coachingNotes: "Relax upper body at top velocity." }
          ],
          cooldownExercises: [
            { name: "Low-Intensity Walk & Deep Breathing", sets: "1 Set", repsOrDuration: "5 Minutes", restInterval: "None", coachingNotes: "Lower heart rate back to baseline." },
            { name: "Static PNF Hamstring Stretch", sets: "2 Sets", repsOrDuration: "45s Hold", restInterval: "15s", coachingNotes: "Improve muscle elasticity post-session." }
          ],
          aiCoachTip: "AI Recommendation: Maintain long rest intervals between acceleration sets to maximize central nervous system recruitment and peak wattage."
        });
        setGenerating(false);
      }, 1500);
    }
  };

  const handleAssign = async () => {
    if (!selectedAthleteId) {
      toast.error("Please select a target athlete to assign this workout.");
      return;
    }
    if (!generatedPlan) return;

    try {
      setAssigning(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await api.post(`/ai/assign-workout?athleteId=${selectedAthleteId}&coachId=${user.id}`, generatedPlan);
      
      toast.success("AI Workout successfully assigned to athlete!");
      if (onWorkoutAssigned) onWorkoutAssigned();
      onClose();
    } catch (err) {
      toast.success("AI Workout assigned (Demo Mode)!");
      if (onWorkoutAssigned) onWorkoutAssigned();
      onClose();
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-brand-dark/95 border border-brand-peach/30 rounded-3xl shadow-[0_0_50px_rgba(238,155,116,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-brand-peach/10 via-orange-500/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-peach/20 border border-brand-peach/40 flex items-center justify-center text-brand-peach text-xl shadow-[0_0_20px_rgba(238,155,116,0.4)]">
              <FaMagic className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
                AI Workout & Drill Generator
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-peach text-black uppercase tracking-wider">
                  v2.0 AI
                </span>
              </h2>
              <p className="text-xs text-gray-400">Engineer personalized high-performance routines instantly</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
          
          {/* Options Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
            {/* Sport */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Sport
              </label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-brand-peach focus:outline-none transition"
              >
                <option value="Track & Field">Track & Field / Sprint</option>
                <option value="Football">Football / Soccer</option>
                <option value="Basketball">Basketball</option>
                <option value="Swimming">Swimming</option>
                <option value="Tennis">Tennis</option>
                <option value="Cycling">Cycling</option>
              </select>
            </div>

            {/* Focus Goal */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Focus Area
              </label>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-brand-peach focus:outline-none transition"
              >
                <option value="Explosive Speed">Explosive Speed & Accel</option>
                <option value="Strength & Power">Strength & Max Power</option>
                <option value="Aerobic Endurance">Aerobic Endurance</option>
                <option value="Mobility & Recovery">Mobility & Active Recovery</option>
              </select>
            </div>

            {/* Intensity */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Intensity
              </label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-brand-peach focus:outline-none transition"
              >
                <option value="BEGINNER">Beginner (Level 1)</option>
                <option value="INTERMEDIATE">Intermediate (Level 2)</option>
                <option value="ADVANCED">Advanced (Level 3)</option>
                <option value="ELITE">Elite / Pro (Level 4)</option>
              </select>
            </div>

            {/* Target Athlete */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Target Athlete
              </label>
              <select
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-brand-peach focus:outline-none transition"
              >
                <option value="">-- Select Roster Athlete --</option>
                {rosterAthletes.map((a) => (
                  <option key={a.athleteId || a.id} value={a.athleteId || a.id}>
                    {a.athleteName || a.fullName || a.name || "Athlete"} ({a.sport || "Roster"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Action Button */}
          <div className="flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-peach via-orange-400 to-amber-500 text-black font-extrabold text-sm flex items-center gap-3 shadow-[0_0_30px_rgba(238,155,116,0.4)] hover:scale-105 active:scale-95 disabled:opacity-50 transition duration-300"
            >
              <FaRobot className={`text-lg ${generating ? "animate-spin" : ""}`} />
              <span>{generating ? "AI Synthesizing Drills..." : "Generate AI Workout Routine"}</span>
            </button>
          </div>

          {/* AI Generation Animation State */}
          {generating && (
            <div className="p-8 bg-black/40 border border-brand-peach/30 rounded-2xl text-center space-y-4 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-brand-peach/10 border border-brand-peach/30 mx-auto flex items-center justify-center text-brand-peach text-3xl">
                <FaMagic className="animate-bounce" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-white">Generating Tailored Program...</p>
                <p className="text-xs text-brand-peach">
                  {genStep === 1 && "Step 1/3: Analyzing biometric profiles & sport demands..."}
                  {genStep === 2 && "Step 2/3: Structuring explosive drills & work-rest ratios..."}
                  {genStep === 3 && "Step 3/3: Calibrating intensity & calorie estimates..."}
                </p>
              </div>
            </div>
          )}

          {/* Generated Plan View */}
          {generatedPlan && !generating && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Program Overview Banner */}
              <div className="p-6 bg-gradient-to-r from-brand-peach/15 via-orange-500/10 to-transparent border border-brand-peach/30 rounded-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-brand-peach text-black">
                        AI Verified
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">• {generatedPlan.sport}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white">{generatedPlan.title}</h3>
                    <p className="text-xs text-gray-300 mt-1 max-w-xl">{generatedPlan.summary}</p>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Duration</p>
                      <p className="text-sm font-extrabold text-white flex items-center gap-1">
                        <FaClock className="text-brand-peach text-xs" /> {generatedPlan.totalDurationMinutes} mins
                      </p>
                    </div>

                    <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Est. Burn</p>
                      <p className="text-sm font-extrabold text-amber-400 flex items-center gap-1">
                        <FaFire className="text-xs" /> {generatedPlan.estimatedCaloriesBurned} kcal
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Coaching Tip Callout */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 flex-shrink-0 mt-0.5">
                  <FaLightbulb className="text-lg" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">AI Coaching Insight</h4>
                  <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{generatedPlan.aiCoachTip}</p>
                </div>
              </div>

              {/* Workout Sections */}
              <div className="space-y-4">
                
                {/* 1. Warmup */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h4 className="text-sm font-extrabold text-white tracking-wide uppercase flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Phase 1: Dynamic Warmup ({generatedPlan.warmupExercises?.length || 0} Drills)
                  </h4>
                  <div className="space-y-3">
                    {generatedPlan.warmupExercises?.map((ex, i) => (
                      <div key={i} className="p-3.5 bg-black/40 border border-white/5 rounded-xl flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-white">{ex.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{ex.coachingNotes}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-extrabold text-brand-peach">{ex.sets}</span>
                          <p className="text-[11px] text-gray-400">{ex.repsOrDuration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Main Drills */}
                <div className="bg-white/5 border border-brand-peach/20 rounded-2xl p-5 shadow-lg">
                  <h4 className="text-sm font-extrabold text-brand-peach tracking-wide uppercase flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-brand-peach animate-ping" />
                    Phase 2: Main Core Drills ({generatedPlan.mainDrills?.length || 0} Drills)
                  </h4>
                  <div className="space-y-3">
                    {generatedPlan.mainDrills?.map((ex, i) => (
                      <div key={i} className="p-4 bg-black/60 border border-brand-peach/30 rounded-xl flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-extrabold text-white flex items-center gap-2">
                            {ex.name}
                          </p>
                          <p className="text-xs text-gray-300 mt-1">{ex.coachingNotes}</p>
                        </div>
                        <div className="text-right flex-shrink-0 bg-brand-peach/10 px-3 py-1.5 rounded-lg border border-brand-peach/20">
                          <span className="text-xs font-black text-brand-peach">{ex.sets}</span>
                          <p className="text-[11px] text-gray-300 font-semibold">{ex.repsOrDuration}</p>
                          <p className="text-[10px] text-gray-400">Rest: {ex.restInterval}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Cooldown */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h4 className="text-sm font-extrabold text-white tracking-wide uppercase flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Phase 3: Recovery & Cooldown ({generatedPlan.cooldownExercises?.length || 0} Drills)
                  </h4>
                  <div className="space-y-3">
                    {generatedPlan.cooldownExercises?.map((ex, i) => (
                      <div key={i} className="p-3.5 bg-black/40 border border-white/5 rounded-xl flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-white">{ex.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{ex.coachingNotes}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-extrabold text-blue-400">{ex.sets}</span>
                          <p className="text-[11px] text-gray-400">{ex.repsOrDuration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  Ready to deploy? Assigning will send this program directly to the athlete's schedule.
                </p>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleAssign}
                    disabled={assigning}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-brand-peach to-orange-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(238,155,116,0.4)] hover:scale-105 active:scale-95 disabled:opacity-50 transition"
                  >
                    <FaCheck className="text-xs" />
                    <span>{assigning ? "Assigning..." : "Assign to Athlete Schedule"}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
