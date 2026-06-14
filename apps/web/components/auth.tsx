"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"

export const API_URL = "http://localhost:3001"

const AUTH_STORAGE_KEY = "authState"

type AccessTokenData = {
  id: string
  createdAt: number
  expiresAt: number
  data: {
    sub: string
    scope: string[]
    // add more fields here if your backend returns them later
    [key: string]: unknown
  }
  token: string
}

type LoginResponse = {
  accessToken: AccessTokenData
  refreshSession?: unknown
}

type AuthState = {
  accessToken: AccessTokenData | null
  user: AccessTokenData["data"] | null
}

type AuthContextType = {
  isAuthenticated: boolean
  authReady: boolean
  accessToken: AccessTokenData | null
  user: AccessTokenData["data"] | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setAuthFromLoginResponse: (response: LoginResponse) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectSearchParam = searchParams.get("redirect")

  const [authReady, setAuthReady] = useState(false)
  const [accessToken, setAccessToken] = useState<AccessTokenData | null>(null)
  const [user, setUser] = useState<AccessTokenData["data"] | null>(null)

  const isAuthenticated = !!accessToken

  const persistAuth = (nextAccessToken: AccessTokenData | null) => {
    setAccessToken(nextAccessToken)
    setUser(nextAccessToken?.data ?? null)

    if (nextAccessToken) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAccessToken))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }

  const setAuthFromLoginResponse = useCallback((response: LoginResponse) => {
    persistAuth(response.accessToken)
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY)
      if (!raw) {
        setAuthReady(true)
        return
      }

      const parsed = JSON.parse(raw) as AccessTokenData
      if (parsed?.data?.sub) {
        setAccessToken(parsed)
        setUser(parsed.data)
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    } finally {
      setAuthReady(true)
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        throw new Error("Login failed")
      }

      const data = (await res.json()) as LoginResponse
      persistAuth(data.accessToken)

      toast.success("Login successful")

      const redirectTo = redirectSearchParam
        ? decodeURIComponent(redirectSearchParam)
        : "/"

      router.replace(redirectTo)
    },
    [redirectSearchParam, router]
  )

  const logout = useCallback(async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })

    persistAuth(null)
    router.replace("/")
  }, [router])

  const value = useMemo(
    () => ({
      isAuthenticated,
      authReady,
      accessToken,
      user,
      login,
      logout,
      setAuthFromLoginResponse,
    }),
    [
      isAuthenticated,
      authReady,
      accessToken,
      user,
      login,
      logout,
      setAuthFromLoginResponse,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
