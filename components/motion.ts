// Motion vocabulary — one source for the whole app.
// Grounded in open-design/craft/animation-discipline.md:
//   150ms state-confirmation · 200–300ms entering UI · 300–500ms cross-screen
//   M3 standard easing cubic-bezier(0.2, 0, 0, 1); springs for position/scale.
// Transform + opacity only (compositor-safe). Reduced motion is honoured
// app-wide through MotionConfig, with opacity crossfades as the substitute.

import type { Transition, Variants } from "framer-motion";

export const EASE = [0.2, 0, 0, 1] as const;
export const EASE_SOFT = [0.22, 1, 0.36, 1] as const;

export const DUR = {
  micro: 0.12,
  confirm: 0.15,
  enter: 0.26,
  screen: 0.45,
} as const;

export const SPRING: Transition = { type: "spring", stiffness: 300, damping: 28, mass: 0.85 };
export const SPRING_SNAP: Transition = { type: "spring", stiffness: 440, damping: 32, mass: 0.7 };

/** Section/heading reveal — travels a short distance, settles fast. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.screen, ease: EASE_SOFT } },
};

/** Parent for grids and rails: children arrive in a wave, not all at once. */
export const wave: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

export const waveItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE_SOFT } },
};

/** One viewport config so every section triggers at the same scroll point. */
export const VIEWPORT = { once: true, amount: 0.12 } as const;
