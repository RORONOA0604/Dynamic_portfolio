# Technical Document: Dynamic Portfolio Dashboard

## 1. Project Overview

The Dynamic Portfolio Dashboard is a full-stack web application built with Next.js, React, TypeScript, Tailwind CSS, and Node.js. It combines static portfolio holdings with market data retrieved from Yahoo Finance and Google Finance.

The dashboard displays:

- Current Market Price (CMP) from Yahoo Finance
- P/E ratio from Google Finance
- Earnings-related data from Google Finance
- Investment and portfolio-weight calculations
- Present value and gain/loss calculations
- Sector-level investment and performance summaries

The frontend handles presentation and periodic refresh. The backend owns external data access, data transformation, financial calculations, caching, and the API response.

## 2. Architecture

The application uses a two-application architecture. The Next.js frontend communicates only with the Node.js backend over HTTP. The backend coordinates static portfolio data, external market-data services, calculations, and response formatting.

```text
+--------------------------+
| Next.js Frontend         |
| React dashboard          |
| Summary, sectors, table  |
| 15-second polling        |
+------------+-------------+
             | HTTP GET /api/portfolio
             v
+--------------------------+
| Node.js Backend          |
| Native node:http server  |
| CORS, routes, errors     |
+------------+-------------+
             v
+--------------------------+
| Portfolio Service        |
| Orchestrates the flow   |
+--------+---------+-------+
         |         |
         v         v
+----------------+  +---------------------+
| Market Data    |  | Google Finance      |
| Yahoo Finance  |  | Playwright + cache  |
| CMP + cache    |  | P/E + EPS + cache   |
+--------+-------+  +----------+----------+
         +---------------------+
                       v
             +----------------------+
             | Calculation Service  |
             | Investment, weights, |
             | value, gain/loss,    |
             | sector summaries     |
             +----------+-----------+
                        v
             +----------------------+
             | JSON API {success,   |
             | data}                |
             +----------------------+
```

The backend currently requests Yahoo Finance data first and then fetches Google Finance data in controlled batches. This is intentional: each provider has its own service and cache, while Google Finance browser requests are limited to four at a time.

## 3. Data Sources

### Yahoo Finance

Yahoo Finance is used to retrieve Current Market Price (CMP). Yahoo Finance does not provide a public official API for this use case, so the project uses the `yahoo-finance2` Node.js library as an unofficial interface.

Yahoo symbol mappings are maintained separately in:

```text
backend/src/data/yahoo-symbols.ts
```

This keeps symbol mappings separate from the portfolio data model and supports exchange-specific symbols such as `.NS` and `.BO`.

### Google Finance

Google Finance is used to retrieve P/E ratio and earnings-related information. Google Finance also does not provide a public official API for this use case.

The required information is rendered dynamically, so the backend uses a headless Playwright Chromium browser to access the rendered page. Google Finance mappings are maintained in:

```text
backend/src/data/google-finance-symbols.ts
```

External page structures can change, so the parser may require maintenance if Google changes its markup.

## 4. Portfolio Data Model

Static holdings are stored in `backend/src/data/portfolio.ts`. Each holding contains:

- ID
- Stock name
- Sector
- Purchase price
- Quantity
- Exchange code

The backend enriches each holding with:

- Investment
- Portfolio percentage
- Current price
- Present value
- Gain/Loss
- Gain/Loss percentage
- P/E ratio
- Latest earnings
- NSE/BSE exchange

The current portfolio contains 26 holdings grouped into Financials, Technology, Consumer, Power, Pipe, and Others.

## 5. Financial Calculations

All portfolio calculations are performed on the backend.

```text
Investment              = Purchase Price x Quantity
Portfolio %             = (Investment / Total Investment) x 100
Present Value           = Current Market Price x Quantity
Gain/Loss               = Present Value - Investment
Gain/Loss %             = (Gain/Loss / Investment) x 100
```

Calculated percentages and market-derived values are rounded to two decimal places. If a market price is unavailable, the related present value and gain/loss fields remain `null`.

## 6. Asynchronous Data Fetching

The backend uses `async`/`await` and Promises for external I/O. The portfolio service:

1. Reads the static holdings.
2. Requests Yahoo Finance prices.
3. Resolves Google Finance symbols.
4. Fetches Google Finance data in batches of four.
5. Combines provider data with the holdings.
6. Calculates holding values and sector summaries.
7. Returns the structured API response.

```text
26 Google Finance symbols
          |
          v
Four browser requests at a time
          |
          v
Collected P/E and EPS results
          |
          v
Portfolio transformation
```

This provides controlled parallelism while reducing excessive browser activity and rate-limit risk.

## 7. Caching and Rate-Limit Management

The backend uses separate in-memory caches:

- Yahoo market-price cache: 15-second TTL
- Google Finance cache: 15-minute TTL

The frontend refreshes every 15 seconds, but caching prevents every refresh from becoming a new external request. This reduces external traffic, response latency, browser automation, and rate-limit risk.

The cache is intentionally simple for this assignment and is lost when the backend restarts. A production deployment could use Redis or another distributed cache.

## 8. Google Finance Data Interpretation

The assignment requires a `Latest Earnings` field. In this implementation, the available EPS value is extracted from the rendered Google Finance page and mapped to `latestEarnings`.

```text
Google Finance EPS -> latestEarnings
```

This field should be understood as EPS, not as a separate total-company earnings figure. If the expected value is unavailable, the backend returns `null` rather than inferring or fabricating it.

