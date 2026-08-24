import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import BoxCube3D from "../components/BoxCube3D";
import Tilt3D from "../components/Tilt3D";
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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials = (formData.name || user?.name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="brand-page">
      <Navbar />

      <section className="brand-container py-8 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Identity card */}
          <div className="brand-panel brand-reveal brand-scene p-8 md:p-10 lg:sticky lg:top-28 lg:self-start">
            <p className="brand-kicker">Your Account</p>

            <div className="mt-8 flex flex-col items-center text-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/70 bg-gradient-to-br from-[#ffe071] to-[#f0b429] text-3xl font-black tracking-tight text-[var(--brand-ink)] shadow-[inset_0_2px_0_rgba(255,255,255,0.85),inset_0_-3px_0_rgba(160,108,0,0.35),0_20px_36px_-14px_rgba(201,138,5,0.8)]">
                  {initials}
                </div>
              </div>

              <h1 className="mt-5 text-2xl font-black tracking-tight">
                {formData.name || "Your Profile"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{formData.email || "-"}</p>

              {user?.role && (
                <span className="brand-chip brand-chip-active mt-4 !px-4 !py-1.5 text-xs uppercase tracking-[0.2em]">
                  {user.role}
                </span>
              )}
            </div>

            <div className="brand-divider my-8" />

            <div className="flex justify-center">
              <BoxCube3D size={150} w={3.2} h={2.8} d={3} branded={false} />
            </div>
          </div>

          {/* Editable details */}
          <div className="brand-panel brand-reveal brand-reveal-2 p-8 md:p-10">
            <h2 className="brand-title !text-3xl">My Profile</h2>
            <p className="mt-3 text-sm text-slate-600">
              Keep your contact details current so order and invoice updates reach you.
            </p>

            {message && <div className="brand-note brand-note-blue mt-6">{message}</div>}

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="brand-label">Full Name</label>
                <input
                  className="brand-input"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="brand-label">Email</label>
                <input
                  className="brand-input"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="brand-label">Phone Number</label>
                <input
                  className="brand-input"
                  placeholder="Phone Number"
                  value={formData.phone}
                  maxLength={10}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFormData({ ...formData, phone: val });
                  }}
                />
              </div>

              <div className="md:col-span-2">
                <label className="brand-label">Address</label>
                <textarea
                  className="brand-input min-h-[120px]"
                  placeholder="Address"
                  rows="4"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            <div className="brand-divider my-8" />

            <div className="flex flex-wrap gap-3">
              <button className="brand-btn-3d brand-btn-blue px-5 py-3" onClick={handleSubmit}>
                Update Profile
              </button>

              <button className="brand-btn-3d brand-btn-red px-5 py-3" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="brand-scene mt-6 grid gap-4 sm:grid-cols-3">
          {[
            user?.role === "admin"
              ? { label: "Admin Dashboard", text: "Manage orders and products", to: "/admin" }
              : { label: "My Orders", text: "Track approvals and payments", to: "/customer" },
            { label: "Invoices", text: "Download invoice PDFs", to: "/invoices" },
            { label: "Custom Order", text: "Specify a made-to-size box", to: "/order" },
          ].map((item, index) => (
            <Tilt3D
              key={item.label}
              max={11}
              lift={8}
              className="brand-tile cursor-pointer p-5"
              onClick={() => navigate(item.to)}
            >
              <div className={index === 0 ? "brand-layer-1" : ""}>
                <p className="text-lg font-black tracking-tight">{item.label}</p>
                <p className="mt-1 text-sm text-slate-600">{item.text}</p>
              </div>
            </Tilt3D>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Profile;
