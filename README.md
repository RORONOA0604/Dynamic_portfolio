# Dynamic Portfolio Dashboard

A full-stack portfolio dashboard built with Next.js, TypeScript, Tailwind CSS, Node.js, and a native `node:http` backend server. The dashboard displays 26 portfolio holdings grouped by sector and enriches them with market data fetched from Yahoo Finance and Google Finance.

## Features

- Portfolio holdings grouped into six sectors
- Purchase price and quantity tracking
- Automatic investment and portfolio-weight calculations
- Current market price retrieval through Yahoo Finance
- Present value, gain/loss, and gain/loss percentage calculations
- P/E ratio and latest earnings/EPS data from Google Finance
- NSE/BSE exchange identification
- Sector-level investment and performance summaries
- Automatic frontend refresh every 15 seconds
- In-memory caching for external market-data requests
- Controlled Google Finance concurrency, limited to four requests per batch
- Loading, refreshing, and API error states
- Green/red gain and loss indicators
- Responsive dashboard layout
- Horizontally scrollable holdings table on smaller screens
- Sticky stock column while the table is horizontally scrolled
- Collapsible sector sections
- Backend-only access to external market-data services

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

### Backend

- Node.js
- TypeScript
- Native `node:http` server with Express-style route handling
- `yahoo-finance2` for current market prices
- Playwright and Cheerio for Google Finance access/parsing dependencies

### Development

- Yarn
- Git / GitHub
- VS Code

## Project Structure

```text
Portfolio_Pulse/
├── backend/
│   ├── src/
│   │   ├── data/
│   │   │   ├── google-finance-symbols.ts
│   │   │   ├── portfolio.ts
│   │   │   └── yahoo-symbols.ts
│   │   ├── services/
│   │   │   ├── google-finance.service.ts
│   │   │   ├── market-data.service.ts
│   │   │   ├── portfolio-calculation.service.ts
│   │   │   └── portfolio.service.ts
│   │   ├── types/portfolio.ts
│   │   └── server.ts
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   ├── PortfolioTable.tsx
│   │   │   └── SectorSummaryCard.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── types/portfolio.ts
│   └── package.json
└── README.md
```

## How It Works

```text
Static portfolio holdings
					│
					▼
Node.js backend
		 ┌────┴────┐
		 ▼         ▼
Yahoo       Google Finance
Finance     via Playwright
price       P/E and EPS
		 └────┬────┘
					▼
Portfolio calculations and sector summaries
					│
					▼
REST API
					│
					▼
Next.js dashboard
```

The backend calculates all derived financial values. The frontend formats and displays the returned values but does not independently recalculate them.

## Requirements

- Node.js with a version compatible with the installed Next.js and TypeScript dependencies
- Yarn
- Chromium installed for Playwright

After installing backend dependencies, install the Playwright browser if it is not already available:

```bash
cd backend
yarn install
yarn playwright install chromium
```

## Running the Project

The frontend and backend are separate applications and must be run independently.

### Start the Backend

```bash
cd backend
yarn install
yarn dev
```

The backend listens on `http://localhost:5000`.

### Start the Frontend

In a second terminal:

```bash
cd frontend
yarn install
yarn dev
```

The frontend listens on `http://localhost:3000`. Open that address to view the dashboard.

The frontend currently calls the backend at `http://localhost:5000`, and the backend permits browser requests from `http://localhost:3000` through CORS headers.

## Available Scripts

### Backend

| Command | Description |
| --- | --- |
| `yarn dev` | Run the TypeScript server with watch mode |
| `yarn build` | Compile TypeScript and emit declarations/source maps |
| `yarn start` | Run the compiled `dist/server.js` |

### Frontend

| Command | Description |
| --- | --- |
| `yarn dev` | Start the Next.js development server |
| `yarn build` | Create a production build |
| `yarn start` | Start the production Next.js server |
| `yarn lint` | Run ESLint |

## API

### `GET /api/health`

Returns a simple backend health response:

```json
{
	"status": "ok",
	"message": "Portfolio backend is running"
}
```

### `GET /api/portfolio`

Returns the complete portfolio response. The portfolio is under the `data` property:

