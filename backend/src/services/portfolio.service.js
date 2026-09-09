import { portfolioHoldings } from "../data/portfolio.js";
import { calculatePortfolioWithMarketPrices, calculateSectorSummaries, calculateTotalInvestment, } from "./portfolio-calculation.service.js";
import { getMarketPrices } from "./market-data.service.js";
import { getGoogleFinanceDataForSymbols, getGoogleFinanceSymbol, } from "./google-finance.service.js";
export async function getPortfolioData() {
    const exchangeCodes = portfolioHoldings.map((holding) => holding.exchangeCode);
    const marketPrices = await getMarketPrices(exchangeCodes);
    const googleSymbols = portfolioHoldings
        .map((holding) => getGoogleFinanceSymbol(holding.exchangeCode))
        .filter((symbol) => symbol !== null);
    const googleFinanceData = await getGoogleFinanceDataForSymbols(googleSymbols, 4);
    const marketPriceMap = new Map(marketPrices.map((price) => [
        price.exchangeCode,
        price.currentPrice,
    ]));
    const holdings = calculatePortfolioWithMarketPrices(portfolioHoldings, marketPriceMap);
    const holdingsWithGoogleData = holdings.map((holding) => {
        const googleSymbol = getGoogleFinanceSymbol(holding.exchangeCode);
        const googleData = googleSymbol
            ? googleFinanceData.get(googleSymbol)
            : undefined;
        return {
            ...holding,
            peRatio: googleData?.peRatio ?? null,
            latestEarnings: googleData?.latestEarnings ?? null,
        };
    });
    const sectorSummaries = calculateSectorSummaries(holdingsWithGoogleData);
    const totalInvestment = calculateTotalInvestment(portfolioHoldings);
    const totalPresentValue = holdingsWithGoogleData.reduce((total, holding) => total + (holding.presentValue ?? 0), 0);
    const totalGainLoss = totalPresentValue - totalInvestment;
    const totalGainLossPercentage = totalInvestment === 0
        ? 0
        : (totalGainLoss / totalInvestment) * 100;
    return {
        holdings: holdingsWithGoogleData,
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