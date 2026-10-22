import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShareAlt } from "react-icons/fa";
import { FiGlobe, FiX, FiShield, FiFileText } from "react-icons/fi";
import { toast } from "react-hot-toast";

export default function Footer() {
  const navigate = useNavigate();
  const [legalModal, setLegalModal] = useState(null);

  const scrollTo = (id) => {
    if (window.location.pathname === "/") {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate(`/#${id}`);
  };

  const handleShare = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.origin);
        toast.success("AthleteX link copied to clipboard!");
      } else {
        toast.success("AthleteX link ready to share!");
      }
    } catch {
      toast.success("AthleteX link ready to share!");
    }
  };

  const handleLanguage = () => {
    toast("Language: English (India / Global INR)", {
      icon: "🌐",
    });
  };

  const legalContent = {
    privacy: {
      title: "AthleteX Privacy Policy",
      content:
        "AthleteX is committed to protecting all biometric data, game footage, and personal scouting records. All athletic metrics and performance videos are encrypted in transit and at rest. Performance statistics are shared exclusively with verified university recruiters and professional coaches based on your platform consent settings.",
    },
    terms: {
      title: "AthleteX Terms of Service",
      content:
        "By accessing the AthleteX recruitment network, users agree to uphold ethical recruiting standards and accuracy in submitting Combine PR metrics and game footage. Any fraudulent records or unauthorized solicitation results in immediate suspension and revocation of verified status.",
    },
    cookies: {
      title: "AthleteX Cookie Policy",
      content:
        "AthleteX utilizes functional and security cookies to authenticate active user sessions, retain user interface theme preferences, and maintain Razorpay secure payment checkout flows. We do not sell user behavioral data to third-party ad networks.",
    },
    docs: {
      title: "AthleteX Platform Documentation",
      content:
        "AthleteX v2.4 provides comprehensive REST APIs for Combine metrics, automated AI workout generation, coach roster management, and Razorpay marketplace billing. For developer inquiries and webhook integration guides, contact developer@athletex.com.",
    },
  };

  return (
    <footer className="bg-[#080809] border-t border-white/5 pt-16 pb-8 px-6 md:px-12 text-gray-400 font-sans text-xs relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 lg:gap-12 mb-12">
          
          {/* Column 1: Logo & Info */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-lg font-sans font-black tracking-[0.2em] text-white hover:text-brand-peach transition-colors duration-300 uppercase flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-brand-peach" />
              <span>ATHLETEX</span>
            </Link>
            <p className="text-gray-500 font-light leading-relaxed max-w-sm">
              The elite benchmark for professional recruitment, athletic identity verification, and high-performance sports analytics.
            </p>
          </div>

          {/* Column 2: Platform Links */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="text-[10px] font-sans font-bold tracking-[0.2em] text-white uppercase">
              PLATFORM
            </h4>
            <ul className="flex flex-col gap-2.5 font-light">
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo("talent")}
                  className="hover:text-white transition-colors duration-200 cursor-pointer text-left"
                >
                  Talent Discovery
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo("analytics")}
                  className="hover:text-white transition-colors duration-200 cursor-pointer text-left"
                >
                  Performance Analytics
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo("programs")}
                  className="hover:text-white transition-colors duration-200 cursor-pointer text-left"
                >
                  Program Management
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources Links */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="text-[10px] font-sans font-bold tracking-[0.2em] text-white uppercase">
              RESOURCES
            </h4>
            <ul className="flex flex-col gap-2.5 font-light">
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal("docs")}
                  className="hover:text-white transition-colors duration-200 cursor-pointer text-left"
                >
                  Documentation
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal("docs")}
                  className="hover:text-white transition-colors duration-200 cursor-pointer text-left"
                >
                  API Portal
                </button>
              </li>
              <li>
                <Link
                  to="/register?role=COACH"
                  className="hover:text-white transition-colors duration-200 text-left"
                >
                  Scouting Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal Links */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h4 className="text-[10px] font-sans font-bold tracking-[0.2em] text-white uppercase">
              LEGAL
            </h4>
            <ul className="flex flex-col gap-2.5 font-light">
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal("privacy")}
                  className="hover:text-white transition-colors duration-200 cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal("terms")}
                  className="hover:text-white transition-colors duration-200 cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal("cookies")}
                  className="hover:text-white transition-colors duration-200 cursor-pointer text-left"
                >
                  Cookie Policy
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom divider line */}
        <div className="w-full h-[1px] bg-white/5 my-8" />

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] tracking-wider text-gray-600 font-bold uppercase">
          <span>
            © 2026 ATHLETEX GLOBAL. ALL RIGHTS RESERVED.
          </span>
          <div className="flex items-center gap-5 text-gray-500">
            <button
              type="button"
              onClick={handleShare}
              className="hover:text-brand-peach transition-colors duration-200 cursor-pointer p-1"
              title="Share AthleteX"
              aria-label="Share AthleteX"
            >
              <FaShareAlt className="text-[14px]" />
            </button>
            <button
              type="button"
              onClick={handleLanguage}
              className="hover:text-brand-peach transition-colors duration-200 cursor-pointer p-1"
              title="Select Language / Region"
              aria-label="Select Language / Region"
            >
              <FiGlobe className="text-[15px]" />
            </button>
          </div>
        </div>

      </div>

      {/* Legal & Info Modal */}
      {legalModal && legalContent[legalModal] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-[#0e1014] border border-brand-peach/30 rounded-lg p-6 shadow-2xl text-gray-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-peach/10 border border-brand-peach/30 text-brand-peach flex items-center justify-center">
                  {legalModal === "privacy" ? <FiShield /> : <FiFileText />}
                </div>
                <h3 className="text-base font-serif font-bold text-white tracking-wide">
                  {legalContent[legalModal].title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <FiX />
              </button>
            </div>
            <p className="text-sm font-sans font-light leading-relaxed text-gray-300 border-t border-white/5 pt-4">
              {legalContent[legalModal].content}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="px-5 py-2 bg-brand-peach hover:bg-brand-peach/90 text-brand-dark font-sans font-bold text-xs tracking-wider rounded-sm transition-all"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}