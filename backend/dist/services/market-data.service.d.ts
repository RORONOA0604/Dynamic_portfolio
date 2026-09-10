export interface MarketPrice {
    exchangeCode: string;
    symbol: string;
    currentPrice: number;
}
export declare function getYahooSymbol(exchangeCode: string): string | null;
export declare function getMarketPrices(exchangeCodes: string[]): Promise<MarketPrice[]>;
//# sourceMappingURL=market-data.service.d.ts.map