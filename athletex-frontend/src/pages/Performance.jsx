import { useEffect, useState } from "react";
import {
  FaRunning,
  FaDumbbell,
  FaHeartbeat,
  FaBolt,
  FaSave,
  FaEdit,
} from "react-icons/fa";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import PerformanceChart from "../components/performance/PerformanceChart";

export default function Performance() {
  const [performance, setPerformance] = useState(null);
  const [history, setHistory] = useState([]);

  const [formData, setFormData] = useState({
    speed: 0,
    strength: 0,
    endurance: 0,
    agility: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  /*
   * =============================
   * FETCH PERFORMANCE
   * =============================
   */

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
          setError("User session not found. Please login again.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);

        if (!user?.id) {
          setError("User ID not found. Please login again.");
          setLoading(false);
          return;
        }

        const response = await api.get(
          `/performance/${user.id}`
        );

        console.log("Performance data:", response.data);

        setPerformance(response.data);

        setFormData({
          speed: response.data.speed ?? 0,
          strength: response.data.strength ?? 0,
          endurance: response.data.endurance ?? 0,
          agility: response.data.agility ?? 0,
        });

        const historyResponse = await api.get(
          `/performance/${user.id}/history`
        );
        setHistory(historyResponse.data);

      } catch (error) {
        console.error("Performance API Error:", error);

        setError(
          error.response?.data?.message ||
          "Unable to load performance data."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  /*
   * =============================
   * HANDLE INPUT
   * =============================
   */

  const handleChange = (e) => {
    const { name, value } = e.target;

    let numericValue = value === "" ? "" : Number(value);

    if (numericValue !== "" && numericValue > 100) {
      numericValue = 100;
    }

    if (numericValue !== "" && numericValue < 0) {
      numericValue = 0;
    }

    setFormData({
      ...formData,
      [name]: numericValue,
    });

    setMessage("");
    setError("");
  };

  /*
   * =============================
   * SAVE PERFORMANCE
   * =============================
   */

  const handleSave = async () => {
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

      const payload = {
        speed: Number(formData.speed) || 0,
        strength: Number(formData.strength) || 0,
        endurance: Number(formData.endurance) || 0,
        agility: Number(formData.agility) || 0,
      };

      const response = await api.put(
        `/performance/${user.id}`,
        payload
      );

      console.log("Updated performance:", response.data);

      setPerformance(response.data);

      setFormData({
        speed: response.data.speed ?? 0,
        strength: response.data.strength ?? 0,
        endurance: response.data.endurance ?? 0,
        agility: response.data.agility ?? 0,
      });

      const historyResponse = await api.get(
        `/performance/${user.id}/history`
      );
      setHistory(historyResponse.data);

      setIsEditing(false);

      setMessage("Performance updated successfully.");

    } catch (error) {
      console.error("Update Performance Error:", error);

      setError(
        error.response?.data?.message ||
        "Unable to update performance."
      );

    } finally {
      setSaving(false);
    }
  };

  /*
   * =============================
   * LOADING STATE
   * =============================
   */

  if (loading) {
    return (
      <DashboardLayout>

        <div className="min-h-[70vh] flex items-center justify-center">

          <div className="text-center">

            <div className="w-12 h-12 border-4 border-brand-peach/20 border-t-brand-peach rounded-full animate-spin mx-auto" />

            <p className="text-gray-400 mt-5">
              Loading performance data...
            </p>

          </div>

        </div>

      </DashboardLayout>
    );
  }

  /*
   * =============================
   * ERROR STATE
   * =============================
   */

  if (error && !performance) {
    return (
      <DashboardLayout>

        <div className="min-h-[70vh] flex items-center justify-center">

          <div className="bg-[#111317] border border-red-500/20 rounded-2xl p-8 text-center max-w-md">

            <h2 className="text-xl font-bold text-white">
              Performance Unavailable
            </h2>

            <p className="text-gray-400 mt-3">
              {error}
            </p>

          </div>

        </div>

      </DashboardLayout>
    );
  }

  if (!performance) {
    return null;
  }

  /*
   * =============================
   * METRICS
   * =============================
   */

  const metrics = [
    {
      title: "Speed",
      name: "speed",
      value: Number(formData.speed) || 0,
      icon: <FaRunning />,
      color: "text-blue-400",
      bar: "bg-blue-400",
    },
    {
      title: "Strength",
      name: "strength",
      value: Number(formData.strength) || 0,
      icon: <FaDumbbell />,
      color: "text-brand-peach",
      bar: "bg-brand-peach",
    },
    {
      title: "Endurance",
      name: "endurance",
      value: Number(formData.endurance) || 0,
      icon: <FaHeartbeat />,
      color: "text-red-400",
      bar: "bg-red-400",
    },
    {
      title: "Agility",
      name: "agility",
      value: Number(formData.agility) || 0,
      icon: <FaBolt />,
      color: "text-yellow-400",
      bar: "bg-yellow-400",
    },
  ];

  return (
    <DashboardLayout>

      <div className="space-y-8 relative z-10">

        {/* ============================= */}
        {/* HEADER */}
        {/* ============================= */}

        <div className="relative">

          <div className="absolute -left-10 -top-10 w-64 h-64 bg-brand-peach/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 relative z-10">

            <div>

              <p className="text-brand-peach text-xs font-bold tracking-[0.25em] uppercase mb-3">
                Athlete Analytics
              </p>

              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
                Performance
              </h1>

              <p className="text-gray-400 mt-3 text-lg font-medium">
                Track your athletic development and monitor your performance.
              </p>

            </div>

            {/* Edit Button */}

            {!isEditing && (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setMessage("");
                  setError("");
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-peach text-black rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-brand-peach/90 transition-all shadow-lg"
              >
                <FaEdit />
                Edit Performance
              </button>
            )}

          </div>

        </div>


        {/* ============================= */}
        {/* SUCCESS / ERROR MESSAGE */}
        {/* ============================= */}

        {(message || (error && performance)) && (
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
        {/* OVERALL PERFORMANCE */}
        {/* ============================= */}

        <div className="glass-card rounded-2xl p-8 shadow-xl relative overflow-hidden">

          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-peach/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

            <div>

              <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">
                Overall Performance
              </p>

              <h2 className="text-6xl font-extrabold text-white mt-3">
                {performance.overallScore ?? 0}
                <span className="text-2xl text-brand-peach">
                  %
                </span>
              </h2>

              <p className="text-gray-500 mt-2">
                Current performance score
              </p>

            </div>

            <div className="relative w-36 h-36 flex items-center justify-center">

              <div className="absolute inset-0 rounded-full border-8 border-white/5" />

              <div
                className="absolute inset-0 rounded-full border-8 border-brand-peach"
                style={{
                  opacity:
                    Number(performance.overallScore) > 0
                      ? 1
                      : 0.2,
                }}
              />

              <span className="text-2xl font-bold text-white">
                {performance.overallScore ?? 0}%
              </span>

            </div>

          </div>

        </div>


        {/* ============================= */}
        {/* METRIC CARDS */}
        {/* ============================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

          {metrics.map((metric) => (

            <div
              key={metric.title}
              className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                    {metric.title}
                  </p>

                  {isEditing ? (

                    <div className="flex items-center mt-3">

                      <input
                        type="number"
                        name={metric.name}
                        value={formData[metric.name]}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-24 bg-white/5 border border-white/10 focus:border-brand-peach/50 rounded-lg px-3 py-2 text-2xl font-extrabold text-white outline-none transition-colors"
                      />

                      <span className={`ml-2 text-lg font-bold ${metric.color}`}>
                        %
                      </span>

                    </div>

                  ) : (

                    <p className={`text-3xl font-extrabold mt-3 ${metric.color}`}>
                      {metric.value}
                    </p>

                  )}

                </div>

                <div
                  className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl ${metric.color}`}
                >
                  {metric.icon}
                </div>

              </div>

              <div className="mt-6 h-2 bg-white/5 rounded-full overflow-hidden">

                <div
                  className={`h-full ${metric.bar} rounded-full transition-all duration-700`}
                  style={{
                    width: `${Math.min(
                      Math.max(metric.value, 0),
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

          ))}

        </div>


        {/* ============================= */}
        {/* SAVE / CANCEL */}
        {/* ============================= */}

        {isEditing && (
          <div className="flex flex-col sm:flex-row justify-end gap-3">

            <button
              onClick={() => {
                setIsEditing(false);

                setFormData({
                  speed: performance.speed ?? 0,
                  strength: performance.strength ?? 0,
                  endurance: performance.endurance ?? 0,
                  agility: performance.agility ?? 0,
                });

                setMessage("");
                setError("");
              }}
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-wider"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-brand-peach text-black hover:bg-brand-peach/90 transition-all font-bold text-xs uppercase tracking-wider disabled:opacity-50"
            >

              {saving ? (
                "Saving..."
              ) : (
                <>
                  <FaSave />
                  Save Performance
                </>
              )}

            </button>

          </div>
        )}


        {/* ============================= */}
        {/* PERFORMANCE HISTORY CHART */}
        {/* ============================= */}

        <div className="glass-card rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
          
          <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-4 relative z-10">
            Performance Progression
          </h2>
          
          <div className="relative z-10">
            <PerformanceChart historyData={history} />
          </div>
        </div>

        {/* ============================= */}
        {/* PERFORMANCE BREAKDOWN */}
        {/* ============================= */}

        <div className="glass-card rounded-2xl p-8 shadow-xl relative overflow-hidden">

          <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-peach/5 blur-[60px] rounded-full pointer-events-none" />

          <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-8">
            Performance Breakdown
          </h2>

          <div className="space-y-6 relative z-10">

            {metrics.map((metric) => (

              <div key={metric.title}>

                <div className="flex justify-between items-center mb-2">

                  <span className="text-sm font-semibold text-gray-300">
                    {metric.title}
                  </span>

                  <span className={`text-sm font-bold ${metric.color}`}>
                    {metric.value}%
                  </span>

                </div>

                <div className="h-2 bg-white/5 rounded-full overflow-hidden">

                  <div
                    className={`h-full ${metric.bar} rounded-full transition-all duration-700`}
                    style={{
                      width: `${Math.min(
                        Math.max(metric.value, 0),
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* ============================= */}
        {/* LAST UPDATED */}
        {/* ============================= */}

        <div className="text-center">

          <p className="text-xs text-gray-600 font-mono">

            LAST UPDATED:{" "}

            {performance.lastUpdated
              ? new Date(
                  performance.lastUpdated
                ).toLocaleString()
              : "Not available"}

          </p>

        </div>

      </div>

    </DashboardLayout>
  );
}