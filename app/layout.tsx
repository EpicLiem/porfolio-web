import type React from "react"
import "@/app/globals.css"

export const metadata = {
  metadataBase: new URL("https://www.epicliem.com"),
  title: "Liem Luttrell | Portfolio",
  description: "Discover Liem Luttrell's software development work.",
  openGraph: {
    title: "Liem Luttrell | Portfolio",
    description: "Discover Liem Luttrell's software development work.",
    type: "website",
    url: "https://www.epicliem.com",
    images: [
      {
        url: "/screenshot.png",
        alt: "Homepage Screenshot",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-zinc-900 text-zinc-100">{children}</body>
    </html>
  )
}
