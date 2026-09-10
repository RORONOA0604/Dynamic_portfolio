import YahooFinance from "yahoo-finance2";
import { yahooSymbols } from "../data/yahoo-symbols.js";
import { MemoryCache } from "../utils/cache.js";
const yahooFinance = new YahooFinance({
    suppressNotices: ["yahooSurvey"],
});
const yahooPriceCache = new MemoryCache(15 * 1000);
export function getYahooSymbol(exchangeCode) {
    return yahooSymbols[exchangeCode] ?? null;
}
export async function getMarketPrices(exchangeCodes) {
    const cacheKey = exchangeCodes.join(",");
    const cachedPrices = yahooPriceCache.get(cacheKey);
    if (cachedPrices) {
        return cachedPrices;
    }
    const requests = exchangeCodes
        .map((exchangeCode) => {
        const symbol = getYahooSymbol(exchangeCode);
        if (!symbol) {
            return null;
        }
        return {
            exchangeCode,
            symbol,
        };
    })
        .filter((request) => request !== null);
    if (requests.length === 0) {
        return [];
    }
    const quotes = await yahooFinance.quote(requests.map((request) => request.symbol));
    const quoteMap = new Map(quotes.map((quote) => [
        quote.symbol,
        quote.regularMarketPrice,
    ]));
    const prices = requests
        .map((request) => {
        const currentPrice = quoteMap.get(request.symbol);
        if (currentPrice === undefined) {
            return null;
        }
        return {
            exchangeCode: request.exchangeCode,
            symbol: request.symbol,
            currentPrice,
        };
    })
        .filter((price) => price !== null);
    yahooPriceCache.set(cacheKey, prices);
    return prices;
}
//# sourceMappingURL=market-data.service.js.map