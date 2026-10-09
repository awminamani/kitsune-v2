"use client";

import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import { ThemeProvider } from "@/components/theme";

/**
 * Client providers.
 *
 * - `ThemeProvider` owns the dynamic hue theme.
 * - `LazyMotion` + `domAnimation` loads only the DOM animation feature set and
 *   every component uses the lightweight `m.*` primitives.
 * - `MotionConfig reducedMotion="user"` drops transform/scale/parallax motion
 *   for readers who ask for it, keeping opacity crossfades.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  );
}
