import { Link } from "react-router-dom";
import { FiUser } from "react-icons/fi";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#080809]/60 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex justify-between items-center">
        
        {/* Logo */}
        <Link
          to="/"
          className="text-xl md:text-2xl font-sans font-black tracking-[0.2em] text-white hover:text-brand-peach transition-colors duration-300"
        >
          ATHLETEX
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8 lg:gap-12 h-full text-[11px] font-sans font-semibold tracking-[0.25em] text-gray-400">
          <Link 
            to="/" 
            className="relative flex items-center h-full text-white hover:text-white transition-colors duration-300"
          >
            {/* Active Top Bar Indicator */}
            <span className="absolute top-0 left-0 w-full h-[2px] bg-brand-peach" />
            HOME
          </Link>
          <a 
            href="#talent" 
            className="flex items-center h-full hover:text-white transition-colors duration-300"
          >
            TALENT DISCOVERY
          </a>
          <a 
            href="#analytics" 
            className="flex items-center h-full hover:text-white transition-colors duration-300"
          >
            ANALYTICS
          </a>
          <a 
            href="#programs" 
            className="flex items-center h-full hover:text-white transition-colors duration-300"
          >
            PROGRAMS
          </a>
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-6">
          <Link
            to="/login"
            className="text-[11px] font-sans font-semibold tracking-[0.25em] text-white hover:text-brand-peach transition-colors duration-300 uppercase"
          >
            Sign In
          </Link>

          {/* User Profile Avatar Icon */}
          <Link
            to="/dashboard"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-peach/20 hover:border-brand-peach/40 border border-white/10 flex items-center justify-center text-white hover:text-brand-peach transition-all duration-300"
          >
            <FiUser className="text-base" />
          </Link>
        </div>

      </div>
    </nav>
  );
}