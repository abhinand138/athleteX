import { useRef } from "react";
import QRCodeSVG from "react-qr-code";
import {
  FaTimes,
  FaPrint,
  FaShieldAlt,
  FaCheckCircle,
  FaQrcode,
  FaUser,
  FaTrophy,
  FaDownload
} from "react-icons/fa";

export default function AthletePassportModal({ athlete, onClose }) {
  const printRef = useRef(null);

  if (!athlete) return null;

  const qrUrl = `http://localhost:5173/verify/${athlete.id}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      
      {/* Modal Container */}
      <div className="glass-card bg-[#0f1118]/95 border border-white/10 rounded-3xl max-w-3xl w-full shadow-2xl relative overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02] shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-peach/10 text-brand-peach rounded-2xl border border-brand-peach/20 text-xl">
              <FaShieldAlt />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Official Athletic Bio-Passport</h2>
              <p className="text-xs text-gray-400">Scannable QR Verification Document</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-peach text-black font-bold text-xs hover:scale-105 transition-all shadow-lg cursor-pointer"
            >
              <FaPrint className="text-sm" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Printable Passport Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-0 print:overflow-visible print:bg-white print:text-black" ref={printRef}>
          
          {/* Top Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#161a24] via-[#1c2230] to-[#161a24] border border-white/10 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 print:bg-white print:border-black print:text-black">
            
            <div className="flex items-center gap-5 text-center sm:text-left">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 font-bold overflow-hidden shrink-0 print:border-black">
                {athlete.profileImage ? (
                  <img src={athlete.profileImage} alt={athlete.fullName} className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-3xl text-gray-500" />
                )}
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-2 print:text-black print:bg-gray-200">
                  <FaCheckCircle className="text-xs" /> VERIFIED ATHLETE
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight print:text-black">
                  {athlete.fullName}
                </h1>
                <p className="text-gray-400 text-sm font-semibold print:text-gray-700">
                  {athlete.sport || "Athlete"} {athlete.position ? `• ${athlete.position}` : ""}
                </p>
                <p className="text-xs text-gray-500 font-mono mt-0.5 print:text-gray-600">{athlete.email}</p>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-2xl border border-white/20 shadow-xl flex flex-col items-center shrink-0 print:border-black">
              <QRCodeSVG value={qrUrl} size={110} level="H" />
              <span className="text-[9px] font-bold font-mono text-gray-800 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                <FaQrcode className="text-brand-peach" /> SCAN TO VERIFY
              </span>
            </div>

          </div>

          {/* Physical & Location Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 print:border-gray-300 print:bg-gray-100">
              <span className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Location</span>
              <p className="font-bold text-white mt-0.5 print:text-black">{athlete.city || "N/A"}, {athlete.country || "N/A"}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 print:border-gray-300 print:bg-gray-100">
              <span className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Age / Gender</span>
              <p className="font-bold text-white mt-0.5 print:text-black">{athlete.age || "N/A"} yrs • {athlete.gender || "N/A"}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 print:border-gray-300 print:bg-gray-100">
              <span className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Height</span>
              <p className="font-bold text-white mt-0.5 print:text-black">{athlete.height ? `${athlete.height} cm` : "N/A"}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 print:border-gray-300 print:bg-gray-100">
              <span className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Weight</span>
              <p className="font-bold text-white mt-0.5 print:text-black">{athlete.weight ? `${athlete.weight} kg` : "N/A"}</p>
            </div>
          </div>

          {/* Endorsed Achievements Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 print:text-black">
              <FaTrophy className="text-amber-400" /> Coach Endorsed & Verified Achievements
            </h3>
            
            {athlete.achievements && athlete.achievements.length > 0 ? (
              <div className="space-y-2">
                {athlete.achievements.map((ach) => (
                  <div
                    key={ach.id || ach.title}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs print:border-gray-300 print:bg-gray-50"
                  >
                    <div>
                      <span className="font-bold text-white print:text-black">{ach.title}</span>
                      <p className="text-[11px] text-gray-400 print:text-gray-600">{ach.description}</p>
                    </div>
                    {ach.isVerified && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 print:bg-emerald-100 print:text-emerald-800">
                        ✔ VERIFIED
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No achievements recorded yet.</p>
            )}
          </div>

          {/* Verification Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-500 font-mono print:border-black print:text-black">
            <span>ATHLETEX CERTIFIED VERIFICATION ENGINES</span>
            <span>TOKEN: {athlete.id}</span>
          </div>

        </div>

      </div>
    </div>
  );
}
