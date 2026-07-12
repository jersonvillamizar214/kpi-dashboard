"use client";

import { useEffect, useRef, useState } from "react";

// Tracks a container's pixel width so SVG charts render at 1:1 device units
// (crisp strokes, trivial hover math — no viewBox scaling distortion).
export function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}
