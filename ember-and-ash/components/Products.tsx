"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState } from "react";
import { type Product, formatShu, products } from "@/lib/products";
import { useCart } from "./Cart";
import JarIllustration from "./JarIllustration";

function HeatBar({ heat }: { heat: number }) {
  return (
    <div className="flex gap-1" aria-label={`Heat ${heat} out of 10`}>
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className={`h-1.5 flex-1 rounded-full ${i < heat ? "bg-ember" : "bg-ash"}`} />
      ))}
    </div>
  );
}

function Card({ p, i }: { p: Product; i: number }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 200, damping: 20 });
  const jarX = useSpring(useTransform(mx, [0, 1], [-14, 14]), { stiffness: 150, damping: 18 });

  return (
    <motion.article
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width);
          my.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}
        className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-ash bg-char p-6"
      >
        <div
          className="absolute inset-x-0 top-0 h-2/3 opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `radial-gradient(60% 60% at 50% 55%, ${p.sauce}66, transparent 70%)` }}
        />
        <div className="relative flex items-start justify-between">
          <span className="font-display text-6xl font-black leading-none text-bone/10">{p.no}</span>
          <span className="rounded-full border border-bone/15 px-3 py-1 text-xs tabular-nums text-smoke">{formatShu(p.shu)} SHU</span>
        </div>
        <motion.div style={{ x: jarX, translateZ: 60 }} className="relative mx-auto my-4 h-64 w-48 transition-transform duration-500 group-hover:-translate-y-2">
          <JarIllustration color={p.sauce} no={p.no} />
        </motion.div>
        <div className="relative mt-auto">
          <h3 className="font-display text-4xl font-extrabold uppercase leading-[0.9]">{p.name}</h3>
          <p className="mt-2 text-sm text-smoke">{p.notes.join(" · ")}</p>
          <div className="mt-4">
            <HeatBar heat={p.heat} />
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-smoke">
              <span className="font-display text-3xl font-bold text-bone">${p.price}</span> / {p.size}
            </p>
            <button
              onClick={() => {
                add(p.id);
                setAdded(true);
                setTimeout(() => setAdded(false), 1400);
              }}
              className="relative h-11 overflow-hidden rounded-full border border-ember px-5 text-sm font-semibold uppercase tracking-wider text-ember transition-colors hover:bg-ember hover:text-coal"
            >
              <motion.span animate={{ y: added ? "-150%" : "0%" }} className="block">
                Add to cart
              </motion.span>
              <motion.span initial={{ y: "150%" }} animate={{ y: added ? "-100%" : "150%" }} className="absolute inset-x-0 top-1/2 block">
                Added
              </motion.span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

export default function Products() {
  const { add, setOpen } = useCart();
  return (
    <section id="sauces" className="gutter relative bg-coal py-28 md:py-40">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <h2 className="font-display text-[clamp(4rem,13vw,12rem)] font-black uppercase leading-[0.8] tracking-tightest">
          The <span className="font-serif font-normal normal-case italic text-ember">line</span>up
        </h2>
        <p className="max-w-sm text-bone/70">
          Three sauces, three kinds of fire. Each one is fermented for 90 days and made in batches small enough to taste every one.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {products.map((p, i) => (
          <Card key={p.id} p={p} i={i} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="halftone relative mt-6 flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[28px] bg-ember p-8 text-coal md:flex-row md:items-center md:p-10"
      >
        <div>
          <p className="eyebrow">Gift box</p>
          <p className="mt-2 font-display text-5xl font-black uppercase leading-[0.85] md:text-6xl">The full fire trio</p>
          <p className="mt-3 max-w-lg text-coal/80">All three sauces in a matte-black box with a tasting card. Ships free.</p>
        </div>
        <div className="flex items-center gap-6">
          <p className="font-display text-5xl font-black">
            $64
          </p>
          <button
            onClick={() => {
              products.forEach((p) => add(p.id));
              setOpen(true);
            }}
            className="rounded-full bg-coal px-7 py-4 font-semibold uppercase tracking-wider text-bone transition hover:scale-105"
          >
            Add the trio
          </button>
        </div>
      </motion.div>
    </section>
  );
}
