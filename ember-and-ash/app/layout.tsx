import type { Metadata, Viewport } from "next";
import { body, display, serif } from "@/lib/fonts";
import { CartProvider } from "@/components/Cart";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ember & Ash — Small-Batch Fermented Hot Sauce",
  description:
    "Smoked for 14 hours, fermented for 90 days, jarred by hand in batches of 600. Gourmet hot sauces from Ember & Ash.",
};

export const viewport: Viewport = { themeColor: "#0A0807" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${serif.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
