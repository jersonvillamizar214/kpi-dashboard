"use client";

import { useState } from "react";
import { SERIES } from "@/lib/theme";
import { Breakdown, compactCurrency, fullCurrency } from "@/lib/metrics";

const R = 80;
const STROKE = 26;
const C = 2 * Math.PI * R;
const GAP = 4; // surface gap between segments (px of arc)

export default function DonutChart({ data }: { data: Breakdown[] }) {
  const [active, setActive] = useState<number | null>(null);
  const total = data.reduce((a, d) => a + d.value, 0);

  // Running start offset per segment, computed without mutating outer state.
  const fracs = data.map((d) => d.value / total);
  const segments = data.map((d, i) => ({
    ...d,
    i,
    frac: fracs[i],
    start: fracs.slice(0, i).reduce((a, b) => a + b, 0),
  }));

  const center = active !== null ? segments[active] : null;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
      <div className="relative">
        <svg width={200} height={200} viewBox="0 0 200 200" role="img" aria-label="Ingresos por región">
          <g transform="rotate(-90 100 100)">
            {segments.map((s) => {
              const len = Math.max(s.frac * C - GAP, 0);
              return (
                <circle
                  key={s.name}
                  cx={100}
                  cy={100}
                  r={R}
                  fill="none"
                  stroke={SERIES[s.i % SERIES.length]}
                  strokeWidth={active === s.i ? STROKE + 6 : STROKE}
                  strokeDasharray={`${len} ${C - len}`}
                  strokeDashoffset={-s.start * C}
                  onMouseEnter={() => setActive(s.i)}
                  onMouseLeave={() => setActive(null)}
                  style={{ transition: "stroke-width 120ms", cursor: "pointer" }}
                />
              );
            })}
          </g>
          <text x={100} y={94} textAnchor="middle" fontSize={13} fill="#898781">
            {center ? center.name : "Total"}
          </text>
          <text x={100} y={116} textAnchor="middle" fontSize={20} fontWeight={600} fill="#ffffff">
            {center ? compactCurrency(center.value) : compactCurrency(total)}
          </text>
        </svg>
      </div>

      {/* legend — identity channel, never color-alone */}
      <ul className="space-y-2 text-sm">
        {segments.map((s) => (
          <li
            key={s.name}
            className="flex items-center gap-2.5"
            onMouseEnter={() => setActive(s.i)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: SERIES[s.i % SERIES.length] }} />
            <span className="w-16 text-slate-300">{s.name}</span>
            <span className="tabular-nums text-slate-400">{fullCurrency(s.value)}</span>
            <span className="tabular-nums text-slate-500">{(s.frac * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
