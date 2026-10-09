"use client";

import { m, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Compass, Home, Search, Sliders } from "./icons";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
];

export default function Nav() {
  const path = usePathname();
  const [solid, setSolid] = useState(false);
  const { scrollYProgress } = useScroll();
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <>
      <m.span className="progress" style={{ scaleX: bar }} aria-hidden="true" />
      <header className={solid ? "nav solid" : "nav"}>
        <Link className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kitsune.png" alt="" />
          <span>Kitsune</span>
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
      </header>
    </>
  );
}

export function TabBar() {
  return (
    <Suspense fallback={null}>
      <TabBarInner />
    </Suspense>
  );
}

function TabBarInner() {
  const path = usePathname();
  const searchParams = useSearchParams();
  const tabs = [
    { href: "/", label: "Home", icon: <Home size={20} /> },
    { href: "/browse", label: "Browse", icon: <Compass size={20} /> },
    { href: "/browse?sort=TRENDING", label: "Trending", icon: <Search size={20} /> },
    { href: "/browse?sort=SCORE", label: "Top", icon: <Sliders size={20} /> },
  ];
  return (
    <nav className="tabbar" aria-label="Sections">
      {tabs.map((t) => {
        const query = t.href.includes("?") ? t.href.slice(t.href.indexOf("?") + 1) : null;
        const active = query
          ? path === "/browse" && query === new URLSearchParams(searchParams?.toString() ?? "").toString()
          : path === t.href;
        return (
          <Link key={t.href} href={t.href} className={active ? "tab on" : "tab"}>
            {t.icon}
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Foot() {
  return (
    <footer className="shell">
      <div className="foot">
        <span>Data from AniList. Independent viewer, no affiliation.</span>
        <a href="#top">Back to top</a>
      </div>
    </footer>
  );
}
