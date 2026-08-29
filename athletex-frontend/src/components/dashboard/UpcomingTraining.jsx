import { useState } from "react";
import { FaCheck, FaCalendarAlt, FaClock } from "react-icons/fa";
import WorkoutCompletionModal from "./WorkoutCompletionModal";

export default function UpcomingTraining({ sessions = [], onComplete }) {
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [localSessions, setLocalSessions] = useState(sessions);

  // Sync if prop updates
  const displaySessions = localSessions.length !== sessions.length ? localSessions : sessions;

  const handleOpenCompleteModal = (e, session) => {
    e.stopPropagation();
    setSelectedTraining(session);
  };

  const handleModalCompleted = (completedId) => {
    setLocalSessions((prev) => prev.filter((s) => s.id !== completedId));
    if (onComplete) {
      onComplete();
    }
  };

  const formatDateDisplay = (dateStr, timeStr) => {
    if (!dateStr) return timeStr || "";
    try {
      const d = new Date(dateStr);
      const formattedDate = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      return `${formattedDate} • ${timeStr || ""}`;
    } catch (e) {
      return `${dateStr} • ${timeStr || ""}`;
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-peach/5 blur-[40px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:bg-brand-peach/10 transition-colors duration-700" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase">
          Upcoming Training
        </h2>
        {displaySessions.length > 0 && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-peach/10 text-brand-peach border border-brand-peach/20">
            {displaySessions.length} Scheduled
          </span>
        )}
      </div>

      {displaySessions.length === 0 ? (
        <p className="text-gray-500 text-sm relative z-10">
          No upcoming training sessions.
        </p>
      ) : (
        <div className="space-y-4 relative z-10">
          {displaySessions.map((session, index) => (
            <div
              key={session.id || index}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-brand-peach/30 transition-all group/item"
            >
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold group-hover/item:text-brand-peach transition-colors truncate">
                  {session.title}
                </p>

                <div className="flex items-center gap-3 text-xs text-gray-500 font-mono mt-1">
                  <span className="flex items-center gap-1.5">
                    <FaCalendarAlt className="text-gray-600 text-[10px]" />
                    {formatDateDisplay(session.date, session.time)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <span className="text-[10px] font-bold tracking-widest uppercase bg-brand-peach/10 text-brand-peach px-2.5 py-1 rounded-md border border-brand-peach/20">
                  {session.category || "General"}
                </span>

                {session.id && (
                  <button
                    onClick={(e) => handleOpenCompleteModal(e, session)}
                    title="Mark Complete with RPE & Notes"
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white text-xs font-semibold rounded-md transition-all cursor-pointer"
                  >
                    <FaCheck className="text-[10px]" />
                    <span>Complete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <WorkoutCompletionModal
        isOpen={Boolean(selectedTraining)}
        onClose={() => setSelectedTraining(null)}
        training={selectedTraining}
        onCompleted={handleModalCompleted}
      />
    </div>
  );
}