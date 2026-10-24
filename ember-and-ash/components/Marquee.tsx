const items = [
  "Fermented 90 days",
  "Smoked over applewood",
  "No gums. No fillers.",
  "Hand-numbered batches",
  "600 jars per batch",
  "Made in Brooklyn",
];

function Star() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true">
      <path fill="currentColor" d="M12 0l2.6 8.2L23 6l-6.2 6L23 18l-8.4-2.2L12 24l-2.6-8.2L1 18l6.2-6L1 6l8.4 2.2z" />
    </svg>
  );
}

export default function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="relative z-10 -my-6 -rotate-2 overflow-hidden border-y-2 border-coal bg-ember py-4 text-coal">
      <div className="flex w-max animate-marquee items-center">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-8 pr-8 font-display text-3xl font-black uppercase md:text-4xl">
            {t}
            <Star />
          </span>
        ))}
      </div>
    </div>
  );
}
