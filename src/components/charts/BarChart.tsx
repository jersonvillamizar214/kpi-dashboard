import { ACCENT } from "@/lib/theme";
import { Breakdown, compactCurrency } from "@/lib/metrics";

// Category magnitude comparison → ONE hue (not rainbow). Value at each bar tip.
export default function BarChart({ data }: { data: Breakdown[] }) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.name} className="group">
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="text-slate-300">{d.name}</span>
            <span className="tabular-nums text-slate-400">{compactCurrency(d.value)}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full transition-opacity group-hover:opacity-90"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: ACCENT }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
