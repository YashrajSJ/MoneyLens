import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { AuthLayout } from "../components/layout/AuthLayout";
import { authApi } from "../features/auth/api/authApi";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [status, setStatus] = useState(token ? "READY" : "MISSING_TOKEN");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!token) {
      setStatus("MISSING_TOKEN");
      return;
    }

    try {
      setLoading(true);

      await authApi.verifyEmail({ token });

      setStatus("SUCCESS");
      toast.success("Email verified successfully");
    } catch (error) {
      setStatus("FAILED");
      toast.error(error.message || "Email verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Confirm your email address to secure your MoneyLens account."
      backgroundImage="/register_image-2.jpg"
    >
      {status === "SUCCESS" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Email verified</p>
          <p className="mt-1 leading-6">
            Your email has been verified successfully.
          </p>

          <Link
            to="/login"
            className="mt-4 inline-flex font-semibold text-emerald-700 hover:text-emerald-600"
          >
            Continue to login
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {status === "MISSING_TOKEN" && (
            <div className="rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-800">
              This verification link is missing a token. Please request a new
              verification email.
            </div>
          )}

          {status === "FAILED" && (
            <div className="rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-800">
              This verification link is invalid or expired.
            </div>
          )}

          <button
            type="button"
            disabled={loading || !token}
            onClick={handleVerify}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify email"}
          </button>

          <p className="text-center text-sm text-white/70">
            Already verified?{" "}
            <Link
              to="/login"
              className="font-semibold text-emerald-300 hover:text-emerald-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  );
};
