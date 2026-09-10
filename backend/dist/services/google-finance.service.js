import { chromium } from "playwright";
import serverlessChromium from "@sparticuz/chromium";
import { googleFinanceSymbols } from "../data/google-finance-symbols.js";
import { MemoryCache } from "../utils/cache.js";
let browser = null;
const googleFinanceCache = new MemoryCache(15 * 60 * 1000);
async function getBrowser() {
    if (!browser) {
        const isProduction = process.env.VERCEL === "1";
        if (isProduction) {
            browser = await chromium.launch({
                headless: true,
                args: serverlessChromium.args,
                executablePath: await serverlessChromium.executablePath(),
            });
        }
        else {
            browser = await chromium.launch({
                headless: true,
            });
        }
    }
    return browser;
}
function parseNumber(value) {
    const cleaned = value
        .replace(/[₹,$€£]/g, "")
        .replace(/,/g, "")
        .trim();
    const number = Number(cleaned);
    return Number.isFinite(number) ? number : null;
}
export async function getGoogleFinanceData(symbol) {
    const cachedData = googleFinanceCache.get(symbol);
    if (cachedData) {
        return cachedData;
    }
    const activeBrowser = await getBrowser();
    const page = await activeBrowser.newPage();
    try {
        const url = `https://www.google.com/finance/beta/quote/${symbol}:NSE?hl=en`;
        await page.goto(url, {
            waitUntil: "networkidle",
            timeout: 60000,
        });
        await page.waitForTimeout(2000);
        const bodyText = await page.locator("body").innerText();
        const normalizedText = bodyText
            .replace(/\s+/g, " ")
            .trim();
        const metricsMatch = normalizedText.match(/P\/E ratio\s+([\d,.]+)\s+52-wk high[\s\S]*?EPS\s+₹?([\d,.]+)/);
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
    }
    finally {
        await page.close();
    }
}
export function getGoogleFinanceSymbol(exchangeCode) {
    return googleFinanceSymbols[exchangeCode] ?? null;
}
export async function closeGoogleFinanceBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
    }
}
export async function getGoogleFinanceDataForSymbols(symbols, concurrency = 4) {
    const results = new Map();
    for (let i = 0; i < symbols.length; i += concurrency) {
        const batch = symbols.slice(i, i + concurrency);
        const batchResults = await Promise.all(batch.map(async (symbol) => {
            const data = await getGoogleFinanceData(symbol);
            return {
                symbol,
                data,
            };
        }));
        for (const result of batchResults) {
            results.set(result.symbol, result.data);
        }
    }
    return results;
}
//# sourceMappingURL=google-finance.service.js.map