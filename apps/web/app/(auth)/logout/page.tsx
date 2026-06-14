"use client"

import { useAuth } from "@/components/auth"

export default function LogoutPage() {
  const { logout } = useAuth()

  logout()
}