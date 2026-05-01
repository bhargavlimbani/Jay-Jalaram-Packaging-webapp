import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordRequest, resetPasswordWithOtpRequest } from "../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleReset = async () => {
    try {
      setErrorMessage("");
      setMessage("");

      if (!emailPattern.test(email.trim())) {
        setErrorMessage("Please enter a valid email address");
        return;
      }

      setLoading(true);
      const res = await forgotPasswordRequest(email.trim());
      setMessage(res.message);
      setOtpSent(true);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to send reset email right now"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetWithOtp = async () => {
    try {
      setErrorMessage("");
      setMessage("");

      if (!emailPattern.test(email.trim())) {
        setErrorMessage("Please enter a valid email address");
        return;
      }

      if (!/^\d{6}$/.test(otp.trim())) {
        setErrorMessage("Please enter a valid 6-digit OTP");
        return;
      }

      if (!password.trim() || password.trim().length < 6) {
        setErrorMessage("Password must be at least 6 characters");
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match");
        return;
      }

      setLoading(true);
      const res = await resetPasswordWithOtpRequest(email.trim(), otp.trim(), password);
      setMessage(res.message);
      setOtp("");
      setPassword("");
      setConfirmPassword("");
      setOtpSent(false);
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
        <p className="brand-kicker">Account Recovery</p>
        <h2 className="mt-3 text-4xl font-black text-gray-900">Forgot Password</h2>
        <p className="mt-3 text-sm text-gray-600">
          Enter your registered email and we will send a password reset link and OTP.
        </p>

        <div className="mt-6">
          <label className="brand-label">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMessage("");
              setMessage("");
            }}
            disabled={loading}
            className="brand-input"
          />
        </div>

        {otpSent && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="brand-label">Reset OTP</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setErrorMessage("");
                  setMessage("");
                }}
                className="brand-input"
              />
            </div>

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
        )}

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
          onClick={handleReset}
          disabled={loading}
          className="brand-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Reset Link & OTP"}
        </button>

        {otpSent && (
          <button
            type="button"
            onClick={handleResetWithOtp}
            disabled={loading}
            className="brand-button mt-3 w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Updating..." : "Reset Password With OTP"}
          </button>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-amber-700 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
