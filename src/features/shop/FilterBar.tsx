"use client";

import type { FilterChip } from "@/config/catalog";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * FilterBar — horizontally scrollable category chips (design: first chip
 * active in brand colour). Emits the selected tag upward.
 */
export function FilterBar({
  filters,
  active,
  onChange,
}: {
  filters: FilterChip[];
  active: string;
  onChange: (tag: string) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Product filters"
      className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {filters.map((filter) => {
        const isActive = filter.tag === active;
        return (
          <button
            key={filter.tag}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(filter.tag)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 font-body text-[13px] font-semibold transition-all duration-200",
              isActive
                ? "border-brand bg-brand text-white shadow-soft"
                : "border-line bg-white text-plum-muted hover:-translate-y-0.5 hover:border-brand hover:text-brand",
            )}
          >
            <Icon name={filter.icon} filled={isActive} className="text-[16px]" />
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
