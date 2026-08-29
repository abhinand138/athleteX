import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import {
  FaUsers,
  FaSearch,
  FaUserShield,
  FaUserTie,
  FaUserCheck,
  FaEdit,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaShieldAlt,
  FaUser
} from "react-icons/fa";

const ROLES = ["ALL", "ATHLETE", "COACH", "ADMIN"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");

  // Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("ATHLETE");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = "/admin/users";
      if (selectedRole !== "ALL") {
        url += `?role=${selectedRole}`;
      }
      const res = await api.get(url);
      setUsers(res.data || []);
    } catch (err) {
      setError(err.response?.data || "Failed to load user list.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdating(true);
    try {
      await api.put(`/admin/users/${editingUser.id}/role`, {
        role: newRole
      });

      toast.success(`Updated ${editingUser.fullName}'s role to ${newRole}! 🛡️`);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data || "Failed to update user role.");
    } finally {
      setUpdating(false);
    }
  };

  // Client-side search filtering
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.sport?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium animate-pulse">Loading User Governance Roster...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-16 relative z-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-8 bg-brand-peach rounded-full"></div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight">
                User Directory
              </h1>
            </div>
            <p className="text-gray-400 text-base font-medium ml-5">
              Manage roles and governance across all registered platform accounts
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-gray-300 text-xs font-mono font-bold self-start sm:self-auto">
            <FaShieldAlt className="text-brand-peach text-sm" />
            <span>{filteredUsers.length} Users Listed</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, email, sport, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#111317] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-peach/50 transition-colors text-sm"
              />
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    selectedRole === r
                      ? "bg-brand-peach text-black shadow-md"
                      : "bg-[#111317] text-gray-400 hover:text-white border border-white/5"
                  }`}
                >
                  {r === "ALL" ? "All Roles" : r}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* User Table */}
        <div className="glass-card rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Sport</th>
                  <th className="py-4 px-6">Contact</th>
                  <th className="py-4 px-6">Active Roster</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500 font-medium">
                      No users match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                      
                      {/* Name & Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 font-bold overflow-hidden shrink-0">
                            {u.profileImage ? (
                              <img src={u.profileImage} alt={u.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <FaUser className="text-base" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-brand-peach transition-colors">{u.fullName}</p>
                            <p className="text-xs text-gray-500 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Pill */}
                      <td className="py-4 px-6">
                        {u.role === "ADMIN" && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 inline-flex items-center gap-1.5">
                            <FaShieldAlt className="text-[10px]" /> ADMIN
                          </span>
                        )}
                        {u.role === "COACH" && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5">
                            <FaUserTie className="text-[10px]" /> COACH
                          </span>
                        )}
                        {u.role === "ATHLETE" && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-flex items-center gap-1.5">
                            <FaUserCheck className="text-[10px]" /> ATHLETE
                          </span>
                        )}
                      </td>

                      {/* Sport */}
                      <td className="py-4 px-6">
                        <span className="text-xs font-semibold text-gray-300">
                          {u.sport || "N/A"}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-6">
                        <span className="text-xs text-gray-400 font-mono">
                          {u.phone || "N/A"}
                        </span>
                      </td>

                      {/* Active Pairings Count */}
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-gray-300">
                          {u.activeAssignmentsCount > 0 ? `${u.activeAssignmentsCount} Assigned` : "None"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setNewRole(u.role || "ATHLETE");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <FaEdit className="text-brand-peach text-xs" />
                          Change Role
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Change Role Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="glass-card bg-[#111317]/95 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-peach/10 blur-[90px] rounded-full pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-peach/10 text-brand-peach rounded-2xl border border-brand-peach/20 text-xl">
                    <FaUserShield />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Update Role</h2>
                    <p className="text-gray-400 text-xs">{editingUser.fullName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleRoleUpdateSubmit} className="mt-5 space-y-4 relative z-10">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Select New System Role *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-peach/50 transition-colors font-bold"
                  >
                    <option value="ATHLETE">ATHLETE (Standard User)</option>
                    <option value="COACH">COACH (Roster & Training Governance)</option>
                    <option value="ADMIN">ADMIN (Full Platform Owner)</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400 leading-relaxed">
                  ⚠️ Updating this role will instantly grant or modify account access capabilities across AthleteX.
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 py-3 rounded-xl bg-brand-peach text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg"
                  >
                    {updating ? "Saving..." : "Update Role"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
