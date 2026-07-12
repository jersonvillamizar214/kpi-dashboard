"use client";

import { usePathname, useRouter } from "next/navigation";

const OPTIONS = [
  { value: 6, label: "6 meses" },
  { value: 12, label: "12 meses" },
] as const;

export default function PeriodFilter({ current }: { current: number }) {
  const router = useRouter();
  const pathname = usePathname();

  function select(value: number) {
    router.push(`${pathname}?p=${value}`);
  }

  return (
    <div className="inline-flex rounded-lg border border-white/10 bg-slate-900 p-1">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => select(o.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            current === o.value
              ? "bg-white/10 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
