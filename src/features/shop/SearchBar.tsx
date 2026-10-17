"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** SearchBar — the one used on the /search page (writes `?q=` to the URL). */
export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto flex w-full max-w-xl items-center gap-2"
      role="search"
    >
      <div className="relative flex-1">
        <Icon
          name="search"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-plum-muted"
        />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search lamps, frames, hampers…"
          aria-label="Search products"
          className="w-full rounded-full border border-line bg-white py-3 pl-12 pr-4 font-body text-[15px] text-plum outline-none transition-colors placeholder:text-plum-muted/60 focus:border-brand"
        />
      </div>
      <Button type="submit" size="md" className="shrink-0">
        Search
      </Button>
    </form>
  );
}
