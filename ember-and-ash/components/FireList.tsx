"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Magnetic from "./Magnetic";

export default function FireList() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");

  return (
    <section className="relative overflow-hidden bg-char py-28 md:py-40">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(50% 70% at 50% 110%, rgba(255,90,31,.45), transparent 70%)" }}
      />
      <div className="gutter relative mx-auto max-w-5xl text-center">
        <p className="eyebrow text-flame">Batch 0418 drops 14 November</p>
        <h2 className="mt-5 font-display text-[clamp(3.5rem,11vw,10rem)] font-black uppercase leading-[0.8] tracking-tightest">
          Join the <span className="font-serif font-normal normal-case italic text-ember">fire</span> list
        </h2>
        <p className="mx-auto mt-6 max-w-md text-bone/70">
          Batches sell out in days. Get 48 hours of early access, plus recipes from our kitchen. One email per batch.
        </p>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setState(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "done" : "error");
          }}
          className="mx-auto mt-10 flex max-w-lg flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state !== "idle") setState("idle");
            }}
            placeholder="you@example.com"
            className="h-14 flex-1 rounded-full border border-ash bg-coal px-6 text-bone placeholder:text-smoke/60 focus:border-ember focus:outline-none"
          />
          <Magnetic strength={0.2}>
            <button className="h-14 w-full rounded-full bg-ember px-8 font-semibold uppercase tracking-wider text-coal transition hover:bg-flame sm:w-auto">
              Get early access
            </button>
          </Magnetic>
        </form>
        <div className="mt-4 h-6" aria-live="polite">
          <AnimatePresence mode="wait">
            {state !== "idle" && (
              <motion.p
                key={state}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={state === "done" ? "text-flame" : "text-bone/70"}
              >
                {state === "done" ? "You're on the list. We'll email you before batch 0418 opens." : "Enter a full email address, like name@example.com."}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
