import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  PiggyBank,
  Plus,
  ShieldCheck,
  BadgeIndianRupee,
  Landmark,
  ReceiptText,
} from "lucide-react";

import { formatCurrency } from "../utils/formatters";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../features/auth/hooks/useCurrentUser";

const stats = [
  {
    label: "Total Balance",
    value: 125000,
    helper: "Across all accounts",
    tone: "neutral",
  },
  {
    label: "Income this month",
    value: 52000,
    helper: "+8% vs last month",
    tone: "positive",
  },
  {
    label: "Expenses this month",
    value: 18200,
    helper: "12% lower than last month",
    tone: "negative",
  },
  {
    label: "Health Score",
    value: 72,
    helper: "Good financial rhythm",
    tone: "score",
  },
];

const accounts = [
  {
    name: "HDFC Savings",
    type: "Savings Account",
    balance: 84500,
    isDefault: true,
  },
  {
    name: "Cash Wallet",
    type: "Wallet",
    balance: 12500,
    isDefault: false,
  },
];

const recentTransactions = [
  {
    title: "Salary credited",
    date: "Today",
    amount: 52000,
    type: "INCOME",
  },
  {
    title: "Netflix subscription",
    date: "Yesterday",
    amount: 499,
    type: "EXPENSE",
  },
  {
    title: "Grocery bill",
    date: "03 Jul",
    amount: 1840,
    type: "EXPENSE",
  },
];

const upcomingPayments = [
  {
    title: "Netflix",
    due: "Due tomorrow",
    amount: 499,
  },
  {
    title: "House rent",
    due: "Due on 10 Jul",
    amount: 12000,
  },
  {
    title: "Monthly SIP",
    due: "Due on 15 Jul",
    amount: 5000,
  },
];

const quickLinks = [
  {
    title: "Accounts",
    description: "Manage balances and account details",
    href: "/accounts",
    icon: <Landmark size={19} />,
    tone: "emerald",
  },
  {
    title: "Transactions",
    description: "Review income, expenses, and filters",
    href: "/transactions",
    icon: <ReceiptText size={19} />,
    tone: "sky",
  },
  {
    title: "Budgets",
    description: "Track monthly spending limits",
    href: "/budgets",
    icon: <PiggyBank size={19} />,
    tone: "amber",
  },
];

const getHelperClassName = (tone) => {
  if (tone === "positive") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (tone === "negative") {
    return "bg-red-50 text-red-600";
  }

  if (tone === "score") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-slate-100 text-slate-600";
};

const getQuickLinkClassName = (tone) => {
  if (tone === "emerald") {
    return "group-hover:border-emerald-200 group-hover:bg-emerald-50/60";
  }

  if (tone === "sky") {
    return "group-hover:border-sky-200 group-hover:bg-sky-50/60";
  }

  if (tone === "amber") {
    return "group-hover:border-amber-200 group-hover:bg-amber-50/60";
  }

  return "group-hover:border-slate-300 group-hover:bg-slate-50";
};

const getQuickIconClassName = (tone) => {
  if (tone === "emerald") {
    return "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100";
  }

  if (tone === "sky") {
    return "bg-sky-50 text-sky-700 group-hover:bg-sky-100";
  }

  if (tone === "amber") {
    return "bg-amber-50 text-amber-700 group-hover:bg-amber-100";
  }

  return "bg-slate-100 text-slate-700 group-hover:bg-slate-200";
};

