import YahooFinance from "yahoo-finance2";
import { yahooSymbols } from "../data/yahoo-symbols.js";

const yahooFinance = new YahooFinance();

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

  return requests
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
}