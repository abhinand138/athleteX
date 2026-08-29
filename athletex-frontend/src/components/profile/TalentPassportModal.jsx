import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCodeSVG from "react-qr-code";
import {
  FaTimes,
  FaShieldAlt,
  FaCheckCircle,
  FaTrophy,
  FaBolt,
  FaDumbbell,
  FaHeartbeat,
  FaRunning,
  FaPrint,
  FaDownload,
  FaQrcode
} from "react-icons/fa";
import toast from "react-hot-toast";

export default function TalentPassportModal({ isOpen, onClose, athlete, performance, topAchievements = [] }) {
  const cardRef = useRef(null);

  if (!isOpen || !athlete) return null;

  const speed = performance?.speed || 75;
  const strength = performance?.strength || 80;
  const endurance = performance?.endurance || 82;
  const agility = performance?.agility || 78;
  const overall = performance?.overallScore
    ? Math.round(performance.overallScore)
    : Math.round((speed + strength + endurance + agility) / 4);

  const getTier = (score) => {
    if (score >= 90) return { name: "ELITE PRO", color: "from-amber-300 via-yellow-400 to-amber-500", text: "text-amber-300" };
    if (score >= 80) return { name: "GOLD TALENT", color: "from-brand-peach via-orange-400 to-amber-400", text: "text-brand-peach" };
    if (score >= 70) return { name: "SILVER PROSPECT", color: "from-slate-200 via-gray-300 to-slate-400", text: "text-slate-200" };
    return { name: "ACADEMY RISING", color: "from-orange-700 via-amber-600 to-yellow-700", text: "text-amber-600" };
  };

  const tier = getTier(overall);

  const handlePrintCard = () => {
    window.print();
    toast.success("Opening print dialog for Talent Passport");
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
          className="absolute inset-0 bg-black/85 backdrop-blur-md print:hidden"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-10 w-full max-w-md flex flex-col items-center"
        >
          {/* Action bar on top */}
          <div className="w-full flex items-center justify-between mb-3 px-2 print:hidden">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <FaShieldAlt className="text-brand-peach" /> Verified Athlete Passport
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintCard}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Print or Save as PDF"
              >
                <FaPrint /> Print / PDF
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* THE TALENT CARD */}
          <div
            ref={cardRef}
            className="w-full rounded-3xl p-6 bg-gradient-to-b from-[#181a24] via-[#11131a] to-[#0a0b0f] border-2 border-brand-peach/40 shadow-2xl relative overflow-hidden text-white"
          >
            {/* Holographic metallic shine lines */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-peach/20 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-400/10 blur-[50px] rounded-full pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-brand-peach to-orange-300">
                  AthleteX Verified Passport
                </span>
              </div>
              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-white/10 bg-white/5 ${tier.text}`}>
                {tier.name}
              </span>
            </div>

            {/* Hero Section: OVR Badge + Athlete Photo + Basic Info */}
            <div className="flex items-center gap-4 mt-5 relative z-10">
              {/* OVR Score Box */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-brand-peach/25 to-orange-500/10 border border-brand-peach/40 min-w-[70px] shadow-lg">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-brand-peach leading-none">
                  {overall}
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-300 mt-1">
                  OVR
                </span>
                <span className="text-[10px] font-bold text-brand-peach mt-0.5">
                  {athlete.position ? athlete.position.substring(0, 3).toUpperCase() : "ATH"}
                </span>
              </div>

              {/* Avatar */}
              <div className="relative w-20 h-20 rounded-2xl bg-white/5 border border-white/15 overflow-hidden flex-shrink-0">
                {athlete.profileImage ? (
                  <img src={athlete.profileImage} alt={athlete.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-brand-peach bg-gradient-to-tr from-brand-peach/20 to-orange-500/20">
                    {athlete.fullName?.charAt(0) || "A"}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 p-1 bg-brand-peach text-black text-[9px] rounded-tl-lg font-bold">
                  <FaCheckCircle />
                </div>
              </div>

              {/* Name & Bio */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-white truncate tracking-wide">
                  {athlete.fullName || "Athlete"}
                </h3>
                <p className="text-xs font-bold text-brand-peach mt-0.5">
                  {athlete.sport || "All-Round Sport"}
                </p>
                <p className="text-[11px] text-gray-400 mt-1 flex flex-wrap gap-2">
                  {athlete.age && <span>{athlete.age} YRS</span>}
                  {athlete.height && <span>{athlete.height} CM</span>}
                  {athlete.weight && <span>{athlete.weight} KG</span>}
                </p>
                {athlete.city && (
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">
                    📍 {athlete.city}{athlete.country ? `, ${athlete.country}` : ""}
                  </p>
                )}
              </div>
            </div>

            {/* Radar Stat Matrix Grid */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 relative z-10">
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                  <FaBolt className="text-amber-400 text-xs" /> SPD
                </span>
                <span className="text-sm font-extrabold text-amber-400">{Math.round(speed)}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                  <FaDumbbell className="text-rose-400 text-xs" /> STR
                </span>
                <span className="text-sm font-extrabold text-rose-400">{Math.round(strength)}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                  <FaHeartbeat className="text-cyan-400 text-xs" /> END
                </span>
                <span className="text-sm font-extrabold text-cyan-400">{Math.round(endurance)}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                  <FaRunning className="text-emerald-400 text-xs" /> AGI
                </span>
                <span className="text-sm font-extrabold text-emerald-400">{Math.round(agility)}</span>
              </div>
            </div>

            {/* Verified Achievements Bar */}
            {topAchievements.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/10 relative z-10">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Featured Accreditations
                </p>
                <div className="flex items-center gap-2 overflow-hidden">
                  {topAchievements.slice(0, 3).map((a, i) => (
                    <div
                      key={i}
                      className="flex-1 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5 truncate"
                    >
                      <span className="text-xs">{a.icon || "🏆"}</span>
                      <span className="text-[10px] font-bold text-gray-200 truncate">{a.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Verification Stamp & Scannable QR Code */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between relative z-10 text-[9px] text-gray-500 font-mono">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-white rounded-lg border border-white/20 shrink-0">
                  <QRCodeSVG value={`http://localhost:5173/verify/${athlete.id}`} size={54} level="M" />
                </div>
                <div>
                  <p className="text-emerald-400 font-extrabold uppercase tracking-widest text-[10px]">✔ OFFICIAL VERIFIED SEAL</p>
                  <p className="text-gray-300 font-bold mt-0.5">AX-ID: {athlete.id?.substring(0, 12).toUpperCase() || "AX2026"}</p>
                  <p className="text-[8px] text-gray-400">SCAN QR TO VERIFY ACCREDITATIONS</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider text-[9px]">
                  SCOUTABLE
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
