"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

export default function ShareButton({ label, title }: { label: string; title: string }) {
  const [done, setDone] = useState(false);
  const onClick = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title, url }); return; } catch { /* cancelled */ }
    }
    await navigator.clipboard.writeText(url);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };
  return (
    <button onClick={onClick} className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-current/20 px-6 text-sm font-semibold transition-colors hover:border-brand-500 hover:text-brand-500">
      {done ? <Check className="size-4" /> : <Share2 className="size-4" />} {label}
    </button>
  );
}
