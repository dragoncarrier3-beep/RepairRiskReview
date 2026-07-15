"use client";

import { riskBgClass } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/utils";

export function RepairTable({
  repairs,
}: {
  repairs: Array<{
    rank: number;
    name: string;
    avgCost: number;
    mileageLow?: number | null;
    mileageHigh?: number | null;
    riskLevel: string;
  }>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="pb-3 pr-3 font-semibold">Rank</th>
            <th className="pb-3 pr-3 font-semibold">Repair</th>
            <th className="pb-3 pr-3 font-semibold">Average Cost</th>
            <th className="pb-3 pr-3 font-semibold">Typical Mileage</th>
            <th className="pb-3 font-semibold">Risk Level</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map((r) => (
            <tr key={r.rank} className="border-b border-slate-100 last:border-0">
              <td className="py-3.5 pr-3 font-semibold text-navy-900">{r.rank}</td>
              <td className="py-3.5 pr-3 font-medium text-navy-900">{r.name}</td>
              <td className="py-3.5 pr-3 text-navy-800">{formatCurrency(r.avgCost)}</td>
              <td className="py-3.5 pr-3 text-slate-600">
                {r.mileageLow != null && r.mileageHigh != null
                  ? `${formatNumber(r.mileageLow)}–${formatNumber(r.mileageHigh)}`
                  : "—"}
              </td>
              <td className="py-3.5">
                <span
                  className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${riskBgClass(r.riskLevel)}`}
                >
                  {r.riskLevel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
