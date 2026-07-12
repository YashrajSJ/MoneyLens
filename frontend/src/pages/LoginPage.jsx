import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { authApi } from "../features/auth/api/authApi";
import { AuthLayout } from "../components/layout/AuthLayout";

export const LoginPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const buttonDisabled = !form.email || !form.password || loading;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      await authApi.login({
        ...form,
        email: form.email.trim().toLowerCase(),
      });

      toast.success("Login successful");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message || "Login failed. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={loading ? "Signing you in..." : "Welcome back to MoneyLens"}
      subtitle="Login to track your accounts, budgets, transactions, receipts, and AI insights."
      backgroundImage="/login_image-4.jpg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="loginEmail"
            className="mb-1.5 block text-sm font-medium text-white/85"
          >
            Email
          </label>
          <input
            id="loginEmail"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/50 focus:border-white/60"
          />
        </div>

        <div>
          <label
            htmlFor="loginPassword"
            className="mb-1.5 block text-sm font-medium text-white/85"
          >
            Password
          </label>
          <input
            id="loginPassword"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/50 focus:border-white/60"
          />
        </div>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={buttonDisabled}
          className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Processing..."
            : buttonDisabled
              ? "Enter all details"
              : "Login"}
        </button>

        <p className="text-center text-sm text-white/70">
          New to MoneyLens?{" "}
          <Link
            to="/register"
            className="font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Create account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
