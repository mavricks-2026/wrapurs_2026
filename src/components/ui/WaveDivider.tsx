import { cn } from "@/lib/utils";

/**
 * WaveDivider — the soft SVG wave used between sections in the design.
 * Colours via `currentColor`; default matches the section background.
 */
export function WaveDivider({
  className,
  flip = false,
  colorClass = "text-section",
}: {
  className?: string;
  flip?: boolean;
  colorClass?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("w-full overflow-hidden leading-none", colorClass, flip && "rotate-180", className)}
    >
      <svg className="block h-12 w-full" preserveAspectRatio="none" viewBox="0 0 1200 120">
        <path
          d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,60 L1200,120 L0,120 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
