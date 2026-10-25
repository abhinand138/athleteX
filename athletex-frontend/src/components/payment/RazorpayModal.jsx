import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import {
  FaTimes,
  FaLock,
  FaShieldAlt,
  FaCreditCard,
  FaQrcode,
  FaUniversity,
  FaWallet,
  FaCheckCircle,
  FaTimesCircle,
  FaBolt,
  FaChevronRight
} from "react-icons/fa";
import { SiRazorpay, SiGooglepay, SiPhonepe, SiPaytm } from "react-icons/si";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function RazorpayModal({
  isOpen,
  onClose,
  orderData,
  coach,
  packageType,
  athleteId,
  onPaymentSuccess,
  onPaymentFailure
}) {
  const [activeTab, setActiveTab] = useState("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [upiId, setUpiId] = useState("athlete@okhdfcbank");
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [selectedWallet, setSelectedWallet] = useState("PAYTM");
  const [timerSeconds, setTimerSeconds] = useState(720); // 12 mins timer

  // Test card details
  const [cardDetails, setCardDetails] = useState({
    number: "4242 4242 4242 4242",
    expiry: "09/29",
    cvv: "321",
    name: "Alex Rivera"
  });

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !orderData || !coach) return null;

  const displayAmount = orderData.displayAmount || 4999;
  const currency = orderData.currency || "INR";
  const athleteEmail = orderData.athleteEmail || "athlete@athletex.com";
  const athletePhone = orderData.athletePhone || "+91 9999999999";
  const packageName =
    packageType === "COACH_MONTHLY_SUBSCRIPTION"
      ? "Monthly Coaching Retainer"
      : "1-on-1 Consultation Session";

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleProcessPayment = async (status = "SUCCESS", method = activeTab) => {
    setIsProcessing(true);
    setProcessingStage("Connecting to Razorpay Banking Gateway...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (status === "FAILURE") {
        setProcessingStage("Declined by issuing bank.");
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsProcessing(false);
        toast.error("Payment failed: Transaction declined by bank");
        if (onPaymentFailure) onPaymentFailure("Transaction declined by bank");
        return;
      }

      setProcessingStage("Verifying payment signature with AthleteX Escrow...");
      await new Promise((resolve) => setTimeout(resolve, 700));

      const paymentId = "pay_rzp_" + Date.now().toString().slice(-8);
      const signature = "sig_rzp_verified_" + Math.random().toString(36).substring(2, 10);

      const verifyRes = await api.post("/payments/razorpay/verify", {
        razorpayOrderId: orderData.orderId || ("order_sim_" + Date.now()),
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        coachId: coach.id,
        athleteId: athleteId,
        paymentType: packageType,
        currency: currency,
        amount: displayAmount
      });

      setProcessingStage("Coaching access activated!");
      if (typeof window !== "undefined" && !window.navigator?.userAgent?.includes("jsdom")) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      setIsProcessing(false);
      onClose();
      if (onPaymentSuccess) {
        onPaymentSuccess(verifyRes.data);
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      setIsProcessing(false);
      const msg = err.response?.data || "Payment authorization failed";
      toast.error(typeof msg === "string" ? msg : "Payment verification failed");
      if (onPaymentFailure) onPaymentFailure(msg);
    }
  };

  const popularBanks = [
    { code: "HDFC", name: "HDFC Bank" },
    { code: "SBI", name: "State Bank of India" },
    { code: "ICICI", name: "ICICI Bank" },
    { code: "AXIS", name: "Axis Bank" },
    { code: "KOTAK", name: "Kotak Mahindra Bank" },
    { code: "PNB", name: "Punjab National Bank" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-[#0f172a] text-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700/60 flex flex-col max-h-[92vh]">
        {/* ========================================================================= */}
        {/* RAZORPAY BRANDED HEADER                                                   */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-[#0c2340] via-[#0b2b54] to-[#0a1e36] p-4 sm:p-5 border-b border-blue-900/40 relative">
          {/* Test Mode Ribbon */}
          <div className="absolute top-0 right-12 bg-amber-500/90 text-black text-[9px] font-black uppercase px-2.5 py-0.5 rounded-b-md tracking-wider shadow">
            ⚡ Razorpay Test Mode
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40"
          >
            <FaTimes className="text-base" />
          </button>

          <div className="flex items-start justify-between pr-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 text-xl shadow-lg">
                <SiRazorpay />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                    AthleteX High Performance
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                    Verified Merchant
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {packageName} • Coach {coach.fullName}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Amount</span>
              <span className="text-xl sm:text-2xl font-black text-white text-emerald-400">
                ₹{displayAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-blue-900/40 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
            <span>Customer: {athleteEmail}</span>
            <span>Contact: {athletePhone}</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PAYMENT BODY: LEFT TABS & RIGHT DETAILS                                    */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[380px]">
          {/* Left Navigation Sidebar */}
          <div className="w-full md:w-56 bg-[#090d16] border-r border-slate-800 p-2 sm:p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
            <button
              type="button"
              onClick={() => setActiveTab("UPI")}
              className={`flex-1 md:flex-initial flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                activeTab === "UPI"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FaQrcode className="text-sm" />
                <span>UPI / QR Code</span>
              </span>
              <FaChevronRight className="hidden md:block text-[10px] opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("CARDS")}
              className={`flex-1 md:flex-initial flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                activeTab === "CARDS"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FaCreditCard className="text-sm" />
                <span>Cards</span>
              </span>
              <FaChevronRight className="hidden md:block text-[10px] opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("NETBANKING")}
              className={`flex-1 md:flex-initial flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                activeTab === "NETBANKING"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FaUniversity className="text-sm" />
                <span>Netbanking</span>
              </span>
              <FaChevronRight className="hidden md:block text-[10px] opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("WALLET")}
              className={`flex-1 md:flex-initial flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                activeTab === "WALLET"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FaWallet className="text-sm" />
                <span>Wallets</span>
              </span>
              <FaChevronRight className="hidden md:block text-[10px] opacity-60" />
            </button>

            {/* Simulated Badge */}
            <div className="hidden md:block mt-auto p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-400 space-y-1">
              <span className="font-bold text-slate-300 block">Instant Simulation</span>
              <p>Safe sandbox environment enabled. No real charges occur.</p>
            </div>
          </div>

          {/* Right Content View */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto bg-[#0b1120]">
            {/* ===================== TAB 1: UPI & QR ===================== */}
            {activeTab === "UPI" && (
              <div className="space-y-4">
                <div className="text-center sm:flex sm:items-center sm:text-left gap-5 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                  {/* Dynamic QR Code */}
                  <div className="w-32 h-32 mx-auto sm:mx-0 p-2 bg-white rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
                    <QRCode
                      value={`upi://pay?pa=athletex.merchant@razorpay&pn=AthleteX&am=${displayAmount}&cu=INR`}
                      size={112}
                    />
                  </div>

                  <div className="mt-3 sm:mt-0 space-y-1.5 flex-1">
                    <span className="text-[11px] font-black uppercase text-blue-400 tracking-wider block">
                      Scan with any UPI App
                    </span>
                    <p className="text-xs text-slate-300">
                      Google Pay, PhonePe, Paytm, or BHIM.
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-lg text-slate-400">
                      <SiGooglepay title="Google Pay" className="text-white hover:text-blue-400" />
                      <SiPhonepe title="PhonePe" className="text-purple-400" />
                      <SiPaytm title="Paytm" className="text-sky-400" />
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono block pt-1">
                      ⏱ QR valid for {formatTimer(timerSeconds)}
                    </span>
                  </div>
                </div>

                {/* UPI ID Option */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Or Enter Virtual Payment Address (VPA / UPI ID)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleProcessPayment("SUCCESS", "UPI_VPA")}
                      disabled={isProcessing}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Verify & Pay
                    </button>
                  </div>
                </div>

                {/* Instant Simulator Action */}
                <button
                  type="button"
                  id="razorpay-simulate-upi-btn"
                  onClick={() => handleProcessPayment("SUCCESS", "UPI_QR")}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FaBolt />
                  <span>Simulate Approved UPI Payment (₹{displayAmount})</span>
                </button>
              </div>
            )}

            {/* ===================== TAB 2: CARDS ===================== */}
            {activeTab === "CARDS" && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Enter Card Information</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCardDetails({
                        number: "4242 4242 4242 4242",
                        expiry: "09/29",
                        cvv: "321",
                        name: "Alex Rivera"
                      })
                    }
                    className="text-[11px] font-bold text-blue-400 hover:underline cursor-pointer"
                  >
                    ⚡ Use Razorpay Test Card
                  </button>
                </div>

                <div className="space-y-2.5">
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    placeholder="Card Number"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />

                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      placeholder="MM/YY"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="password"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      placeholder="CVV"
                      maxLength={4}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    placeholder="Cardholder Name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="button"
                  id="razorpay-pay-card-btn"
                  onClick={() => handleProcessPayment("SUCCESS", "CARD")}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FaLock className="text-xs" />
                  <span>Pay ₹{displayAmount.toLocaleString("en-IN")} via Card</span>
                </button>
              </div>
            )}

            {/* ===================== TAB 3: NETBANKING ===================== */}
            {activeTab === "NETBANKING" && (
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-300 block">Select Popular Bank</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {popularBanks.map((bank) => (
                    <button
                      key={bank.code}
                      type="button"
                      onClick={() => setSelectedBank(bank.code)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                        selectedBank === bank.code
                          ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  id="razorpay-pay-netbanking-btn"
                  onClick={() => handleProcessPayment("SUCCESS", `NETBANKING_${selectedBank}`)}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FaUniversity className="text-xs" />
                  <span>Pay ₹{displayAmount.toLocaleString("en-IN")} with {selectedBank} NetBanking</span>
                </button>
              </div>
            )}

            {/* ===================== TAB 4: WALLETS ===================== */}
            {activeTab === "WALLET" && (
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-300 block">Select Digital Wallet</span>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: "PAYTM", name: "Paytm Wallet", icon: <SiPaytm className="text-sky-400 text-lg" /> },
                    { id: "PHONEPE", name: "PhonePe Wallet", icon: <SiPhonepe className="text-purple-400 text-lg" /> },
                    { id: "MOBIKWIK", name: "MobiKwik", icon: <FaWallet className="text-blue-400 text-lg" /> },
                    { id: "AIRTEL", name: "Airtel Payments", icon: <FaUniversity className="text-red-400 text-lg" /> }
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setSelectedWallet(w.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 text-xs font-bold transition-all ${
                        selectedWallet === w.id
                          ? "bg-blue-600/20 border-blue-500 text-white shadow"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      {w.icon}
                      <span>{w.name}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  id="razorpay-pay-wallet-btn"
                  onClick={() => handleProcessPayment("SUCCESS", `WALLET_${selectedWallet}`)}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FaWallet className="text-xs" />
                  <span>Pay ₹{displayAmount.toLocaleString("en-IN")} via {selectedWallet}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FOOTER: SECURITY BADGES & SIMULATION OPTIONS                               */}
        {/* ========================================================================= */}
        <div className="bg-[#090d16] p-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-emerald-400 text-sm" />
            <span>Secured by Razorpay • 256-bit SSL encryption</span>
          </div>

          <button
            type="button"
            onClick={() => handleProcessPayment("FAILURE")}
            disabled={isProcessing}
            className="text-[10px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <FaTimesCircle /> Test Failure Scenario
          </button>
        </div>

        {/* ========================================================================= */}
        {/* PROCESSING OVERLAY                                                        */}
        {/* ========================================================================= */}
        {isProcessing && (
          <div className="absolute inset-0 z-30 bg-[#0a101d]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg" />
            <div className="space-y-1">
              <h4 className="text-lg font-black text-white">Processing Transaction</h4>
              <p className="text-xs text-blue-400 font-mono animate-pulse">{processingStage}</p>
            </div>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Please do not close or refresh this window while Razorpay confirms the transaction.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
