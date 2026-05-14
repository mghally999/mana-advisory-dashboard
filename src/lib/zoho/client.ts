/**
 * Zoho Books / CRM / Inventory client.
 * - OAuth2 refresh-token grant
 * - Access tokens cached in Redis with TTL ~55 min
 * - Per-API base URLs (Books / CRM / Inventory share auth)
 */
import { redis } from "@/lib/cache/redis";

const ZOHO_REGION = process.env.ZOHO_REGION ?? "com"; // com, eu, in, sa, com.au
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID ?? "";
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET ?? "";
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN ?? "";
const ZOHO_ORG_ID = process.env.ZOHO_ORG_ID ?? "";

const ACCOUNTS_URL = `https://accounts.zoho.${ZOHO_REGION}`;
const BOOKS_URL = `https://www.zohoapis.${ZOHO_REGION}/books/v3`;
const CRM_URL = `https://www.zohoapis.${ZOHO_REGION}/crm/v6`;
const INV_URL = `https://www.zohoapis.${ZOHO_REGION}/inventory/v1`;

const CACHE_KEY = "zoho:access_token";

async function getAccessToken(): Promise<string> {
  const cached = await redis.get<string>(CACHE_KEY);
  if (cached) return cached;

  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
    throw new Error("Zoho OAuth credentials not configured");
  }

  const res = await fetch(`${ACCOUNTS_URL}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: ZOHO_REFRESH_TOKEN,
      client_id: ZOHO_CLIENT_ID,
      client_secret: ZOHO_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) throw new Error(`Zoho token refresh failed: ${res.status}`);
  const data = await res.json();
  const token = data.access_token as string;
  const expires_in = (data.expires_in as number) ?? 3600;

  // Cache slightly less than actual TTL
  await redis.set(CACHE_KEY, token, { ex: Math.max(300, expires_in - 120) });
  return token;
}

async function zohoFetch(url: string): Promise<any> {
  const token = await getAccessToken();
  const res = await fetch(url, {
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`Zoho fetch ${url}: ${res.status} ${await res.text()}`);
  return res.json();
}

/**
 * Fetch P&L report from Zoho Books.
 * Returns the 3 KPIs management cares about: revenue, cost, profit.
 */
export async function fetchPnL(fromDate: string, toDate: string) {
  const url = `${BOOKS_URL}/reports/profitandloss?organization_id=${ZOHO_ORG_ID}&from_date=${fromDate}&to_date=${toDate}`;
  return zohoFetch(url);
}

export async function fetchRevenueByVertical(fromDate: string, toDate: string) {
  // Custom branch tagging is recommended in Zoho — fall back to summary if not enabled
  const url = `${BOOKS_URL}/reports/profitandloss?organization_id=${ZOHO_ORG_ID}&from_date=${fromDate}&to_date=${toDate}&group_by=branch`;
  return zohoFetch(url);
}

export async function fetchInventoryValue() {
  const url = `${INV_URL}/reports/inventoryvaluation?organization_id=${ZOHO_ORG_ID}`;
  return zohoFetch(url);
}

export async function fetchDeals() {
  const url = `${CRM_URL}/Deals`;
  return zohoFetch(url);
}
