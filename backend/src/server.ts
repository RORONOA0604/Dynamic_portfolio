import http from "node:http";
import {
  getPortfolioHoldings,
  getPortfolioSectorSummaries,
  getPortfolioTotalInvestment,
} from "./services/portfolio.service.js";
const PORT = 5000;

const server = http.createServer((req, res) => {
  if (req.url === "/api/health" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        status: "ok",
        message: "Portfolio backend is running",
      })
    );

    return;
  }

  if (req.url === "/api/portfolio" && req.method === "GET") {
  const holdings = getPortfolioHoldings();
  const totalInvestment = getPortfolioTotalInvestment();
  const sectorSummaries = getPortfolioSectorSummaries();

  res.writeHead(200, {
    "Content-Type": "application/json",
  });

  res.end(
    JSON.stringify({
      success: true,
      data: {
        holdings,
        totalInvestment,
        sectorSummaries,
      },
    })
  );

  return;
}

  res.writeHead(404, {
    "Content-Type": "application/json",
  });

  res.end(
    JSON.stringify({
      success: false,
      message: "Route not found",
    })
  );
});

server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});