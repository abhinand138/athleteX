import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCreditCard, FiAtSign, FiPhone, FiLock, FiUsers, FiChevronRight } from "react-icons/fi";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "ATHLETE",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/auth/register", formData);
      setMessage({ type: "success", text: response.data || "Registration Successful! Redirecting..." });
      
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: "ATHLETE",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error.response?.data || "Registration Failed. Please check your credentials." 
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current timestamp for terminal footer
  const getTerminalTime = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  };

  return (
    <div className="relative min-h-screen bg-brand-dark flex items-center justify-center py-12 px-6 grid-bg">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 radial-glow z-0 pointer-events-none opacity-40" />

      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        
        {/* AthleteX Badge */}
        <div className="mb-6 p-2.5 w-14 h-14 bg-[#0c0c0e]/95 border border-white/10 shadow-2xl rounded-lg flex items-center justify-center">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <span className="absolute w-1.5 h-full bg-blue-500 rounded-sm transform rotate-45 translate-x-[-1px]" />
            <span className="absolute w-1.5 h-full bg-brand-peach rounded-sm transform -rotate-45 translate-x-[1px]" />
            <span className="absolute w-2 h-2 bg-[#0c0c0e] transform rotate-45 scale-75" />
          </div>
        </div>

        {/* Form Title & Subtitle */}
        <div className="text-center mb-10 relative">
          <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-normal text-white uppercase leading-none mb-2">
            RECRUIT <br />
            ENROLLMENT
          </h1>
          
          <div className="flex items-center justify-center gap-2 mt-3">
            {/* LED Status Light */}
            <span className="w-1.5 h-1.5 rounded-full bg-brand-peach animate-pulse" />
            <span className="text-[8px] font-sans font-bold tracking-[0.25em] text-gray-500 uppercase">
              SECURE TERMINAL — PROSCOUT PRECISION SYSTEM V.2.4
            </span>
          </div>
        </div>

        {/* Form Box */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          
          {/* Notification Message */}
          {message.text && (
            <div className={`p-3 text-[10px] font-sans font-bold tracking-wider rounded-sm text-center border ${
              message.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}>
              {message.text}
            </div>
          )}

          {/* 01 FULL NAME */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-sans font-bold tracking-[0.2em] text-brand-peach uppercase">
              01 FULL NAME
            </label>
            <div className="relative flex items-center bg-[#111115]/40 border border-white/5 focus-within:border-brand-peach/40 focus-within:bg-[#111115]/70 transition-all duration-300 px-4 py-3.5 rounded-[2px]">
              <FiCreditCard className="text-gray-500 text-sm" />
              <input
                type="text"
                name="fullName"
                placeholder="ENTER FULL LEGAL NAME"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full bg-transparent border-none outline-none text-xs font-sans tracking-wider text-white pl-3.5 placeholder-gray-600 focus:ring-0"
                required
              />
            </div>
          </div>

          {/* 02 EMAIL & 03 CONTACT LINK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 02 EMAIL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-sans font-bold tracking-[0.2em] text-brand-peach uppercase">
                02 EMAIL ADDRESS
              </label>
              <div className="relative flex items-center bg-[#111115]/40 border border-white/5 focus-within:border-brand-peach/40 focus-within:bg-[#111115]/70 transition-all duration-300 px-4 py-3.5 rounded-[2px]">
                <FiAtSign className="text-gray-500 text-sm" />
                <input
                  type="email"
                  name="email"
                  placeholder="NAME@DOMAIN.COM"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none outline-none text-xs font-sans tracking-wider text-white pl-3.5 placeholder-gray-600 focus:ring-0"
                  required
                />
              </div>
            </div>

            {/* 03 CONTACT LINK */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-sans font-bold tracking-[0.2em] text-brand-peach uppercase">
                03 CONTACT LINK
              </label>
              <div className="relative flex items-center bg-[#111115]/40 border border-white/5 focus-within:border-brand-peach/40 focus-within:bg-[#111115]/70 transition-all duration-300 px-4 py-3.5 rounded-[2px]">
                <FiPhone className="text-gray-500 text-sm" />
                <input
                  type="text"
                  name="phone"
                  placeholder="+1 (000) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none outline-none text-xs font-sans tracking-wider text-white pl-3.5 placeholder-gray-600 focus:ring-0"
                  required
                />
              </div>
            </div>

          </div>

          {/* 04 ACCESS KEY */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-sans font-bold tracking-[0.2em] text-brand-peach uppercase">
              04 ACCESS KEY
            </label>
            <div className="relative flex items-center bg-[#111115]/40 border border-white/5 focus-within:border-brand-peach/40 focus-within:bg-[#111115]/70 transition-all duration-300 px-4 py-3.5 rounded-[2px]">
              <FiLock className="text-gray-500 text-sm" />
              <input
                type="password"
                name="password"
                placeholder="••••••••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-transparent border-none outline-none text-xs font-sans tracking-wider text-white pl-3.5 placeholder-gray-600 focus:ring-0"
                required
              />
            </div>
          </div>

          {/* 05 IDENTITY CLASSIFICATION */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-sans font-bold tracking-[0.2em] text-brand-peach uppercase">
              05 IDENTITY CLASSIFICATION
            </label>
            <div className="relative flex items-center bg-[#111115]/40 border border-white/5 focus-within:border-brand-peach/40 focus-within:bg-[#111115]/70 transition-all duration-300 px-4 py-3.5 rounded-[2px]">
              <FiUsers className="text-gray-500 text-sm" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-transparent border-none outline-none text-xs font-sans tracking-wider text-white pl-3.5 pr-8 placeholder-gray-600 focus:ring-0 cursor-pointer appearance-none uppercase"
              >
                <option value="ATHLETE" className="bg-[#0c0c0e] text-white">ATHLETE / COACH</option>
                <option value="COACH" className="bg-[#0c0c0e] text-white">COACH / RECRUITER</option>
              </select>
              {/* Dropdown Indicator */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[10px]">
                ▼
              </div>
            </div>
          </div>

          {/* AUTHORIZE ACCESS Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-4 bg-brand-peach hover:bg-brand-peach/90 disabled:bg-brand-peach/50 text-[#080809] font-sans font-bold text-xs tracking-[0.25em] rounded-sm transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer shadow-lg uppercase"
          >
            {isLoading ? "AUTHORIZING..." : "AUTHORIZE ACCESS"}
            {!isLoading && <FiChevronRight className="text-sm font-bold" />}
          </button>

          {/* Footer Navigation Link */}
          <p className="text-center text-[10px] tracking-wider text-gray-500 mt-4 uppercase">
            Already verified?{" "}
            <Link to="/login" className="text-brand-peach font-bold hover:underline transition-all">
              Login to Portal
            </Link>
          </p>

          {/* Terminal Signature Footer */}
          <div className="w-full flex items-center justify-center gap-4 my-2 opacity-50 select-none">
            <span className="h-[1px] flex-grow bg-white/5" />
            <span className="text-[7px] font-sans font-bold tracking-wider text-gray-700 uppercase">
              END_OF_TRANSMISSION // [{getTerminalTime()}]
            </span>
            <span className="h-[1px] flex-grow bg-white/5" />
          </div>

        </form>

      </div>
    </div>
  );
}