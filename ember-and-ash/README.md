# Ember & Ash — landing page

A premium landing page for a fictional small-batch hot sauce brand.

**Stack:** Next.js 14 (App Router), Tailwind CSS, React Three Fiber + drei, GSAP ScrollTrigger, Framer Motion.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
STATIC_EXPORT=1 npm run build   # static site in ./out
```

## What's on the page

| Section | File | Motion |
| --- | --- | --- |
| Hero with 3D jar | `components/Hero.tsx`, `components/scene/*` | R3F scene; GSAP scrubs the jar and type on scroll; Framer intro |
| Marquee | `components/Marquee.tsx` | CSS loop |
| Process story | `components/Story.tsx` | GSAP pinned, scroll-scrubbed chapters |
| Product cards and gift box | `components/Products.tsx` | Framer 3D tilt, reveal, add-to-cart states |
| Flavor explorer | `components/Flavors.tsx` | Framer tabs, animated Scoville scale |
| Ingredients | `components/Ingredients.tsx` | GSAP stagger and parallax; Framer accordion |
| Newsletter | `components/FireList.tsx` | Magnetic button, validation |
| Cart drawer | `components/Cart.tsx` | Framer drawer, free-shipping meter |

## The 3D jar

There is no model file. The jar is built in code (`components/scene/Jar.tsx`):

- **Glass:** a lathe-revolved profile with drei's `MeshTransmissionMaterial` (refraction, chromatic aberration).
- **Sauce:** an inner lathe with flakes and seeds suspended against the glass. Its colour eases to the selected flavor.
- **Lid:** a knurled metal lid.
- **Label:** painted onto a canvas texture with the page fonts (`label.ts`).
- **Lighting:** an environment of `Lightformer` panels, so no HDR file is downloaded. A key light follows the pointer and an ember rim light flickers.
- **Steam:** a small point-sprite shader (`Steam.tsx`).
- **Spices:** instanced peppercorns, chili flakes and sesame seeds (`Spices.tsx`).

The canvas stops rendering when the hero is off screen. Phones get fewer particles, a lower pixel ratio and no contact shadow.

Products, prices and copy live in `lib/products.ts`. Checkout and newsletter sign-up are front-end only.
