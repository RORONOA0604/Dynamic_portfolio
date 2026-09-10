import type { SectorSummary } from "../../types/portfolio";

interface SectorSummaryCardProps {
  summary: SectorSummary;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function SectorSummaryCard({
  summary,
}: SectorSummaryCardProps) {
  const isGain = summary.totalGainLoss >= 0;

  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Investment
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {formatCurrency(summary.totalInvestment)}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Present Value
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {formatCurrency(summary.totalPresentValue)}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Gain/Loss
          </p>

          <p
            className={`mt-1 font-semibold ${
              isGain ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(summary.totalGainLoss)}
          </p>
        </div>
      </div>
    </div>
  );
}