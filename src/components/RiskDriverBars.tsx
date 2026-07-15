"use client";

export function RiskDriverBars({
  drivers,
}: {
  drivers: Array<{ name: string; percent: number; color: string }>;
}) {
  return (
    <div className="space-y-3">
      {drivers.map((d) => (
        <div key={d.name}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-navy-900">{d.name}</span>
            <span className="font-semibold text-navy-700">{d.percent}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${d.percent}%`, backgroundColor: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
