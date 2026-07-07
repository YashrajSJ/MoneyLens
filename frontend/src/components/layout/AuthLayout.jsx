import { WalletCards } from "lucide-react";

const appName = import.meta.env.VITE_APP_NAME || "MoneyLens";

export const AuthLayout = ({
  title,
  subtitle,
  backgroundImage = "/login-3.avif",
  children,
}) => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <section className="w-full max-w-md rounded-xl border border-white/25 bg-white/10 p-7 shadow-2xl backdrop-blur-md sm:p-8">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-white text-slate-950">
              <WalletCards size={23} />
            </div>

            <div>
              <p className="text-lg font-semibold">{appName}</p>
              <p className="text-sm text-white/70">AI finance platform</p>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            {subtitle ? (
              <p className="mt-2 text-sm leading-6 text-white/70">{subtitle}</p>
            ) : null}
          </div>

          {children}
        </section>
      </div>
    </main>
  );
};
