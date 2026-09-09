import { getMarketPrices } from "./services/market-data.service.js";
const symbols = [
    "HDFCBANK",
    "BAJFINANCE",
    "532174",
    "544252",
    "511577",
    "AFFLE",
    "LTIM",
    "542651",
    "544028",
    "544107",
    "532790",
    "DMART",
    "532540",
    "500331",
    "500400",
    "542323",
    "532667",
    "542851",
    "543517",
    "ASTRAL",
    "542652",
    "543318",
    "506401",
    "541557",
    "533282",
    "540719",
];
try {
    const prices = await getMarketPrices(symbols);
    console.table(prices);
}
catch (error) {
    console.error("Yahoo Finance test failed:", error);
}
//# sourceMappingURL=test-yahoo.js.map