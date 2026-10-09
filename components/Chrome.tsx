"use client";

import { m, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "./theme";
import { Compass, Search, Sliders, Spark } from "./icons";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
];

/**
 * Fixed nav. Transparent over the hero, glass once scrolled, with a
 * scroll-progress hairline in the live accent colour and the hue dial that
 * lets the reader pin the theme.
 */
export default function Nav() {
  const { hue, auto, setHue, release } = useTheme();
  const path = usePathname();
  const [solid, setSolid] = useState(false);
  const { scrollYProgress } = useScroll();
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 56);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={solid ? "nav solid" : "nav"}>
      <m.span className="nav-progress" style={{ scaleX: bar }} aria-hidden="true" />

      <Link className="brand" href="/">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kitsune.png" alt="" />
        <span>
          Kit<em>sune</em>
        </span>
      </Link>

      <nav className="nav-links">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            data-active={path === l.href ? "true" : "false"}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="dial">
        <span className="dial-dot" aria-hidden="true" />
        <input
          className="dial-track"
          type="range"
          min={0}
          max={360}
          value={Math.round(hue)}
          onChange={(e) => setHue(Number(e.target.value))}
          aria-label="Theme hue"
          title="Pick the interface colour"
        />
        {!auto && (
          <button className="dial-auto" onClick={release} title="Let the content choose">
            auto
          </button>
        )}
      </div>
    </header>
  );
}

/** Mobile tab bar. */
export function TabBar() {
  const path = usePathname();
  const tabs = [
    { href: "/", label: "Home", icon: <Spark size={19} /> },
    { href: "/browse", label: "Browse", icon: <Compass size={19} /> },
    { href: "/browse?sort=TRENDING", label: "Trending", icon: <Search size={19} /> },
    { href: "/browse?sort=SCORE", label: "Top", icon: <Sliders size={19} /> },
  ];
  return (
    <nav className="tabbar" aria-label="Sections">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={path + (t.href.includes("?") ? t.href.slice(t.href.indexOf("?")) : "") === t.href ? "tab on" : "tab"}
        >
          {t.icon}
          <span>{t.label}</span>
        </Link>
      ))}
    </nav>
  );
}

/** Shared page footer. */
export function Foot() {
  return (
    <footer className="shell">
      <div className="foot">
        <span>
          Data from AniList. Kitsune is an independent viewer with no affiliation.
        </span>
        <a href="#top">Back to top</a>
      </div>
    </footer>
  );
}
