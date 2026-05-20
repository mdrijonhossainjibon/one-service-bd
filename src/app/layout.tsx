import type { Metadata } from "next"
import { Outfit, DM_Sans } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "One Service 𝓑𝓓 — Admin Dashboard",
  description: "Enterprise-grade admin panel for license management, user control, and real-time analytics.",
  icons: { icon: "/logo.png", apple: "/logo.png" },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
