import StatCard from "@/components/StatCard";
import PeriodFilter from "@/components/PeriodFilter";
import AreaChart from "@/components/charts/AreaChart";
import BarChart from "@/components/charts/BarChart";
import DonutChart from "@/components/charts/DonutChart";
import { getDashboardData, formatKpi, fullCurrency, Period } from "@/lib/metrics";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;
  const period: Period = p === "6" ? 6 : 12;
  const data = getDashboardData(period);
  const periodLabel = period === 6 ? "semestre" : "año";

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-400">Northwind Retail</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Dashboard de indicadores
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Resumen de desempeño de los últimos {period} meses.
          </p>
        </div>
        <PeriodFilter current={period} />
      </div>

      {/* KPI cards */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.kpis.map((kpi) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={formatKpi(kpi)}
            deltaPct={kpi.deltaPct}
            spark={kpi.spark}
            periodLabel={periodLabel}
          />
        ))}
      </section>

      {/* Revenue trend */}
      <Card title="Tendencia de ingresos" subtitle="Ingresos mensuales del periodo">
        <AreaChart data={data.monthly} />
      </Card>

      {/* Category + Region */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Ingresos por categoría" subtitle="Comparativa de magnitud">
          <BarChart data={data.byCategory} />
        </Card>
        <Card title="Ingresos por región" subtitle="Distribución del total">
          <DonutChart data={data.byRegion} />
        </Card>
      </div>

      {/* Top products */}
      <Card title="Productos destacados" subtitle="Top 5 por ingresos">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr className="border-b border-white/10">
                <th className="py-2 pr-4">Producto</th>
                <th className="py-2 pr-4">Categoría</th>
                <th className="py-2 pr-4 text-right">Pedidos</th>
                <th className="py-2 text-right">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((prod) => (
                <tr key={prod.product} className="border-b border-white/5">
                  <td className="py-2.5 pr-4 font-medium text-white">{prod.product}</td>
                  <td className="py-2.5 pr-4 text-slate-400">{prod.category}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-slate-400">
                    {prod.orders.toLocaleString("es-CO")}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-slate-200">
                    {fullCurrency(prod.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <footer className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-slate-500">
        Datos sintéticos con fines de demostración · Next.js · SVG charts —{" "}
        <a
          href="https://github.com/jersonvillamizar214"
          className="text-slate-400 hover:text-white"
        >
          @jersonvillamizar214
        </a>
      </footer>
    </main>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
