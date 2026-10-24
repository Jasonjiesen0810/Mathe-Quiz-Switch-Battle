"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const chapters = [
  {
    step: "Smoke",
    stat: "14",
    unit: "hours",
    title: "Over applewood, from dawn.",
    body: "Whole habaneros, ghosts and moritas go into the smoker before sunrise. We pull them when the skins blister and the flesh turns sweet and dark.",
  },
  {
    step: "Ferment",
    stat: "90",
    unit: "days",
    title: "In a 3.5% salt brine.",
    body: "Then we wait. Lactic fermentation rounds off the raw burn and builds a deep, savoury sourness that no splash of vinegar can fake.",
  },
  {
    step: "Finish",
    stat: "600",
    unit: "jars",
    title: "Per batch, numbered by hand.",
    body: "Blended, rested for a week and jarred by hand. Every lid carries its batch number, so you know exactly which fire your sauce came from.",
  },
];

// Pinned, scroll-scrubbed chapters: the stat, copy and backdrop swap as you scroll.
export default function Story() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-chapter]");
      const stats = gsap.utils.toArray<HTMLElement>("[data-stat]");
      const glows = gsap.utils.toArray<HTMLElement>("[data-glow]");
      gsap.set([...panels.slice(1), ...stats.slice(1)], { autoAlpha: 0, yPercent: 40 });
      gsap.set(glows.slice(1), { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut", duration: 1 },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${window.innerHeight * 2.4}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });
      tl.to("[data-progress]", { scaleX: 1, ease: "none", duration: 3 }, 0);
      for (let i = 1; i < chapters.length; i++) {
        // Short crossfades leave each chapter at rest for most of its scroll
        const at = i - 0.35;
        tl.to([panels[i - 1], stats[i - 1]], { autoAlpha: 0, yPercent: -40, duration: 0.35 }, at)
          .to([panels[i], stats[i]], { autoAlpha: 1, yPercent: 0, duration: 0.35 }, at + 0.3)
          .to(glows[i - 1], { autoAlpha: 0 }, at)
          .to(glows[i], { autoAlpha: 1 }, at)
          .to(`[data-dot="${i}"]`, { backgroundColor: "#FF5A1F", scale: 1.4, duration: 0.3 }, at + 0.15);
      }
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="story" ref={root} className="relative h-[100svh] overflow-hidden bg-char">
      {/* Backdrops */}
      <div data-glow className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 20% 60%, rgba(120,60,40,.35), transparent 70%)" }} />
      <div data-glow className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 80% 40%, rgba(255,90,31,.28), transparent 70%)" }} />
      <div data-glow className="absolute inset-0" style={{ background: "radial-gradient(80% 70% at 50% 100%, rgba(255,138,61,.32), transparent 70%)" }} />

      <div className="gutter relative flex h-full flex-col justify-center pt-20">
        <div className="mb-10 flex items-center justify-between gap-6">
          <p className="eyebrow text-flame">The process</p>
          <div className="flex items-center gap-3">
            {chapters.map((c, i) => (
              <span key={c.step} className="flex items-center gap-2">
                <span data-dot={i} className={`h-2 w-2 rounded-full ${i === 0 ? "scale-[1.4] bg-ember" : "bg-ash"}`} />
                <span className="eyebrow hidden text-smoke sm:inline">{c.step}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="grid items-center gap-8 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="relative h-[clamp(9rem,30vw,26rem)]">
            {chapters.map((c) => (
              <div key={c.step} data-stat className="absolute inset-0 flex items-end gap-4">
                <span className="font-display text-[clamp(9rem,30vw,26rem)] font-black leading-[0.75] tracking-tightest text-ember">
                  {c.stat}
                </span>
                <span className="mb-[0.4em] font-serif text-[clamp(2rem,5vw,4.5rem)] italic leading-none text-bone">{c.unit}</span>
              </div>
            ))}
          </div>
          <div className="relative min-h-[15rem]">
            {chapters.map((c, i) => (
              <article key={c.step} data-chapter className="absolute inset-0">
                <p className="eyebrow text-smoke">
                  Step {i + 1} of 3 · {c.step}
                </p>
                <h2 className="mt-4 font-display text-[clamp(2.4rem,5vw,4.5rem)] font-extrabold uppercase leading-[0.9]">{c.title}</h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-bone/75">{c.body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-14 h-px w-full bg-ash">
          <div data-progress className="h-full origin-left scale-x-0 bg-ember" />
        </div>
      </div>
    </section>
  );
}
