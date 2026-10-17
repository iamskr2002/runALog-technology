import { cn } from "@/lib/utils";

/**
 * RunA Log Technologies logo — an abstract "connected route" mark
 * (workflow nodes + forward path) with a wordmark.
 */
export function LogoMark({
  className,
  tone = "dark",
}: {
  className?: string;
  /** "dark" = for light backgrounds, "light" = for navy backgrounds */
  tone?: "dark" | "light";
}) {
  const box = tone === "dark" ? "#0E1D33" : "#FFFFFF";
  const path = tone === "dark" ? "#2DD4BF" : "#0D9488";
  const node = tone === "dark" ? "#FFFFFF" : "#0E1D33";
  const nodeSecondary = tone === "dark" ? "#5EEAD4" : "#14B8A6";

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("size-9 shrink-0", className)}
    >
      <rect width="40" height="40" rx="11" fill={box} />
      <path
        d="M12 29V16.5C12 14.6 13.6 13 15.5 13H26"
        stroke={path}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M22.5 8.5L27 13L22.5 17.5"
        stroke={path}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="29" r="2.6" fill={node} />
      <circle cx="12" cy="16.5" r="1.7" fill={nodeSecondary} />
      <circle cx="19.5" cy="29" r="1.7" fill={nodeSecondary} />
      <path
        d="M19.5 29h6.5"
        stroke={nodeSecondary}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="1.5 3.5"
      />
    </svg>
  );
}

export function Logo({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const wordColor = tone === "dark" ? "text-navy-900" : "text-white";
  const subColor = tone === "dark" ? "text-navy-400" : "text-navy-300";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark tone={tone} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-lg font-bold tracking-tight",
            wordColor
          )}
        >
          RunA&nbsp;Log
          <span className="sr-only"> Technologies</span>
        </span>
        <span
          className={cn(
            "mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.28em]",
            subColor
          )}
        >
          Technologies
        </span>
      </span>
    </span>
  );
}
