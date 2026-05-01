import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPasswordRequest } from "../services/authService";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    try {
      setErrorMessage("");
      setMessage("");

      if (!password.trim() || password.length < 6) {
        setErrorMessage("Password must be at least 6 characters");
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match");
        return;
      }
      

      setLoading(true);
      const res = await resetPasswordRequest(token, password);
      setMessage(res.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to reset password right now"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brand-auth-shell flex items-center justify-center">
      <div className="brand-panel w-full max-w-lg p-8 md:p-10">
        <p className="brand-kicker">Secure Access</p>
        <h2 className="mt-3 text-4xl font-black text-gray-900">Reset Password</h2>
        <p className="mt-3 text-sm text-gray-600">
          Enter your new password for your Jai Jalaram Packaging account.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="brand-label">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage("");
                setMessage("");
              }}
              className="brand-input"
            />
          </div>

          <div>
            <label className="brand-label">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrorMessage("");
                setMessage("");
              }}
              className="brand-input"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {errorMessage}
          </p>
        )}

        {message && (
          <p className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={handleResetPassword}
          disabled={loading}
          className="brand-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Updating..." : "Reset Password"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Back to{" "}
          <Link to="/login" className="font-semibold text-amber-700 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
