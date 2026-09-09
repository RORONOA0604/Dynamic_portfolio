import type { PortfolioHolding } from "../types/portfolio.js";

export interface CalculatedPortfolioHolding extends PortfolioHolding {
  investment: number;
  portfolioPercentage: number;
  currentPrice: number | null;
  presentValue: number | null;
  gainLoss: number | null;
  gainLossPercentage: number | null;
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
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
  const totalInvestment = calculateTotalInvestment(holdings);

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
      currentPrice: null,
      presentValue: null,
      gainLoss: null,
      gainLossPercentage: null,
    };
  });
}

export function calculatePresentValue(
  currentPrice: number,
  quantity: number
): number {
  return roundToTwo(currentPrice * quantity);
}

export function calculateGainLoss(
  presentValue: number,
  investment: number
): number {
  return roundToTwo(presentValue - investment);
}

export function calculateGainLossPercentage(
  gainLoss: number,
  investment: number
): number {
  if (investment === 0) {
    return 0;
  }

  return roundToTwo((gainLoss / investment) * 100);
}

export function calculatePortfolioWithMarketPrices(
  holdings: PortfolioHolding[],
  marketPrices: Map<string, number>
): CalculatedPortfolioHolding[] {
  const calculatedHoldings = calculatePortfolio(holdings);

  return calculatedHoldings.map((holding) => {
    const currentPrice = marketPrices.get(holding.exchangeCode);

    if (currentPrice === undefined) {
      return holding;
    }

    const presentValue = calculatePresentValue(
      currentPrice,
      holding.quantity
    );

    const gainLoss = calculateGainLoss(
      presentValue,
      holding.investment
    );

    const gainLossPercentage = calculateGainLossPercentage(
      gainLoss,
      holding.investment
    );

    return {
      ...holding,
      currentPrice,
      presentValue,
      gainLoss,
      gainLossPercentage,
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
  const sectorMap = new Map<
    string,
    {
      totalInvestment: number;
      totalPresentValue: number;
      totalGainLoss: number;
    }
  >();

  for (const holding of holdings) {
    const current = sectorMap.get(holding.sector) ?? {
      totalInvestment: 0,
      totalPresentValue: 0,
      totalGainLoss: 0,
    };

    current.totalInvestment += holding.investment;
    current.totalPresentValue += holding.presentValue ?? 0;
    current.totalGainLoss += holding.gainLoss ?? 0;

    sectorMap.set(holding.sector, current);
  }

  return Array.from(sectorMap.entries()).map(
    ([sector, values]) => ({
      sector,
      totalInvestment: roundToTwo(values.totalInvestment),
      totalPresentValue: roundToTwo(values.totalPresentValue),
      totalGainLoss: roundToTwo(values.totalGainLoss),
    })
  );
}