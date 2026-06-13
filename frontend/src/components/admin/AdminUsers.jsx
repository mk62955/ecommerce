import React, { useEffect, useState } from "react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    is_active: true,
    is_staff: false,
    is_superuser: false,
    is_verified: true,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://127.0.0.1:8000/api/products/admin/users/?search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Failed to fetch users");
        setUsers(Array.isArray(data) ? data : data.results || []);
        setError(null);
      } else {
        throw new Error(`Server configuration error: Expected JSON but received HTML (Status ${response.status})`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/products/admin/users/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== id));
      } else {
        setError("Failed to delete user");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      password: "", // Leave blank unless changing
      is_active: user.is_active,
      is_staff: user.is_staff,
      is_superuser: user.is_superuser,
      is_verified: user.is_verified,
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setFormData({
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      is_active: true,
      is_staff: false,
      is_superuser: false,
      is_verified: true,
    });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const method = editingUser ? "PUT" : "POST";
      const url = editingUser
        ? `http://127.0.0.1:8000/api/products/admin/users/${editingUser.id}/`
        : "http://127.0.0.1:8000/api/products/admin/users/";

      // Remove password if it's empty during an update
      const payload = { ...formData };
      if (editingUser && !payload.password) {
        delete payload.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchUsers();
        setShowForm(false);
        window.alert(editingUser ? "User updated successfully!" : "User created successfully!");
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await response.json();
          const errorMessages = Object.entries(errData)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
            .join(" | ");
          setError(errData.detail || errorMessages || "Failed to save user");
        } else {
          const errorText = await response.text();
          console.error("Server Error:", errorText);
          setError(`Server Error ${response.status}: Please check the browser console for details.`);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400 tracking-tight">Users Management</h2>
        <button
          onClick={handleAddNew}
          className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 border-none"
        >
          + Add User
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#111] rounded-2xl p-2 border border-white/5 flex items-center px-4 focus-within:border-white/20 transition-colors">
        <svg className="w-5 h-5 text-slate-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          type="text"
          placeholder="Search users by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-white py-2 outline-none text-sm placeholder-slate-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm animate-pulse">Loading users...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">Error: {error}</div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-sm">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs uppercase bg-white/5 text-slate-500 font-medium">
              <tr>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-4 px-6 font-medium text-slate-200">{user.email}</td>
                    <td className="py-4 px-6">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          user.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {user.is_superuser ? (
                        <span className="text-purple-400 text-sm font-semibold">Admin</span>
                      ) : user.is_staff ? (
                        <span className="text-blue-400 text-sm font-semibold">Staff</span>
                      ) : (
                        <span className="text-slate-400 text-sm">Customer</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] rounded-[2rem] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="border-b border-white/10 p-6 flex justify-between items-center bg-[#111] shrink-0">
              <h3 className="text-xl font-bold text-white">
                {editingUser ? "Edit User" : "Add New User"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Password {editingUser && <span className="text-slate-500 text-xs">(Leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingUser}
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm"
                  />
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10 grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="w-4 h-4 rounded border-slate-600 text-orange-500 focus:ring-orange-500 bg-slate-800" />
                  <span className="text-slate-300 font-medium">Active Account</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="is_verified" checked={formData.is_verified} onChange={handleInputChange} className="w-4 h-4 rounded border-slate-600 text-orange-500 focus:ring-orange-500 bg-slate-800" />
                  <span className="text-slate-300 font-medium">Email Verified</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="is_staff" checked={formData.is_staff} onChange={handleInputChange} className="w-4 h-4 rounded border-slate-600 text-orange-500 focus:ring-orange-500 bg-slate-800" />
                  <span className="text-slate-300 font-medium">Staff Status</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="is_superuser" checked={formData.is_superuser} onChange={handleInputChange} className="w-4 h-4 rounded border-slate-600 text-orange-500 focus:ring-orange-500 bg-slate-800" />
                  <span className="text-slate-300 font-medium text-purple-400">Superuser (Admin)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-transparent hover:bg-white/5 text-slate-300 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-orange-500/30 border-none disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingUser ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;