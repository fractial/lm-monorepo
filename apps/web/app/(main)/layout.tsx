"use client"

import { ReactNode } from "react"
import Header from "@/components/header"

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Header />
        </div>
      </div>

      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
