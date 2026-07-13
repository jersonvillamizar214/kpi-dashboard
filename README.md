# KPI Dashboard — Business Analytics

[![CI](https://github.com/jersonvillamizar214/kpi-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/jersonvillamizar214/kpi-dashboard/actions/workflows/ci.yml)

An interactive business-intelligence dashboard built with **Next.js** and **hand-crafted SVG charts** (no charting library). It visualizes revenue, orders, customers and average order value for a fictional retailer, with breakdowns by category and region.

> Part of my developer portfolio. Focus: data visualization, dashboard UX, and clean data-aggregation logic.

## Highlights

- **4 KPI tiles** with value, delta vs. the previous period, and a 12-point sparkline.
- **Revenue trend** — interactive area chart with hover crosshair + tooltip.
- **Category comparison** — single-hue magnitude bars.
- **Region distribution** — donut chart with legend and hover.
- **Top products** table.
- **Period filter** (6 / 12 months) that recomputes every metric server-side via the URL.

## Design & accessibility

The chart palette was **validated for colorblind-safety** (protanopia/deuteranopia ΔE 41.3, all series ≥ 3:1 contrast on the dark surface). Categorical hues are assigned in a fixed order and never cycled; magnitude comparisons use a single hue; identity is carried by legends and labels, never color alone.

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Framework  | Next.js 16 (App Router)             |
| Language   | TypeScript                          |
| Styling    | Tailwind CSS v4                     |
| Charts     | Custom SVG (area, bar, donut, spark)|
| Deploy     | Vercel                              |

## How it works

- `src/lib/data.ts` — generates a deterministic order book (seeded PRNG) for 24 months: the stable stand-in for a real database.
- `src/lib/metrics.ts` — aggregates orders into KPIs, monthly series, and category/region/product breakdowns (the equivalent of SQL `GROUP BY` / `SUM`).
- `src/components/charts/*` — presentational SVG charts; interactivity (hover, tooltips) via small client components.
- `src/app/page.tsx` — a Server Component that reads the period from the URL, computes the data, and renders the dashboard.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

Try the period filter, hover the revenue chart, and hover the donut segments.

## Deploy

Push to GitHub and import the repo into [Vercel](https://vercel.com) — no environment variables or database required. Every push to `main` redeploys automatically.

## License

MIT
