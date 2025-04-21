import type React from "react"
import "@/app/globals.css"

export const metadata = {
  title: "Liem Luttrell | Portfolio",
  description: "Software developer portfolio for Liem Luttrell with a retro terminal aesthetic",
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
