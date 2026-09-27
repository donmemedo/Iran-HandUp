"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

type BtnProps = {
  variant?: "primary" | "ghost" | "outline" | "soft";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const styles = {
  base: "relative inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
  variant: {
    primary:
      "text-white bg-linear-to-r from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/45 hover:-translate-y-0.5 active:translate-y-0",
    outline: "border border-current/25 hover:border-brand-500 hover:text-brand-500",
    ghost: "hover:bg-brand-500/10 hover:text-brand-500",
    soft: "bg-brand-500/12 text-brand-600 dark:text-brand-300 hover:bg-brand-500/20",
  },
  size: { sm: "h-9 px-4 text-sm", md: "h-11 px-6 text-sm", lg: "h-14 px-8 text-base" },
};

export function Button({ variant = "primary", size = "md", className, children, ...rest }: BtnProps) {
  return (
    <button className={cn(styles.base, styles.variant[variant], styles.size[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  href, variant = "primary", size = "md", className, children,
}: {
  href: string;
  variant?: "primary" | "ghost" | "outline" | "soft";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(styles.base, styles.variant[variant], styles.size[size], className)}>
      {children}
    </Link>
  );
}

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", className)}>
      {children}
    </span>
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [forced, setForced] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setForced(true), 900);
    return () => clearTimeout(id);
  }, []);
  return (
    <div ref={ref} className={cn("h-2 w-full overflow-hidden rounded-full bg-current/10", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: inView || forced ? `${value}%` : 0 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="h-full rounded-full bg-linear-to-r from-brand-500 via-brand-400 to-[var(--color-violet-brand)]"
      />
    </div>
  );
}

export function Reveal({
  children, delay = 0, y = 24, className,
}: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  // Safety net: never leave content hidden if IntersectionObserver never fires.
  const [forced, setForced] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setForced(true), 900);
    return () => clearTimeout(id);
  }, []);
  const show = inView || forced;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Counter({ to, format }: { to: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  const [forced, setForced] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setForced(true), 900);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!inView && !forced) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1400);
      setN(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, forced, to]);
  return <span ref={ref}>{format(n)}</span>;
}

export function SectionHead({
  eyebrow, title, sub, center = true,
}: { eyebrow?: string; title: string; sub?: string; center?: boolean }) {
  return (
    <Reveal className={cn("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && (
        <span className="mb-3 inline-block rounded-full bg-brand-500/12 px-3 py-1 text-xs font-bold tracking-wide text-brand-600 dark:text-brand-300">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">{title}</h2>
      {sub && <p className="ink-soft mt-4 text-base sm:text-lg">{sub}</p>}
    </Reveal>
  );
}
