import YahooFinance from "yahoo-finance2";
import { yahooSymbols } from "../data/yahoo-symbols.js";
import { MemoryCache } from "../utils/cache.js";
const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});
const yahooPriceCache = new MemoryCache<MarketPrice[]>(
  15 * 1000
);
export interface MarketPrice {
  exchangeCode: string;
  symbol: string;
  currentPrice: number;
}

export function getYahooSymbol(exchangeCode: string): string | null {
  return yahooSymbols[exchangeCode] ?? null;
}

export async function getMarketPrices(
  exchangeCodes: string[]
): Promise<MarketPrice[]> {
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
    .filter(
      (
        request
      ): request is {
        exchangeCode: string;
        symbol: string;
      } => request !== null
    );

  if (requests.length === 0) {
    return [];
  }

  const quotes = await yahooFinance.quote(
    requests.map((request) => request.symbol)
  );

  const quoteMap = new Map(
    quotes.map((quote) => [
      quote.symbol,
      quote.regularMarketPrice,
    ])
  );

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
  .filter(
    (price): price is MarketPrice => price !== null
  );

yahooPriceCache.set(cacheKey, prices);

return prices;
}