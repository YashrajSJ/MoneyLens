import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeIndianRupee,
  ReceiptText,
} from "lucide-react";

import { formatCurrency } from "../../../utils/formatters";

export const SummaryCards = ({ summary }) => {
  const totalIncome = summary?.totalIncome || 0;
  const totalExpenses = summary?.totalExpenses || 0;
  const netSavings = summary?.netSavings || 0;
  const transactionCount = summary?.transactionCount || 0;

  const cards = [
    {
      label: "Income",
      value: formatCurrency(totalIncome),
      helper: "Completed income",
      icon: <ArrowUpRight size={18} />,
      iconClassName: "text-emerald-600 bg-emerald-50",
      cardClassName: "border-emerald-300 hover:border-emerald-400",
    },
    {
      label: "Expenses",
      value: formatCurrency(totalExpenses),
      helper: "Completed expenses",
      icon: <ArrowDownRight size={18} />,
      iconClassName: "text-red-500 bg-red-50",
      cardClassName: "border-red-300 hover:border-red-400",
    },
    {
      label: "Net savings",
      value: formatCurrency(netSavings),
      helper: "Income minus expenses",
      icon: <BadgeIndianRupee size={18} />,
      iconClassName:
        netSavings >= 0
          ? "text-slate-700 bg-slate-100"
          : "text-red-500 bg-red-50",
      cardClassName:
        netSavings >= 0
          ? "border-sky-300 hover:border-sky-400"
          : "border-red-300 hover:border-red-400",
    },
    {
      label: "Transactions",
      value: transactionCount,
      helper: "Completed entries",
      icon: <ReceiptText size={18} />,
      iconClassName: "text-sky-700 bg-sky-50",
      cardClassName: "border-sky-300 hover:border-sky-400",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`rounded-2xl border-2 bg-white/90 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md ${card.cardClassName}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{card.label}</p>

            <div
              className={`flex size-9 items-center justify-center rounded-xl ${card.iconClassName}`}
            >
              {card.icon}
            </div>
          </div>

          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
            {card.value}
          </p>

          <p className="mt-2 text-sm text-slate-500">{card.helper}</p>
        </article>
      ))}
    </section>
  );
};