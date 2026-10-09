"use client";

import { useEffect, useRef } from "react";

/**
 * Fires `onHit` when the sentinel nears the viewport. The generous rootMargin
 * prefetches well before the reader arrives, so an infinite list never gaps.
 */
export function useSentinel(onHit: () => void, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onHit);
  cb.current = onHit;

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && cb.current(),
      { rootMargin: "900px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);

  return ref;
}
