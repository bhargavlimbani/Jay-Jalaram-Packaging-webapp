import { useState, useContext } from "react";
import { loginUser } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";

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
    <div className="brand-auth-shell flex items-center justify-center">
      <div className="brand-panel w-full max-w-5xl overflow-hidden">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-[var(--brand-ink)] p-8 text-white md:p-12">
            <div className="inline-flex rounded-[28px] bg-white/10 p-3">
              <img src={logo} alt="Jai Jalaram Packaging" className="h-16 w-auto object-contain" />
            </div>
            <p className="mt-6 brand-kicker text-amber-300">Customer Access</p>
            <h1 className="mt-3 text-4xl font-black leading-tight">
              Welcome back to your packaging storefront.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Sign in to place multi-product orders, request custom box production, and stay in touch with admin updates.
            </p>
          </div>

          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-black">Login</h2>
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
                <div className="flex overflow-hidden rounded-2xl border border-black/10 bg-white">
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
                    className="bg-amber-50 px-4 font-semibold text-slate-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            {errorMessage && (
              <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
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
    </div>
  );
}

export default Login;
