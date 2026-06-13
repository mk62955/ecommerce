import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../../api/client";

const Profile = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("access");

  const [loading, setLoading] = useState(true);

  // Profile Form State
  const [profileData, setProfileData] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    return {
      first_name: stored.first_name || "",
      last_name: stored.last_name || "",
      email: stored.email || "",
    };
  });
  const [profileMessage, setProfileMessage] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Password Form State
  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await apiRequest("/profile/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        setProfileData(prev => ({
          first_name: data.first_name || prev.first_name || "",
          last_name: data.last_name || prev.last_name || "",
          email: data.email || prev.email || "",
        }));
      } catch (err) {
        setProfileError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn, navigate]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    setProfileError(null);

    try {
      const data = await apiRequest("/profile/update/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
        }),
      });

      setProfileMessage("Profile updated successfully!");
      // Update local storage so Header reflects the new name
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      storedUser.first_name = data.first_name || profileData.first_name;
      storedUser.last_name = data.last_name || profileData.last_name;
      localStorage.setItem("user", JSON.stringify(storedUser));
      window.dispatchEvent(new Event("auth-changed"));
      setShowEditProfileModal(false);
    } catch (err) {
      setProfileError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMessage(null);
    setPasswordError(null);

    if (passwords.new_password !== passwords.confirm_password) {
      setPasswordError("New passwords do not match.");
      setSavingPassword(false);
      return;
    }
    if (passwords.new_password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      setSavingPassword(false);
      return;
    }

    try {
      const data = await apiRequest("/change-password/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify({
          old_password: passwords.old_password,
          new_password: passwords.new_password,
        }),
      });

      setPasswordMessage(data.message || "Password changed successfully!");
      setPasswords({ old_password: "", new_password: "", confirm_password: "" });
      setShowPasswordModal(false);
    } catch (err) {
      setPasswordError(err.message || "Failed to change password. Please check your current password.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[60vh]">
        <div className="text-slate-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <main className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 min-h-[70vh]">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Account</h1>

        {profileMessage && <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg">{profileMessage}</div>}
        {passwordMessage && <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg">{passwordMessage}</div>}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-8 md:flex items-center gap-6">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 md:mb-0 flex-shrink-0">
              {(profileData.first_name?.[0] || profileData.email?.[0] || "U").toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {profileData.first_name || profileData.last_name 
                  ? `${profileData.first_name} ${profileData.last_name}` 
                  : "User"}
              </h2>
              <p className="text-slate-600 text-lg">{profileData.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => setShowEditProfileModal(true)}
            className="flex items-center justify-between p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition text-left"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Edit Profile</h3>
              <p className="text-sm text-slate-500">Update your name and personal details</p>
            </div>
            <span className="text-blue-600 text-xl">→</span>
          </button>

          <Link 
            to="/orders"
            className="flex items-center justify-between p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition text-left"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-900">My Orders</h3>
              <p className="text-sm text-slate-500">View and track your past purchases</p>
            </div>
            <span className="text-blue-600 text-xl">→</span>
          </Link>

          <button 
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center justify-between p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition text-left"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Change Password</h3>
              <p className="text-sm text-slate-500">Update your security credentials</p>
            </div>
            <span className="text-blue-600 text-xl">→</span>
          </button>

          <Link 
            to="/help"
            className="flex items-center justify-between p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition text-left"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Help Center</h3>
              <p className="text-sm text-slate-500">Get support and contact us</p>
            </div>
            <span className="text-blue-600 text-xl">→</span>
          </Link>
        </div>

        {/* Edit Profile Modal */}
        {showEditProfileModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900">Edit Profile</h3>
                <button onClick={() => setShowEditProfileModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
              </div>
              <form onSubmit={submitProfile} className="p-6 space-y-4">
                {profileError && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{profileError}</div>}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                  <input type="text" name="first_name" value={profileData.first_name} onChange={handleProfileChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input type="text" name="last_name" value={profileData.last_name} onChange={handleProfileChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none" />
                </div>
                <div className="pt-4 flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowEditProfileModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition">Cancel</button>
                  <button type="submit" disabled={savingProfile} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-70">
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900">Change Password</h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
              </div>
              <form onSubmit={submitPassword} className="p-6 space-y-4">
                {passwordError && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{passwordError}</div>}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                  <input type="password" name="old_password" required value={passwords.old_password} onChange={handlePasswordChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input type="password" name="new_password" required minLength="8" value={passwords.new_password} onChange={handlePasswordChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                  <input type="password" name="confirm_password" required minLength="8" value={passwords.confirm_password} onChange={handlePasswordChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none" />
                </div>
                <div className="pt-4 flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition">Cancel</button>
                  <button type="submit" disabled={savingPassword} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-70">
                    {savingPassword ? "Changing..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </section>
    </main>
  );
};

export default Profile;