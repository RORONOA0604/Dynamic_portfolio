import { chromium, type Browser } from "playwright";
//import serverlessChromium from "@sparticuz/chromium";
import { googleFinanceSymbols } from "../data/google-finance-symbols.js";
import { MemoryCache } from "../utils/cache.js";
export interface GoogleFinanceData {
  peRatio: number | null;
  latestEarnings: number | null;
}

let browser: Browser | null = null;
const googleFinanceCache = new MemoryCache<GoogleFinanceData>(
  15 * 60 * 1000
);
async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
    });
  }

  return browser;
}

function parseNumber(value: string): number | null {
  const cleaned = value
    .replace(/[₹,$€£]/g, "")
    .replace(/,/g, "")
    .trim();

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : null;
}

export async function getGoogleFinanceData(
  symbol: string
): Promise<GoogleFinanceData> {
      const cachedData = googleFinanceCache.get(symbol);

  if (cachedData) {
    return cachedData;
  }
  const activeBrowser = await getBrowser();
  const page = await activeBrowser.newPage();

  try {
    const url =
      `https://www.google.com/finance/beta/quote/${symbol}:NSE?hl=en`;

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    await page.waitForTimeout(2000);

    const bodyText = await page.locator("body").innerText();

    const normalizedText = bodyText
      .replace(/\s+/g, " ")
      .trim();

    const metricsMatch = normalizedText.match(
      /P\/E ratio\s+([\d,.]+)\s+52-wk high[\s\S]*?EPS\s+₹?([\d,.]+)/
    );

    if (!metricsMatch || !metricsMatch[1] || !metricsMatch[2]) {
  const data = {
    peRatio: null,
    latestEarnings: null,
  };

  googleFinanceCache.set(symbol, data);

  return data;
}

   const data = {
  peRatio: parseNumber(metricsMatch[1]),
  latestEarnings: parseNumber(metricsMatch[2]),
};

googleFinanceCache.set(symbol, data);

return data;
  } finally {
    await page.close();
  }
}

export function getGoogleFinanceSymbol(
  exchangeCode: string
): string | null {
  return googleFinanceSymbols[exchangeCode] ?? null;
}

export async function closeGoogleFinanceBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
export async function getGoogleFinanceDataForSymbols(
  symbols: string[],
  concurrency = 4
): Promise<Map<string, GoogleFinanceData>> {
  const results = new Map<string, GoogleFinanceData>();

  for (let i = 0; i < symbols.length; i += concurrency) {
    const batch = symbols.slice(i, i + concurrency);

    const batchResults = await Promise.all(
      batch.map(async (symbol) => {
        const data = await getGoogleFinanceData(symbol);

        return {
          symbol,
          data,
        };
      })
    );

    for (const result of batchResults) {
      results.set(result.symbol, result.data);
    }
  }

  return results;
}