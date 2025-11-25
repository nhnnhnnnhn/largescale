import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"
import { FilterProvider } from "@/lib/filter-context"
import { ReduxProvider } from "@/components/providers/ReduxProvider"

const inter = Inter({ subsets: ["latin"] })
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "UK Car Sales Dashboard | MongoDB Analytics",
  description: "Interactive dashboard for exploring UK automotive sales data with MongoDB",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ReduxProvider>
          <FilterProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 ml-64">{children}</main>
            </div>
          </FilterProvider>
        </ReduxProvider>
        <Analytics />
      </body>
    </html>
  )
}
