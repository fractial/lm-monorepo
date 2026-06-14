"use client"

import { ReactNode } from "react"
import { useRequireAuth } from "@/hooks/use-require-auth"
import Header from "@/components/dashboard/header"

export default function ProfileLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  useRequireAuth()

  return children
}