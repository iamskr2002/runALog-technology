import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  /** "default" for light sections, "on-navy" for deep navy bands */
  tone?: "default" | "on-navy";
  className?: string;
  id?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "default",
  className,
  id,
}: SectionHeadingProps) {
  const onNavy = tone === "on-navy";

  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
      id={id}
    >
      <p
        className={cn(
          "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]",
          onNavy ? "text-teal-300" : "text-teal-700"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-block h-px w-6",
            onNavy ? "bg-teal-300/70" : "bg-teal-600/60"
          )}
        />
        {eyebrow}
        {align === "center" && (
          <span
            aria-hidden="true"
            className={cn(
              "inline-block h-px w-6",
              onNavy ? "bg-teal-300/70" : "bg-teal-600/60"
            )}
          />
        )}
      </p>
      <h2
        className={cn(
          "mt-4 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.6rem] lg:leading-[1.15]",
          onNavy ? "text-white" : "text-navy-900"
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-4 max-w-2xl text-base leading-relaxed sm:text-lg",
            align === "center" && "mx-auto",
            onNavy ? "text-navy-200" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
