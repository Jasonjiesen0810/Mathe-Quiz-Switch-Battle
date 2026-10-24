"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { products, type Product } from "@/lib/products";
import JarIllustration from "./JarIllustration";

type Line = { id: string; qty: number };
type CartCtx = {
  lines: Line[];
  count: number;
  add: (id: string) => void;
  remove: (id: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);

  const add = useCallback((id: string) => {
    setLines((ls) => {
      const hit = ls.find((l) => l.id === id);
      return hit ? ls.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l)) : [...ls, { id, qty: 1 }];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setLines((ls) => ls.flatMap((l) => (l.id !== id ? [l] : l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : [])));
  }, []);

  const count = lines.reduce((n, l) => n + l.qty, 0);
  const value = useMemo(() => ({ lines, count, add, remove, open, setOpen }), [lines, count, add, remove, open]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <CartDrawer />
    </Ctx.Provider>
  );
}

function CartDrawer() {
  const { lines, remove, add, open, setOpen } = useCart();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const items = lines
    .map((l) => ({ ...l, product: products.find((p) => p.id === l.id) as Product }))
    .filter((l) => l.product);
  const subtotal = items.reduce((s, l) => s + l.product.price * l.qty, 0);
  const freeShipAt = 45;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-coal/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-label="Your cart"
            className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-md flex-col border-l border-ash bg-char"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
          >
            <div className="flex items-center justify-between border-b border-ash px-6 py-5">
              <h2 className="font-display text-3xl font-extrabold uppercase">Your cart</h2>
              <button onClick={() => setOpen(false)} className="eyebrow text-smoke hover:text-bone">
                Close
              </button>
            </div>

            <div className="px-6 pt-5">
              <p className="text-sm text-smoke">
                {subtotal >= freeShipAt
                  ? "You've unlocked free shipping."
                  : `Add $${freeShipAt - subtotal} more for free shipping.`}
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-ash">
                <motion.div
                  className="h-full bg-ember"
                  animate={{ width: `${Math.min(100, (subtotal / freeShipAt) * 100)}%` }}
                />
              </div>
            </div>

            <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
              {items.length === 0 && <li className="text-smoke">Your cart is empty. The sauces are waiting.</li>}
              <AnimatePresence initial={false}>
                {items.map((l) => (
                  <motion.li
                    key={l.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    className="flex items-center gap-4 rounded-xl border border-ash p-3"
                  >
                    <div className="h-20 w-16 shrink-0">
                      <JarIllustration color={l.product.sauce} no={l.product.no} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xl font-bold uppercase leading-none">{l.product.name}</p>
                      <p className="mt-1 text-sm text-smoke">
                        {l.product.size} · ${l.product.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        aria-label={`Remove one ${l.product.name}`}
                        onClick={() => remove(l.id)}
                        className="grid h-8 w-8 place-items-center rounded-full border border-ash hover:border-ember"
                      >
                        −
                      </button>
                      <span className="w-5 text-center tabular-nums">{l.qty}</span>
                      <button
                        aria-label={`Add one ${l.product.name}`}
                        onClick={() => add(l.id)}
                        className="grid h-8 w-8 place-items-center rounded-full border border-ash hover:border-ember"
                      >
                        +
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <div className="border-t border-ash px-6 py-6">
              <div className="mb-4 flex justify-between text-lg">
                <span>Subtotal</span>
                <span className="tabular-nums">${subtotal}.00</span>
              </div>
              <button
                disabled={items.length === 0}
                className="w-full rounded-full bg-ember py-4 font-semibold uppercase tracking-wider text-coal transition hover:bg-flame disabled:opacity-40"
              >
                Checkout
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
