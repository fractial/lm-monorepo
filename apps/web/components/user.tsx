"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { API_URL, useAuth } from "@/components/auth"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { initials, type User, useUsers } from "@/app/dashboard/users/columns"
import { useEffect, useState } from "react"

export function User() {
  const {logout, isAuthenticated, accessToken } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleLogin = () => {
    const queryString = searchParams.toString()
    const currentPath = queryString ? `${pathname}?${queryString}` : pathname
    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
  }

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchAsync = async () => {
      const res = await fetch(`${API_URL}/user/${accessToken?.data.sub}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken?.token}`,
        },
      })
      if (!res.ok) {
        throw new Error("Failed to fetch users")
      }
      setUser(await res.json())
    }

    fetchAsync()
  }, [accessToken?.data.sub, accessToken?.token])

  return (
    <>
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarFallback>{user?.name ?  initials(user.name) : "?"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-32">
            <DropdownMenuGroup>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onClick={() => logout()}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button onClick={handleLogin}>Login</Button>
      )}
    </>
  )
}