import type { PortfolioHolding } from "../types/portfolio.js";
export interface CalculatedPortfolioHolding extends PortfolioHolding {
    investment: number;
    portfolioPercentage: number;
    currentPrice: number | null;
    presentValue: number | null;
    gainLoss: number | null;
    gainLossPercentage: number | null;
    peRatio: number | null;
    latestEarnings: number | null;
    exchange: "NSE" | "BSE";
}
export interface SectorSummary {
    sector: string;
    totalInvestment: number;
    totalPresentValue: number;
    totalGainLoss: number;
}
export declare function calculateInvestment(purchasePrice: number, quantity: number): number;
export declare function calculatePortfolio(holdings: PortfolioHolding[]): CalculatedPortfolioHolding[];
export declare function calculatePresentValue(currentPrice: number, quantity: number): number;
export declare function calculateGainLoss(presentValue: number, investment: number): number;
export declare function calculateGainLossPercentage(gainLoss: number, investment: number): number;
export declare function calculatePortfolioWithMarketPrices(holdings: PortfolioHolding[], marketPrices: Map<string, number>): CalculatedPortfolioHolding[];
export declare function calculateTotalInvestment(holdings: PortfolioHolding[]): number;
export declare function calculateSectorSummaries(holdings: CalculatedPortfolioHolding[]): SectorSummary[];
//# sourceMappingURL=portfolio-calculation.service.d.ts.map