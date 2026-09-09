import { portfolioHoldings } from "../data/portfolio.js";
import {
  calculatePortfolio,
  calculateSectorSummaries,
  calculateTotalInvestment,
} from "./portfolio-calculation.service.js";

export function getPortfolioHoldings() {
  return calculatePortfolio(portfolioHoldings);
}

export function getPortfolioTotalInvestment() {
  return calculateTotalInvestment(portfolioHoldings);
}

export function getPortfolioSectorSummaries() {
  const holdings = calculatePortfolio(portfolioHoldings);

  return calculateSectorSummaries(holdings);
}