import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Campaign } from "./api";

export const cn = (...i: ClassValue[]) => twMerge(clsx(i));

export const isFa = (l: string) => l === "fa";

const faDigits = (s: string) => s.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

export function formatNumber(n: number, locale: string) {
  const s = new Intl.NumberFormat("en-US").format(Math.round(n));
  return isFa(locale) ? faDigits(s).replace(/,/g, "\u066C") : s;
}

export function formatAmount(n: number, locale: string) {
  if (isFa(locale)) {
    if (n >= 1_000_000_000) return `${faDigits((n / 1_000_000_000).toFixed(1))} میلیارد`;
    if (n >= 1_000_000) return `${faDigits(Math.round(n / 1_000_000).toString())} میلیون`;
    return formatNumber(n, locale);
  }
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return formatNumber(n, locale);
}

export const pct = (c: { raised_amount: number; goal_amount: number }) =>
  c.goal_amount <= 0 ? 0 : Math.min(100, Math.round((c.raised_amount / c.goal_amount) * 100));

export function daysLeft(deadline: string | null) {
  if (!deadline) return null;
  const d = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  return d > 0 ? d : 0;
}

export function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(isFa(locale) ? "fa-IR" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  }).format(new Date(iso));
}

export const cTitle = (c: Pick<Campaign, "title" | "title_en">, l: string) => (isFa(l) ? c.title : c.title_en || c.title);
export const cSummary = (c: Pick<Campaign, "summary" | "summary_en">, l: string) => (isFa(l) ? c.summary : c.summary_en || c.summary);
export const cCity = (c: Pick<Campaign, "city" | "city_en">, l: string) => (isFa(l) ? c.city : c.city_en || c.city);
export const cName = (c: Pick<Campaign, "beneficiary_name" | "beneficiary_name_en">, l: string) =>
  isFa(l) ? c.beneficiary_name : c.beneficiary_name_en || c.beneficiary_name;