export const DashboardPage = () => {
  const { data: user } = useCurrentUser();

  const firstName =
    user?.fullName?.trim()?.split(" ")[0] || user?.username || "there";
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-100/70 blur-3xl" />
        <div className="absolute bottom-0 right-24 h-24 w-24 rounded-full bg-sky-100/70 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                July 2026 overview
              </span>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                Personal finance workspace
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Welcome back, {firstName}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Track balances, monthly spending, budgets, and upcoming payments
              from one focused dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            <Link
              to="/accounts?create=true"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
            >
              <Landmark size={17} />
              Add Account
            </Link>

            <Link
              to="/budgets?create=true"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 text-sm font-medium text-amber-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-100 hover:shadow-md"
            >
              <PiggyBank size={17} />
              Create Budget
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-emerald-200/80 bg-white/90 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Monthly Budget
            </p>
            <p className="mt-1 text-sm text-slate-600">
              You have used 62% of your default account budget this month.
            </p>
          </div>

          <div className="w-full md:w-64">
            <div className="h-2 rounded-full bg-emerald-100">
              <div className="h-2 w-[62%] rounded-full bg-emerald-600" />
            </div>
            <p className="mt-2 text-right text-xs font-semibold text-slate-700">
              {formatCurrency(6200)} of {formatCurrency(10000)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-semibold text-slate-950">Money workspace</h2>
            <p className="mt-1 text-sm text-slate-500">
              Jump into the areas you use most to manage your money.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className={`group flex min-h-40 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${getQuickLinkClassName(
                item.tone,
              )}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex size-12 items-center justify-center rounded-2xl transition ${getQuickIconClassName(
                      item.tone,
                    )}`}
                  >
                    {item.icon}
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>

                <ArrowRight
                  size={17}
                  className="mt-1 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{stat.label}</p>

              {stat.tone === "positive" && (
                <ArrowUpRight className="text-emerald-600" size={18} />
              )}
              {stat.tone === "negative" && (
                <ArrowDownRight className="text-red-500" size={18} />
              )}
              {stat.tone === "score" && (
                <ShieldCheck className="text-blue-600" size={18} />
              )}
              {stat.tone === "neutral" && (
                <BadgeIndianRupee className="text-slate-500" size={18} />
              )}
            </div>

            <p className="mt-4 text-2xl font-semibold text-slate-950">
              {stat.tone === "score"
                ? `${stat.value}/100`
                : formatCurrency(stat.value)}
            </p>

            <span
              className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getHelperClassName(
                stat.tone,
              )}`}
            >
              {stat.helper}
            </span>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-950">
                Monthly Expense Breakdown
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Category chart will connect to analytics data.
              </p>
            </div>
          </div>

          <div className="mt-6 flex h-72 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">
            Chart area
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">Recent Transactions</h2>

          <div className="mt-5 space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.title}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {transaction.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {transaction.date}
                  </p>
                </div>

                <p
                  className={
                    transaction.type === "INCOME"
                      ? "text-sm font-semibold text-emerald-600"
                      : "text-sm font-semibold text-red-500"
                  }
                >
                  {transaction.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">Accounts</h2>
            <p className="mt-1 text-sm text-slate-500">
              Your linked balances and default account.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <button className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-5 text-slate-500 transition hover:border-slate-400 hover:bg-slate-50">
            <Plus size={30} />
            <span className="mt-2 text-sm font-medium">Add New Account</span>
          </button>

          {accounts.map((account) => (
            <article
              key={account.name}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-950">
                    {account.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{account.type}</p>
                </div>

                {account.isDefault && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    Default
                  </span>
                )}
              </div>

              <p className="mt-6 text-2xl font-semibold text-slate-950">
                {formatCurrency(account.balance)}
              </p>

              <div className="mt-5 flex justify-between text-sm text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <ArrowUpRight size={16} className="text-emerald-600" />
                  Income
                </span>
                <span className="inline-flex items-center gap-1">
                  <ArrowDownRight size={16} className="text-red-500" />
                  Expense
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">Upcoming Payments</h2>
            <p className="mt-1 text-sm text-slate-500">
              Recurring payments coming up soon.
            </p>
          </div>

          <div className="flex size-9 items-center justify-center rounded-lg bg-slate-50 text-slate-700">
            <CalendarClock size={18} />
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {upcomingPayments.map((payment) => (
            <div
              key={payment.title}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-3"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {payment.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">{payment.due}</p>
              </div>

              <p className="text-sm font-semibold text-slate-900">
                {formatCurrency(payment.amount)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
