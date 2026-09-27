export const API_BROWSER =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const API_SERVER =
  process.env.INTERNAL_API_URL ?? API_BROWSER;

const base = () => (typeof window === "undefined" ? API_SERVER : API_BROWSER);

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function safeApi<T>(path: string, fallback: T): Promise<T> {
  try {
    return await api<T>(path);
  } catch {
    return fallback;
  }
}

export type Category = { id: number; slug: string; name: string; name_en: string; icon: string; color: string };
export type Organization = { id: number; slug: string; name: string; name_en: string; description: string; description_en: string; city: string; logo: string | null; verified: boolean };
export type CampaignUpdate = { id: number; title: string; title_en: string; body: string; body_en: string; spent_amount: number | null; receipt_url: string | null; created_at: string };
export type Donation = { id: number; amount: number; message: string | null; donor_name: string; anonymous: boolean; created_at: string; campaign_id: number };
export type Campaign = {
  id: number; slug: string; title: string; title_en: string; summary: string; summary_en: string;
  cover: string; beneficiary_name: string; beneficiary_name_en: string; beneficiary_age: number | null;
  city: string; city_en: string; goal_amount: number; raised_amount: number; donors_count: number;
  urgent: boolean; featured: boolean; verified: boolean; status: string; deadline: string | null;
  created_at: string; category: Category | null; organization: Organization | null;
};
export type CampaignDetail = Campaign & { story: string; story_en: string; updates: CampaignUpdate[]; recent_donations: Donation[] };
export type Stats = { total_raised: number; campaigns_count: number; donors_count: number; organizations_count: number; beneficiaries_helped: number };
