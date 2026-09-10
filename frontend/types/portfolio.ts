export interface PortfolioHolding {
  id: string;
  name: string;
  sector: string;
  purchasePrice: number;
  quantity: number;
  exchangeCode: string;
  exchange: "NSE" | "BSE";
  investment: number;
  portfolioPercentage: number;
  currentPrice: number | null;
  presentValue: number | null;
  gainLoss: number | null;
  gainLossPercentage: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
}

export interface PortfolioSummary {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
}

export interface PortfolioData {
  holdings: PortfolioHolding[];
  summary: PortfolioSummary;
  sectorSummaries: SectorSummary[];
}

export interface PortfolioResponse {
  success: boolean;
  data: PortfolioData;
}