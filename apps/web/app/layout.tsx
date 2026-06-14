"use client"

import { Geist_Mono, Inter, Playfair_Display } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/components/auth"
import { CartProvider } from "@/components/cart"
import { Toaster } from "sonner"
import { ReactNode } from "react"
import { TooltipProvider } from "@workspace/ui/components/tooltip"

const playfairDisplayHeading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
})

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        playfairDisplayHeading.variable
      )}
    >
      <body>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <CartProvider>
              <TooltipProvider>
                <ThemeProvider>
                  {children}
                </ThemeProvider>
              </TooltipProvider>
            </CartProvider>
          </QueryClientProvider>

          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
