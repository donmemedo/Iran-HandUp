"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { API_BROWSER, type Category } from "@/lib/api";
import type { Dict } from "@/i18n/fa";
import { isFa } from "@/lib/utils";
import { useAuth } from "./providers";
import { Button, LinkButton } from "./ui";

const field = "w-full rounded-2xl border border-current/15 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:opacity-50 focus:border-brand-500";

export default function StartForm({ categories, locale, t }: { categories: Category[]; locale: string; t: Dict }) {
  const { user, token, ready } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({
    title: "", summary: "", story: "", goal_amount: "", city: "", beneficiary_name: "",
    cover: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=70",
    category_id: "",
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  if (ready && !user) {
    return (
      <div className="surface rounded-4xl p-10 text-center">
        <p className="ink-soft">{t.start.needLogin}</p>
        <LinkButton href={`/${locale}/login`} className="mt-5">{t.nav.login}</LinkButton>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="surface rounded-4xl p-12 text-center">
        <CheckCircle2 className="mx-auto size-14 text-[var(--color-teal-brand)]" />
        <p className="mt-5 text-lg font-bold">{t.start.done}</p>
        <LinkButton href={`/${locale}/campaigns`} className="mt-6">{t.featured.all}</LinkButton>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setError(null);
    try {
      const res = await fetch(`${API_BROWSER}/api/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...f,
          goal_amount: Number(f.goal_amount.replace(/\D/g, "")) || 0,
          category_id: f.category_id ? Number(f.category_id) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? t.common.error);
      setState("done");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
      setState("idle");
    }
  };

  return (
    <form onSubmit={submit} className="surface grid gap-4 rounded-4xl p-6 sm:p-8">
      <input className={field} placeholder={t.start.ftitle} value={f.title} onChange={set("title")} required />
      <textarea className={`${field} min-h-20 resize-none`} placeholder={t.start.fsummary} value={f.summary} onChange={set("summary")} required />
      <textarea className={`${field} min-h-40 resize-none`} placeholder={t.start.fstory} value={f.story} onChange={set("story")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <input className={field} inputMode="numeric" placeholder={t.start.fgoal} value={f.goal_amount} onChange={set("goal_amount")} required />
        <input className={field} placeholder={t.start.fcity} value={f.city} onChange={set("city")} />
        <input className={field} placeholder={t.start.fbeneficiary} value={f.beneficiary_name} onChange={set("beneficiary_name")} />
        <select className={field} value={f.category_id} onChange={set("category_id")}>
          <option value="" className="bg-[var(--bg-elev)]">{t.start.fcategory}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id} className="bg-[var(--bg-elev)] text-[var(--ink)]">
              {isFa(locale) ? c.name : c.name_en}
            </option>
          ))}
        </select>
      </div>
      <input className={field} placeholder={t.start.fcover} value={f.cover} onChange={set("cover")} dir="ltr" />
      {error && <p className="rounded-2xl bg-brand-500/10 px-4 py-3 text-sm text-brand-600 dark:text-brand-300">{error}</p>}
      <Button type="submit" size="lg" disabled={state === "loading"} className="mt-2">
        {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : t.start.submit}
      </Button>
    </form>
  );
}
