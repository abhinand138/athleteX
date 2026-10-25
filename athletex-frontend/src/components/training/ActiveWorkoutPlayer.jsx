import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaPlay,
  FaPause,
  FaRedo,
  FaStepForward,
  FaCheck,
  FaDumbbell,
  FaClock,
  FaFire,
  FaVolumeUp,
  FaVolumeMute,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTrophy
} from "react-icons/fa";

/**
 * Web Audio API synthesizer for countdown and rest completion sound cues.
 * Bypasses external audio file dependencies and works reliably across browsers.
 */
const playBeep = (freq = 880, duration = 0.15, type = "sine") => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Non-blocking if audio context is restricted
  }
};

export default function ActiveWorkoutPlayer({
  isOpen,
  onClose,
  training,
  onFinishWorkout
}) {
  if (!isOpen || !training) return null;

  // Active Session Elapsed Timer
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isSessionRunning, setIsSessionRunning] = useState(true);

  // Active Rest Interval Timer
  const [restSeconds, setRestSeconds] = useState(60);
  const [initialRestSeconds, setInitialRestSeconds] = useState(60);
  const [isRestRunning, setIsRestRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Prepare Exercise List (Use training.exercises or derive dynamic sport routine)
  const initialExercises = (() => {
    if (training.exercises && Array.isArray(training.exercises) && training.exercises.length > 0) {
      return training.exercises.map((ex, idx) => ({
        id: `ex_${idx}`,
        name: ex.name,
        setsTarget: parseInt(ex.sets, 10) || 3,
        repsOrDuration: ex.repsOrDuration || "10 Reps",
        restInterval: ex.restInterval || "60s",
        restSecs: parseInt(ex.restInterval, 10) || 60,
        coachingNotes: ex.coachingNotes || "Focus on explosive execution and pristine mechanics.",
        completedSets: []
      }));
    }

    const cat = (training.category || "GENERAL").toUpperCase();
    if (cat.includes("SPEED") || cat.includes("SPRINT")) {
      return [
        {
          id: "sp_1",
          name: "Dynamic High Knees & A-Skips",
          setsTarget: 3,
          repsOrDuration: "30 meters",
          restInterval: "45s",
          restSecs: 45,
          coachingNotes: "Dorsiflex ankles, maintain tall posture and quick ground contact.",
          completedSets: []
        },
        {
          id: "sp_2",
          name: "20m Acceleration Drive Starts",
          setsTarget: 4,
          repsOrDuration: "20m Max Effort",
          restInterval: "90s",
          restSecs: 90,
          coachingNotes: "Forward lean from ankles, drive aggressively through ground.",
          completedSets: []
        },
        {
          id: "sp_3",
          name: "Flying 30m Speed Endurance",
          setsTarget: 3,
          repsOrDuration: "30m Flying",
          restInterval: "120s",
          restSecs: 120,
          coachingNotes: "Relax shoulders and jaw at top velocity; float over track.",
          completedSets: []
        }
      ];
    } else if (cat.includes("STRENGTH") || cat.includes("POWER")) {
      return [
        {
          id: "st_1",
          name: "Trap-Bar Deadlifts / Squats",
          setsTarget: 4,
          repsOrDuration: "6 Reps @ 80% 1RM",
          restInterval: "90s",
          restSecs: 90,
          coachingNotes: "Brace abdominal core, neutral spine, explosive hip extension.",
          completedSets: []
        },
        {
          id: "st_2",
          name: "Dumbbell Bulgarian Split Squats",
          setsTarget: 3,
          repsOrDuration: "8 Reps / leg",
          restInterval: "60s",
          restSecs: 60,
          coachingNotes: "Control eccentric descent, vertical shin for maximum quad drive.",
          completedSets: []
        },
        {
          id: "st_3",
          name: "Explosive Box Jumps or Med-Ball Slams",
          setsTarget: 3,
          repsOrDuration: "6 Reps",
          restInterval: "60s",
          restSecs: 60,
          coachingNotes: "Triple extension at ankles, knees, hips. Land soft like a feather.",
          completedSets: []
        }
      ];
    } else if (cat.includes("AGILITY") || cat.includes("PLYO")) {
      return [
        {
          id: "ag_1",
          name: "Pro Agility 5-10-5 Shuttle",
          setsTarget: 4,
          repsOrDuration: "Max Speed Cut",
          restInterval: "75s",
          restSecs: 75,
          coachingNotes: "Drop hips low to brake; plant outside foot firmly without slipping.",
          completedSets: []
        },
        {
          id: "ag_2",
          name: "3-Cone L-Drill Precision Route",
          setsTarget: 3,
          repsOrDuration: "Full Speed",
          restInterval: "90s",
          restSecs: 90,
          coachingNotes: "Hug the cone corner tightly; accelerate immediately on exit.",
          completedSets: []
        }
      ];
    }

    return [
      {
        id: "gen_1",
        name: "General Warm-Up Mobility Circuit",
        setsTarget: 2,
        repsOrDuration: "45 sec per movement",
        restInterval: "30s",
        restSecs: 30,
        coachingNotes: "Increase core temperature and synovial fluid in joints.",
        completedSets: []
      },
      {
        id: "gen_2",
        name: training.title || "Main Workout Circuit",
        setsTarget: 4,
        repsOrDuration: "10-12 Reps / 2 mins",
        restInterval: "60s",
        restSecs: 60,
        coachingNotes: training.description || "Maintain high intensity and steady breathing.",
        completedSets: []
      }
    ];
  })();

  const [exercises, setExercises] = useState(initialExercises);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  // Set logging inputs for active exercise
  const [inputWeight, setInputWeight] = useState("");
  const [inputReps, setInputReps] = useState("10");

  // Track session timer
  useEffect(() => {
    let interval = null;
    if (isSessionRunning) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionRunning]);

  // Track rest countdown timer
  useEffect(() => {
    let interval = null;
    if (isRestRunning && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 4 && prev > 1 && soundEnabled) {
            playBeep(600, 0.08, "sine"); // Short warning beeps at 3, 2, 1
          }
          if (prev === 1) {
            if (soundEnabled) {
              playBeep(1100, 0.35, "triangle"); // Completion chime
            }
            setIsRestRunning(false);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestRunning, restSeconds, soundEnabled]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
  };

  const handleStartRest = (targetSeconds = 60) => {
    setRestSeconds(targetSeconds);
    setInitialRestSeconds(targetSeconds);
    setIsRestRunning(true);
  };

  const handleCheckSet = (exIndex, setNumber) => {
    setExercises((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exIndex] };
      const currentCompleted = [...ex.completedSets];

      const existingIndex = currentCompleted.findIndex((s) => s.setNumber === setNumber);
      if (existingIndex >= 0) {
        // Toggle off
        currentCompleted.splice(existingIndex, 1);
      } else {
        // Log set
        currentCompleted.push({
          setNumber,
          weight: parseFloat(inputWeight) || 0,
          reps: parseInt(inputReps, 10) || 10,
          timestamp: new Date().toISOString()
        });

        // Trigger rest interval automatically for smooth gym-floor flow
        handleStartRest(ex.restSecs || 60);
      }

      ex.completedSets = currentCompleted;
      copy[exIndex] = ex;
      return copy;
    });
  };

  // Compute Volume & Progress
  const totalTargetSets = exercises.reduce((acc, curr) => acc + curr.setsTarget, 0);
  const totalCompletedSets = exercises.reduce((acc, curr) => acc + curr.completedSets.length, 0);
  const totalTonnageKg = exercises.reduce(
    (acc, curr) =>
      acc +
      curr.completedSets.reduce(
        (sub, s) => sub + (s.weight > 0 ? s.weight * s.reps : 0),
        0
      ),
    0
  );
  const completionPercentage = Math.round(
    (totalCompletedSets / (totalTargetSets || 1)) * 100
  );

  const activeExercise = exercises[activeExerciseIndex] || exercises[0];

  const handleFinish = () => {
    const elapsedMinutes = Math.max(5, Math.round(sessionSeconds / 60));
    if (onFinishWorkout) {
      onFinishWorkout({
        elapsedMinutes,
        completedSetsCount: totalCompletedSets,
        totalTonnageKg: Math.round(totalTonnageKg),
        exercisesLogged: exercises
      });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-[#090b0e] border border-brand-peach/30 rounded-3xl shadow-[0_0_60px_rgba(238,155,116,0.2)] overflow-hidden flex flex-col max-h-[96vh]"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-brand-peach/15 via-[#12161f] to-transparent border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-peach/20 border border-brand-peach/30 flex items-center justify-center text-brand-peach text-xl shadow-[0_0_20px_rgba(238,155,116,0.3)]">
                <FaDumbbell className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-brand-peach text-black">
                    Gym Floor Mode
                  </span>
                  <span className="text-xs font-bold text-gray-400">
                    {training.category || "General"}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5 tracking-tight line-clamp-1">
                  {training.title}
                </h2>
              </div>
            </div>

            {/* Session Stopwatch */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/60 border border-white/10 font-mono text-base font-black text-white">
                <FaClock className="text-brand-peach text-sm" />
                <span>{formatTime(sessionSeconds)}</span>
                <button
                  onClick={() => setIsSessionRunning(!isSessionRunning)}
                  className="ml-1 text-gray-400 hover:text-white text-xs p-1"
                  title={isSessionRunning ? "Pause Stopwatch" : "Resume Stopwatch"}
                >
                  {isSessionRunning ? <FaPause /> : <FaPlay />}
                </button>
              </div>

              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl border text-sm transition-colors ${
                  soundEnabled
                    ? "bg-brand-peach/10 border-brand-peach/30 text-brand-peach"
                    : "bg-white/5 border-white/10 text-gray-500"
                }`}
                title={soundEnabled ? "Timer Sound On" : "Timer Sound Muted"}
              >
                {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Overall Session Progress & Volume Bar */}
          <div className="px-6 py-3 bg-black/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-gray-400">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 uppercase tracking-wider text-[10px]">Sets:</span>
                <span className="text-white font-black">{totalCompletedSets} / {totalTargetSets}</span>
                <span className="text-brand-peach font-bold">({completionPercentage}%)</span>
              </div>
              {totalTonnageKg > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 uppercase tracking-wider text-[10px]">Tonnage:</span>
                  <span className="text-emerald-400 font-black">{totalTonnageKg} kg</span>
                </div>
              )}
            </div>

            <div className="w-full sm:w-48 bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-brand-peach to-orange-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, completionPercentage)}%` }}
              />
            </div>
          </div>

          {/* Main Body: Rest Countdown Banner + Active Exercise */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Interactive Rest Countdown Timer Card */}
            <div
              className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                isRestRunning
                  ? "bg-gradient-to-r from-brand-peach/20 via-orange-500/10 to-transparent border-brand-peach/40 shadow-[0_0_30px_rgba(238,155,116,0.25)]"
                  : "bg-white/[0.02] border-white/10"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isRestRunning ? "bg-emerald-400 animate-ping" : "bg-gray-500"
                      }`}
                    />
                    <span className="text-[11px] font-black uppercase tracking-widest text-brand-peach">
                      {isRestRunning ? "Active Rest Interval" : "Rest Interval Timer"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                      {formatTime(restSeconds)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {isRestRunning ? "Recover neurological energy" : "Target recovery"}
                    </span>
                  </div>
                </div>

                {/* Rest Timer Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsRestRunning(!isRestRunning)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isRestRunning
                        ? "bg-white/10 hover:bg-white/20 text-white"
                        : "bg-brand-peach hover:bg-brand-peach/90 text-black shadow-lg shadow-brand-peach/20"
                    }`}
                  >
                    {isRestRunning ? <FaPause /> : <FaPlay />}
                    <span>{isRestRunning ? "Pause" : "Start Rest"}</span>
                  </button>

                  <button
                    onClick={() => setRestSeconds((prev) => prev + 30)}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold border border-white/10 transition-colors"
                  >
                    +30s
                  </button>

                  <button
                    onClick={() => {
                      setRestSeconds(initialRestSeconds);
                      setIsRestRunning(false);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs border border-white/10 transition-colors"
                    title="Reset Timer"
                  >
                    <FaRedo />
                  </button>

                  <button
                    onClick={() => {
                      setRestSeconds(0);
                      setIsRestRunning(false);
                    }}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold border border-white/10 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>

              {/* Rest Progress line */}
              {isRestRunning && initialRestSeconds > 0 && (
                <div className="w-full bg-white/10 rounded-full h-1 mt-4 overflow-hidden">
                  <div
                    className="bg-brand-peach h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, (restSeconds / initialRestSeconds) * 100)
                      )}%`
                    }}
                  />
                </div>
              )}
            </div>

            {/* Exercise Tabs / Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {exercises.map((ex, idx) => {
                const isCurrent = idx === activeExerciseIndex;
                const isDone = ex.completedSets.length >= ex.setsTarget;
                return (
                  <button
                    key={ex.id}
                    onClick={() => setActiveExerciseIndex(idx)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 border ${
                      isCurrent
                        ? "bg-brand-peach text-black border-brand-peach shadow-lg shadow-brand-peach/20"
                        : isDone
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        : "bg-white/5 text-gray-400 border-white/5 hover:border-white/20"
                    }`}
                  >
                    <span>{idx + 1}. {ex.name}</span>
                    {isDone && <FaCheck className="text-[10px]" />}
                  </button>
                );
              })}
            </div>

            {/* Current Exercise Detail Card */}
            {activeExercise && (
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 sm:p-7 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-peach">
                      Drill {activeExerciseIndex + 1} of {exercises.length}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {activeExercise.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-semibold text-gray-400">
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-200">
                        Target: {activeExercise.setsTarget} Sets × {activeExercise.repsOrDuration}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-brand-peach/10 border border-brand-peach/20 text-brand-peach">
                        Rest: {activeExercise.restInterval}
                      </span>
                    </div>
                  </div>

                  {/* Coaching Cue Pill */}
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 max-w-sm text-xs text-gray-300 flex items-start gap-2.5">
                    <FaInfoCircle className="text-brand-peach text-sm shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Coach Cue:</strong> {activeExercise.coachingNotes}
                    </p>
                  </div>
                </div>

                {/* Quick Weight & Reps Loggers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Load / Resistance (kg / lbs)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 80"
                      value={inputWeight}
                      onChange={(e) => setInputWeight(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-peach"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Reps Completed
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={inputReps}
                      onChange={(e) => setInputReps(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-peach"
                    />
                  </div>
                </div>

                {/* Sets Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
                    Set Checklist & Execution
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Array.from({ length: activeExercise.setsTarget }).map((_, sIdx) => {
                      const setNum = sIdx + 1;
                      const loggedSet = activeExercise.completedSets.find(
                        (s) => s.setNumber === setNum
                      );
                      const isLogged = Boolean(loggedSet);

                      return (
                        <div
                          key={setNum}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                            isLogged
                              ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                              : "bg-white/[0.02] border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider">
                              Set {setNum}
                            </span>
                            {isLogged && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                                Completed
                              </span>
                            )}
                          </div>

                          <div className="text-xs font-semibold">
                            {isLogged ? (
                              <span className="text-emerald-300 font-mono">
                                {loggedSet.weight > 0 ? `${loggedSet.weight}kg × ` : ""}
                                {loggedSet.reps} reps
                              </span>
                            ) : (
                              <span className="text-gray-500">
                                Target: {activeExercise.repsOrDuration}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleCheckSet(activeExerciseIndex, setNum)}
                            className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              isLogged
                                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/20"
                                : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                            }`}
                          >
                            <FaCheck className="text-[10px]" />
                            <span>{isLogged ? "Completed ✓" : "Check Off Set"}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Next Exercise Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <button
                    disabled={activeExerciseIndex === 0}
                    onClick={() => setActiveExerciseIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 disabled:opacity-40 transition-colors"
                  >
                    ← Previous Exercise
                  </button>

                  <button
                    disabled={activeExerciseIndex === exercises.length - 1}
                    onClick={() =>
                      setActiveExerciseIndex((prev) =>
                        Math.min(exercises.length - 1, prev + 1)
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-brand-peach border border-brand-peach/30 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                  >
                    <span>Next Exercise</span>
                    <FaStepForward className="text-[10px]" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 sm:p-6 bg-[#0c0e13] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-gray-400">
              <span className="font-bold text-white block">
                {totalCompletedSets === totalTargetSets
                  ? "🎉 All sets completed! Ready to finish session."
                  : `${totalCompletedSets} of ${totalTargetSets} sets checked off.`}
              </span>
              <span className="text-[11px] text-gray-500">
                Finishing will automatically prompt RPE exertion & calculate impulse.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:text-white transition-colors"
              >
                Exit Player
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
              >
                <FaTrophy />
                <span>Finish & Record Workout</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
