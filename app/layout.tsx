import type React from "react"
import "@/app/globals.css"

export const metadata = {
  title: "Liem Luttrell | Portfolio",
  description: "Software developer portfolio for Liem Luttrell with a retro terminal aesthetic",
  openGraph: {
    title: "Liem Luttrell | Portfolio",
    description: "Software developer portfolio for Liem Luttrell with a retro terminal aesthetic",
    type: "website",
    url: "https://www.epicliem.com", // TODO: Replace with your actual site URL
    images: [
      {
        url: "/screenshot.png", // TODO: Replace with your actual image URL
        alt: "Homepage Screenshot", // Optional: Specify image alt text
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
