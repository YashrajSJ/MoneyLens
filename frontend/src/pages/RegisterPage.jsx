import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { authApi } from "../features/auth/api/authApi";
import { AuthLayout } from "../components/layout/AuthLayout";

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const buttonDisabled =
    !form.fullName || !form.username || !form.email || !form.password || loading;

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

      await authApi.register({
        ...form,
        email: form.email.trim().toLowerCase(),
      });

      toast.success("Account created successfully");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Registration failed. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={loading ? "Creating account..." : "Create your account"}
      subtitle="Set up your MoneyLens workspace and start tracking your finances with clarity."
      backgroundImage="/register_image-2.jpg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-white/85">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            value={form.fullName}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/50 focus:border-white/60"
          />
        </div>

        <div>
          <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-white/85">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Choose a username"
            value={form.username}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/50 focus:border-white/60"
          />
        </div>

        <div>
          <label htmlFor="registerEmail" className="mb-1.5 block text-sm font-medium text-white/85">
            Email
          </label>
          <input
            id="registerEmail"
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
          <label htmlFor="registerPassword" className="mb-1.5 block text-sm font-medium text-white/85">
            Password
          </label>
          <input
            id="registerPassword"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/50 focus:border-white/60"
          />
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
              : "Create account"}
        </button>

        <p className="text-center text-sm text-white/70">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-emerald-300 hover:text-emerald-200">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};