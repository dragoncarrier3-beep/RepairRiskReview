"use client";

const milestones = [
  { mile: 90000, label: "90k", items: "Water Pump / Alternator", tone: "high" },
  { mile: 110000, label: "110k", items: "Turbo / A/C", tone: "mod" },
  { mile: 130000, label: "130k", items: "Wheel Bearings / Starter", tone: "low" },
  { mile: 150000, label: "150k+", items: "Transmission", tone: "high" },
];

export function RepairTimeline({ currentMileage }: { currentMileage: number }) {
  const min = 75000;
  const max = 160000;
  const pct = Math.min(100, Math.max(0, ((currentMileage - min) / (max - min)) * 100));

  const toneClass = (t: string) => {
    if (t === "high") return "bg-red-500 ring-red-200";
    if (t === "mod") return "bg-orange-500 ring-orange-200";
    return "bg-amber-400 ring-amber-200";
  };

  return (
    <div className="pt-2">
      <div className="relative mb-10 mt-8">
        <div className="absolute left-0 right-0 top-3 h-1.5 rounded-full bg-slate-200" />
        <div
          className="absolute left-0 top-3 h-1.5 rounded-full bg-brand-blue"
          style={{ width: `${pct}%` }}
        />
        <div className="relative flex justify-between">
          <div className="flex flex-col items-start">
            <div className="h-3.5 w-3.5 rounded-full bg-navy-700 ring-4 ring-slate-100" />
            <span className="mt-2 text-xs font-medium text-slate-500">75k</span>
          </div>
          {milestones.map((m) => {
            const left = ((m.mile - min) / (max - min)) * 100;
            return (
              <div
                key={m.label}
                className="absolute flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${left}%` }}
              >
                <div className={`h-3.5 w-3.5 rounded-full ring-4 ${toneClass(m.tone)}`} />
                <span className="mt-2 text-xs font-semibold text-navy-900">{m.label}</span>
                <span className="mt-1 max-w-[110px] text-center text-[10px] leading-tight text-slate-500">
                  {m.items}
                </span>
              </div>
            );
          })}
        </div>
        <div
          className="absolute -top-7 -translate-x-1/2 rounded bg-navy-900 px-2 py-1 text-[10px] font-semibold text-white"
          style={{ left: `${pct}%` }}
        >
          You · {Math.round(currentMileage / 1000)}k
        </div>
      </div>
    </div>
  );
}
