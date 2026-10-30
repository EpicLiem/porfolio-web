import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import localFont from "next/font/local";
import { isPreview, site } from "@/lib/site";

const consoleFont = localFont({
  src: "./fonts/ibm-vga-8x16.woff",
  variable: "--font-console",
  display: "swap",
});

const desktopFont = localFont({
  src: [
    { path: "./fonts/terminess-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/terminess-bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-desktop",
  display: "swap",
  preload: false,
});

const pixelFont = localFont({
  src: "./fonts/dogica-pixel.ttf",
  variable: "--font-pixel",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: "%s | Liem Luttrell" },
  description: site.description,
  authors: [{ name: "Liem Luttrell", url: site.url }],
  robots: { index: !isPreview, follow: !isPreview },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Liem Luttrell",
    title: site.title,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [{ url: "/opengraph-image", alt: "Liem Luttrell — software and engineering. Flowcast, NoteBrew, and Liemfish." }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Hide the boot animation before first paint when ArchStartup will skip it anyway. */}
      <head><script dangerouslySetInnerHTML={{ __html: "try{if(sessionStorage.getItem('portfolio-v2:booted-hyprland')==='true'||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.booted=''}catch(e){}" }} /></head>
      <body className={`${consoleFont.variable} ${desktopFont.variable} ${pixelFont.variable}`}>{children}</body>
    </html>
  );
}
