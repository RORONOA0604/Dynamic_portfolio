import type { PortfolioHolding } from "../types/portfolio.js";

export interface CalculatedPortfolioHolding extends PortfolioHolding {
  investment: number;
  portfolioPercentage: number;
}
export interface SectorSummary {
  sector: string;
  totalInvestment: number;
}

function roundToTwo(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateInvestment(
  purchasePrice: number,
  quantity: number
): number {
  return purchasePrice * quantity;
}

export function calculatePortfolio(
  holdings: PortfolioHolding[]
): CalculatedPortfolioHolding[] {
  const totalInvestment = holdings.reduce(
    (total, holding) =>
      total + calculateInvestment(holding.purchasePrice, holding.quantity),
    0
  );

  return holdings.map((holding) => {
    const investment = calculateInvestment(
      holding.purchasePrice,
      holding.quantity
    );

    const portfolioPercentage =
      totalInvestment === 0
        ? 0
        : (investment / totalInvestment) * 100;

    return {
      ...holding,
      investment,
      portfolioPercentage: roundToTwo(portfolioPercentage),
    };
  });
}

export function calculateTotalInvestment(
  holdings: PortfolioHolding[]
): number {
  return holdings.reduce(
    (total, holding) =>
      total + calculateInvestment(holding.purchasePrice, holding.quantity),
    0
  );
}
export function calculateSectorSummaries(
  holdings: CalculatedPortfolioHolding[]
): SectorSummary[] {
  const sectorMap = new Map<string, number>();

  for (const holding of holdings) {
    const currentInvestment = sectorMap.get(holding.sector) ?? 0;

    sectorMap.set(
      holding.sector,
      currentInvestment + holding.investment
    );
  }

  return Array.from(sectorMap.entries()).map(
    ([sector, totalInvestment]) => ({
      sector,
      totalInvestment,
    })
  );
}