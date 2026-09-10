"use client";

import { useEffect, useState } from "react";
import SectorSummaryCard from "./components/SectorSummaryCard";
import PortfolioTable from "./components/PortfolioTable";
import type {
  PortfolioResponse,
  PortfolioSummary,
  SectorSummary,
} from "../types/portfolio";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function Home() {
  const [summary, setSummary] =
    useState<PortfolioSummary | null>(null);
  const [holdings, setHoldings] =
  useState<PortfolioResponse["data"]["holdings"]>([]);
  const [sectorSummaries, setSectorSummaries] =
  useState<SectorSummary[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] =
  useState<Date | null>(null);

  const [expandedSectors, setExpandedSectors] =
  useState<Record<string, boolean>>({});
  async function fetchPortfolio() {
    try {
      setError(null);
      setRefreshing(true);
      const response = await fetch(
        "/api/portfolio"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch portfolio");
      }

      const result: PortfolioResponse =
        await response.json();

      if (!result.success) {
        throw new Error("Portfolio API returned an error");
      }

      setSummary(result.data.summary);
      setHoldings(result.data.holdings);
      setSectorSummaries(result.data.sectorSummaries);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Portfolio fetch error:", error);
      setError("Unable to load portfolio data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
  const loadPortfolio = async () => {
    await fetchPortfolio();
  };

  loadPortfolio();

  const interval = setInterval(() => {
    loadPortfolio();
  }, 15000);

  return () => clearInterval(interval);
}, []);

  const isGain =
    summary !== null && summary.totalGainLoss >= 0;
  const holdingsBySector = sectorSummaries.map(
  (sectorSummary) => ({
    summary: sectorSummary,
    holdings: holdings.filter(
      (holding) =>
        holding.sector === sectorSummary.sector
    ),
  })
);
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-[1600px]">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
  <div>
    <p className="mb-2 text-sm font-medium text-blue-600">
      Portfolio Dashboard
    </p>

    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
      Dynamic Portfolio
    </h1>

    <p className="mt-2 text-slate-600">
      Live portfolio performance and market data
    </p>
  </div>

  <div className="flex flex-wrap items-center gap-3 text-sm">
  <div className="flex items-center gap-2 font-medium text-green-600">
    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
    Live Data
  </div>

  {refreshing && (
    <span className="text-slate-500">
      Updating...
    </span>
  )}

  {lastUpdated && !refreshing && (
    <span className="text-slate-500">
      Last updated:{" "}
      {lastUpdated.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </span>
  )}
</div>
</header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading && !summary ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-slate-600">
              Loading portfolio data...
            </p>
             <p className="mt-3 text-sm leading-6 text-slate-500">
            Please wait while we fetch the latest market data from our
            financial data sources.
          </p>

          <p className="mt-2 text-sm font-medium text-slate-700">
            The first load may take up to 1–2 minutes.
          </p>

          <p className="mt-4 text-xs text-slate-400">
            Please be patient and do not refresh or close this page.
          </p>
          </div>
        ) : summary ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <p className="text-sm font-medium text-slate-500">
                  Total Investment
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    summary.totalInvestment
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <p className="text-sm font-medium text-slate-500">
                  Present Value
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    summary.totalPresentValue
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <p className="text-sm font-medium text-slate-500">
                  Total Gain/Loss
                </p>

                <p
                  className={`mt-2 text-2xl font-bold ${
                    isGain
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(
                    summary.totalGainLoss
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <p className="text-sm font-medium text-slate-500">
                  Gain/Loss %
                </p>

                <p
                  className={`mt-2 text-2xl font-bold ${
                    isGain
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {summary.totalGainLossPercentage.toFixed(
                    2
                  )}
                  %
                </p>
              </div>
            </section>

            <section className="mt-8 w-full rounded-xl bg-white p-6 shadow-sm">
  <div className="mb-6">
    <h2 className="text-lg font-semibold text-slate-900">
      Portfolio by Sector
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Holdings grouped by sector with sector-level performance
    </p>
  </div>

  <div className="space-y-4">
  {holdingsBySector.map(
    ({ summary, holdings: sectorHoldings }, index) => {
      const isExpanded =
        expandedSectors[summary.sector] ??
        index < 2;

      return (
        <div
          key={summary.sector}
          className="overflow-hidden rounded-xl border border-slate-200"
        >
          <button
            type="button"
            onClick={() =>
              setExpandedSectors((current) => ({
                ...current,
                [summary.sector]: !isExpanded,
              }))
            }
            className="flex w-full items-center justify-between gap-4 bg-white px-5 py-4 text-left transition-colors hover:bg-slate-50"
          >
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {summary.sector}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {sectorHoldings.length} stocks
              </p>
            </div>

            <div className="hidden items-center gap-12 sm:flex">
              <div>
                <p className="text-xs text-slate-500">
                  Total Investment
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 2,
                  }).format(summary.totalInvestment)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Present Value
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 2,
                  }).format(summary.totalPresentValue)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Gain/Loss
                </p>

                <p
                  className={`mt-1 font-semibold ${
                    summary.totalGainLoss >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 2,
                  }).format(summary.totalGainLoss)}
                </p>
              </div>
            </div>

            <span
              className={`text-xl text-slate-500 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
             ⌄
            </span>
          </button>

          {isExpanded && (
            <div className="border-t border-slate-200 bg-white p-4">
              <div className="mb-4 sm:hidden">
                <SectorSummaryCard summary={summary} />
              </div>

              <PortfolioTable holdings={sectorHoldings} />
            </div>
          )}
        </div>
      );
    }
  )}
</div>
          </section>
          </>
        ) : null}
      </div>
    </main>
  );
}