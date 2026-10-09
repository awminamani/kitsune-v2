import type { Transition, Variants } from "framer-motion";

export const EASE = [0.2, 0, 0, 1] as const;
export const EASE_SOFT = [0.22, 1, 0.36, 1] as const;

export const SPRING: Transition = { type: "spring", stiffness: 300, damping: 28, mass: 0.85 };
export const SPRING_SNAP: Transition = { type: "spring", stiffness: 440, damping: 32, mass: 0.7 };

export const DUR = {
  micro: 0.12,
  confirm: 0.15,
  enter: 0.26,
  screen: 0.45,
} as const;

export const rise: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.screen, ease: EASE_SOFT } },
};

export const wave: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.038, delayChildren: 0.04 } },
};

export const waveItem: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE_SOFT } },
};

export const VIEWPORT = { once: true, amount: 0.12 } as const;
