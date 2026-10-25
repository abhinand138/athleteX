import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  FaSearch,
  FaUserShield,
  FaAward,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaTimes,
  FaCheckCircle,
  FaStar,
  FaDumbbell,
  FaRunning,
  FaRegLightbulb,
  FaCreditCard,
  FaLock,
  FaShieldAlt,
  FaCheck,
  FaBolt,
  FaCalendarCheck,
  FaComments,
  FaReceipt
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import RazorpayModal from "../../components/payment/RazorpayModal";

export default function AthleteCoaches() {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All");
  const [selectedBudget, setSelectedBudget] = useState("All");
  const [selectedCoach, setSelectedCoach] = useState(null);

  // Checkout Modal State
  const [checkoutCoach, setCheckoutCoach] = useState(null);
  const [packageType, setPackageType] = useState("COACH_MONTHLY_SUBSCRIPTION");
  const [paymentGatewayTab, setPaymentGatewayTab] = useState("RAZORPAY");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState(null);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayOrderData, setRazorpayOrderData] = useState(null);

  // Simulated Card State
  const [cardData, setCardData] = useState({
    cardNumber: "4242 •••• •••• 4242",
    expiry: "12/28",
    cvv: "888",
    cardholderName: "Alex Rivera",
    notes: ""
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const athleteId = user.id || user._id || user.userId || user.email || "";

  // Dynamically load Razorpay checkout script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {
        // cleanup safe
      }
    };
  }, []);

  useEffect(() => {
    fetchCoaches();
  }, [athleteId]);

  const fetchCoaches = async () => {
    setLoading(true);
    try {
      const response = await api.get("/coaches/directory", {
        params: { athleteId }
      });
      let directory = Array.isArray(response.data) ? response.data : [];

      // Also cross-reference completed payments for this athlete to guarantee hired tagging
      if (athleteId) {
        try {
          const paymentsRes = await api.get("/payments/history", {
            params: { athleteId }
          });
          const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];
          const completedCoachIds = new Set(
            payments
              .filter((p) => p.paymentStatus === "COMPLETED" || !p.paymentStatus)
              .map((p) => p.coachId)
              .filter(Boolean)
          );
          if (completedCoachIds.size > 0) {
            directory = directory.map((c) => {
              if (completedCoachIds.has(c.id)) {
                return { 
                  ...c, 
                  isAssignedToAthlete: true, 
                  assignedToAthlete: true, 
                  isHired: true, 
                  hired: true 
                };
              }
              return c;
            });
          }
        } catch (e) {
          // ignore payment cross-check error
        }
      }

      setCoaches(directory);
    } catch (error) {
      console.error("Error fetching coaches directory:", error);
      setCoaches([
        {
          id: "coach-1",
          fullName: "Marcus Vance",
          email: "marcus.vance@athletex.com",
          phone: "+1 (555) 234-5678",
          sport: "Track & Field",
          title: "Elite Performance Director",
          specialization: "Sprint Biomechanics & Acceleration",
          experienceYears: 12,
          certifications: "USATF Level 3, CSCS, EXOS High Performance",
          city: "Austin",
          state: "TX",
          country: "India",
          bio: "Former Olympic trials finalist specializing in sprint mechanics, top-end velocity development, and neural recovery protocols.",
          profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
          isAssignedToAthlete: true,
          assignedToAthlete: true,
          isHired: true,
          hired: true,
          monthlyRate: 4999.0,
          consultationRate: 1999.0,
          currency: "INR"
        },
        {
          id: "coach-2",
          fullName: "Dr. Elena Rostova",
          email: "elena.rostova@athletex.com",
          phone: "+1 (555) 876-5432",
          sport: "Basketball & Explosiveness",
          title: "Senior Strength Specialist",
          specialization: "Vertical Jump & Plyometrics",
          experienceYears: 9,
          certifications: "Ph.D. Kinesiology, CSCS, FMS Level 2",
          city: "Chicago",
          state: "IL",
          country: "India",
          bio: "Pioneer in reactive strength index (RSI) optimization, rate of force development (RFD), and lower limb injury prevention.",
          profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
          isAssignedToAthlete: false,
          monthlyRate: 5499.0,
          consultationRate: 2499.0,
          currency: "INR"
        },
        {
          id: "coach-3",
          fullName: "Coach David Miller",
          email: "david.miller@athletex.com",
          phone: "+1 (555) 345-6789",
          sport: "Endurance & Triathlon",
          title: "VO2 Max & Aerobic Capacity Lead",
          specialization: "Metabolic Efficiency & Heart Rate Dynamics",
          experienceYears: 15,
          certifications: "Ironman Certified Coach, USA Triathlon Level 2",
          city: "Boulder",
          state: "CO",
          country: "India",
          bio: "Master of lactate threshold training, zone-based aerobic periodization, and altitude adaptation strategies.",
          profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
          isAssignedToAthlete: false,
          monthlyRate: 3999.0,
          consultationRate: 1799.0,
          currency: "INR"
        },
        {
          id: "coach-4",
          fullName: "Sarah Jenkins",
          email: "sarah.jenkins@athletex.com",
          phone: "+1 (555) 456-7890",
          sport: "Soccer & Football",
          title: "Movement Quality Coach",
          specialization: "Change of Direction & Deceleration Control",
          experienceYears: 8,
          certifications: "UEFA A License, NASM-PES, PRI Specialist",
          city: "Seattle",
          state: "WA",
          country: "India",
          bio: "Expert in multi-planar movement efficiency, agility drills, and return-to-play ACL rehabilitation protocols.",
          profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
          isAssignedToAthlete: false,
          monthlyRate: 5999.0,
          consultationRate: 2999.0,
          currency: "INR"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const safeCoaches = Array.isArray(coaches) ? coaches : [];
  const isCoachHired = (c) => Boolean(
    c?.isHired ?? 
    c?.hired ?? 
    c?.isAssignedToAthlete ?? 
    c?.assignedToAthlete
  );
  const assignedCoach = safeCoaches.find(isCoachHired);

  const categories = [
    "All",
    "Sprint Biomechanics",
    "Vertical Jump",
    "Metabolic Efficiency",
    "Change of Direction",
    "Strength & Conditioning"
  ];

  const budgetFilters = [
    { label: "All Rates", value: "All" },
    { label: "Under ₹4,000", value: "under4000" },
    { label: "₹4,000 - ₹5,500", value: "4000to5500" },
    { label: "₹5,500+", value: "above5500" }
  ];

  const filteredCoaches = safeCoaches.filter((coach) => {
    const matchesSearch =
      coach.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.sport.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedSpecialization === "All" ||
      coach.specialization.toLowerCase().includes(selectedSpecialization.toLowerCase());

    const rate = coach.monthlyRate != null ? coach.monthlyRate : 4999;
    let matchesBudget = true;
    if (selectedBudget === "under4000") matchesBudget = rate < 4000;
    else if (selectedBudget === "4000to5500") matchesBudget = rate >= 4000 && rate <= 5500;
    else if (selectedBudget === "above5500") matchesBudget = rate > 5500;

    return matchesSearch && matchesCategory && matchesBudget;
  });

  const handleOpenCheckout = (coach, type = "COACH_MONTHLY_SUBSCRIPTION") => {
    setPackageType(type);
    setCheckoutCoach(coach);
    setSelectedCoach(null);
  };

  const handleFillSandboxCard = () => {
    setCardData({
      cardNumber: "4242 4242 4242 4242",
      expiry: "09/29",
      cvv: "321",
      cardholderName: user.fullName || "Alex Rivera",
      notes: "Sprint & Combine Development Retainer"
    });
    toast.success("Sandbox test card populated!");
  };

  const handleExecutePayment = async () => {
    if (!checkoutCoach) return;
    setIsProcessingPayment(true);

    try {
      const payload = {
        coachId: checkoutCoach.id,
        athleteId: athleteId,
        paymentType: packageType,
        paymentMethod: "SANDBOX_CARD",
        cardNumber: cardData.cardNumber,
        expiry: cardData.expiry,
        cvv: cardData.cvv,
        cardholderName: cardData.cardholderName,
        notes: cardData.notes
      };

      const res = await api.post("/payments/checkout", payload);
      setCompletedReceipt(res.data);
      setCheckoutCoach(null);
      toast.success("Payment confirmed! Coaching access activated.");
      fetchCoaches(); // Refresh coach assigned badges
    } catch (error) {
      console.error("Payment failed:", error);
      const msg = error.response?.data || "Payment failed. Please verify your details.";
      toast.error(typeof msg === "string" ? msg : "Payment could not be processed.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!checkoutCoach) return;
    setIsProcessingPayment(true);

    try {
      // 1. Create order on backend
      const orderRes = await api.post("/payments/razorpay/create-order", {
        coachId: checkoutCoach.id,
        athleteId: athleteId,
        paymentType: packageType,
        currency: "INR"
      });

      const orderData = orderRes.data;
      setRazorpayOrderData(orderData);

      // If backend created a genuine server-side order with live Razorpay keys, launch official Razorpay SDK
      if (
        orderData.orderId &&
        !orderData.orderId.startsWith("order_sim_") &&
        orderData.simulated !== true &&
        typeof window.Razorpay === "function"
      ) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountInPaise,
          currency: orderData.currency || "INR",
          name: "AthleteX High Performance",
          description: orderData.description || `Coaching Access: ${checkoutCoach.fullName}`,
          image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=200",
          order_id: orderData.orderId,
          prefill: {
            name: orderData.athleteName || user.fullName || "Alex Rivera",
            email: orderData.athleteEmail || user.email || "athlete@athletex.com",
            contact: orderData.athletePhone || "+919999999999"
          },
          notes: {
            coachId: checkoutCoach.id,
            athleteId: athleteId,
            paymentType: packageType
          },
          theme: {
            color: "#EE9B74"
          },
          handler: async function (response) {
            try {
              setIsProcessingPayment(true);
              const verifyRes = await api.post("/payments/razorpay/verify", {
                razorpayOrderId: response.razorpay_order_id || orderData.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                coachId: checkoutCoach.id,
                athleteId: athleteId,
                paymentType: packageType,
                currency: orderData.currency || "INR",
                amount: orderData.displayAmount
              });

              setCompletedReceipt(verifyRes.data);
              setCheckoutCoach(null);
              toast.success("Razorpay payment confirmed! Coaching access activated.");
              fetchCoaches();
            } catch (err) {
              console.error("Razorpay verification failed:", err);
              toast.error("Payment verification failed. Please check with your bank.");
            } finally {
              setIsProcessingPayment(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
              toast("Razorpay checkout closed", { icon: "ℹ️" });
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          toast.error("Payment failed: " + (response.error?.description || "Transaction declined"));
          setIsProcessingPayment(false);
        });
        rzp.open();
      } else {
        // Open the interactive Razorpay Payment Gateway Modal
        setShowRazorpayModal(true);
      }
    } catch (error) {
      console.error("Razorpay order error:", error);
      const msg = error.response?.data || "Failed to initialize Razorpay checkout.";
      toast.error(typeof msg === "string" ? msg : "Could not open Razorpay checkout.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-peach/10 rounded-xl border border-brand-peach/20 text-brand-peach">
                <FaUserShield className="text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-wide">
                  Coach Marketplace & Network
                </h1>
                <p className="text-gray-400 text-sm mt-0.5">
                  Hire certified high-performance athletic specialists, book 1-on-1 drill reviews, and unlock customized training.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {coaches.length} Certified Coaches Active
            </span>
          </div>
        </div>

        {/* Assigned Coach Spotlight Banner (If Available) */}
        {assignedCoach && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/60 via-brand-dark/95 to-brand-dark border border-emerald-500/30 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="relative">
                  <img
                    src={assignedCoach.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"}
                    alt={assignedCoach.fullName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-emerald-400/60 shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black text-xs font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                    <FaCheckCircle className="text-xs" /> HIRED
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                      Your Hired Coach
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FaMapMarkerAlt className="text-emerald-400" />
                      {assignedCoach.city}, {assignedCoach.state}
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-white tracking-wide">
                    {assignedCoach.fullName}
                  </h2>
                  <p className="text-brand-peach font-semibold text-sm">
                    {assignedCoach.title} • {assignedCoach.sport}
                  </p>
                  <p className="text-gray-300 text-xs line-clamp-2 max-w-2xl pt-1">
                    {assignedCoach.bio}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-4 lg:pt-0 border-t sm:border-t-0 border-white/10">
                <div className="text-left sm:text-right">
                  <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Monthly Rate</div>
                  <div className="text-lg font-black text-emerald-300">
                    ₹{(assignedCoach.monthlyRate || 4999).toLocaleString('en-IN')}/mo
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate("/chat")}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center gap-2"
                  >
                    <FaComments /> Direct Chat
                  </button>
                  <button
                    onClick={() => setSelectedCoach(assignedCoach)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10 flex items-center gap-2"
                  >
                    <FaRegLightbulb className="text-brand-peach" /> Full Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="space-y-4 bg-brand-dark/60 p-5 rounded-2xl border border-white/10 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search coach by name, sport, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-brand-peach transition-all"
              />
            </div>

            {/* Budget Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <span className="text-xs font-semibold text-gray-400 mr-1">Rate:</span>
              {budgetFilters.map((b) => (
                <button
                  key={b.value}
                  onClick={() => setSelectedBudget(b.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    selectedBudget === b.value
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Specialization Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-white/5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedSpecialization(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedSpecialization === cat
                    ? "bg-brand-peach text-black border-brand-peach shadow-[0_0_15px_rgba(238,155,116,0.3)]"
                    : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Coaches Grid Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaAward className="text-brand-peach" /> All Marketplace Coaches ({filteredCoaches.length})
            </h3>
            <span className="text-xs text-gray-400">
              Showing certified performance directors with instant booking
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : filteredCoaches.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <FaUserShield className="text-4xl text-gray-500 mx-auto mb-3" />
              <p className="text-white font-bold">No coaches found matching your filters.</p>
              <p className="text-xs text-gray-400 mt-1">Try resetting your search query or selecting 'All Rates'.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoaches.map((coach) => (
                <div
                  key={coach.id}
                  className={`group relative rounded-2xl bg-gradient-to-b from-[#15171c] to-brand-dark border transition-all duration-300 hover:-translate-y-1.5 shadow-xl overflow-hidden flex flex-col justify-between ${
                    isCoachHired(coach)
                      ? "border-emerald-500/60 shadow-emerald-500/15 bg-gradient-to-b from-emerald-950/20 via-[#15171c] to-brand-dark"
                      : "border-white/10 hover:border-brand-peach/50 hover:shadow-brand-peach/10"
                  }`}
                >
                  {/* Status / Pricing Tag Top Right */}
                  <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2">
                    {isCoachHired(coach) ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                        <FaCheckCircle className="text-xs" /> HIRED
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-brand-peach/20 border border-brand-peach/40 text-brand-peach text-xs font-black shadow-md flex items-center gap-1">
                        <FaBolt className="text-[10px]" /> ₹{(coach.monthlyRate || 4999).toLocaleString('en-IN')}/mo
                      </span>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Coach Top Profile Header */}
                    <div className="flex items-start gap-4 pr-16">
                      <img
                        src={coach.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"}
                        alt={coach.fullName}
                        className="w-16 h-16 rounded-xl object-cover border border-white/20 group-hover:border-brand-peach transition-colors shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-extrabold text-brand-peach tracking-wide uppercase block truncate">
                          {coach.sport}
                        </span>
                        <h4 className="text-lg font-bold text-white truncate group-hover:text-brand-peach transition-colors">
                          {coach.fullName}
                        </h4>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{coach.title}</p>
                      </div>
                    </div>

                    {/* Specialization Pill */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <FaDumbbell className="text-brand-peach" /> Primary Specialization
                      </div>
                      <div className="text-xs font-bold text-gray-200 truncate">
                        {coach.specialization}
                      </div>
                    </div>

                    {/* Rates & Experience Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-gray-400 block text-[10px]">Monthly Coaching</span>
                        <span className="text-white font-extrabold mt-0.5 block text-sm">
                          ₹{(coach.monthlyRate || 4999).toLocaleString('en-IN')} <span className="text-[10px] text-gray-400 font-normal">/mo</span>
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-gray-400 block text-[10px]">1-on-1 Consultation</span>
                        <span className="text-emerald-400 font-extrabold mt-0.5 block text-sm">
                          ₹{(coach.consultationRate || 1999).toLocaleString('en-IN')} <span className="text-[10px] text-gray-400 font-normal">/session</span>
                        </span>
                      </div>
                    </div>

                    {/* Bio snippet */}
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {coach.bio}
                    </p>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-4 bg-white/5 border-t border-white/10 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCoach(coach)}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10 text-center"
                    >
                      Profile & Bio
                    </button>
                    {isCoachHired(coach) ? (
                      <div className="flex-1 flex items-center gap-1.5">
                        <button
                          disabled
                          className="py-2.5 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold text-[11px] flex items-center justify-center gap-1 select-none shadow-sm cursor-default"
                        >
                          <FaCheckCircle className="text-[10px]" /> Hired
                        </button>
                        <button
                          onClick={() => navigate("/chat")}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FaComments /> Message
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenCheckout(coach, "COACH_MONTHLY_SUBSCRIPTION")}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-peach to-orange-500 hover:opacity-95 text-black font-extrabold text-xs transition-all shadow-md shadow-brand-peach/20 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <FaCreditCard /> Hire Coach
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coach Detail Modal */}
        {selectedCoach && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-2xl bg-brand-dark border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin">
              {/* Modal Close Button */}
              <button
                onClick={() => setSelectedCoach(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all"
              >
                <FaTimes className="text-lg" />
              </button>

              {/* Modal Header */}
              <div className="flex items-start gap-5">
                <img
                  src={selectedCoach.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"}
                  alt={selectedCoach.fullName}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-peach shadow-xl"
                />
                <div className="space-y-1">
                  {isCoachHired(selectedCoach) && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 mb-1.5 shadow-md">
                      <FaCheckCircle className="text-xs" /> HIRED
                    </span>
                  )}
                  <h3 className="text-2xl font-black text-white tracking-wide">
                    {selectedCoach.fullName}
                  </h3>
                  <p className="text-brand-peach font-bold text-sm">
                    {selectedCoach.title} • {selectedCoach.sport}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 pt-0.5">
                    <FaMapMarkerAlt className="text-brand-peach" /> {selectedCoach.city}, {selectedCoach.state}, {selectedCoach.country}
                  </p>
                </div>
              </div>

              {/* Pricing & Rate Highlights */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Monthly Training Retainer</span>
                  <div className="text-xl font-black text-white mt-0.5">
                    ₹{selectedCoach.monthlyRate || 4999} <span className="text-xs text-gray-400 font-normal">/month</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Includes custom daily workouts, drill reviews, and 1-on-1 direct chat.</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">1-on-1 Consultation</span>
                  <div className="text-xl font-black text-emerald-400 mt-0.5">
                    ₹{selectedCoach.consultationRate || 1999} <span className="text-xs text-gray-400 font-normal">/session</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Single 45-minute video drill biomechanics assessment.</p>
                </div>
              </div>

              {/* Specialization & Bio Section */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <h4 className="text-xs font-bold text-brand-peach uppercase tracking-wider flex items-center gap-2">
                    <FaRunning /> Key Specialization
                  </h4>
                  <p className="text-sm font-bold text-white">
                    {selectedCoach.specialization}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <FaGraduationCap className="text-brand-peach" /> Certifications & Qualifications
                  </h4>
                  <p className="text-xs text-gray-300 bg-white/5 p-3 rounded-xl border border-white/10">
                    {selectedCoach.certifications}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Coach Biography & Training Philosophy
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                    {selectedCoach.bio}
                  </p>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <FaEnvelope className="text-brand-peach" /> {selectedCoach.email}
                  </span>
                </div>

                {isCoachHired(selectedCoach) ? (
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs flex items-center gap-1.5 shadow-sm">
                      <FaCheckCircle className="text-emerald-400" /> Hired Coach
                    </span>
                    <button
                      onClick={() => {
                        setSelectedCoach(null);
                        navigate("/chat");
                      }}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FaComments /> Direct Chat
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => handleOpenCheckout(selectedCoach, "COACH_CONSULTATION_SESSION")}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10 cursor-pointer"
                    >
                      Book Session (₹{selectedCoach.consultationRate || 1999})
                    </button>
                    <button
                      onClick={() => handleOpenCheckout(selectedCoach, "COACH_MONTHLY_SUBSCRIPTION")}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brand-peach to-orange-500 text-black font-extrabold text-xs hover:opacity-95 transition-all shadow-lg shadow-brand-peach/20 cursor-pointer"
                    >
                      Hire Coach (₹{selectedCoach.monthlyRate || 4999}/mo)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CHECKOUT MODAL                                                            */}
        {/* ========================================================================= */}
        {checkoutCoach && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-xl bg-[#121418] border border-brand-peach/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto scrollbar-thin">
              {/* Close Button */}
              <button
                onClick={() => setCheckoutCoach(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all"
              >
                <FaTimes />
              </button>

              {/* Checkout Title */}
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-3 rounded-xl bg-brand-peach/10 text-brand-peach border border-brand-peach/30">
                  <FaCreditCard className="text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-wide">
                    Coach Marketplace Checkout
                  </h3>
                  <p className="text-xs text-gray-400">
                    Instant coaching activation with 256-bit encrypted checkout
                  </p>
                </div>
              </div>

              {/* Coach Summary Header */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                <img
                  src={checkoutCoach.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"}
                  alt={checkoutCoach.fullName}
                  className="w-14 h-14 rounded-xl object-cover border border-brand-peach/50"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-white truncate">
                    {checkoutCoach.fullName}
                  </h4>
                  <p className="text-xs text-brand-peach font-semibold truncate">
                    {checkoutCoach.title} • {checkoutCoach.sport}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">
                    Specialist: {checkoutCoach.specialization}
                  </p>
                </div>
              </div>

              {/* Package Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                  Select Coaching Package
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPackageType("COACH_MONTHLY_SUBSCRIPTION")}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      packageType === "COACH_MONTHLY_SUBSCRIPTION"
                        ? "bg-brand-peach/15 border-brand-peach shadow-lg shadow-brand-peach/10"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-brand-peach">Monthly Retainer</span>
                      <span className="text-base font-black text-white">₹{checkoutCoach.monthlyRate || 4999}</span>
                    </div>
                    <p className="text-[11px] text-gray-300 mt-1">
                      Full custom workout assignments, form checks, and direct 1-on-1 chat.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPackageType("COACH_CONSULTATION_SESSION")}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      packageType === "COACH_CONSULTATION_SESSION"
                        ? "bg-brand-peach/15 border-brand-peach shadow-lg shadow-brand-peach/10"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-emerald-400">1-on-1 Session</span>
                      <span className="text-base font-black text-white">₹{checkoutCoach.consultationRate || 1999}</span>
                    </div>
                    <p className="text-[11px] text-gray-300 mt-1">
                      Single drill biomechanics breakdown & combine preparation review.
                    </p>
                  </button>
                </div>
              </div>

              {/* Order Cost Breakdown */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>Coach Package Fee</span>
                  <span className="font-bold text-white">
                    ₹{packageType === "COACH_MONTHLY_SUBSCRIPTION" ? (checkoutCoach.monthlyRate || 4999) : (checkoutCoach.consultationRate || 1999)}.00
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>AthleteX Platform Service & Escrow (10%)</span>
                  <span>Included</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-black text-white">
                  <span>Total Amount Due</span>
                  <span className="text-brand-peach text-base">
                    ₹{packageType === "COACH_MONTHLY_SUBSCRIPTION" ? (checkoutCoach.monthlyRate || 4999) : (checkoutCoach.consultationRate || 1999)}.00 INR
                  </span>
                </div>
              </div>

              {/* Payment Method Switcher Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                  Select Payment Gateway
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    id="tab-razorpay-btn"
                    onClick={() => setPaymentGatewayTab("RAZORPAY")}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      paymentGatewayTab === "RAZORPAY"
                        ? "bg-brand-peach/15 border-brand-peach text-brand-peach font-bold shadow-lg shadow-brand-peach/10"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    <div className="text-sm font-black">⚡ Razorpay</div>
                    <p className="text-[10px] text-gray-400 mt-0.5">UPI, GPay, PhonePe, Cards</p>
                  </button>

                  <button
                    type="button"
                    id="tab-card-btn"
                    onClick={() => setPaymentGatewayTab("CARD")}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      paymentGatewayTab === "CARD"
                        ? "bg-brand-peach/15 border-brand-peach text-brand-peach font-bold shadow-lg shadow-brand-peach/10"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    <div className="text-sm font-black">💳 Test Card</div>
                    <p className="text-[10px] text-gray-400 mt-0.5">Direct Sandbox Simulator</p>
                  </button>
                </div>
              </div>

              {/* Razorpay Option View */}
              {paymentGatewayTab === "RAZORPAY" && (
                <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Indian & Global Payment Hub
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-brand-peach/20 text-brand-peach border border-brand-peach/30">
                      INR Pricing
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs space-y-2">
                    <div className="flex items-center justify-between text-gray-300">
                      <span>Package Price:</span>
                      <span className="font-extrabold text-white text-sm">
                        ₹{(packageType === "COACH_MONTHLY_SUBSCRIPTION" ? (checkoutCoach.monthlyRate || 4999) : (checkoutCoach.consultationRate || 1999)).toLocaleString('en-IN')} INR
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Includes 10% AthleteX service & escrow guarantee.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Supported Channels:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-bold text-gray-300">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/5">Google Pay / PhonePe</div>
                      <div className="p-2 rounded-lg bg-white/5 border border-white/5">BHIM / Paytm UPI</div>
                      <div className="p-2 rounded-lg bg-white/5 border border-white/5">Visa / MasterCard / RuPay</div>
                      <div className="p-2 rounded-lg bg-white/5 border border-white/5">50+ NetBanking Banks</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    id="pay-razorpay-btn"
                    disabled={isProcessingPayment}
                    onClick={handleRazorpayPayment}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-peach to-orange-500 text-black font-black text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-xl shadow-brand-peach/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Authorizing Payment...</span>
                      </>
                    ) : (
                      <>
                        <FaBolt />
                        <span>Pay ₹{(packageType === "COACH_MONTHLY_SUBSCRIPTION" ? (checkoutCoach.monthlyRate || 4999) : (checkoutCoach.consultationRate || 1999)).toLocaleString('en-IN')} with Razorpay</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Direct Card Simulator Option View */}
              {paymentGatewayTab === "CARD" && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                        <FaLock className="text-emerald-400" /> Payment Card
                      </label>
                      <button
                        type="button"
                        onClick={handleFillSandboxCard}
                        className="text-[11px] font-bold text-brand-peach hover:underline cursor-pointer"
                      >
                        ⚡ Use Demo Test Card
                      </button>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={cardData.cardNumber}
                        onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                        placeholder="Card Number"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-peach font-mono"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-peach font-mono"
                        />
                        <input
                          type="password"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          placeholder="CVV"
                          maxLength={4}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-peach font-mono"
                        />
                      </div>
                      <input
                        type="text"
                        value={cardData.cardholderName}
                        onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
                        placeholder="Cardholder Full Name"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-peach"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    id="pay-card-btn"
                    disabled={isProcessingPayment}
                    onClick={handleExecutePayment}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-peach to-orange-500 text-black font-black text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-xl shadow-brand-peach/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Authorizing Payment...</span>
                      </>
                    ) : (
                      <>
                        <FaCreditCard />
                        <span>Confirm & Pay ₹{packageType === "COACH_MONTHLY_SUBSCRIPTION" ? (checkoutCoach.monthlyRate || 4999) : (checkoutCoach.consultationRate || 1999)}.00 INR</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Guarantee & Encryption Reassurance */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                <FaShieldAlt className="text-base flex-shrink-0" />
                <span>256-bit SSL encrypted. 100% Athlete Satisfaction Guarantee with escrow protection.</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* RAZORPAY PAYMENT GATEWAY MODAL                                            */}
        {/* ========================================================================= */}
        {showRazorpayModal && razorpayOrderData && checkoutCoach && (
          <RazorpayModal
            isOpen={showRazorpayModal}
            onClose={() => setShowRazorpayModal(false)}
            orderData={razorpayOrderData}
            coach={checkoutCoach}
            packageType={packageType}
            athleteId={athleteId}
            onPaymentSuccess={(receipt) => {
              setCompletedReceipt(receipt);
              setCheckoutCoach(null);
              setShowRazorpayModal(false);
              toast.success("Razorpay payment confirmed! Coaching access activated.");
              fetchCoaches();
            }}
            onPaymentFailure={(err) => {
              toast.error("Payment could not be completed: " + err);
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* PAYMENT SUCCESS RECEIPT MODAL                                             */}
        {/* ========================================================================= */}
        {completedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-lg bg-[#121418] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
              {/* Celebratory Icon */}
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
                <FaCheck />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase text-emerald-400 tracking-widest block">
                  Payment Authorized & Confirmed
                </span>
                <h3 className="text-2xl font-black text-white">
                  Welcome to Team {completedReceipt.coachName}!
                </h3>
                <p className="text-xs text-gray-300 max-w-md mx-auto">
                  {completedReceipt.message || "Your coach assignment has been activated. Direct messaging and tailored workouts are ready."}
                </p>
              </div>

              {/* Receipt Snapshot Card */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Receipt Number</span>
                  <span className="font-mono text-white font-bold">{completedReceipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Gateway Ref</span>
                  <span className="font-mono text-brand-peach">{completedReceipt.gatewayReferenceId}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Package</span>
                  <span className="text-white font-semibold">
                    {completedReceipt.paymentType === "COACH_MONTHLY_SUBSCRIPTION" ? "Monthly Retainer" : "1-on-1 Consultation"}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-black text-white">
                  <span>Amount Paid</span>
                  <span className="text-emerald-400 font-black">
                    ₹{completedReceipt.amount} {completedReceipt.currency || "INR"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCompletedReceipt(null);
                    navigate("/chat");
                  }}
                  className="w-full sm:flex-1 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                  <FaComments className="text-sm" /> Message Coach in Chat
                </button>
                <button
                  type="button"
                  onClick={() => setCompletedReceipt(null)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
