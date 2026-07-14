import {
  BarChart3,
  Bell,
  Landmark,
  LayoutDashboard,
  LogOut,
  PiggyBank,
  Plus,
  ReceiptText,
  WalletCards,
  Sparkles,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { authApi } from "../../features/auth/api/authApi";
import { useCurrentUser } from "../../features/auth/hooks/useCurrentUser";

import { BgGradient } from "./BgGradient";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Accounts",
    href: "/accounts",
    icon: Landmark,
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: ReceiptText,
  },
  {
    label: "Budgets",
    href: "/budgets",
    icon: PiggyBank,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];

export const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  const firstName =
    user?.fullName?.trim()?.split(" ")[0] || user?.username || "User";

  const handleLogout = async () => {
    try {
      await authApi.logout();

      queryClient.clear();

      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "Logout failed");
    }
  };
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
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
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
              className="group relative hidden h-10 items-center overflow-hidden rounded-xl bg-linear-to-r from-rose-200 via-amber-200 to-emerald-200 p-px shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:inline-flex"
            >
              <span className="inline-flex h-full items-center gap-2 rounded-[11px] bg-white px-3.5 text-sm font-medium text-slate-800 transition group-hover:bg-slate-50">
                <Sparkles
                  size={17}
                  className="text-rose-500 transition group-hover:scale-110"
                />
                Scan Receipt
              </span>
            </button>

            <Link
              to="/transactions?create=true"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus size={17} />
              Add Transaction
            </Link>

            <div className="hidden items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 md:flex">
              {firstName}
            </div>

            <button
              type="button"
              className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-emerald-500" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
              aria-label="Logout"
            >
              <LogOut size={20} />
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
