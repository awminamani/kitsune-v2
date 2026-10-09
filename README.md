# Kitsune v2

A calm, cinematic way to browse anime. Search, filter by mood, and let the
interface take its colour from whatever you're looking at.

## The idea

Most anime catalogues shout. Kitsune v2 is built like a printed film programme:
a warm ink canvas, a serif voice, hairline rules, and a single signal colour
that **changes as you browse**. Hover a poster or open a title and the whole
page eases into that series' hue — one registered CSS custom property
(`--hue`) drives every accent, so the retint is a single animated unit rather
than a dozen scattered transitions.

## Dynamic theme

- `--hue` is declared with `@property` so the browser can *interpolate* it.
- `components/theme.tsx` derives a deterministic hue from a title's genres
  (then a stable nudge from its id) — no randomness, no "trust gradient".
- Hovering a card, opening the spotlight, or opening a detail view adopts that
  hue. The nav dial lets you take over manually; `auto` hands control back.

## Motion

`components/motion.ts` holds one vocabulary: 150 ms for state confirmation,
260 ms for entering UI, 450 ms for section reveals, M3 standard easing for
value changes and springs for position. Every animation is transform/opacity
only, and `MotionConfig reducedMotion="user"` drops movement for readers who
ask for it.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript (strict)
- Framer Motion (`LazyMotion` + `m.*` — only the DOM animation feature set)
- Data: AniList GraphQL (primary), Jikan/MAL (rankings) — both free, no keys

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Deploy

Push to `master` — Vercel builds and deploys automatically. No environment
variables required.
