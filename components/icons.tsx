// Monoline icons, 1.7px stroke, currentColor — no icon font, no emoji.
// (open-design/craft/anti-ai-slop.md rule 3.)

type P = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export function Search({ size = 18 }: P) {
  return (
    <svg {...base(size)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.6-3.6" />
    </svg>
  );
}

export function Star({ size = 12, className }: P) {
  return (
    <svg {...base(size)} className={className} fill="currentColor" stroke="none">
      <path d="M12 3.6l2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.6 6.9 19.3l1.1-5.7-4.3-4 5.8-.7z" />
    </svg>
  );
}

export function Play({ size = 16 }: P) {
  return (
    <svg {...base(size)} fill="currentColor" stroke="none">
      <path d="M8 5.2v13.6L19 12z" />
    </svg>
  );
}

export function Sliders({ size = 17 }: P) {
  return (
    <svg {...base(size)}>
      <path d="M4 7h9M17 7h3M4 17h5M13 17h7" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="11" cy="17" r="2" />
    </svg>
  );
}

export function Compass({ size = 20 }: P) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.6 8.4l-2 5.2-5.2 2 2-5.2z" />
    </svg>
  );
}

export function Spark({ size = 20 }: P) {
  return (
    <svg {...base(size)}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8.5l1.4 2.1 2.1 1.4-2.1 1.4L12 15.5l-1.4-2.1L8.5 12l2.1-1.4z" />
    </svg>
  );
}

export function ArrowUp({ size = 20 }: P) {
  return (
    <svg {...base(size)}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}
