"use client";

import { useState } from "react";
import { ACCENT, GRID, INK } from "@/lib/theme";
import { fullCurrency, compactCurrency } from "@/lib/metrics";
import { useContainerWidth } from "./useContainerWidth";

interface Point {
  label: string;
  revenue: number;
}

const H = 260;
const PAD = { top: 16, right: 16, bottom: 28, left: 48 };

export default function AreaChart({ data }: { data: Point[] }) {
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const plotW = Math.max(width - PAD.left - PAD.right, 0);
  const plotH = H - PAD.top - PAD.bottom;

  const max = Math.max(...data.map((d) => d.revenue));
  const yMax = niceCeil(max);
  const step = data.length > 1 ? plotW / (data.length - 1) : 0;

  const x = (i: number) => PAD.left + i * step;
  const y = (v: number) => PAD.top + plotH - (v / yMax) * plotH;

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(d.revenue)}`).join(" ");
  const area = `${line} L${x(data.length - 1)} ${PAD.top + plotH} L${x(0)} ${PAD.top + plotH} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * yMax);
  const labelEvery = Math.ceil(data.length / 8);

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!step) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = Math.round((px - PAD.left) / step);
    setActive(Math.max(0, Math.min(data.length - 1, i)));
  }

  return (
    <div ref={ref} className="relative w-full">
      {width > 0 && (
        <svg
          width={width}
          height={H}
          onMouseMove={handleMove}
          onMouseLeave={() => setActive(null)}
          role="img"
          aria-label="Tendencia de ingresos por mes"
        >
          {/* gridlines + y labels */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} stroke={GRID} strokeWidth={1} />
              <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end" fontSize={11} fill={INK.muted} style={{ fontVariantNumeric: "tabular-nums" }}>
                {compactCurrency(v)}
              </text>
            </g>
          ))}

          {/* area + line */}
          <path d={area} fill={ACCENT} fillOpacity={0.1} />
          <path d={line} fill="none" stroke={ACCENT} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {/* x labels (sparse) */}
          {data.map((d, i) =>
            i % labelEvery === 0 ? (
              <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize={11} fill={INK.muted}>
                {d.label.split(" ")[0]}
              </text>
            ) : null
          )}

          {/* hover crosshair + marker */}
          {active !== null && (
            <>
              <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + plotH} stroke={INK.muted} strokeWidth={1} strokeDasharray="3 3" />
              <circle cx={x(active)} cy={y(data[active].revenue)} r={5} fill={ACCENT} stroke="#0f172a" strokeWidth={2} />
            </>
          )}
        </svg>
      )}

      {/* tooltip */}
      {active !== null && width > 0 && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs shadow-xl"
          style={{ left: Math.min(Math.max(x(active), 70), width - 70), top: 4 }}
        >
          <div className="font-medium text-white">{data[active].label}</div>
          <div className="mt-0.5 text-slate-300" style={{ fontVariantNumeric: "tabular-nums" }}>
            {fullCurrency(data[active].revenue)}
          </div>
        </div>
      )}
    </div>
  );
}

// Round a max up to a clean axis ceiling (1/2/2.5/5 × 10^n).
function niceCeil(v: number): number {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  return nice * mag;
}
