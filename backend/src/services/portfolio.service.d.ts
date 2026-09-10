export declare function getPortfolioData(): Promise<{
    holdings: {
        exchange: "NSE" | "BSE";
        peRatio: number | null;
        latestEarnings: number | null;
        investment: number;
        portfolioPercentage: number;
        currentPrice: number | null;
        presentValue: number | null;
        gainLoss: number | null;
        gainLossPercentage: number | null;
        id: string;
        name: string;
        sector: string;
        purchasePrice: number;
        quantity: number;
        exchangeCode: string;
    }[];
    summary: {
        totalInvestment: number;
        totalPresentValue: number;
        totalGainLoss: number;
        totalGainLossPercentage: number;
    };
    sectorSummaries: import("./portfolio-calculation.service.js").SectorSummary[];
}>;
//# sourceMappingURL=portfolio.service.d.ts.map