## 9. API and Error Handling

### `GET /api/health`

```json
{
  "status": "ok",
  "message": "Portfolio backend is running"
}
```

### `GET /api/portfolio`

The response is wrapped in `success` and `data` properties:

```json
{
  "success": true,
  "data": {
    "holdings": [],
    "summary": {
      "totalInvestment": 1543060,
      "totalPresentValue": 0,
      "totalGainLoss": 0,
      "totalGainLossPercentage": 0
    },
    "sectorSummaries": []
  }
}
```

If the portfolio pipeline fails, the backend returns HTTP 500 with `success: false`. Unknown routes return HTTP 404. The frontend catches unsuccessful responses and displays a clear error state.

Unavailable individual metrics are represented by `null` and rendered by the frontend as `—`.

## 10. Real-Time Updates

The dashboard uses polling rather than WebSockets. The frontend performs an initial request and then fetches updated data every 15 seconds using `setInterval`. The interval is cleared when the page component is unmounted.

The interface displays Live Data status, Updating status during a request, and the last successful update time.

## 11. Performance Optimization

- Provider-specific caching reduces repeated external requests.
- Google Finance requests are limited to four simultaneous browser operations.
- Financial calculations and sector aggregation happen on the backend.
- `PortfolioTable` and `SectorSummaryCard` are wrapped with `React.memo`, allowing React to skip rendering them when their props have not changed.

## 12. Security

External market-data access is performed only by the backend:

```text
Browser -> Application Backend -> Yahoo Finance
                              -> Google Finance
```

The browser communicates with the application's API and does not directly access external financial services. No external API keys are exposed in frontend code. The backend allows the local frontend origin, `http://localhost:3000`, through CORS headers.

## 13. Data Transformation

The backend combines static holdings, Yahoo Finance CMP, Google Finance P/E and EPS, and financial calculations into one typed JSON response. This keeps provider-specific parsing and financial logic out of the frontend.

## 14. Sector Grouping

Holdings are grouped by sector on the backend. For each sector, the application calculates total investment, total present value, and total gain/loss. The frontend displays these values in collapsible sections, with the first two sectors expanded by default.

## 15. Responsive Design

The dashboard supports desktop, tablet, and mobile layouts. Summary cards and sector summaries adapt to smaller screens. The portfolio table has a wide minimum width, horizontal scrolling on smaller screens, and a sticky first stock column.

The table uses a native HTML table rather than `react-table`; the assignment lists `react-table` as recommended, not required. Charting with `recharts` was optional and is not included.

## 16. Main Technical Challenges and Solutions

| Challenge | Solution |
| --- | --- |
| No official Yahoo Finance API | Used `yahoo-finance2` and isolated Yahoo symbol mappings. |
| No official Google Finance API | Used Playwright to access rendered Google Finance pages. |
| Google Finance dynamic rendering | Parsed rendered page text for P/E and EPS values. |
| External rate limits | Added separate caches and limited Google Finance concurrency to four requests. |
| Different provider formats | Transformed provider responses into one typed portfolio schema. |
| Repeated frontend refreshes | Combined 15-second polling with provider-specific cache TTLs. |
| Unavailable financial values | Returned `null` and displayed `—` instead of guessing. |
| Unnecessary React renders | Wrapped `PortfolioTable` and `SectorSummaryCard` with `React.memo`. |
| Wide financial table | Added horizontal scrolling and a sticky stock column. |
| API failures | Added backend error responses and frontend loading/error states. |

## 17. Limitations

- Yahoo Finance and Google Finance are accessed through unofficial interfaces.
- External page structures may change and require parser updates.
- Market-data availability depends on external services.
- Google Finance `latestEarnings` represents EPS in this implementation.
- In-memory cache data is lost when the backend restarts.
- The application uses polling instead of WebSockets.
- Retry and exponential backoff are not currently implemented.
- A provider failure can cause the complete portfolio request to fail rather than returning partial results.
- The portfolio is static and does not yet support user accounts or database persistence.

## 18. Possible Production Improvements

1. Use a licensed financial market-data provider.
2. Replace in-memory caching with Redis.
3. Add retry and exponential backoff policies.
4. Return partial results when one provider is unavailable.
5. Add persistent database storage for portfolios.
6. Add authentication and user-specific portfolios.
7. Use WebSockets for more efficient real-time updates.
8. Add monitoring, centralized logging, and alerting.
9. Add historical portfolio performance charts.
10. Add automated tests for calculations, parsers, API services, and components.
11. Add production deployment and containerization.

## 19. Validation Performed

Run the following checks from the indicated project directories:

```bash
cd backend
yarn build
```

```bash
cd frontend
yarn lint
yarn build
```

Functional validation should also cover `/api/health`, `/api/portfolio`, the 26 active holdings, the static total investment of `₹15,43,060`, Yahoo Finance market-price retrieval, Google Finance P/E and EPS retrieval, cache behavior, controlled concurrency, calculation accuracy, sector summaries, 15-second refresh behavior, loading/error states, and responsive layouts.

## 20. Conclusion

The project implements the required Dynamic Portfolio Dashboard with a clear separation between presentation, backend orchestration, external data access, and financial calculations. The solution addresses the case-study challenges through unofficial data integrations, backend transformation, asynchronous operations, controlled concurrency, caching, periodic updates, error handling, React memoization, and responsive UI design.
