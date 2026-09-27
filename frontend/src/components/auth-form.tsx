"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HandHeart, Loader2 } from "lucide-react";
import type { Dict } from "@/i18n/fa";
import { useAuth } from "./providers";
import { Button } from "./ui";

const field = "w-full rounded-2xl border border-current/15 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:opacity-50 focus:border-brand-500";

export default function AuthForm({ locale, t }: { locale: string; t: Dict }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ email: "", password: "", full_name: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();
  const router = useRouter();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form);
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass w-full max-w-md rounded-5xl p-8 shadow-2xl">
      <span className="grid size-12 place-items-center rounded-2xl bg-linear-to-br from-brand-500 to-[var(--color-violet-brand)] text-white">
        <HandHeart className="size-6" />
      </span>
      <h1 className="mt-5 text-2xl font-black">{mode === "login" ? t.auth.loginTitle : t.auth.signupTitle}</h1>

      <form onSubmit={submit} className="mt-6 grid gap-3">
        {mode === "signup" && (
          <>
            <input className={field} placeholder={t.auth.name} value={form.full_name} onChange={set("full_name")} required />
            <input className={field} placeholder={t.auth.city} value={form.city} onChange={set("city")} />
          </>
        )}
        <input className={field} type="email" placeholder={t.auth.email} value={form.email} onChange={set("email")} required dir="ltr" />
        <input className={field} type="password" placeholder={t.auth.password} value={form.password} onChange={set("password")} required minLength={8} dir="ltr" />
        {error && <p className="rounded-2xl bg-brand-500/10 px-4 py-3 text-sm text-brand-600 dark:text-brand-300">{error}</p>}
        <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : mode === "login" ? t.auth.submitLogin : t.auth.submitSignup}
        </Button>
      </form>

      <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-5 w-full text-sm font-semibold text-brand-500 hover:underline">
        {mode === "login" ? t.auth.toSignup : t.auth.toLogin}
      </button>
      <p className="ink-soft mt-4 rounded-2xl border border-dashed border-current/20 px-4 py-3 text-center text-xs" dir="ltr">
        {t.auth.demo}
      </p>
    </div>
  );
}
