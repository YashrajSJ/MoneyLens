import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { AuthLayout } from "../components/layout/AuthLayout";
import { authApi } from "../features/auth/api/authApi";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const buttonDisabled = !email.trim() || loading;

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      await authApi.forgotPassword({
        email: email.trim().toLowerCase(),
      });

      setSubmitted(true);
      toast.success("Password reset instructions sent");
    } catch (error) {
      toast.error(error.message || "Unable to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your account email. We’ll send a reset link if it matches an account."
      backgroundImage="/login_image-4.jpg"
    >
      {submitted ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Check your inbox</p>
          <p className="mt-1 leading-6">
            If an account exists with this email, you will receive reset
            instructions shortly.
          </p>

          <Link
            to="/login"
            className="mt-4 inline-flex font-semibold text-emerald-700 hover:text-emerald-600"
          >
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="forgotEmail"
              className="mb-1.5 block text-sm font-medium text-white/85"
            >
              Email
            </label>
            <input
              id="forgotEmail"
              type="email"
              required
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/50 focus:border-white/60"
            />
          </div>

          <button
            type="submit"
            disabled={buttonDisabled}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>

          <p className="text-center text-sm text-white/70">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-emerald-300 hover:text-emerald-200"
            >
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};
