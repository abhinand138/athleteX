import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiCreditCard, FiAtSign, FiPhone, FiLock, FiUsers, FiChevronRight, FiCheck, FiX, FiKey, FiRefreshCw, FiArrowLeft, FiMail } from "react-icons/fi";
import api from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Registration Step: 1 for Details, 2 for OTP
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devOtpInfo, setDevOtpInfo] = useState(null);
  
  const roleParam = searchParams.get("role")?.toUpperCase();
  const initialRole = roleParam === "COACH" ? "COACH" : "ATHLETE";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: initialRole,
  });

  useEffect(() => {
    const r = searchParams.get("role")?.toUpperCase();
    if (r === "COACH" || r === "ATHLETE") {
      setFormData((prev) => ({ ...prev, role: r }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchDevOtpInfo = async (email) => {
    try {
      const res = await api.get(`/auth/dev-otp?email=${encodeURIComponent(email)}`);
      setDevOtpInfo(res.data);
    } catch (err) {
      console.log("Could not fetch OTP status:", err);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await api.post(`/auth/resend-otp?email=${encodeURIComponent(formData.email)}`);
      setMessage({ type: "success", text: res.data?.message || "Verification code resent!" });
      setResendCooldown(30);
      await fetchDevOtpInfo(formData.email);
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: getErrorMessage(err, "Failed to resend code.") 
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      await api.post("/auth/register", payload);
      setMessage({ type: "success", text: "Enrollment initiated! Enter your verification code below." });
      
      // Move to OTP step
      setStep(2);
      fetchDevOtpInfo(formData.email.trim());
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

      // Clear any old session from previous users (e.g. previous athlete)
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Auto-login to authenticate as the newly created user
      const loginRes = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password
      });

      if (loginRes.data && loginRes.data.token) {
        localStorage.setItem("user", JSON.stringify(loginRes.data));
        localStorage.setItem("token", loginRes.data.token);
      }

      setMessage({ type: "success", text: "Enrollment Verified! Entering Dashboard..." });

      const targetRole = loginRes.data?.role || formData.role;

      setTimeout(() => {
        if (targetRole === "COACH") {
          navigate("/coach/dashboard");
        } else if (targetRole === "ADMIN") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 1000);
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
                  <option value="ATHLETE" className="bg-[#0c0c0e] text-white">ATHLETE (Track Performance & Workouts)</option>
                  <option value="COACH" className="bg-[#0c0c0e] text-white">COACH (Manage Roster, Drills & Analytics)</option>
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
          <form onSubmit={handleOtpSubmit} className="w-full flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white transition-all cursor-pointer font-bold uppercase tracking-wider"
              >
                <FiArrowLeft className="text-xs" /> Edit Details
              </button>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Step 02 of 02</span>
            </div>

            <div className="text-center text-xs font-sans tracking-wider text-gray-400">
              A 6-digit verification code has been transmitted to<br/>
              <span className="text-brand-peach font-bold">{formData.email}</span>
            </div>

            {/* Dynamic Status Banner based on SMTP / Dev Mode */}
            {devOtpInfo?.smtpConfigured ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-sm text-left flex items-start gap-2.5">
                <FiMail className="text-emerald-400 text-sm mt-0.5 shrink-0" />
                <div className="text-[11px] text-gray-300 leading-relaxed">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider block text-[10px]">Email Dispatched</span>
                  Verification email sent via SMTP. Please check your inbox (and spam/promotions folder).
                </div>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-sm text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    Active Verification Code
                  </span>
                  {devOtpInfo?.otp && (
                    <button
                      type="button"
                      onClick={() => setOtp(devOtpInfo.otp)}
                      className="text-[9px] font-bold text-amber-300 underline hover:text-white cursor-pointer uppercase tracking-wider"
                    >
                      Click to Auto-Fill
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between bg-black/50 px-3 py-2 rounded border border-white/5">
                  <span className="font-mono text-base font-black tracking-[0.25em] text-brand-peach">
                    {devOtpInfo?.otp || "123456"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtp(devOtpInfo?.otp || "123456")}
                    className="px-2.5 py-1 bg-brand-peach text-black text-[10px] font-black uppercase tracking-wider rounded hover:bg-brand-peach/90 transition-all cursor-pointer shadow"
                  >
                    Use Code
                  </button>
                </div>

                <p className="text-[10px] text-gray-400 leading-normal">
                  <span className="text-gray-300 font-semibold">Note:</span> Live Gmail SMTP password not configured in backend. Code is generated above (or bypass with <span className="font-mono text-white font-bold">123456</span>).
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-sans font-bold tracking-[0.2em] text-brand-peach uppercase">VERIFICATION CODE (OTP)</label>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => setOtp("123456")} 
                    className="text-[9px] font-bold text-gray-400 hover:text-white cursor-pointer"
                  >
                    Bypass: 123456
                  </button>
                </div>
              </div>
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

            <button type="submit" disabled={isLoading || otp.length !== 6} className="w-full mt-2 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/30 disabled:text-gray-500 text-[#080809] font-sans font-bold text-xs tracking-[0.25em] rounded-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg uppercase">
              {isLoading ? "VERIFYING..." : "CONFIRM IDENTITY"}
              {!isLoading && <FiCheck className="text-sm font-bold" />}
            </button>

            {/* Resend OTP Button */}
            <div className="flex items-center justify-center gap-2 text-center text-[11px] text-gray-400">
              <span>Didn't receive code?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading || resendCooldown > 0}
                className="text-brand-peach font-bold hover:underline disabled:text-gray-600 disabled:no-underline transition-all cursor-pointer flex items-center gap-1"
              >
                <FiRefreshCw className={`text-[10px] ${isLoading ? "animate-spin" : ""}`} />
                <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}</span>
              </button>
            </div>
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