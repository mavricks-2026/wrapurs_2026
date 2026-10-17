"use client";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/** Build a compact page list, e.g. 1 … 4 5 6 … 12 */
function pageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("ellipsis");
  for (let p = start; p <= end; p += 1) out.push(p);
  if (end < total - 1) out.push("ellipsis");
  out.push(total);
  return out;
}

/** Pagination — numbered pages with prev/next, animated on hover. */
export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  const pages = pageList(page, pageCount);

  const arrow =
    "flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-plum transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <button
        type="button"
        className={arrow}
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <Icon name="chevron_left" className="text-[20px]" />
      </button>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="px-1.5 font-body text-plum-muted">
            &hellip;
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "h-10 min-w-10 rounded-full border px-3 font-body text-[14px] font-semibold transition-all duration-200",
              p === page
                ? "border-brand bg-brand text-white shadow-soft"
                : "border-line bg-white text-plum-muted hover:-translate-y-0.5 hover:border-brand hover:text-brand",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        className={arrow}
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        aria-label="Next page"
      >
        <Icon name="chevron_right" className="text-[20px]" />
      </button>
    </nav>
  );
}
