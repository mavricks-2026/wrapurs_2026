import { cn } from "@/lib/utils";

type IconProps = {
  /** Material Symbols ligature name, e.g. "favorite" */
  name: string;
  className?: string;
  /** Use the filled variant of the icon */
  filled?: boolean;
  /** Provide for an accessible label (otherwise the icon is decorative) */
  label?: string;
  size?: number;
};

/**
 * Icon — thin wrapper around Google "Material Symbols Outlined" (the icon set
 * used by the Stitch design). Loaded once in `app/layout.tsx`.
 */
export function Icon({ name, className, filled, label, size }: IconProps) {
  return (
    <span
      className={cn(
        "material-symbols-outlined inline-flex select-none items-center justify-center leading-none",
        filled && "icon-filled",
        className,
      )}
      style={size ? { fontSize: size } : undefined}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      {name}
    </span>
  );
}
