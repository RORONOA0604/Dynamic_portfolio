"use client";
import { memo } from "react";
import type { PortfolioHolding } from "../../types/portfolio";

interface PortfolioTableProps {
  holdings: PortfolioHolding[];
}

function formatNumber(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrency(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function PortfolioTable({
  holdings,
}: PortfolioTableProps) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Portfolio Holdings
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {holdings.length} stocks in your portfolio
        </p>
      </div>
 
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[1450px] text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="sticky left-0 z-20 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-600">Stock
              </th>

              <th className="px-4 py-3 text-right font-semibold text-slate-600">
                Purchase Price
              </th>

              <th className="px-4 py-3 text-right font-semibold text-slate-600">
                Qty
              </th>

              <th className="px-4 py-3 text-right font-semibold text-slate-600">
                Investment
              </th>

              <th className="px-4 py-3 text-right font-semibold text-slate-600">
                Portfolio %
              </th>

              <th className="px-4 py-3 text-center font-semibold text-slate-600">
                NSE/BSE
              </th>

              <th className="px-4 py-3 text-right font-semibold text-slate-600">
                CMP
              </th>

              <th className="px-4 py-3 text-right font-semibold text-slate-600">
                Present Value
              </th>

              <th className="px-4 py-3 text-right font-semibold text-slate-600">
                Gain/Loss
              </th>

              <th className="px-4 py-3 text-right font-semibold text-slate-600">
                P/E Ratio
              </th>

              <th className="px-4 py-3 text-right font-semibold text-slate-600">
                Latest Earnings
              </th>
            </tr>
          </thead>

          <tbody>
            {holdings.map((holding) => {
              const isGain =
                (holding.gainLoss ?? 0) >= 0;

              return (
                <tr
                  key={holding.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="sticky left-0 z-10 bg-white px-4 py-4">
                    <div className="font-medium text-slate-900">
                      {holding.name}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {holding.sector}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-right text-slate-700">
                    {formatCurrency(
                      holding.purchasePrice
                    )}
                  </td>

                  <td className="px-4 py-4 text-right text-slate-700">
                    {formatNumber(holding.quantity)}
                  </td>

                  <td className="px-4 py-4 text-right text-slate-700">
                    {formatCurrency(
                      holding.investment
                    )}
                  </td>

                  <td className="px-4 py-4 text-right text-slate-700">
                    {holding.portfolioPercentage.toFixed(2)}%
                  </td>

                  <td className="px-4 py-4 text-center font-medium text-slate-700">
                    {holding.exchange}
                  </td>

                  <td className="px-4 py-4 text-right font-medium text-slate-900">
                    {formatCurrency(
                      holding.currentPrice
                    )}
                  </td>

                  <td className="px-4 py-4 text-right text-slate-700">
                    {formatCurrency(
                      holding.presentValue
                    )}
                  </td>

                  <td
                    className={`px-4 py-4 text-right font-semibold ${
                      isGain
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(holding.gainLoss)}
                  </td>

                  <td className="px-4 py-4 text-right text-slate-700">
                    {formatNumber(holding.peRatio)}
                  </td>

                  <td className="px-4 py-4 text-right text-slate-700">
                    {formatNumber(
                      holding.latestEarnings
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default memo(PortfolioTable);