export declare function getPortfolioData(): Promise<{
    holdings: import("./portfolio-calculation.service.js").CalculatedPortfolioHolding[];
    summary: {
        totalInvestment: number;
        totalPresentValue: number;
        totalGainLoss: number;
        totalGainLossPercentage: number;
    };
    sectorSummaries: import("./portfolio-calculation.service.js").SectorSummary[];
}>;
//# sourceMappingURL=portfolio.service.d.ts.map