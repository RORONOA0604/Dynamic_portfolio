import http from "node:http";

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

  res.writeHead(404, {
    "Content-Type": "application/json",
  });

  res.end(
    JSON.stringify({
      status: "error",
      message: "Route not found",
    })
  );
});

server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});