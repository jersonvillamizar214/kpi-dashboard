// Deterministic synthetic dataset for a fictional retail company ("Copower Retail").
// Orders are generated order-by-order with a seeded PRNG so the numbers are stable
// across renders, then aggregated in metrics.ts — the same shape as querying a real
// database with GROUP BY / SUM.

export interface Order {
  month: number; // 0..23 (two years of history)
  customerId: number;
  category: string;
  product: string;
  region: string;
  channel: string;
  amount: number; // in USD
}

// mulberry32 — a tiny, fast, seedable PRNG. Same seed → same sequence.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CATEGORIES = [
  { name: "Electrónica", weight: 0.3, avg: 520, products: ["Auriculares Pro", "Smartwatch X", "Cámara 4K"] },
  { name: "Moda", weight: 0.24, avg: 90, products: ["Chaqueta Urbana", "Zapatillas Run", "Bolso Clásico"] },
  { name: "Hogar", weight: 0.2, avg: 140, products: ["Set Cocina", "Lámpara LED", "Robot Aspirador"] },
  { name: "Deportes", weight: 0.14, avg: 110, products: ["Bicicleta City", "Mancuernas Set", "Tienda 2P"] },
  { name: "Belleza", weight: 0.12, avg: 45, products: ["Sérum Facial", "Perfume Nuit", "Kit Cuidado"] },
];

const REGIONS = [
  { name: "Norte", weight: 0.26 },
  { name: "Centro", weight: 0.24 },
  { name: "Sur", weight: 0.2 },
  { name: "Este", weight: 0.16 },
  { name: "Oeste", weight: 0.14 },
];

const CHANNELS = [
  { name: "Online", weight: 0.55 },
  { name: "Retail", weight: 0.3 },
  { name: "Mayorista", weight: 0.15 },
];

export const TOTAL_MONTHS = 24;
const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// Human labels for the 24-month history (two calendar years).
export const MONTH_LABELS: string[] = Array.from({ length: TOTAL_MONTHS }, (_, i) => {
  const year = 24 + Math.floor(i / 12); // '24, '25
  return `${MONTH_NAMES[i % 12]} ${year}`;
});

function pick<T extends { weight: number }>(items: T[], r: number): T {
  let acc = 0;
  for (const item of items) {
    acc += item.weight;
    if (r <= acc) return item;
  }
  return items[items.length - 1];
}

// Generate the order book once at module load (memoized).
function generateOrders(): Order[] {
  const rand = mulberry32(20260703);
  const orders: Order[] = [];

  for (let month = 0; month < TOTAL_MONTHS; month++) {
    // Base volume grows ~4% per month, with a Q4 (Nov/Dec) seasonal lift.
    const growth = Math.pow(1.04, month);
    const seasonal = month % 12 === 10 || month % 12 === 11 ? 1.35 : 1;
    const count = Math.round(160 * growth * seasonal);

    for (let i = 0; i < count; i++) {
      const cat = pick(CATEGORIES, rand());
      const region = pick(REGIONS, rand());
      const channel = pick(CHANNELS, rand());
      const product = cat.products[Math.floor(rand() * cat.products.length)];
      const amount = Math.round(cat.avg * (0.6 + rand() * 0.9));
      // Customer pool grows over time; repeat buyers emerge naturally.
      const customerId = Math.floor(rand() * (800 + month * 120));

      orders.push({
        month,
        customerId,
        category: cat.name,
        product,
        region: region.name,
        channel: channel.name,
        amount,
      });
    }
  }
  return orders;
}

let cache: Order[] | null = null;
export function getOrders(): Order[] {
  if (!cache) cache = generateOrders();
  return cache;
}

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);
export const REGION_NAMES = REGIONS.map((r) => r.name);
export const CHANNEL_NAMES = CHANNELS.map((c) => c.name);
