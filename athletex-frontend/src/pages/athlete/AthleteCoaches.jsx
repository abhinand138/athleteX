import { useState, useEffect } from "react";
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
  FaHeartbeat,
  FaRegLightbulb
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import api from "../../services/api";

export default function AthleteCoaches() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All");
  const [selectedCoach, setSelectedCoach] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const athleteId = user.id || "";

  useEffect(() => {
    fetchCoaches();
  }, [athleteId]);

  const fetchCoaches = async () => {
    setLoading(true);
    try {
      const response = await api.get("/coaches/directory", {
        params: { athleteId }
      });
      setCoaches(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching coaches directory:", error);
      // Fallback mock coaches if backend dev server is offline
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
          country: "USA",
          bio: "Former Olympic trials finalist specializing in sprint mechanics, top-end velocity development, and neural recovery protocols.",
          profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
          isAssignedToAthlete: true
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
          country: "USA",
          bio: "Pioneer in reactive strength index (RSI) optimization, rate of force development (RFD), and lower limb injury prevention.",
          profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
          isAssignedToAthlete: false
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
          country: "USA",
          bio: "Master of lactate threshold training, zone-based aerobic periodization, and altitude adaptation strategies.",
          profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
          isAssignedToAthlete: false
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
          country: "USA",
          bio: "Expert in multi-planar movement efficiency, agility drills, and return-to-play ACL rehabilitation protocols.",
          profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
          isAssignedToAthlete: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const safeCoaches = Array.isArray(coaches) ? coaches : [];
  const assignedCoach = safeCoaches.find((c) => c.isAssignedToAthlete);

  const categories = [
    "All",
    "Sprint Biomechanics",
    "Vertical Jump",
    "Metabolic Efficiency",
    "Change of Direction",
    "Strength & Conditioning"
  ];

  const filteredCoaches = safeCoaches.filter((coach) => {
    const matchesSearch =
      coach.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.sport.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedSpecialization === "All" ||
      coach.specialization.toLowerCase().includes(selectedSpecialization.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const handleContactCoach = (coach) => {
    toast.success(`Contact request sent to ${coach.fullName}! (${coach.email})`);
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
                  Coach Network & Directory
                </h1>
                <p className="text-gray-400 text-sm mt-0.5">
                  Discover elite performance specialists, compare certifications, and view specializations across AthleteX.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {coaches.length} Elite Coaches Active
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
                    <FaCheckCircle className="text-xs" /> ASSIGNED
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                      Your Primary Coach
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
                  <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Specialization</div>
                  <div className="text-sm font-bold text-emerald-300">{assignedCoach.specialization}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCoach(assignedCoach)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10 flex items-center gap-2"
                  >
                    <FaRegLightbulb className="text-brand-peach" /> Full Profile
                  </button>
                  <a
                    href={`mailto:${assignedCoach.email}`}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center gap-2"
                  >
                    <FaEnvelope /> Email Coach
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-brand-dark/60 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
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

          {/* Specialization Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
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
              <FaAward className="text-brand-peach" /> All Coaches ({filteredCoaches.length})
            </h3>
            <span className="text-xs text-gray-400">
              Showing active certified athletic performance coaches
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : filteredCoaches.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <FaUserShield className="text-4xl text-gray-500 mx-auto mb-3" />
              <p className="text-white font-bold">No coaches found matching your filters.</p>
              <p className="text-xs text-gray-400 mt-1">Try resetting your search query or selecting 'All' specializations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoaches.map((coach) => (
                <div
                  key={coach.id}
                  className={`group relative rounded-2xl bg-gradient-to-b from-brand-dark/95 to-brand-dark border transition-all duration-300 hover:-translate-y-1.5 shadow-xl overflow-hidden flex flex-col justify-between ${
                    coach.isAssignedToAthlete
                      ? "border-emerald-500/50 shadow-emerald-500/10"
                      : "border-white/10 hover:border-brand-peach/50 hover:shadow-brand-peach/10"
                  }`}
                >
                  {/* Assigned Badge Indicator */}
                  {coach.isAssignedToAthlete && (
                    <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-md">
                      <FaCheckCircle /> Your Coach
                    </div>
                  )}

                  <div className="p-6 space-y-4">
                    {/* Coach Top Profile Header */}
                    <div className="flex items-start gap-4">
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

                    {/* Experience & Location */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-gray-400 block text-[10px]">Experience</span>
                        <span className="text-white font-extrabold flex items-center gap-1 mt-0.5">
                          <FaStar className="text-yellow-400 text-xs" /> {coach.experienceYears} Years
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-gray-400 block text-[10px]">Location</span>
                        <span className="text-gray-200 font-semibold truncate block mt-0.5">
                          {coach.city}, {coach.state}
                        </span>
                      </div>
                    </div>

                    {/* Bio snippet */}
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                      {coach.bio}
                    </p>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedCoach(coach)}
                      className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-brand-peach hover:text-black text-white font-bold text-xs transition-all flex items-center justify-center gap-2 border border-white/10"
                    >
                      View Specializations & Bio
                    </button>
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
                  {selectedCoach.isAssignedToAthlete && (
                    <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider inline-block mb-1">
                      Assigned Coach
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

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase block">Experience</span>
                  <span className="text-sm font-extrabold text-white mt-1 block">
                    {selectedCoach.experienceYears} Years Active
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase block">Sport Focus</span>
                  <span className="text-sm font-extrabold text-brand-peach mt-1 block truncate">
                    {selectedCoach.sport}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase block">Role</span>
                  <span className="text-sm font-extrabold text-emerald-300 mt-1 block">
                    Head Athletic Coach
                  </span>
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
                  <span className="flex items-center gap-1.5">
                    <FaPhoneAlt className="text-emerald-400" /> {selectedCoach.phone}
                  </span>
                </div>

                <button
                  onClick={() => {
                    handleContactCoach(selectedCoach);
                    setSelectedCoach(null);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-peach text-black font-extrabold text-xs hover:bg-orange-400 transition-all shadow-lg shadow-brand-peach/20"
                >
                  Request Consultation / Connection
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
