/**
 * eBay Browse API client.
 *
 * Setup:
 * 1. Go to https://developer.ebay.com → Sign in → Create Application
 * 2. Copy your Production App ID (Client ID) and Cert ID (Client Secret)
 * 3. Add to .env.local:
 *      EBAY_CLIENT_ID=your_client_id
 *      EBAY_CLIENT_SECRET=your_client_secret
 *      EBAY_ENV=production          # or "sandbox"
 */

const ENDPOINTS = {
  sandbox: {
    auth: "https://api.sandbox.ebay.com/identity/v1/oauth2/token",
    browse: "https://api.sandbox.ebay.com/buy/browse/v1",
  },
  production: {
    auth: "https://api.ebay.com/identity/v1/oauth2/token",
    browse: "https://api.ebay.com/buy/browse/v1",
  },
};

let cachedToken: { token: string; expires: number } | null = null;

function getEnv() {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  const env = (process.env.EBAY_ENV ?? "production") as "sandbox" | "production";
  if (!clientId || !clientSecret) {
    throw new Error("Missing EBAY_CLIENT_ID or EBAY_CLIENT_SECRET env vars");
  }
  return { clientId, clientSecret, env };
}

/** Get an OAuth application access token (client credentials grant). */
export async function getEbayToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token;
  }

  const { clientId, clientSecret, env } = getEnv();
  const url = ENDPOINTS[env].auth;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`eBay auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000, // refresh 1 min early
  };

  return cachedToken.token;
}

export interface EbayItem {
  itemId: string;
  title: string;
  price: { value: string; currency: string };
  image?: { imageUrl: string };
  thumbnailImages?: { imageUrl: string }[];
  condition?: string;
  itemWebUrl: string;
  seller?: { username: string };
  itemEndDate?: string;
}

export interface EbaySearchResult {
  total: number;
  items: EbayItem[];
}

/**
 * Search eBay Browse API for sports cards.
 * Returns active and recently sold listings.
 */
export async function searchEbay(
  query: string,
  options?: {
    limit?: number;
    sort?: string;
    filter?: string;
  },
): Promise<EbaySearchResult> {
  const { env } = getEnv();
  const token = await getEbayToken();
  const baseUrl = ENDPOINTS[env].browse;

  const params = new URLSearchParams({
    q: query,
    limit: String(options?.limit ?? 20),
    category_ids: "212", // Sports Trading Cards category
  });

  if (options?.sort) params.set("sort", options.sort);
  if (options?.filter) params.set("filter", options.filter);

  const res = await fetch(`${baseUrl}/item_summary/search?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      "X-EBAY-C-ENDUSERCTX": "affiliateCampaignId=<eBayCampaignId>,affiliateReferenceId=<referenceId>",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`eBay search failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return {
    total: data.total ?? 0,
    items: (data.itemSummaries ?? []).map((item: Record<string, unknown>) => ({
      itemId: item.itemId,
      title: item.title,
      price: item.price,
      image: item.image,
      thumbnailImages: item.thumbnailImages,
      condition: item.condition,
      itemWebUrl: item.itemWebUrl,
      seller: item.seller,
      itemEndDate: item.itemEndDate,
    })),
  };
}

/**
 * Search for a specific card and return the best image URL.
 * Tries to find a high-quality image from active listings.
 */
export async function findCardImage(
  playerName: string,
  cardSet: string,
  grade: string,
): Promise<string | null> {
  try {
    const query = `${playerName} ${cardSet} ${grade} sports card`;
    const result = await searchEbay(query, {
      limit: 5,
      sort: "price",
    });

    for (const item of result.items) {
      const url = item.image?.imageUrl ?? item.thumbnailImages?.[0]?.imageUrl;
      if (url) {
        // eBay images: replace size suffix for higher res
        return url.replace(/s-l\d+/, "s-l500");
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Search for recently sold listings of a card to get market prices.
 */
export async function fetchSoldPrices(
  playerName: string,
  cardSet: string,
  grade: string,
  limit = 10,
): Promise<{ price: number; date: string; source: string; title: string }[]> {
  try {
    const query = `${playerName} ${cardSet} ${grade}`;
    const result = await searchEbay(query, {
      limit,
      filter: "buyingOptions:{FIXED_PRICE|AUCTION},conditions:{3000}", // 3000 = Used (graded cards)
      sort: "-price", // highest first
    });

    return result.items.map((item) => ({
      price: parseFloat(item.price.value),
      date: item.itemEndDate ?? new Date().toISOString(),
      source: "eBay",
      title: item.title as string,
    }));
  } catch {
    return [];
  }
}
