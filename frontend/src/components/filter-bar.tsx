"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/api";
import type { Dict } from "@/i18n/fa";
import { cn, isFa } from "@/lib/utils";

export default function FilterBar({
  categories, locale, t,
}: { categories: Category[]; locale: string; t: Dict }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");

  const push = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const id = setTimeout(() => {
      if ((sp.get("q") ?? "") !== q) push({ q: q || null });
    }, 420);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const active = sp.get("category");
  const sort = sp.get("sort") ?? "trending";

  return (
    <div className="glass sticky top-20 z-30 space-y-4 rounded-4xl p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 opacity-50 ltr:left-4 rtl:right-4" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.list.search}
            className="w-full rounded-2xl border border-current/15 bg-transparent py-3 text-sm outline-none transition-colors placeholder:opacity-50 focus:border-brand-500 ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4"
          />
        </label>
        <label className="relative">
          <SlidersHorizontal className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 opacity-50 ltr:left-4 rtl:right-4" />
          <select
            value={sort}
            onChange={(e) => push({ sort: e.target.value })}
            className="w-full appearance-none rounded-2xl border border-current/15 bg-transparent py-3 text-sm font-semibold outline-none focus:border-brand-500 ltr:pl-11 ltr:pr-8 rtl:pr-11 rtl:pl-8 sm:w-52"
          >
            {Object.entries(t.list.sort).map(([k, v]) => (
              <option key={k} value={k} className="bg-[var(--bg-elev)] text-[var(--ink)]">{v}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => push({ category: null })}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-all",
            !active ? "border-brand-500 bg-brand-500 text-white" : "border-current/15 hover:border-brand-500",
          )}
        >
          {t.list.all}
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => push({ category: active === c.slug ? null : c.slug })}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-all",
              active === c.slug ? "border-brand-500 bg-brand-500 text-white" : "border-current/15 hover:border-brand-500",
            )}
          >
            {isFa(locale) ? c.name : c.name_en}
          </button>
        ))}
      </div>
    </div>
  );
}
