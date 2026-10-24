"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { formatShu, products } from "@/lib/products";

// Log scale for Scoville units, 100 → 2,000,000
const MIN = Math.log10(100);
const MAX = Math.log10(2_000_000);
const pos = (shu: number) => ((Math.log10(shu) - MIN) / (MAX - MIN)) * 100;

const references = [
  { label: "Jalapeño", shu: 5000 },
  { label: "Habanero", shu: 200000 },
  { label: "Ghost pepper", shu: 1000000 },
];

export default function Flavors() {
  const [i, setI] = useState(0);
  const p = products[i];

  return (
    <section id="flavors" className="halftone relative overflow-hidden bg-ember py-28 text-coal md:py-36">
      <div className="gutter">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-[clamp(4rem,12vw,11rem)] font-black uppercase leading-[0.8] tracking-tightest">
            Pick your
            <br />
            <span className="font-serif font-normal normal-case italic">poison</span>
          </h2>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Flavors">
            {products.map((x, k) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={k === i}
                onClick={() => setI(k)}
                className={`relative rounded-full border-2 border-coal px-5 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
                  k === i ? "text-ember" : "hover:bg-coal/10"
                }`}
              >
                {k === i && <motion.span layoutId="flavor-tab" className="absolute inset-0 rounded-full bg-coal" />}
                <span className="relative">No.{x.no}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 grid gap-12 md:grid-cols-[1.2fr_1fr]"
          >
            <div>
              <p className="eyebrow">No.{p.no} · {p.size}</p>
              <h3 className="mt-3 font-display text-[clamp(3rem,7vw,6.5rem)] font-black uppercase leading-[0.85]">{p.name}</h3>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-coal/80">{p.description}</p>

              <div className="mt-10">
                <div className="mb-3 flex items-baseline justify-between">
                  <p className="eyebrow">Heat, Scoville units</p>
                  <p className="font-display text-3xl font-black tabular-nums">{formatShu(p.shu)}</p>
                </div>
                <div className="relative h-16">
                  <div className="absolute inset-x-0 top-6 h-3 rounded-full bg-gradient-to-r from-[#ffd0a8] via-blood to-coal" />
                  {references.map((r) => (
                    <div key={r.label} className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${pos(r.shu)}%` }}>
                      <span className="block h-5 w-px bg-coal/40 mx-auto" />
                      <span className="mt-6 block whitespace-nowrap text-[0.68rem] font-semibold uppercase tracking-wider text-coal/70">{r.label}</span>
                    </div>
                  ))}
                  <motion.div
                    className="absolute top-3 -ml-[11px] h-[22px] w-[22px] rounded-full border-4 border-coal bg-bone"
                    initial={{ left: "0%" }}
                    animate={{ left: `${pos(p.shu)}%` }}
                    transition={{ type: "spring", stiffness: 90, damping: 16 }}
                  />
                </div>
                <p className="mt-6 text-sm text-coal/70">Pepper markers show the raw chile. The sauce is diluted by fermentation and blending.</p>
              </div>
            </div>

            <div className="grid content-start gap-10">
              <div>
                <p className="eyebrow">Tasting notes</p>
                <ul className="mt-4 divide-y divide-coal/20 border-y border-coal/20">
                  {p.notes.map((n, k) => (
                    <motion.li
                      key={n}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + k * 0.08 }}
                      className="flex items-center justify-between py-4 font-display text-3xl font-bold uppercase"
                    >
                      {n}
                      <span className="font-sans text-xs font-semibold tracking-widest text-coal/50">0{k + 1}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="eyebrow">Best with</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.pairings.map((x) => (
                    <span key={x} className="rounded-full bg-coal px-4 py-2 text-sm font-medium text-bone">
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
