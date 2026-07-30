import { Link } from "react-router-dom";
import { FaShareAlt } from "react-icons/fa";
import { FiGlobe } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-[#080809] border-t border-white/5 pt-16 pb-8 px-6 md:px-12 text-gray-400 font-sans text-xs">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 lg:gap-12 mb-12">
          
          {/* Column 1: Logo & Info */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <Link
              to="/"
              className="text-lg font-sans font-black tracking-[0.2em] text-white hover:text-brand-peach transition-colors duration-300 uppercase"
            >
              ATHLETEX
            </Link>
            <p className="text-gray-500 font-light leading-relaxed max-w-sm">
              The elite benchmark for professional recruitment and high-performance sports analytics.
            </p>
          </div>

          {/* Column 2: Platform Links */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="text-[10px] font-sans font-bold tracking-[0.2em] text-white uppercase">
              PLATFORM
            </h4>
            <ul className="flex flex-col gap-2.5 font-light">
              <li>
                <a href="#talent" className="hover:text-white transition-colors duration-200">Talent Discovery</a>
              </li>
              <li>
                <a href="#analytics" className="hover:text-white transition-colors duration-200">Performance Analytics</a>
              </li>
              <li>
                <a href="#programs" className="hover:text-white transition-colors duration-200">Program Management</a>
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
                <a href="#docs" className="hover:text-white transition-colors duration-200">Documentation</a>
              </li>
              <li>
                <a href="#api" className="hover:text-white transition-colors duration-200">API Portal</a>
              </li>
              <li>
                <a href="#scouting" className="hover:text-white transition-colors duration-200">Scouting Reports</a>
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
                <a href="#privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors duration-200">Terms of Service</a>
              </li>
              <li>
                <a href="#cookies" className="hover:text-white transition-colors duration-200">Cookie Policy</a>
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
            <button className="hover:text-white transition-colors duration-200" title="Share">
              <FaShareAlt className="text-[14px]" />
            </button>
            <button className="hover:text-white transition-colors duration-200" title="Language">
              <FiGlobe className="text-[15px]" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}