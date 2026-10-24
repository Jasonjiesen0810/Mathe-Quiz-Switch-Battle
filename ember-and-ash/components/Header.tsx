"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { useCart } from "./Cart";

const links = [
  { href: "#story", label: "Process" },
  { href: "#sauces", label: "Sauces" },
  { href: "#flavors", label: "Flavors" },
  { href: "#ingredients", label: "Ingredients" },
];

export function Logo({ className = "" }: { className?: string }) {
  return (
    <a href="#top" className={`group flex items-center gap-2.5 ${className}`} aria-label="Ember & Ash home">
      <svg viewBox="0 0 24 24" className="h-7 w-7 text-ember transition-transform duration-500 group-hover:rotate-[20deg]" aria-hidden="true">
        <path fill="currentColor" d="M12 1.5c1 3.6 5.8 6.4 5.8 12a5.8 5.8 0 0 1-11.6 0c0-2.4 1.1-4.2 2.4-5.6.2 1.7.9 2.9 2 3.5-.3-3.7.4-7 1.4-9.9z" />
        <path fill="#0A0807" d="M12 12.2c.5 1.6 2.4 2.5 2.4 4.6a2.4 2.4 0 0 1-4.8 0c0-1.6 1.2-2.7 2.4-4.6z" />
      </svg>
      <span className="font-display text-2xl font-black uppercase leading-none tracking-wide">
        Ember <span className="font-serif text-xl font-normal normal-case italic text-ember">&amp;</span> Ash
      </span>
    </a>
  );
}

export default function Header() {
  const { count, setOpen } = useCart();
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 40);
    setHidden(y > 600 && y > prev);
  });

  return (
    <motion.header
      animate={{ y: hidden ? "-110%" : "0%" }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid ? "border-b border-ash/70 bg-coal/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="gutter flex h-[72px] items-center justify-between gap-6">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="group relative text-sm font-medium text-bone/80 hover:text-bone">
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-ember transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
            </a>
          ))}
        </nav>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 rounded-full border border-bone/20 py-2 pl-4 pr-2 text-sm font-medium transition hover:border-ember"
        >
          Cart
          <motion.span
            key={count}
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 14 }}
            className="grid h-7 min-w-7 place-items-center rounded-full bg-ember px-2 text-xs font-bold text-coal tabular-nums"
          >
            {count}
          </motion.span>
        </button>
      </div>
    </motion.header>
  );
}
