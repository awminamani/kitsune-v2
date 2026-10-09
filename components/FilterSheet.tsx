"use client";

import { AnimatePresence, m } from "framer-motion";
import { useState } from "react";
import type { BrowseQuery, MediaFormat, Season, SortKey } from "@/lib/types";
import { FORMAT_OPTIONS, SEASON_OPTIONS, SORT_OPTIONS } from "@/lib/query";
import { Sliders } from "./icons";

export default function FilterSheet({
  open,
  current,
  genres,
  onApply,
  onClose,
}: {
  open: boolean;
  current: BrowseQuery;
  genres: string[];
  onApply: (q: BrowseQuery) => void;
  onClose: () => void;
}) {
  const [d, setD] = useState<BrowseQuery>(current);

  const set = <K extends keyof BrowseQuery>(k: K, v: BrowseQuery[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const toggle = <K extends keyof BrowseQuery>(k: K, v: BrowseQuery[K]) =>
    setD((prev) => ({ ...prev, [k]: prev[k] === v ? undefined : v }));

  const active =
    (d.genre ? 1 : 0) + (d.format ? 1 : 0) + (d.season ? 1 : 0) + (d.year ? 1 : 0);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="sheet-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <m.div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            initial={{ y: 64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.8 }}
          >
            <div className="sheet-grip" aria-hidden="true" />
            <div className="sheet-head">
              <h3>Refine{active > 0 && <span style={{ color: "var(--accent)", fontSize: "0.7em" }}> · {active}</span>}</h3>
              <button className="sec-link" onClick={onClose}>Close</button>
            </div>

            <p className="sheet-label">Genre</p>
            <div className="chips scroll">
              <button className={!d.genre ? "chip on" : "chip"} onClick={() => set("genre", undefined)}>Any</button>
              {genres.map((g) => (
                <button key={g} className={d.genre === g ? "chip on" : "chip"} onClick={() => toggle("genre", g)}>{g}</button>
              ))}
            </div>

            <p className="sheet-label">Format</p>
            <div className="chips">
              <button className={!d.format ? "chip on" : "chip"} onClick={() => set("format", undefined)}>Any</button>
              {FORMAT_OPTIONS.map((f: MediaFormat) => (
                <button key={f} className={d.format === f ? "chip on" : "chip"} onClick={() => toggle("format", f)}>{f}</button>
              ))}
            </div>

            <p className="sheet-label">Season</p>
            <div className="chips">
              <button className={!d.season ? "chip on" : "chip"} onClick={() => set("season", undefined)}>Any</button>
              {SEASON_OPTIONS.map((s: Season) => (
                <button key={s} className={d.season === s ? "chip on" : "chip"} onClick={() => toggle("season", s)}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <p className="sheet-label">Sort by</p>
            <div className="chips">
              {SORT_OPTIONS.map((s: { key: SortKey; label: string }) => (
                <button key={s.key} className={(d.sort ?? "POPULARITY") === s.key ? "chip on" : "chip"} onClick={() => set("sort", s.key)}>
                  {s.label}
                </button>
              ))}
            </div>

            <p className="sheet-label">Year</p>
            <input
              className="field"
              type="number"
              inputMode="numeric"
              min={1940}
              max={2100}
              placeholder="Any year, e.g. 2024"
              value={d.year ?? ""}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                set("year", raw ? Number(raw) : undefined);
              }}
            />

            <div className="sheet-foot">
              <button className="btn btn-line" onClick={() => setD({ sort: current.sort ?? "POPULARITY" })}>Reset</button>
              <button className="btn btn-solid" onClick={() => onApply(d)}>
                <Sliders size={15} />
                Show results
              </button>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
