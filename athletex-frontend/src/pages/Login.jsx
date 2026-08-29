import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShield, FiGrid, FiKey, FiUsers, FiUserPlus } from "react-icons/fi";
import { FaFingerprint, FaFutbol, FaBasketballBall, FaVolleyballBall, FaFootballBall, FaRunning, FaBicycle, FaDumbbell, FaTableTennis } from "react-icons/fa";
import { motion } from "framer-motion";
import api from "../services/api";

const SPORTS_ICONS = [
  { Icon: FaFutbol, color: "text-blue-500", size: 140, startX: "5vw", startY: "15vh", moveX: ["5vw", "25vw", "5vw"], moveY: ["15vh", "35vh", "15vh"], duration: 35 },
  { Icon: FaBasketballBall, color: "text-brand-peach", size: 110, startX: "85vw", startY: "10vh", moveX: ["85vw", "60vw", "85vw"], moveY: ["10vh", "40vh", "10vh"], duration: 38 },
  { Icon: FaRunning, color: "text-emerald-500", size: 180, startX: "20vw", startY: "75vh", moveX: ["20vw", "50vw", "20vw"], moveY: ["75vh", "50vh", "75vh"], duration: 32 },
  { Icon: FaDumbbell, color: "text-purple-500", size: 130, startX: "80vw", startY: "85vh", moveX: ["80vw", "65vw", "80vw"], moveY: ["85vh", "65vh", "85vh"], duration: 36 },
  { Icon: FaVolleyballBall, color: "text-amber-500", size: 120, startX: "45vw", startY: "5vh", moveX: ["45vw", "75vw", "45vw"], moveY: ["5vh", "25vh", "5vh"], duration: 34 },
  { Icon: FaBicycle, color: "text-rose-500", size: 160, startX: "10vw", startY: "85vh", moveX: ["10vw", "-10vw", "10vw"], moveY: ["85vh", "65vh", "85vh"], duration: 40 },
  { Icon: FaTableTennis, color: "text-cyan-500", size: 95, startX: "90vw", startY: "50vh", moveX: ["90vw", "70vw", "90vw"], moveY: ["50vh", "80vh", "50vh"], duration: 30 },
  { Icon: FaFootballBall, color: "text-fuchsia-500", size: 125, startX: "5vw", startY: "50vh", moveX: ["5vw", "30vw", "5vw"], moveY: ["50vh", "25vh", "50vh"], duration: 37 },
];

const PremiumBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {/* Animated Glowing Orbs */}
    <motion.div
      className="absolute w-[40vw] h-[40vw] rounded-full bg-blue-500/10 blur-[120px]"
      animate={{
        x: ['-20vw', '80vw', '-20vw'],
        y: ['-20vh', '80vh', '-20vh'],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
    />
    <motion.div
      className="absolute w-[45vw] h-[45vw] rounded-full bg-brand-peach/10 blur-[120px]"
      animate={{
        x: ['80vw', '-20vw', '80vw'],
        y: ['80vh', '-20vh', '80vh'],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />

    {/* Floating Sports Icons */}
    {SPORTS_ICONS.map((item, index) => {
      const { Icon, color, size, startX, startY, moveX, moveY, duration } = item;
      return (
        <motion.div
          key={index}
          className={`absolute ${color} drop-shadow-[0_0_15px_currentColor]`}
          initial={{ x: startX, y: startY, opacity: 0, rotate: 0 }}
          animate={{
            x: moveX,
            y: moveY,
            opacity: [0.15, 0.45, 0.15],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ left: 0, top: 0 }}
        >
          <Icon size={size} />
        </motion.div>
      );
    })}
  </div>
);

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

  console.log(response.data);

  if (response.data.message === "Login Successful") {

    localStorage.setItem("user", JSON.stringify(response.data));
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    setMessage({
      type: "success",
      text: response.data.message,
    });

    setTimeout(() => {
      if (response.data.role === "COACH") {
        navigate("/coach/dashboard");
      } else {
        navigate("/dashboard");
      }
    }, 1500);

  }

} catch (error) {

  setMessage({
    type: "error",
    text: error.response?.data?.message || "AUTHENTICATION FAILED",
  });

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

      {/* Premium Animated Background */}
      <PremiumBackground />

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