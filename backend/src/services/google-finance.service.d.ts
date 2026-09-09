export interface GoogleFinanceData {
    peRatio: number | null;
    latestEarnings: number | null;
}
export declare function getGoogleFinanceData(symbol: string): Promise<GoogleFinanceData>;
export declare function getGoogleFinanceSymbol(exchangeCode: string): string | null;
export declare function closeGoogleFinanceBrowser(): Promise<void>;
export declare function getGoogleFinanceDataForSymbols(symbols: string[], concurrency?: number): Promise<Map<string, GoogleFinanceData>>;
//# sourceMappingURL=google-finance.service.d.ts.map