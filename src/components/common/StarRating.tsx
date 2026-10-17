import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

/** StarRating — brand stars (matches `fill-icon` in the design).
 *  Pass `allowHalf` to render a `star_half` glyph for fractional ratings. */
export function StarRating({
  rating = 5,
  className,
  iconClassName,
  allowHalf = false,
}: {
  rating?: number;
  className?: string;
  iconClassName?: string;
  allowHalf?: boolean;
}) {
  return (
    <div className={cn("flex text-brand", className)} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const full = i + 1 <= rating;
        const half = !full && allowHalf && rating - i >= 0.25;
        return (
          <Icon
            key={i}
            name={half ? "star_half" : "star"}
            filled={full || half}
            className={cn("text-[18px]", !full && !half && "text-line", iconClassName)}
          />
        );
      })}
    </div>
  );
}
