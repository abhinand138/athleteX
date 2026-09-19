import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { getErrorMessage } from "../../utils/errorHandler";
import {
  FaUsers,
  FaSearch,
  FaUserShield,
  FaUserTie,
  FaUserCheck,
  FaEdit,
  FaTrash,
  FaTrashAlt,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaUser,
  FaDownload
} from "react-icons/fa";

const ROLES = ["ALL", "ATHLETE", "COACH", "ADMIN"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");

  // Edit User Details Modal
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    sport: "",
    city: "",
    role: "ATHLETE"
  });
  const [updating, setUpdating] = useState(false);

  // Delete User Modal State
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Delete Last User Modal State
  const [showDeleteLastModal, setShowDeleteLastModal] = useState(false);
  const [deletingLast, setDeletingLast] = useState(false);

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
      setError(getErrorMessage(err, "Failed to load user list."));
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      let url = "/admin/export/users";
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedRole !== "ALL") params.append("role", selectedRole);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await api.get(url, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", "athletex_users_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("User directory exported successfully! 📥");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to export user directory."));
    }
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setEditForm({
      fullName: u.fullName || "",
      email: u.email || "",
      phone: u.phone || "",
      sport: u.sport || "",
      city: u.city || "",
      role: u.role || "ATHLETE"
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdating(true);
    try {
      await api.put(`/admin/users/${editingUser.id}`, editForm);
      toast.success(`Successfully updated ${editForm.fullName}'s profile! 🛡️`);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update user details."));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    setDeleting(true);
    try {
      const res = await api.delete(`/admin/users/${deletingUser.id}`);
      toast.success(res.data || `User ${deletingUser.fullName} deleted successfully! 🗑️`);
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete user account."));
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteLastUser = async () => {
    setDeletingLast(true);
    try {
      const res = await api.delete("/admin/users/last");
      toast.success(res.data || "Last registered user deleted successfully! 🗑️");
      setShowDeleteLastModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete last registered user."));
    } finally {
      setDeletingLast(false);
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-8 bg-brand-peach rounded-full"></div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight">
                User Directory
              </h1>
            </div>
            <p className="text-gray-400 text-base font-medium ml-5">
              Manage roles, update profiles, and execute account deletions across platform accounts
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-peach/10 border border-brand-peach/20 text-brand-peach hover:bg-brand-peach hover:text-black font-bold text-xs transition-all cursor-pointer shadow-sm"
              title="Export User Directory as CSV"
            >
              <FaDownload />
              <span>Export CSV</span>
            </button>

            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-300 text-xs font-mono font-bold">
              <FaShieldAlt className="text-brand-peach text-sm" />
              <span>{filteredUsers.length} Users Listed</span>
            </div>

            <button
              onClick={() => setShowDeleteLastModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
              title="Delete the most recently registered user account"
            >
              <FaTrashAlt />
              <span>Delete Last User</span>
            </button>
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
                  <th className="py-4 px-6">Sport & Location</th>
                  <th className="py-4 px-6">Contact Phone</th>
                  <th className="py-4 px-6">Active Pairings</th>
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

                      {/* Sport & City */}
                      <td className="py-4 px-6">
                        <p className="text-xs font-semibold text-gray-300">{u.sport || "N/A"}</p>
                        {u.city && <p className="text-[11px] text-gray-500">{u.city}</p>}
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
                          {u.activeAssignmentsCount > 0 ? `${u.activeAssignmentsCount} Active` : "None"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all cursor-pointer"
                            title="Edit User Profile & Role"
                          >
                            <FaEdit className="text-brand-peach text-xs" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => setDeletingUser(u)}
                            className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                            title="Delete User Account"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="glass-card bg-[#111317]/95 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-peach/10 blur-[90px] rounded-full pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-peach/10 text-brand-peach rounded-2xl border border-brand-peach/20 text-xl">
                    <FaUserShield />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Edit User Profile</h2>
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

              <form onSubmit={handleEditSubmit} className="mt-5 space-y-4 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-peach/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-peach/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-peach/50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Primary Sport
                    </label>
                    <input
                      type="text"
                      value={editForm.sport}
                      onChange={(e) => setEditForm({ ...editForm, sport: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-peach/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      City / Location
                    </label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-peach/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      System Role *
                    </label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full bg-[#181b22] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-peach/50 font-bold"
                    >
                      <option value="ATHLETE">ATHLETE</option>
                      <option value="COACH">COACH</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
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
                    {updating ? "Saving Changes..." : "Save User Details"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete User Modal */}
        {deletingUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="glass-card bg-[#111317]/95 border border-red-500/20 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[90px] rounded-full pointer-events-none" />

              <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 text-2xl">
                  <FaExclamationTriangle />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Delete User Account</h2>
                  <p className="text-gray-400 text-xs">{deletingUser.fullName}</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-white">{deletingUser.fullName}</strong> (<span className="font-mono text-gray-400">{deletingUser.email}</span>)?
                </p>

                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 space-y-1">
                  <p className="font-bold">⚠️ Warning: Irreversible Action</p>
                  <p className="text-red-400/90">
                    This will remove their profile and instantly clean up all active roster pairings from the system.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeletingUser(null)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDeleteUser}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-red-500/20"
                  >
                    {deleting ? "Deleting..." : "Permanently Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Last User Modal */}
        {showDeleteLastModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="glass-card bg-[#111317]/95 border border-red-500/20 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[90px] rounded-full pointer-events-none" />

              <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 text-2xl">
                  <FaTrashAlt />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Delete Last Registered User</h2>
                  <p className="text-gray-400 text-xs">Platform Maintenance Command</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  This command will delete the <strong className="text-white">most recently registered account</strong> from MongoDB and clear any active roster pairings associated with it.
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteLastModal(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={deletingLast}
                    onClick={handleDeleteLastUser}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-red-500/20"
                  >
                    {deletingLast ? "Executing..." : "Delete Last User"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
