import { useEffect, useState } from "react";
import {
  FaTrophy,
  FaMedal,
  FaCalendarAlt,
  FaPlus,
  FaTimes,
  FaDownload,
  FaCertificate,
  FaAward,
  FaCheckCircle
} from "react-icons/fa";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import { generateAchievementCertificate } from "../utils/certificateGenerator";

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Competition",
    level: "Gold",
    date: "",
    icon: "🏆",
  });

  /* ============================= */
  /* FETCH ACHIEVEMENTS */
  /* ============================= */

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setError("User session not found. Please login again.");
        return;
      }

      const user = JSON.parse(storedUser);

      if (!user?.id) {
        setError("User ID not found. Please login again.");
        return;
      }

      const response = await api.get(
        `/achievements/athlete/${user.id}`
      );

      setAchievements(response.data || []);

    } catch (error) {
      console.error("Achievements API Error:", error);

      setError(
        error.response?.data?.message ||
        "Unable to load achievements."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  /* ============================= */
  /* HANDLE INPUT */
  /* ============================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setMessage("");
    setError("");
  };

  /* ============================= */
  /* CREATE ACHIEVEMENT */
  /* ============================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setError("User session not found. Please login again.");
        return;
      }

      const user = JSON.parse(storedUser);

      if (!user?.id) {
        setError("User ID not found. Please login again.");
        return;
      }

      const response = await api.post(
        `/achievements/${user.id}`,
        formData
      );

      console.log(
        "Achievement created:",
        response.data
      );

      setMessage("Achievement added successfully.");

      setFormData({
        title: "",
        description: "",
        category: "Competition",
        level: "Gold",
        date: "",
        icon: "🏆",
      });

      setShowForm(false);

      await fetchAchievements();

    } catch (error) {
      console.error(
        "Create Achievement Error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to create achievement."
      );

    } finally {
      setSaving(false);
    }
  };

  /* ============================= */
  /* LOADING */
  /* ============================= */

  if (loading) {
    return (
      <DashboardLayout>

        <div className="min-h-[70vh] flex items-center justify-center">

          <div className="text-center">

            <div className="w-12 h-12 border-4 border-brand-peach/20 border-t-brand-peach rounded-full animate-spin mx-auto" />

            <p className="text-gray-400 mt-5">
              Loading achievements...
            </p>

          </div>

        </div>

      </DashboardLayout>
    );
  }

  /* ============================= */
  /* ERROR */
  /* ============================= */

  if (error && achievements.length === 0) {
    return (
      <DashboardLayout>

        <div className="min-h-[70vh] flex items-center justify-center">

          <div className="bg-[#111317] border border-red-500/20 rounded-2xl p-8 text-center max-w-md">

            <h2 className="text-xl font-bold text-white">
              Achievements Unavailable
            </h2>

            <p className="text-gray-400 mt-3">
              {error}
            </p>

          </div>

        </div>

      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      <div className="space-y-10 relative z-10">

        {/* ============================= */}
        {/* HEADER */}
        {/* ============================= */}

        <div className="relative">

          <div className="absolute -left-10 -top-10 w-64 h-64 bg-brand-peach/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 relative z-10">

            <div>

              <p className="text-brand-peach text-xs font-bold tracking-[0.25em] uppercase mb-3">
                Athlete Milestones
              </p>

              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
                Achievements
              </h1>

              <p className="text-gray-400 mt-3 text-lg font-medium">
                Your milestones, victories, and athletic accomplishments.
              </p>

            </div>

            {/* ADD BUTTON */}

            <button
              onClick={() => {
                setShowForm(true);
                setMessage("");
                setError("");
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-peach text-black rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-brand-peach/90 transition-all shadow-lg"
            >
              <FaPlus />
              Add Achievement
            </button>

          </div>

        </div>


        {/* ============================= */}
        {/* MESSAGE */}
        {/* ============================= */}

        {(message || (error && achievements.length > 0)) && (
          <div
            className={`rounded-xl px-5 py-3 text-sm font-medium border ${
              message
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {message || error}
          </div>
        )}


        {/* ============================= */}
        {/* ADD ACHIEVEMENT FORM */}
        {/* ============================= */}

        {showForm && (
          <div className="glass-card rounded-2xl p-8 shadow-xl relative overflow-hidden">

            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-peach/10 blur-[60px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">

              <div>

                <p className="text-brand-peach text-xs font-bold tracking-[0.2em] uppercase">
                  New Milestone
                </p>

                <h2 className="text-2xl font-bold text-white mt-2">
                  Add Achievement
                </h2>

              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <FaTimes />
              </button>

            </div>


            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10"
            >

              {/* TITLE */}

              <div className="md:col-span-2">

                <label className="block text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">
                  Achievement Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. District Championship"
                  required
                  className="w-full bg-white/5 border border-white/10 focus:border-brand-peach/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors"
                />

              </div>


              {/* DESCRIPTION */}

              <div className="md:col-span-2">

                <label className="block text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your achievement..."
                  rows="4"
                  required
                  className="w-full bg-white/5 border border-white/10 focus:border-brand-peach/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors resize-none"
                />

              </div>


              {/* CATEGORY */}

              <div>

                <label className="block text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-[#111317] border border-white/10 focus:border-brand-peach/50 rounded-xl px-4 py-3 text-white outline-none transition-colors"
                >
                  <option value="Competition">
                    Competition
                  </option>

                  <option value="Training">
                    Training
                  </option>

                  <option value="Award">
                    Award
                  </option>

                  <option value="Milestone">
                    Milestone
                  </option>
                </select>

              </div>


              {/* LEVEL */}

              <div>

                <label className="block text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">
                  Level
                </label>

                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full bg-[#111317] border border-white/10 focus:border-brand-peach/50 rounded-xl px-4 py-3 text-white outline-none transition-colors"
                >
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Bronze">Bronze</option>
                </select>

              </div>


              {/* DATE */}

              <div>

                <label className="block text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">
                  Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 focus:border-brand-peach/50 rounded-xl px-4 py-3 text-white outline-none transition-colors"
                />

              </div>


              {/* ICON */}

              <div>

                <label className="block text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">
                  Icon
                </label>

                <select
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="w-full bg-[#111317] border border-white/10 focus:border-brand-peach/50 rounded-xl px-4 py-3 text-white outline-none transition-colors"
                >
                  <option value="🏆">🏆 Trophy</option>
                  <option value="🥇">🥇 Gold Medal</option>
                  <option value="🥈">🥈 Silver Medal</option>
                  <option value="🥉">🥉 Bronze Medal</option>
                  <option value="⭐">⭐ Star</option>
                  <option value="🔥">🔥 Milestone</option>
                </select>

              </div>


              {/* BUTTONS */}

              <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-brand-peach text-black hover:bg-brand-peach/90 transition-all font-bold text-xs uppercase tracking-wider disabled:opacity-50"
                >

                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <FaPlus />
                      Save Achievement
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>
        )}


        {/* ============================= */}
        {/* SUMMARY */}
        {/* ============================= */}

        <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden">

          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-peach/10 blur-[70px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex items-center gap-5">

            <div className="w-14 h-14 rounded-2xl bg-brand-peach/10 border border-brand-peach/20 flex items-center justify-center">

              <FaTrophy className="text-brand-peach text-2xl" />

            </div>

            <div>

              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                Total Achievements
              </p>

              <h2 className="text-3xl font-extrabold text-white mt-1">
                {achievements.length}
              </h2>

            </div>

          </div>

        </div>


        {/* ============================= */}
        {/* ACHIEVEMENTS */}
        {/* ============================= */}

        {achievements.length === 0 ? (

          <div className="glass-card rounded-2xl p-12 shadow-xl text-center">

            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">

              <FaTrophy className="text-gray-600 text-3xl" />

            </div>

            <h2 className="text-xl font-bold text-white mt-6">
              No Achievements Yet
            </h2>

            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Your achievements will appear here as you reach new milestones in your athletic journey.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {achievements.map((achievement) => (

              <div
                key={achievement.id}
                className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-brand-peach/30 transition-all duration-300"
              >

                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-peach/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-brand-peach/20 transition-colors duration-500" />

                <div className="flex items-center justify-between relative z-10">

                  <div className="w-14 h-14 rounded-2xl bg-brand-peach/10 border border-brand-peach/20 flex items-center justify-center text-2xl">
                    {achievement.icon || "🏆"}
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase bg-brand-peach/10 text-brand-peach px-3 py-1.5 rounded-full border border-brand-peach/20">
                      <FaMedal />
                      {achievement.level || "Achievement"}
                    </span>
                    {achievement.isVerified && (
                      <span className="flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/20">
                        <FaCheckCircle className="text-[10px]" /> Verified by Coach
                      </span>
                    )}
                  </div>

                </div>

                <h2 className="text-xl font-bold text-white mt-6 relative z-10 group-hover:text-brand-peach transition-colors">
                  {achievement.title}
                </h2>

                <p className="text-gray-400 text-sm mt-2 leading-relaxed relative z-10">
                  {achievement.description || "Achievement earned by the athlete."}
                </p>

                <div className="mt-5 relative z-10">

                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    Category
                  </span>

                  <p className="text-gray-300 text-sm mt-1">
                    {achievement.category || "General"}
                  </p>

                </div>

                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-brand-peach text-xs" />
                    <span className="text-xs text-gray-500 font-mono">
                      {achievement.date
                        ? new Date(achievement.date).toLocaleDateString()
                        : "Date unavailable"}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      const user = JSON.parse(localStorage.getItem("user") || "{}");
                      try {
                        generateAchievementCertificate(achievement, user?.fullName, achievement.coachName);
                        toast.success("Certificate generated & downloaded! 📜");
                      } catch (err) {
                        toast.error("Failed to generate certificate.");
                      }
                    }}
                    title="Download Official Certificate"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-peach/10 hover:bg-brand-peach border border-brand-peach/30 hover:border-brand-peach text-brand-peach hover:text-black text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <FaCertificate className="text-xs" />
                    <span>Certificate</span>
                    <FaDownload className="text-[10px]" />
                  </button>
                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </DashboardLayout>
  );
}