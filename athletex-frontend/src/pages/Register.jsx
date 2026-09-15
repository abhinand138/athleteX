import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCreditCard, FiAtSign, FiPhone, FiLock, FiUsers, FiChevronRight, FiCheck, FiX, FiKey } from "react-icons/fi";
import api from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

export default function Register() {
  const navigate = useNavigate();
  
  // Registration Step: 1 for Details, 2 for OTP
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "ATHLETE",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Password validation checks
  const passwordValidations = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[@$!%*?&]/.test(formData.password),
  };
  
  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  const getStrengthColor = () => {
    const validCount = Object.values(passwordValidations).filter(Boolean).length;
    if (validCount === 0) return "bg-gray-800";
    if (validCount <= 2) return "bg-rose-500";
    if (validCount === 3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStrengthWidth = () => {
    const validCount = Object.values(passwordValidations).filter(Boolean).length;
    return `${(validCount / 4) * 100}%`;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!isPasswordValid) {
      setMessage({ type: "error", text: "Please meet all password complexity requirements." });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };

      const response = await api.post("/auth/register", payload);
      setMessage({ type: "success", text: "OTP sent! Please check your email." });
      
      // Move to OTP step
      setStep(2);
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: getErrorMessage(error, "Registration Failed. Please check your inputs.")
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (otp.length !== 6) {
      setMessage({ type: "error", text: "OTP must be exactly 6 digits." });
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/verify-otp", {
        email: formData.email,
        otp: otp
      });
      
      setMessage({ type: "success", text: "Verification Successful! Redirecting..." });
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: getErrorMessage(error, "Verification Failed. Invalid OTP.")
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
            {step === 1 ? (
              <>RECRUIT <br /> ENROLLMENT</>
            ) : (
              <>IDENTITY <br /> VERIFICATION</>
            )}
          </h1>
          
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-peach animate-pulse" />
            <span className="text-[8px] font-sans font-bold tracking-[0.25em] text-gray-500 uppercase">
              SECURE TERMINAL — PROSCOUT PRECISION SYSTEM V.2.4
            </span>
          </div>
        </div>

        {/* Notification Message */}
        {message.text && (
          <div className={`w-full mb-6 p-3 text-[10px] font-sans font-bold tracking-wider rounded-sm text-center border ${
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}>
            {message.text}
          </div>
        )}

        {/* STEP 1: REGISTRATION FORM */}
        {step === 1 && (
          <form onSubmit={handleRegisterSubmit} className="w-full flex flex-col gap-6">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-sans font-bold tracking-[0.2em] text-brand-peach uppercase">01 FULL NAME</label>
              <div className="relative flex items-center bg-[#111115]/40 border border-white/5 focus-within:border-brand-peach/40 focus-within:bg-[#111115]/70 transition-all duration-300 px-4 py-3.5 rounded-[2px]">
                <FiCreditCard className="text-gray-500 text-sm" />
                <input type="text" name="fullName" placeholder="ENTER FULL LEGAL NAME" value={formData.fullName} onChange={handleChange} className="w-full bg-transparent border-none outline-none text-xs font-sans tracking-wider text-white pl-3.5 placeholder-gray-600 focus:ring-0" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-sans font-bold tracking-[0.2em] text-brand-peach uppercase">02 EMAIL ADDRESS</label>
                <div className="relative flex items-center bg-[#111115]/40 border border-white/5 focus-within:border-brand-peach/40 focus-within:bg-[#111115]/70 transition-all duration-300 px-4 py-3.5 rounded-[2px]">
                  <FiAtSign className="text-gray-500 text-sm" />
                  <input type="email" name="email" placeholder="NAME@DOMAIN.COM" value={formData.email} onChange={handleChange} className="w-full bg-transparent border-none outline-none text-xs font-sans tracking-wider text-white pl-3.5 placeholder-gray-600 focus:ring-0" required />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-sans font-bold tracking-[0.2em] text-brand-peach uppercase">03 CONTACT LINK</label>
                <div className="relative flex items-center bg-[#111115]/40 border border-white/5 focus-within:border-brand-peach/40 focus-within:bg-[#111115]/70 transition-all duration-300 px-4 py-3.5 rounded-[2px]">
                  <FiPhone className="text-gray-500 text-sm" />
                  <input type="text" name="phone" placeholder="+1 (000) 000-0000" value={formData.phone} onChange={handleChange} className="w-full bg-transparent border-none outline-none text-xs font-sans tracking-wider text-white pl-3.5 placeholder-gray-600 focus:ring-0" required />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-sans font-bold tracking-[0.2em] text-brand-peach uppercase">04 ACCESS KEY</label>
              <div className="relative flex items-center bg-[#111115]/40 border border-white/5 focus-within:border-brand-peach/40 focus-within:bg-[#111115]/70 transition-all duration-300 px-4 py-3.5 rounded-[2px]">
                <FiLock className="text-gray-500 text-sm" />
                <input type="password" name="password" placeholder="••••••••••••••" value={formData.password} onChange={handleChange} className="w-full bg-transparent border-none outline-none text-xs font-sans tracking-wider text-white pl-3.5 placeholder-gray-600 focus:ring-0" required />
              </div>
              
              {/* Password Strength Meter & Guidelines */}
              <div className="mt-2 bg-[#111115]/60 p-3 rounded-sm border border-white/5">
                <div className="h-1 w-full bg-gray-800 rounded-full mb-3 overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${getStrengthColor()}`} style={{ width: getStrengthWidth() }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-sans font-bold tracking-wider uppercase">
                  <div className={`flex items-center gap-1.5 ${passwordValidations.length ? 'text-emerald-400' : 'text-gray-600'}`}>
                    {passwordValidations.length ? <FiCheck /> : <FiX />} 8+ CHARACTERS
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordValidations.upper ? 'text-emerald-400' : 'text-gray-600'}`}>
                    {passwordValidations.upper ? <FiCheck /> : <FiX />} UPPERCASE (A-Z)
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordValidations.number ? 'text-emerald-400' : 'text-gray-600'}`}>
                    {passwordValidations.number ? <FiCheck /> : <FiX />} NUMBER (0-9)
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordValidations.special ? 'text-emerald-400' : 'text-gray-600'}`}>
                    {passwordValidations.special ? <FiCheck /> : <FiX />} SPECIAL (@$!%*?&)
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-sans font-bold tracking-[0.2em] text-brand-peach uppercase">05 IDENTITY CLASSIFICATION</label>
              <div className="relative flex items-center bg-[#111115]/40 border border-white/5 focus-within:border-brand-peach/40 focus-within:bg-[#111115]/70 transition-all duration-300 px-4 py-3.5 rounded-[2px]">
                <FiUsers className="text-gray-500 text-sm" />
                <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-transparent border-none outline-none text-xs font-sans tracking-wider text-white pl-3.5 pr-8 placeholder-gray-600 focus:ring-0 cursor-pointer appearance-none uppercase">
                  <option value="ATHLETE" className="bg-[#0c0c0e] text-white">ATHLETE / COACH</option>
                  <option value="COACH" className="bg-[#0c0c0e] text-white">COACH / RECRUITER</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[10px]">▼</div>
              </div>
            </div>

            <button type="submit" disabled={isLoading || !isPasswordValid} className="w-full mt-2 py-4 bg-brand-peach hover:bg-brand-peach/90 disabled:bg-brand-peach/30 disabled:text-gray-500 text-[#080809] font-sans font-bold text-xs tracking-[0.25em] rounded-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg uppercase">
              {isLoading ? "AUTHORIZING..." : "INITIATE ENROLLMENT"}
              {!isLoading && <FiChevronRight className="text-sm font-bold" />}
            </button>
            
            <p className="text-center text-[10px] tracking-wider text-gray-500 mt-2 uppercase">
              Already verified? <Link to="/login" className="text-brand-peach font-bold hover:underline transition-all">Login to Portal</Link>
            </p>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION FORM */}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center text-xs font-sans tracking-wider text-gray-400 mb-2">
              A 6-digit verification code has been transmitted to<br/>
              <span className="text-brand-peach font-bold">{formData.email}</span>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-sans font-bold tracking-[0.2em] text-brand-peach uppercase">VERIFICATION CODE (OTP)</label>
              <div className="relative flex items-center bg-[#111115]/40 border border-white/5 focus-within:border-brand-peach/40 focus-within:bg-[#111115]/70 transition-all duration-300 px-4 py-3.5 rounded-[2px]">
                <FiKey className="text-gray-500 text-sm" />
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="000000" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                  className="w-full bg-transparent border-none outline-none text-center text-xl font-mono tracking-[0.5em] text-white placeholder-gray-600 focus:ring-0" 
                  required 
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading || otp.length !== 6} className="w-full mt-4 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/30 disabled:text-gray-500 text-[#080809] font-sans font-bold text-xs tracking-[0.25em] rounded-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg uppercase">
              {isLoading ? "VERIFYING..." : "CONFIRM IDENTITY"}
              {!isLoading && <FiCheck className="text-sm font-bold" />}
            </button>
          </form>
        )}

        {/* Terminal Signature Footer */}
        <div className="w-full flex items-center justify-center gap-4 mt-8 opacity-50 select-none">
          <span className="h-[1px] flex-grow bg-white/5" />
          <span className="text-[7px] font-sans font-bold tracking-wider text-gray-700 uppercase">
            END_OF_TRANSMISSION // [{getTerminalTime()}]
          </span>
          <span className="h-[1px] flex-grow bg-white/5" />
        </div>

      </div>
    </div>
  );
}