export const PageLoader = ({ label = "Loading" }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="size-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
          <p className="text-sm font-medium text-slate-700">{label}</p>
        </div>
      </div>
    </div>
  );
};