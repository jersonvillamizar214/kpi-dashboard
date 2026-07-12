import { getOrders, MONTH_LABELS, Order, TOTAL_MONTHS } from "./data";

export type Period = 6 | 12;

export interface Kpi {
  label: string;
  value: number;
  format: "currency" | "number";
  deltaPct: number; // vs previous equal-length period
  spark: number[]; // per-month values across the current window
}

export interface Breakdown {
  name: string;
  value: number;
}

export interface MonthlyPoint {
  label: string;
  revenue: number;
}

export interface DashboardData {
  period: Period;
  kpis: Kpi[];
  monthly: MonthlyPoint[];
  byCategory: Breakdown[];
  byRegion: Breakdown[];
  topProducts: { product: string; category: string; revenue: number; orders: number }[];
}

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
const pctChange = (curr: number, prev: number) =>
  prev === 0 ? 0 : ((curr - prev) / prev) * 100;

// Aggregate a set of orders into { key -> summed metric }, sorted desc.
function groupSum(orders: Order[], key: keyof Order, order: string[]): Breakdown[] {
  const totals = new Map<string, number>(order.map((k) => [k, 0]));
  for (const o of orders) {
    totals.set(o[key] as string, (totals.get(o[key] as string) ?? 0) + o.amount);
  }
  return [...totals.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function monthlyValues(orders: Order[], months: number[], reducer: (o: Order[]) => number) {
  return months.map((m) => reducer(orders.filter((o) => o.month === m)));
}

export function getDashboardData(period: Period): DashboardData {
  const orders = getOrders();
  const currMonths = Array.from({ length: period }, (_, i) => TOTAL_MONTHS - period + i);
  const prevMonths = Array.from({ length: period }, (_, i) => TOTAL_MONTHS - 2 * period + i);

  const curr = orders.filter((o) => currMonths.includes(o.month));
  const prev = orders.filter((o) => prevMonths.includes(o.month));

  const revenue = sum(curr.map((o) => o.amount));
  const prevRevenue = sum(prev.map((o) => o.amount));
  const orderCount = curr.length;
  const prevOrders = prev.length;
  const customers = new Set(curr.map((o) => o.customerId)).size;
  const prevCustomers = new Set(prev.map((o) => o.customerId)).size;
  const aov = orderCount ? revenue / orderCount : 0;
  const prevAov = prevOrders ? prevRevenue / prevOrders : 0;

  const kpis: Kpi[] = [
    {
      label: "Ingresos",
      value: revenue,
      format: "currency",
      deltaPct: pctChange(revenue, prevRevenue),
      spark: monthlyValues(orders, currMonths, (o) => sum(o.map((x) => x.amount))),
    },
    {
      label: "Pedidos",
      value: orderCount,
      format: "number",
      deltaPct: pctChange(orderCount, prevOrders),
      spark: monthlyValues(orders, currMonths, (o) => o.length),
    },
    {
      label: "Clientes",
      value: customers,
      format: "number",
      deltaPct: pctChange(customers, prevCustomers),
      spark: monthlyValues(orders, currMonths, (o) => new Set(o.map((x) => x.customerId)).size),
    },
    {
      label: "Ticket promedio",
      value: aov,
      format: "currency",
      deltaPct: pctChange(aov, prevAov),
      spark: monthlyValues(orders, currMonths, (o) =>
        o.length ? sum(o.map((x) => x.amount)) / o.length : 0
      ),
    },
  ];

  const monthly: MonthlyPoint[] = currMonths.map((m) => ({
    label: MONTH_LABELS[m],
    revenue: sum(orders.filter((o) => o.month === m).map((o) => o.amount)),
  }));

  const byCategory = groupSum(curr, "category", []);
  const byRegion = groupSum(curr, "region", []);

  // Top products by revenue (like GROUP BY product ORDER BY SUM(amount) DESC LIMIT 5).
  const prodMap = new Map<string, { product: string; category: string; revenue: number; orders: number }>();
  for (const o of curr) {
    const entry = prodMap.get(o.product) ?? {
      product: o.product,
      category: o.category,
      revenue: 0,
      orders: 0,
    };
    entry.revenue += o.amount;
    entry.orders += 1;
    prodMap.set(o.product, entry);
  }
  const topProducts = [...prodMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return { period, kpis, monthly, byCategory, byRegion, topProducts };
}

// ── formatters ────────────────────────────────────────────────────────────────
export function compactCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n)}`;
}

export function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${Math.round(n)}`;
}

export function fullCurrency(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function formatKpi(kpi: Kpi): string {
  return kpi.format === "currency" ? compactCurrency(kpi.value) : compactNumber(kpi.value);
}
