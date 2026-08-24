import { useState, useContext } from "react";
import { loginUser } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import AuthScene from "../components/AuthScene";
import BoxCube3D from "../components/BoxCube3D";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleLogin = async () => {
    try {
      setErrorMessage("");

      if (!emailPattern.test(email.trim())) {
        setErrorMessage("Please enter a valid email address");
        return;
      }

      const data = await loginUser(email.trim(), password);

      login(data.user, data.token);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <AuthScene>
      <div className="brand-panel brand-reveal w-full max-w-5xl overflow-hidden">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#252c38] via-[var(--brand-ink)] to-[#05070a] p-8 text-white shadow-[inset_-1px_0_0_rgba(255,255,255,0.08)] md:p-12">
            <div className="relative inline-flex rounded-[28px] border border-white/15 bg-white/10 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_18px_36px_-16px_rgba(0,0,0,0.8)] backdrop-blur">
              <img src={logo} alt="Jai Jalaram Packaging" className="h-16 w-auto object-contain" />
            </div>
            <p className="mt-6 brand-kicker text-amber-300">Customer Access</p>
            <h1 className="mt-3 text-4xl font-black leading-tight">
              Welcome back to your packaging storefront.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Sign in to place multi-product orders, request custom box production, and stay in touch with admin updates.
            </p>

            <div className="mt-10 hidden justify-center lg:flex">
              <BoxCube3D size={168} w={3.2} h={2.8} d={3} branded={false} />
            </div>
          </div>

          <div className="p-8 md:p-12">
            <h2 className="brand-title !text-3xl">Login</h2>
            <p className="mt-2 text-sm text-slate-600">Use your registered email to continue.</p>

            <div className="mt-8 space-y-4">
              <div>
                <label className="brand-label">Email</label>
                <input
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage("");
                  }}
                  className="brand-input"
                />
              </div>

              <div>
                <label className="brand-label">Password</label>
                <div className="brand-input flex overflow-hidden !p-0">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage("");
                    }}
                    className="w-full px-4 py-3 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="bg-gradient-to-b from-amber-100 to-amber-200 px-4 font-semibold text-slate-800 transition hover:from-amber-200 hover:to-amber-300"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            {errorMessage && (
              <p className="mt-4 rounded-2xl border border-red-200/70 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_20px_-12px_rgba(220,38,38,0.5)]">
                {errorMessage}
              </p>
            )}

            <div className="mt-3 text-right">
              <Link to="/forgot-password" className="text-sm font-semibold text-amber-700 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button type="button" onClick={handleLogin} className="brand-button mt-6 w-full">
              Login
            </button>

            <p className="mt-5 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-semibold text-amber-700 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthScene>
  );
}

export default Login;
