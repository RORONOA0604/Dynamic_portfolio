function roundToTwo(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
export function calculateInvestment(purchasePrice, quantity) {
    return purchasePrice * quantity;
}
export function calculatePortfolio(holdings) {
    const totalInvestment = holdings.reduce((total, holding) => total + calculateInvestment(holding.purchasePrice, holding.quantity), 0);
    return holdings.map((holding) => {
        const investment = calculateInvestment(holding.purchasePrice, holding.quantity);
        const portfolioPercentage = totalInvestment === 0
            ? 0
            : (investment / totalInvestment) * 100;
        return {
            ...holding,
            investment,
            portfolioPercentage: roundToTwo(portfolioPercentage),
        };
    });
}
export function calculateTotalInvestment(holdings) {
    return holdings.reduce((total, holding) => total + calculateInvestment(holding.purchasePrice, holding.quantity), 0);
}
export function calculateSectorSummaries(holdings) {
    const sectorMap = new Map();
    for (const holding of holdings) {
        const currentInvestment = sectorMap.get(holding.sector) ?? 0;
        sectorMap.set(holding.sector, currentInvestment + holding.investment);
    }
    return Array.from(sectorMap.entries()).map(([sector, totalInvestment]) => ({
        sector,
        totalInvestment,
    }));
}
//# sourceMappingURL=portfolio-calculation.service.js.map