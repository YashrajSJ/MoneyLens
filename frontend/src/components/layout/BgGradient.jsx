export const BgGradient = ({ children, className = "" }) => {
  return (
    <div className={`relative isolate ${className}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-16rem] top-[-12rem] -z-10 h-[34rem] w-[34rem] rounded-full bg-emerald-200/25 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-14rem] top-[8rem] -z-10 h-[38rem] w-[38rem] rounded-full bg-cyan-200/25 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[18%] top-[34rem] -z-10 h-[32rem] w-[32rem] rounded-full bg-teal-200/15 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[10%] top-[62rem] -z-10 h-[30rem] w-[30rem] rounded-full bg-emerald-100/25 blur-3xl"
      />

      {children}
    </div>
  );
};