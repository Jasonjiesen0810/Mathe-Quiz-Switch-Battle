"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

const ingredients = [
  { name: "Habanero chiles", origin: "Yucatán, Mexico", color: "#FF5A1F", note: "Fruity, floral heat. The backbone of No.01, bought direct from one family farm." },
  { name: "Ghost peppers", origin: "Assam, India", color: "#C2260C", note: "Bhut jolokia with a slow, smoky build. Charred over open flame for No.03." },
  { name: "Black garlic", origin: "Hudson Valley, NY", color: "#2B1A14", note: "Aged 40 days at low heat until it turns soft, sweet and balsamic." },
  { name: "Wildflower honey", origin: "Catskills, NY", color: "#D98A1C", note: "Caramelised until it nearly burns, for a bitter-sweet depth." },
  { name: "Chipotle morita", origin: "Oaxaca, Mexico", color: "#6B2A17", note: "Smoke-dried red jalapeños that add notes of leather and cocoa." },
  { name: "Flaky sea salt", origin: "Maine coast", color: "#E9E1D6", note: "The only salt we use, in the brine and the finish." },
];

const never = ["Xanthan gum", "Added sugar syrup", "“Natural flavors”", "Preservatives", "Pepper extract"];

export default function Ingredients() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from("[data-row]", {
        yPercent: 60,
        opacity: 0,
        stagger: 0.08,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-rows]", start: "top 80%" },
      });
      gsap.to("[data-pure]", {
        xPercent: -30,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="ingredients" ref={root} className="relative overflow-hidden bg-coal py-28 md:py-40">
      <div data-pure aria-hidden="true" className="pointer-events-none absolute left-[10%] top-10 whitespace-nowrap font-display text-[32vw] font-black uppercase leading-none text-outline" style={{ "--stroke": "#2A221F" } as React.CSSProperties}>
        Nothing else
      </div>

      <div className="gutter relative grid gap-14 lg:grid-cols-[1fr_1.4fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow text-flame">Ingredients</p>
          <h2 className="mt-4 font-display text-[clamp(3.5rem,8vw,7.5rem)] font-black uppercase leading-[0.82]">
            Six things.
            <br />
            <span className="text-ember">Nothing</span> else.
          </h2>
          <p className="mt-6 max-w-sm text-bone/70">Every ingredient is on the label, and every one is there for flavour. Here is what we leave out.</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {never.map((n) => (
              <li key={n} className="rounded-full border border-ash px-3 py-1.5 text-sm text-smoke line-through decoration-ember decoration-2">
                {n}
              </li>
            ))}
          </ul>
        </div>

        <ul data-rows className="border-t border-ash">
          {ingredients.map((ing, i) => {
            const isOpen = open === i;
            return (
              <li key={ing.name} data-row className="border-b border-ash">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  onMouseEnter={() => setOpen(i)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center gap-5 py-6 text-left"
                >
                  <motion.span
                    className="h-4 w-4 shrink-0 rounded-full border border-bone/20"
                    style={{ backgroundColor: ing.color }}
                    animate={{ scale: isOpen ? 1.6 : 1 }}
                  />
                  <span
                    className={`flex-1 font-display text-[clamp(2rem,4.5vw,3.75rem)] font-extrabold uppercase leading-none transition-colors ${
                      isOpen ? "text-bone" : "text-bone/40 group-hover:text-bone/70"
                    }`}
                  >
                    {ing.name}
                  </span>
                  <span className="hidden text-sm text-smoke sm:block">{ing.origin}</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-lg pb-6 pl-9 text-bone/70">
                        <span className="text-smoke sm:hidden">{ing.origin}. </span>
                        {ing.note}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
