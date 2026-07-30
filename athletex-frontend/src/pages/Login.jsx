import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShield, FiGrid, FiKey, FiUsers, FiUserPlus } from "react-icons/fi";
import { FaFingerprint } from "react-icons/fa";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/auth/login", loginData);
      
      if (response.data === "Login Successful") {
        setMessage({ type: "success", text: "ACCESS GRANTED. INITIALIZING DASHBOARD..." });
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setMessage({ type: "error", text: response.data || "INVALID IDENTITY PARAMETERS" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "AUTHENTICATION TIMEOUT // INVALID SIGNATURE" });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-dark flex flex-col items-center justify-center py-12 px-6 grid-bg overflow-hidden select-none">
      
      {/* Visual Design Element: Corner Brackets */}
      <div className="absolute top-10 left-10 w-10 h-10 border-t-2 border-l-2 border-white/5 pointer-events-none hidden sm:block" />
      <div className="absolute top-10 right-10 w-10 h-10 border-t-2 border-r-2 border-white/5 pointer-events-none hidden sm:block" />
      <div className="absolute bottom-10 left-10 w-10 h-10 border-b-2 border-l-2 border-white/5 pointer-events-none hidden sm:block" />
      <div className="absolute bottom-10 right-10 w-10 h-10 border-b-2 border-r-2 border-white/5 pointer-events-none hidden sm:block" />

      {/* Subtle radial glow */}
      <div className="absolute inset-0 radial-glow z-0 pointer-events-none opacity-40" />

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        
        {/* AthleteX Badge */}
        <div className="mb-6 p-2.5 w-14 h-14 bg-[#0c0c0e]/95 border border-white/10 shadow-2xl rounded-lg flex items-center justify-center">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <span className="absolute w-1.5 h-full bg-blue-500 rounded-sm transform rotate-45 translate-x-[-1px]" />
            <span className="absolute w-1.5 h-full bg-brand-peach rounded-sm transform -rotate-45 translate-x-[1px]" />
            <span className="absolute w-2 h-2 bg-[#0c0c0e] transform rotate-45 scale-75" />
          </div>
        </div>

        {/* Form Container Card */}
        <div className="w-full bg-[#0c0c0e]/85 backdrop-blur-md border border-white/5 rounded-md p-8 md:p-10 shadow-2xl relative">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-sans font-black tracking-wider text-white uppercase leading-none">
                TERMINAL LOGIN
              </h1>
              
              <div className="flex items-center gap-2 mt-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-peach animate-pulse" />
                <span className="text-[8px] font-sans font-bold tracking-[0.2em] text-gray-500 uppercase">
                  SYSTEM STATUS: AWAITING AUTH
                </span>
              </div>
            </div>
            
            <FiShield className="text-gray-600 text-xl mt-1.5" />
          </div>

          <div className="w-full h-[1px] bg-white/5 mb-8" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Status Messages */}
            {message.text && (
              <div className={`p-3 text-[10px] font-sans font-bold tracking-wider rounded-sm text-center border ${
                message.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}>
                {message.text}
              </div>
            )}

            {/* IDENTITY TOKEN / EMAIL */}
            <div className="flex flex-col gap-2">
              <label className="text-[8px] font-sans font-bold tracking-[0.2em] text-gray-500 uppercase">
                [ 01 ] IDENTITY TOKEN / EMAIL
              </label>
              
              <div className="relative flex items-center bg-[#111115]/50 border border-white/5 focus-within:border-brand-peach/40 focus-within:bg-[#111115]/80 transition-all duration-300 px-4 py-3.5 rounded-sm">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email..."
                  value={loginData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none outline-none text-xs font-sans tracking-wider text-white placeholder-gray-700 focus:ring-0"
                  required
                />
                <FaFingerprint className="text-gray-600 text-sm flex-shrink-0" />
              </div>
            </div>

            {/* ACCESS SEQUENCE */}
            <div className="flex flex-col gap-2">
              <label className="text-[8px] font-sans font-bold tracking-[0.2em] text-gray-500 uppercase">
                [ 02 ] ACCESS SEQUENCE
              </label>
              
              <div className="relative flex items-center bg-[#111115]/50 border border-white/5 focus-within:border-brand-peach/40 focus-within:bg-[#111115]/80 transition-all duration-300 px-4 py-3.5 rounded-sm">
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••••••••••"
                  value={loginData.password}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none outline-none text-xs font-sans tracking-wider text-white placeholder-gray-700 focus:ring-0"
                  required
                />
                <FiGrid className="text-gray-600 text-sm flex-shrink-0" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-4 bg-brand-peach hover:bg-brand-peach/90 disabled:bg-brand-peach/50 text-[#080809] font-sans font-bold text-xs tracking-[0.25em] rounded-sm transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer shadow-lg uppercase"
            >
              {isLoading ? "AUTHENTICATING..." : "AUTHORIZE ACCESS"}
              {!isLoading && <FiKey className="text-xs" />}
            </button>

          </form>

          <div className="w-full h-[1px] bg-white/5 my-6" />

          {/* Navigation Links */}
          <div className="flex justify-between items-center text-[9px] font-sans font-bold tracking-[0.15em] text-gray-500 uppercase">
            <Link
              to="/register"
              className="flex items-center gap-2 hover:text-brand-peach transition-colors duration-200"
            >
              <FiUsers className="text-[11px]" />
              JOIN AS SCOUT
            </Link>
            
            <span className="text-white/5">|</span>
            
            <Link
              to="/register"
              className="flex items-center gap-2 hover:text-brand-peach transition-colors duration-200"
            >
              <FiUserPlus className="text-[11px]" />
              SIGN UP ATHLETE
            </Link>
          </div>

        </div>

        {/* Node & Build Info */}
        <div className="mt-8 text-center text-[8px] font-sans font-bold tracking-[0.25em] text-gray-700 uppercase flex flex-col gap-1.5 select-none">
          <span>SECURE NODE: AX-772-PRO</span>
          <span>VERSION: 2.4.0-STABLE</span>
        </div>

      </div>
    </div>
  );
}