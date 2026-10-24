"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { heroState } from "@/lib/heroState";
import { formatShu, products } from "@/lib/products";
import { useCart } from "./Cart";
import Magnetic from "./Magnetic";

const JarScene = dynamic(() => import("./scene/JarScene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center">
      <div className="h-[46%] w-[22%] min-w-[140px] animate-pulse rounded-[28px] bg-gradient-to-b from-ash to-blood/40 blur-sm" />
    </div>
  ),
});

const ease = [0.22, 1, 0.36, 1] as const;

function Word({ text, className, delay }: { text: string; className: string; delay: number }) {
  return (
    <span className={`flex overflow-hidden ${className}`} aria-hidden="true">
      {text.split("").map((c, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ y: "105%" }}
          animate={{ y: "0%" }}
          transition={{ duration: 1.1, ease, delay: delay + i * 0.06 }}
        >
          {c}
        </motion.span>
      ))}
    </span>
  );
}

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const lineA = useRef<HTMLDivElement>(null);
  const lineB = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(true);
  const [lite, setLite] = useState(false);
  const { add, setOpen } = useCart();
  const product = products[index];

  useEffect(() => {
    setLite(window.matchMedia("(max-width: 767px)").matches);
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    if (section.current) io.observe(section.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
          onUpdate: (st) => (heroState.progress = st.progress),
        },
      });
      tl.to(lineA.current, { xPercent: -18, ease: "none" }, 0)
        .to(lineB.current, { xPercent: 18, ease: "none" }, 0)
        .to(stage.current, { scale: 0.82, opacity: 0.2, ease: "none" }, 0);
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="top"
      ref={section}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(60% 55% at 50% 52%, rgba(255,90,31,.38) 0%, rgba(181,54,27,.14) 38%, transparent 70%), radial-gradient(120% 80% at 50% 120%, #2a120a 0%, #0a0807 60%)",
      }}
    >
      <h1 className="sr-only">Ember &amp; Ash — slow-fire, small-batch fermented hot sauce</h1>

      {/* Oversized type behind the jar */}
      <div className="pointer-events-none absolute inset-0 z-0 flex flex-col justify-center gap-[2vw] pb-[8vh] font-display font-black uppercase leading-[0.8] tracking-tightest">
        <div ref={lineA} className="gutter text-[clamp(6.5rem,25vw,27rem)]">
          <Word text="Slow" className="text-outline text-bone/80" delay={0.15} />
        </div>
        <div ref={lineB} className="gutter flex justify-end text-[clamp(6.5rem,25vw,27rem)] text-ember">
          <Word text="Fire." className="" delay={0.35} />
        </div>
      </div>

      {/* 3D jar */}
      <motion.div
        ref={stage}
        className="pointer-events-none absolute inset-0 z-10"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.6, ease, delay: 0.5 }}
      >
        <JarScene product={product} active={active} lite={lite} eventSource={section} />
      </motion.div>

      {/* Foreground copy and controls */}
      <div className="gutter relative z-20 mt-auto grid gap-8 pb-10 pt-[64vh] md:grid-cols-[1fr_auto] md:items-end md:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 1 }}
          className="max-w-md"
        >
          <p className="eyebrow text-flame">Small-batch fermented hot sauce</p>
          <p className="mt-3 text-lg leading-relaxed text-bone/80">
            Smoked for <span className="text-bone">14 hours</span>, fermented for{" "}
            <span className="text-bone">90 days</span>, jarred by hand in batches of 600. Heat with something to say.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Magnetic>
              <button
                onClick={() => {
                  products.forEach((p) => add(p.id));
                  setOpen(true);
                }}
                className="group relative overflow-hidden rounded-full bg-ember px-7 py-4 font-semibold uppercase tracking-wider text-coal"
              >
                <span className="relative z-10">Shop the trio — $64</span>
                <span className="absolute inset-0 translate-y-full bg-bone transition-transform duration-500 ease-out group-hover:translate-y-0" />
              </button>
            </Magnetic>
            <a href="#story" className="eyebrow text-bone/70 underline-offset-8 hover:text-bone hover:underline">
              See how it&apos;s made
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 1.15 }}
          className="w-full max-w-sm md:w-80"
        >
          <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-3 flex items-end justify-between"
            >
              <div>
                <p className="eyebrow text-smoke">No.{product.no}</p>
                <p className="font-display text-3xl font-extrabold uppercase leading-none">{product.name}</p>
              </div>
              <p className="text-right text-sm tabular-nums text-smoke">
                {formatShu(product.shu)}
                <br />
                SHU
              </p>
            </motion.div>
          <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Choose a flavor">
            {products.map((p, i) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={i === index}
                onClick={() => setIndex(i)}
                className={`relative rounded-full border px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  i === index ? "border-ember text-coal" : "border-bone/20 text-bone/70 hover:border-bone/50"
                }`}
              >
                {i === index && (
                  <motion.span layoutId="flavor-pill" className="absolute inset-0 rounded-full bg-ember" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                )}
                <span className="relative">{p.short}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="eyebrow text-[0.6rem] text-smoke">Scroll</span>
        <span className="h-10 w-px overflow-hidden bg-ash">
          <motion.span
            className="block h-1/2 w-full bg-ember"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </div>
    </section>
  );
}
