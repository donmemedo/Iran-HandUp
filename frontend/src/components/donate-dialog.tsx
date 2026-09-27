"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Heart, Loader2, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BROWSER } from "@/lib/api";
import type { Dict } from "@/i18n/fa";
import { formatNumber } from "@/lib/utils";
import { useAuth } from "./providers";
import { Button } from "./ui";

const PRESETS = [200_000, 500_000, 1_000_000, 2_500_000];

export default function DonateDialog({
  slug, title, locale, t, className, size = "lg",
}: { slug: string; title: string; locale: string; t: Dict; className?: string; size?: "md" | "lg" }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(500_000);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();
  const router = useRouter();

  const value = custom ? Number(custom.replace(/\D/g, "")) : amount;

  const submit = async () => {
    if (value < 10_000) return setError(t.donate.min);
    setError(null);
    setState("loading");
    try {
      const res = await fetch(`${API_BROWSER}/api/campaigns/${slug}/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ amount: value, message: message || null, anonymous, donor_name: name || user?.full_name || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? t.common.error);
      setState("done");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error);
      setState("idle");
    }
  };

  const field = "w-full rounded-2xl border border-current/15 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:opacity-50 focus:border-brand-500";

  return (
    <>
      <Button size={size} className={className} onClick={() => setOpen(true)}>
        <Heart className="size-4" /> {t.campaign.donate}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="surface my-8 w-full max-w-lg rounded-4xl p-6 shadow-2xl sm:p-8"
            >
              {state === "done" ? (
                <div className="py-6 text-center">
                  <CheckCircle2 className="mx-auto size-16 text-[var(--color-teal-brand)]" />
                  <h3 className="mt-5 text-2xl font-black">{t.donate.success}</h3>
                  <p className="ink-soft mt-2 text-sm">{t.donate.successSub}</p>
                  <Button className="mt-6 w-full" onClick={() => { setOpen(false); setState("idle"); }}>
                    {t.donate.close}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="ink-soft text-xs font-semibold">{t.donate.title}</p>
                      <h3 className="mt-1 text-xl font-black leading-7">{title}</h3>
                    </div>
                    <button onClick={() => setOpen(false)} className="grid size-9 shrink-0 place-items-center rounded-full border border-current/15 hover:text-brand-500">
                      <X className="size-4" />
                    </button>
                  </div>

                  <label className="mb-2 block text-sm font-semibold">{t.donate.amount}</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {PRESETS.map((p) => (
                      <button
                        key={p}
                        onClick={() => { setAmount(p); setCustom(""); }}
                        className={`rounded-2xl border px-3 py-3 text-sm font-bold transition-all ${
                          !custom && amount === p ? "border-brand-500 bg-brand-500/12 text-brand-500" : "border-current/15 hover:border-brand-500/60"
                        }`}
                      >
                        {formatNumber(p, locale)}
                      </button>
                    ))}
                  </div>
                  <input
                    className={`${field} mt-3`}
                    inputMode="numeric"
                    placeholder={t.donate.custom}
                    value={custom ? formatNumber(Number(custom.replace(/\D/g, "")) || 0, locale) : ""}
                    onChange={(e) => setCustom(e.target.value)}
                  />

                  <div className="mt-3 grid gap-3">
                    <input className={field} placeholder={t.donate.name} value={name} disabled={anonymous}
                      onChange={(e) => setName(e.target.value)} />
                    <textarea className={`${field} min-h-24 resize-none`} placeholder={t.donate.message}
                      value={message} onChange={(e) => setMessage(e.target.value)} />
                    <label className="flex cursor-pointer items-center gap-3 text-sm">
                      <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)}
                        className="size-4 accent-[var(--color-brand-500)]" />
                      {t.donate.anonymous}
                    </label>
                  </div>

                  {error && <p className="mt-3 rounded-2xl bg-brand-500/10 px-4 py-3 text-sm text-brand-600 dark:text-brand-300">{error}</p>}

                  <Button className="mt-5 w-full" size="lg" onClick={submit} disabled={state === "loading"}>
                    {state === "loading" ? <><Loader2 className="size-4 animate-spin" /> {t.donate.processing}</> : (
                      <>{t.donate.submit} · {formatNumber(value, locale)} {t.common.toman}</>
                    )}
                  </Button>
                  <p className="ink-soft mt-3 flex items-center justify-center gap-1.5 text-center text-xs">
                    <ShieldCheck className="size-3.5" /> {t.hero.trust}
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