```json
{
	"success": true,
	"data": {
		"holdings": [
			{
				"id": "1",
				"name": "HDFC Bank",
				"sector": "Financials",
				"purchasePrice": 1490,
				"quantity": 50,
				"exchangeCode": "HDFCBANK",
				"investment": 74500,
				"portfolioPercentage": 4.83,
				"currentPrice": 687,
				"presentValue": 34350,
				"gainLoss": -40150,
				"gainLossPercentage": -53.89,
				"peRatio": 13.48,
				"latestEarnings": 51.21,
				"exchange": "NSE"
			}
		],
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

The numerical market values in this example are illustrative. Current values are retrieved when the endpoint is called. When market data is unavailable, the backend returns `null` for the affected values and the frontend displays an em dash.

Unknown routes return HTTP 404. Portfolio-fetch failures return HTTP 500 with `success: false` and an error message.

## Portfolio Calculations

```text
Investment              = Purchase Price × Quantity
Portfolio %             = (Individual Investment / Total Investment) × 100
Present Value           = Current Market Price × Quantity
Gain/Loss               = Present Value - Investment
Gain/Loss %             = (Gain/Loss / Investment) × 100
```

The backend rounds calculated percentages and market-derived values to two decimal places. If the total investment is zero, the portfolio and gain/loss percentages are returned as zero.

## Market Data

### Yahoo Finance

Yahoo Finance supplies current market prices through `yahoo-finance2`. Yahoo symbols are maintained separately in `backend/src/data/yahoo-symbols.ts`.

Examples:

```text
HDFCBANK → HDFCBANK.NS
TATAPOWER → TATAPOWER.NS
SAVANI → 511577.BO
```

The exchange is inferred from the Yahoo symbol suffix: `.BO` is BSE and other mapped symbols are treated as NSE.

### Google Finance

Google Finance is used for P/E ratio and latest earnings/EPS information. Because the page is rendered dynamically, the backend uses a headless Playwright Chromium browser. Google Finance symbol mappings are maintained in `backend/src/data/google-finance-symbols.ts`.

Google Finance data is parsed from the rendered page. Google Finance can change its page structure or fail to provide a metric, so unavailable values are represented as `null` rather than inferred.

## Caching and Concurrency

External requests use in-memory caches:

- Yahoo market prices: 15-second TTL
- Google Finance metrics: 15-minute TTL

Cache contents are lost when the backend restarts. Google Finance requests are processed in batches of four to allow controlled parallel I/O without opening all browser pages at once.

## Automatic Refresh

On initial load, the frontend requests `/api/portfolio`. It then polls the endpoint every 15 seconds and displays:

- Live Data status
- Updating status while a request is in progress
- The last successful update time

The previous data remains visible while a refresh is in progress. An error message is shown when the API cannot be reached or returns an unsuccessful response.

## Sector Summaries and Responsive UI

The current static portfolio contains 26 holdings grouped under Financials, Technology, Consumer, Power, Pipe, and Others. Each sector shows its stock count, total investment, present value, and gain/loss. Sector sections can be expanded or collapsed; the first two are expanded by default.

The holdings table has a wide minimum layout and horizontal scrolling for smaller screens. The first stock column remains sticky while scrolling across the remaining columns.

## Security and Data Accuracy

- External market-data requests are performed only by the backend.
- The frontend does not expose Yahoo Finance or Google Finance implementation details to the browser.
- Purchase prices, quantities, sectors, and symbol mappings are static source data.
- Market prices, present values, gain/loss values, P/E ratios, and earnings can change or be unavailable.
- Yahoo Finance and Google Finance are unofficial external interfaces for this project and may change without notice.

## Limitations and Future Improvements

Current limitations include unofficial external data interfaces, scraping fragility, dependence on external availability, in-memory cache loss on restart, and polling instead of WebSockets. Possible production improvements include:

- Redis or another persistent distributed cache
- Retries with exponential backoff
- More robust market-data providers
- Database-backed portfolios and user authentication
- Historical performance charts
- Automated monitoring and centralized logging
- Dockerized deployment
- WebSocket-based updates

## Validation

Useful local checks include:

```bash
cd backend
yarn build
```

```bash
cd frontend
yarn lint
yarn build
```

When external services are available, also verify `/api/health`, `/api/portfolio`, the 26 active holdings, the total static investment of `₹15,43,060`, market-data fallbacks, cache behavior, controlled Google Finance concurrency, 15-second refresh behavior, and responsive table scrolling.

## License

This project was created as a technical assignment and demonstration project.
