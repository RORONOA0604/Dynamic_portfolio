import type { PortfolioHolding } from "../types/portfolio.js";
export interface CalculatedPortfolioHolding extends PortfolioHolding {
    investment: number;
    portfolioPercentage: number;
}
export interface SectorSummary {
    sector: string;
    totalInvestment: number;
}
export declare function calculateInvestment(purchasePrice: number, quantity: number): number;
export declare function calculatePortfolio(holdings: PortfolioHolding[]): CalculatedPortfolioHolding[];
export declare function calculateTotalInvestment(holdings: PortfolioHolding[]): number;
export declare function calculateSectorSummaries(holdings: CalculatedPortfolioHolding[]): SectorSummary[];
//# sourceMappingURL=portfolio-calculation.service.d.ts.map