import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import { FiLock, FiLogOut, FiBell, FiShield, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/users/profile/${user.id}`);
      setProfile(response.data);
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "New passwords do not match." });
      return;
    }
    
    setLoading(true);
    setStatus({ type: "", message: "" });
    
    try {
      await api.put(`/users/password/${user.id}`, {
        currentPassword,
        newPassword
      });
      setStatus({ type: "success", message: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setStatus({ 
        type: "error", 
        message: error.response?.data?.message || "Failed to update password." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
            <h1 className="text-gray-400 font-medium animate-pulse">Loading Settings...</h1>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-1.5 h-8 bg-brand-peach rounded-full"></div>
          <h1 className="text-3xl font-bold text-white tracking-wide">Account Settings</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Account Overview (Read-Only) */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-peach/5 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 bg-white/5 rounded-xl text-brand-peach">
                  <FiUser size={24} />
                </div>
                <h2 className="text-xl font-bold text-white">Account Info</h2>
              </div>
              
              <div className="space-y-4 relative z-10">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Full Name</p>
                  <p className="text-gray-200 font-medium">{profile.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email Address</p>
                  <p className="text-gray-200 font-medium">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                  <p className="text-gray-200 font-medium">{profile.phone}</p>
                </div>
                
                <button 
                  onClick={() => navigate("/profile/edit")}
                  className="w-full mt-4 py-2 px-4 rounded-xl border border-white/10 text-gray-300 font-medium hover:bg-white/5 transition-colors"
                >
                  Edit Profile Information
                </button>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 bg-white/5 rounded-xl text-blue-400">
                  <FiBell size={24} />
                </div>
                <h2 className="text-xl font-bold text-white">Preferences</h2>
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Email Notifications</span>
                  <div className="w-12 h-6 bg-brand-peach rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Push Notifications</span>
                  <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Password */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 bg-white/5 rounded-xl text-blue-400">
                  <FiShield size={24} />
                </div>
                <h2 className="text-xl font-bold text-white">Security Settings</h2>
              </div>
              
              <form onSubmit={handlePasswordUpdate} className="space-y-6 relative z-10 max-w-md">
                
                {status.message && (
                  <div className={`p-4 rounded-xl border ${status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                    {status.message}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[#111317] border border-white/10 rounded-xl px-12 py-3.5 text-white focus:outline-none focus:border-brand-peach/50 transition-colors"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#111317] border border-white/10 rounded-xl px-12 py-3.5 text-white focus:outline-none focus:border-brand-peach/50 transition-colors"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#111317] border border-white/10 rounded-xl px-12 py-3.5 text-white focus:outline-none focus:border-brand-peach/50 transition-colors"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-peach to-orange-500 text-white font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(255,123,84,0.3)] transition-all disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="glass-card rounded-3xl p-8 border border-red-500/10 shadow-2xl relative overflow-hidden mt-8">
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                  <FiLogOut size={24} />
                </div>
                <h2 className="text-xl font-bold text-red-500">Account Actions</h2>
              </div>
              
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h3 className="text-white font-medium">Log out</h3>
                  <p className="text-gray-500 text-sm mt-1">End your current session safely.</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold rounded-xl transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
