import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Mirrors tapt.so: Regular=400, Bold mapped to 600 so font-semibold hits Bold.
const productSans = localFont({
  src: [
    { path: "./fonts/ProductSansRegular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/ProductSansBold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-product-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Design",
  description: "The start of a cohesive design system for tapt.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${productSans.variable} h-full antialiased`}>
      {/* className on body, same as tapt.so, so every element inherits the face. */}
      <body className={`${productSans.className} flex min-h-full flex-col bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
