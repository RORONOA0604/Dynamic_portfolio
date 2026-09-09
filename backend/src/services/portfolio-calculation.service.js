function roundToTwo(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
export function calculateInvestment(purchasePrice, quantity) {
    return purchasePrice * quantity;
}
export function calculatePortfolio(holdings) {
    const totalInvestment = calculateTotalInvestment(holdings);
    return holdings.map((holding) => {
        const investment = calculateInvestment(holding.purchasePrice, holding.quantity);
        const portfolioPercentage = totalInvestment === 0
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
export function calculatePresentValue(currentPrice, quantity) {
    return roundToTwo(currentPrice * quantity);
}
export function calculateGainLoss(presentValue, investment) {
    return roundToTwo(presentValue - investment);
}
export function calculateGainLossPercentage(gainLoss, investment) {
    if (investment === 0) {
        return 0;
    }
    return roundToTwo((gainLoss / investment) * 100);
}
export function calculatePortfolioWithMarketPrices(holdings, marketPrices) {
    const calculatedHoldings = calculatePortfolio(holdings);
    return calculatedHoldings.map((holding) => {
        const currentPrice = marketPrices.get(holding.exchangeCode);
        if (currentPrice === undefined) {
            return holding;
        }
        const presentValue = calculatePresentValue(currentPrice, holding.quantity);
        const gainLoss = calculateGainLoss(presentValue, holding.investment);
        const gainLossPercentage = calculateGainLossPercentage(gainLoss, holding.investment);
        return {
            ...holding,
            currentPrice,
            presentValue,
            gainLoss,
            gainLossPercentage,
        };
    });
}
export function calculateTotalInvestment(holdings) {
    return holdings.reduce((total, holding) => total + calculateInvestment(holding.purchasePrice, holding.quantity), 0);
}
export function calculateSectorSummaries(holdings) {
    const sectorMap = new Map();
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
    return Array.from(sectorMap.entries()).map(([sector, values]) => ({
        sector,
        totalInvestment: roundToTwo(values.totalInvestment),
        totalPresentValue: roundToTwo(values.totalPresentValue),
        totalGainLoss: roundToTwo(values.totalGainLoss),
    }));
}
//# sourceMappingURL=portfolio-calculation.service.js.map