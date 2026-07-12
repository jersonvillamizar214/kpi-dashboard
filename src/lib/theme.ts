// Chart palette — validated with the data-viz skill's validator against the
// dark chart surface (#0f172a): CVD ΔE 41.3, contrast ≥ 3:1, all checks pass.
// Categorical hues are assigned in a FIXED order and never cycled.

// Single hue for magnitude (revenue trend, category bars).
export const ACCENT = "#3987e5";

// Categorical slots (identity) — used for the region donut, in fixed order.
export const SERIES = [
  "#3987e5", // blue
  "#199e70", // aqua
  "#c98500", // yellow
  "#9085e9", // violet
  "#d95926", // orange
] as const;

// Text tokens — data marks carry color; text never does.
export const INK = {
  primary: "#ffffff",
  secondary: "#c3c2b7",
  muted: "#898781",
} as const;

export const GRID = "rgba(255,255,255,0.08)";
export const AXIS = "rgba(255,255,255,0.14)";

// Delta direction colors (up = good here).
export const GOOD = "#22c55e";
export const BAD = "#e66767";
