import http from "node:http";
import { getPortfolioData } from "./services/portfolio.service.js";
const PORT = Number(process.env.PORT) || 5000;

const server = http.createServer(async(req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
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
  try {
    const portfolio = await getPortfolioData();

    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        success: true,
        data: portfolio,
      })
    );
  } catch (error) {
    console.error("Portfolio API error:", error);

    res.writeHead(500, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        success: false,
        message: "Unable to fetch portfolio market data",
      })
    );
  }

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