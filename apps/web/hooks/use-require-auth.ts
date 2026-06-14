"use client"

import { useAuth } from "@/components/auth"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"

export function useRequireAuth(isAdmin: boolean = false) {
  const { accessToken, authReady } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const hasChecked = useRef(false)

  useEffect(() => {
    if (!authReady) return
    if (hasChecked.current) return
    hasChecked.current = true

    if (!accessToken) {
      const queryString = searchParams.toString()
      const currentPath = queryString ? `${pathname}?${queryString}` : pathname

      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`)
    }
  }, [accessToken, authReady, router, pathname, searchParams])
}
