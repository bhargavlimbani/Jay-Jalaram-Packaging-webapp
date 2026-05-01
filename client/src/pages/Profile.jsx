import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { getProfile, updateProfile as saveProfile } from "../services/authService";

function Profile() {
  const { user, updateUser, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }

    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        setFormData({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          address: profile.address || "",
        });
        updateUser(profile);
      } catch (error) {
        console.log(error);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    try {
      const res = await saveProfile(formData);
      updateUser(res.user);
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.log(error);
      setMessage("Unable to update profile.");
    }
  };

  // ... 
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div>
      <Navbar />

      <div className="mx-auto max-w-2xl p-10">
        <h1 className="mb-6 text-3xl font-bold">
          My Profile
        </h1>

        {message && (
          <div className="mb-6 rounded bg-blue-100 px-4 py-3 text-blue-900">
            {message}
          </div>
        )}

        <div className="grid gap-4">
          <input
            className="rounded border p-3"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            className="rounded border p-3"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            className="rounded border p-3"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <textarea
            className="rounded border p-3"
            placeholder="Address"
            rows="4"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Update Profile
          </button>

          <button
            className="rounded bg-red-600 px-5 py-3 text-white hover:bg-red-700"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
