import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiLogOut, FiMenu, FiX, FiShield, FiArrowRight } from "react-icons/fi";
import { toast } from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse user session in Navbar", e);
    }
  }, []);

  const getDashboardPath = () => {
    if (!currentUser) return "/login";
    if (currentUser.role === "COACH") return "/coach/dashboard";
    if (currentUser.role === "ADMIN") return "/admin/dashboard";
    return "/dashboard";
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setCurrentUser(null);
    setMobileMenuOpen(false);
    toast.success("Successfully signed out");
    navigate("/");
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (window.location.pathname === "/") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate(`/#${id}`);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#080809]/80 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex justify-between items-center">
        
        {/* Logo */}
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-xl md:text-2xl font-sans font-black tracking-[0.2em] text-white hover:text-brand-peach transition-colors duration-300 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-brand-peach animate-pulse" />
          <span>ATHLETEX</span>
        </Link>

        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 lg:gap-12 h-full text-[11px] font-sans font-semibold tracking-[0.25em] text-gray-400">
          <button 
            type="button"
            onClick={() => {
              if (window.location.pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                navigate("/");
              }
            }}
            className="relative flex items-center h-full text-white hover:text-brand-peach transition-colors duration-300 cursor-pointer"
          >
            {/* Active Top Bar Indicator */}
            <span className="absolute top-0 left-0 w-full h-[2px] bg-brand-peach" />
            HOME
          </button>
          <button 
            type="button"
            onClick={() => scrollToSection("talent")}
            className="flex items-center h-full hover:text-white transition-colors duration-300 cursor-pointer"
          >
            TALENT DISCOVERY
          </button>
          <button 
            type="button"
            onClick={() => scrollToSection("analytics")}
            className="flex items-center h-full hover:text-white transition-colors duration-300 cursor-pointer"
          >
            ANALYTICS
          </button>
          <button 
            type="button"
            onClick={() => scrollToSection("programs")}
            className="flex items-center h-full hover:text-white transition-colors duration-300 cursor-pointer"
          >
            PROGRAMS
          </button>
        </div>

        {/* Right Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-5">
          {currentUser ? (
            <>
              {/* Role Badge & Direct Dashboard Link */}
              <Link
                to={getDashboardPath()}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-white/5 hover:bg-brand-peach/10 border border-white/10 hover:border-brand-peach/30 transition-all text-[11px] font-sans font-bold tracking-[0.2em] text-brand-peach uppercase"
              >
                {currentUser.role === "ADMIN" && <FiShield className="text-xs" />}
                <span>DASHBOARD</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-peach/20 text-brand-peach">
                  {currentUser.role || "ATHLETE"}
                </span>
              </Link>

              {/* User Profile Avatar Icon */}
              <Link
                to={getDashboardPath()}
                title={`Logged in as ${currentUser.fullName || currentUser.email || "User"}`}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-peach/20 hover:border-brand-peach/40 border border-white/10 flex items-center justify-center text-white hover:text-brand-peach transition-all duration-300"
              >
                <FiUser className="text-base" />
              </Link>

              {/* Quick Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-rose-500/20 hover:border-rose-500/40 border border-white/10 flex items-center justify-center text-gray-400 hover:text-rose-400 transition-all duration-300 cursor-pointer"
              >
                <FiLogOut className="text-sm" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[11px] font-sans font-semibold tracking-[0.25em] text-white hover:text-brand-peach transition-colors duration-300 uppercase py-2"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="px-5 py-2.5 bg-brand-peach hover:bg-brand-peach/90 text-brand-dark font-sans font-bold text-[10px] tracking-[0.2em] rounded-sm transition-all duration-300 hover:scale-105 shadow-md uppercase"
              >
                Get Started
              </Link>

              {/* User Avatar Icon */}
              <Link
                to="/login"
                title="Sign In"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-peach/20 hover:border-brand-peach/40 border border-white/10 flex items-center justify-center text-white hover:text-brand-peach transition-all duration-300"
              >
                <FiUser className="text-base" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex md:hidden items-center gap-3">
          {currentUser && (
            <Link
              to={getDashboardPath()}
              className="text-[10px] font-sans font-bold tracking-wider px-2.5 py-1 bg-brand-peach/10 text-brand-peach border border-brand-peach/30 rounded"
            >
              {currentUser.role}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-brand-peach hover:border-brand-peach/40 transition-all cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0c0e]/95 border-b border-white/10 px-6 py-6 flex flex-col gap-5 backdrop-blur-2xl animate-in slide-in-from-top-4 duration-300">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-left text-xs font-sans font-bold tracking-[0.2em] text-white hover:text-brand-peach py-2 flex items-center justify-between"
          >
            <span>HOME</span>
            <FiArrowRight className="text-gray-500" />
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("talent")}
            className="text-left text-xs font-sans font-bold tracking-[0.2em] text-gray-300 hover:text-brand-peach py-2 flex items-center justify-between"
          >
            <span>TALENT DISCOVERY</span>
            <FiArrowRight className="text-gray-500" />
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("analytics")}
            className="text-left text-xs font-sans font-bold tracking-[0.2em] text-gray-300 hover:text-brand-peach py-2 flex items-center justify-between"
          >
            <span>ANALYTICS</span>
            <FiArrowRight className="text-gray-500" />
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("programs")}
            className="text-left text-xs font-sans font-bold tracking-[0.2em] text-gray-300 hover:text-brand-peach py-2 flex items-center justify-between"
          >
            <span>PROGRAMS</span>
            <FiArrowRight className="text-gray-500" />
          </button>

          <div className="w-full h-[1px] bg-white/10 my-1" />

          {currentUser ? (
            <div className="flex flex-col gap-3">
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3.5 bg-brand-peach hover:bg-brand-peach/90 text-brand-dark font-sans font-bold text-xs tracking-[0.2em] text-center rounded-sm uppercase"
              >
                ENTER DASHBOARD ({currentUser.role})
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 bg-white/5 hover:bg-rose-500/20 text-rose-400 border border-white/10 font-sans font-semibold text-xs tracking-[0.2em] text-center rounded-sm uppercase flex items-center justify-center gap-2"
              >
                <FiLogOut />
                <span>SIGN OUT</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3.5 border border-white/20 hover:border-brand-peach text-white hover:text-brand-peach font-sans font-semibold text-xs tracking-[0.2em] text-center rounded-sm uppercase"
              >
                SIGN IN
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3.5 bg-brand-peach hover:bg-brand-peach/90 text-brand-dark font-sans font-bold text-xs tracking-[0.2em] text-center rounded-sm uppercase"
              >
                GET STARTED
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}