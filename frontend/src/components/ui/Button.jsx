import { cn } from "../../utils/cn";

const variants = {
  primary: "bg-slate-950 text-white hover:bg-slate-800",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export const Button = ({
  children,
  className,
  variant = "primary",
  type = "button",
  isLoading = false,
  disabled,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant] || variants.primary,
        className,
      )}
      {...props}
    >
      {isLoading ? "Please wait..." : children}
    </button>
  );
};
