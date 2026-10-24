import { Logo } from "./Header";

const cols = [
  { title: "Shop", links: ["All sauces", "Gift box", "Merch", "Wholesale"] },
  { title: "Kitchen", links: ["Recipes", "Process", "Batch log", "FAQ"] },
  { title: "Company", links: ["About", "Stockists", "Contact", "Shipping"] },
];

export default function Footer() {
  return (
    <footer className="border-t border-ash bg-coal">
      <div className="gutter grid gap-12 py-16 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-smoke">Small-batch fermented hot sauce, smoked and jarred by hand in Brooklyn, NY.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="eyebrow text-smoke">{c.title}</p>
            <ul className="mt-4 space-y-2">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#top" className="text-bone/80 transition-colors hover:text-ember">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="gutter overflow-hidden">
        <p aria-hidden="true" className="select-none font-display text-[23vw] font-black uppercase leading-[0.72] tracking-tightest text-char">
          Ember&amp;Ash
        </p>
      </div>
      <div className="gutter flex flex-wrap justify-between gap-4 border-t border-ash py-6 text-xs text-smoke">
        <span>© 2026 Ember &amp; Ash. A fictional brand.</span>
        <span>Keep refrigerated after opening.</span>
      </div>
    </footer>
  );
}
