import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-emerald-700">404</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Page not found 😔
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          The page you are looking for does not exist or has moved.
        </p>

        <Link
          to="/dashboard"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800"
        >
          Back to dashboard 
        </Link>
      </div>
    </main>
  );
};
