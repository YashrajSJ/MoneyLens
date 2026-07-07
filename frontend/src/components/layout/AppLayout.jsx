import {
  Bell,
  LayoutDashboard,
  Plus,
  WalletCards,
  Sparkles,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { BgGradient } from "./BgGradient";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
];

export const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                <WalletCards size={22} />
              </div>

              <div>
                <p className="text-base font-semibold leading-none">
                  MoneyLens
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  AI finance platform
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      [
                        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-slate-950 text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                      ].join(" ")
                    }
                  >
                    <Icon size={17} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="group relative hidden h-10 items-center overflow-hidden rounded-xl bg-gradient-to-r from-rose-200 via-amber-200 to-emerald-200 p-px shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:inline-flex"
            >
              <span className="inline-flex h-full items-center gap-2 rounded-[11px] bg-white px-3.5 text-sm font-medium text-slate-800 transition group-hover:bg-slate-50">
                <Sparkles
                  size={17}
                  className="text-rose-500 transition group-hover:scale-110"
                />
                Scan Receipt
              </span>
            </button>

            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus size={17} />
              Add Transaction
            </button>

            <button
              type="button"
              className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-emerald-500" />
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <BgGradient>{children}</BgGradient>
      </main>
    </div>
  );
};
