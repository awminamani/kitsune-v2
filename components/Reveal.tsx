"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";
import { rise, wave, VIEWPORT, waveItem } from "./motion";

/** Reveals a block once as it enters the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <m.div
      className={className}
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      transition={{ delay }}
    >
      {children}
    </m.div>
  );
}

/** Container whose children (carrying `waveItem`) arrive in a wave. */
export function Wave({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <m.div
      className={className}
      variants={wave}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
    >
      {children}
    </m.div>
  );
}

export { waveItem };
