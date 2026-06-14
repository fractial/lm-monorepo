"use client"

import { useAuth } from "@/components/auth"
import { useEffect } from "react"

export default function LogoutPage() {
  const { logout } = useAuth()

  useEffect(() => {
    logout()
  }, [logout])

  return null
}