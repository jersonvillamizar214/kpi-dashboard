import { ACCENT, GOOD, BAD } from "@/lib/theme";

interface Props {
  label: string;
  value: string;
  deltaPct: number;
  spark: number[];
  periodLabel: string;
}

// Stat tile: label · value · delta (vs previous period) · 12-point sparkline.
export default function StatCard({ label, value, deltaPct, spark, periodLabel }: Props) {
  const up = deltaPct >= 0;
  const deltaColor = up ? GOOD : BAD;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
        <Sparkline data={spark} />
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-sm">
        <span style={{ color: deltaColor }} className="font-medium">
          {up ? "▲" : "▼"} {Math.abs(deltaPct).toFixed(1)}%
        </span>
        <span className="text-slate-500">vs. {periodLabel} anterior</span>
      </p>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const w = 108;
  const h = 34;
  const pad = 3;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);

  const points = data.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });

  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="shrink-0">
      <path d={path} fill="none" stroke={ACCENT} strokeOpacity={0.45} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {/* current period marker with a surface ring */}
      <circle cx={lastX} cy={lastY} r={4} fill={ACCENT} stroke="#0f172a" strokeWidth={2} />
    </svg>
  );
}
