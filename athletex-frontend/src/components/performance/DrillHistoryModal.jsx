import { useState, useEffect } from "react";
import {
  FaTimes,
  FaTrophy,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaTrash,
  FaCalendarAlt,
  FaPlus
} from "react-icons/fa";
import api, { getMediaUrl } from "../../services/api";
import toast from "react-hot-toast";

export default function DrillHistoryModal({
  isOpen,
  onClose,
  userId,
  drillCode,
  drillName,
  onLogNew,
  onUpdate
}) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = async () => {
    if (!drillCode) return;
    try {
      setLoading(true);
      const res = await api.get(`/performance/${userId}/drills/${drillCode}/history`);
      setHistory(res.data || []);
    } catch (err) {
      console.error("Failed to fetch drill history:", err);
      toast.error("Could not load drill attempt history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && drillCode) {
      fetchHistory();
    }
  }, [isOpen, drillCode]);

  if (!isOpen) return null;

  const handleDelete = async (drillId) => {
    if (!window.confirm("Are you sure you want to delete this attempt?")) {
      return;
    }
    try {
      setDeletingId(drillId);
      await api.delete(`/performance/${userId}/drills/${drillId}`);
      toast.success("Attempt removed.");
      fetchHistory();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Failed to delete drill attempt:", err);
      toast.error("Could not delete drill attempt.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-peach/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-brand-peach" />
              <span className="text-xs uppercase tracking-widest text-brand-peach font-bold">
                Progression History
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-white tracking-wide">
              {drillName || "Combine Drill"}
            </h3>
            <p className="text-xs text-gray-400">
              Complete historical progression log across all recorded attempts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onLogNew) onLogNew(drillCode);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-peach/10 border border-brand-peach/30 text-brand-peach text-xs font-bold hover:bg-brand-peach hover:text-black transition-all"
            >
              <FaPlus className="text-[10px]" />
              <span>Log Attempt</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Modal Body / History List */}
        <div className="mt-6 flex-1 overflow-y-auto space-y-3 pr-1 relative z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <div className="w-8 h-8 border-2 border-brand-peach/20 border-t-brand-peach rounded-full animate-spin mb-3" />
              <p className="text-xs">Loading attempt history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FaTrophy className="text-3xl text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-300">No attempts logged yet</p>
              <p className="text-xs text-gray-500 mt-1">
                Record your first attempt to start tracking personal records and athletic curve.
              </p>
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.isPersonalRecord
                    ? "bg-amber-500/[0.07] border-amber-500/30 shadow-lg shadow-amber-500/5"
                    : "bg-white/[0.02] border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-black shrink-0 ${
                      item.isPersonalRecord
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-white/5 text-gray-400 border border-white/10"
                    }`}
                  >
                    {item.isPersonalRecord ? <FaTrophy /> : `#${history.length - idx}`}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl font-extrabold text-white">
                        {item.value} <span className="text-xs text-brand-peach">{item.unit}</span>
                      </span>

                      {item.isPersonalRecord && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider border border-amber-500/40">
                          🏆 All-Time PR
                        </span>
                      )}

                      {item.tierBadge && (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-300 text-[10px] font-semibold border border-white/10">
                          {item.tierBadge}
                        </span>
                      )}

                      {item.isCoachVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <FaCheckCircle className="text-[9px]" />
                          <span>Verified by {item.verifiedByCoachName || "Coach"}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-[10px] text-gray-500" />
                        {item.recordedAt ? new Date(item.recordedAt).toLocaleDateString() : "Recent"}
                      </span>

                      {item.percentile && (
                        <span className="text-brand-peach font-semibold">
                          {item.percentile}th Percentile
                        </span>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-xs text-gray-300 italic mt-1.5 bg-black/30 px-2.5 py-1 rounded-lg border border-white/5">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {item.proofUrl && (
                    <a
                      href={getMediaUrl(item.proofUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white/5 border border-white/10 text-brand-peach hover:bg-white/10 transition-colors"
                      title="View Video / Activity Proof"
                    >
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  )}

                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                    title="Delete Attempt"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500 relative z-10">
          <span>Total attempts recorded: {history.length}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold hover:bg-white/10 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
