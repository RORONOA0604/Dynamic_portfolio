import { portfolioHoldings } from "../data/portfolio.js";
import { calculatePortfolioWithMarketPrices, calculateSectorSummaries, calculateTotalInvestment, } from "./portfolio-calculation.service.js";
import { getMarketPrices } from "./market-data.service.js";
export async function getPortfolioData() {
    const exchangeCodes = portfolioHoldings.map((holding) => holding.exchangeCode);
    const marketPrices = await getMarketPrices(exchangeCodes);
    const marketPriceMap = new Map(marketPrices.map((price) => [
        price.exchangeCode,
        price.currentPrice,
    ]));
    const holdings = calculatePortfolioWithMarketPrices(portfolioHoldings, marketPriceMap);
    const sectorSummaries = calculateSectorSummaries(holdings);
    const totalInvestment = calculateTotalInvestment(portfolioHoldings);
    const totalPresentValue = holdings.reduce((total, holding) => total + (holding.presentValue ?? 0), 0);
    const totalGainLoss = totalPresentValue - totalInvestment;
    const totalGainLossPercentage = totalInvestment === 0
        ? 0
        : (totalGainLoss / totalInvestment) * 100;
    return {
        holdings,
        summary: {
            totalInvestment,
            totalPresentValue,
            totalGainLoss: Math.round((totalGainLoss + Number.EPSILON) * 100) / 100,
            totalGainLossPercentage: Math.round((totalGainLossPercentage + Number.EPSILON) * 100) / 100,
        },
        sectorSummaries,
    };
}
//# sourceMappingURL=portfolio.service.js.map