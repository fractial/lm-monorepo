"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Check, Copy, MoreHorizontal, Trash2, User } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { API_URL, useAuth } from "@/components/auth"

export type User = {
  orderCount: number
  canPayOnInvoice: boolean
  isAdmin: boolean
  email: string
  password: string
  name: string
  address?:
    | {
        street: string
        city: string
        zip: string
        country: string
      }
    | undefined
  id: string
  createdAt: string
  updatedAt: string
}

const USERS_QUERY_KEY = ["users"]

export function useUsers() {
  const queryClient = useQueryClient()

  const {accessToken} = useAuth()

  const query = useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken?.token}`,
        },
      })
      if (!res.ok) {
        throw new Error("Failed to fetch users")
      }
      return await res.json() as User[]
    }
  })

  const updateUser = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string,
      data: Partial<User>
    }) => {
      const res = await fetch(`${API_URL}/user/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        throw new Error("Failed to update user")
      }
      return await res.json() as User
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY })

      const previous = queryClient.getQueryData<User[]>(USERS_QUERY_KEY)

      queryClient.setQueryData<User[]>(
        USERS_QUERY_KEY,
        (old = []) =>
          old.map((user) => user.id === id ? {...user, ...data} : user)
      )

      return { previous }
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(USERS_QUERY_KEY, context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    }
  })

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/user/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken?.token}`,
        }
      })
      if (!res.ok) {
        throw new Error("Failed to update user")
      }
      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY })

      const previous = queryClient.getQueryData<User[]>(USERS_QUERY_KEY)

      queryClient.setQueryData<User[]>(USERS_QUERY_KEY, (old = []) =>
        old.filter((user) => user.id !== id)
      )

      return { previous }
    },
    onError: (error, id, context) => {
      queryClient.setQueryData(USERS_QUERY_KEY, context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    },
  })

  return {
    users: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    updateUser: updateUser.mutate,
    deleteUser: deleteUser.mutate,
    isUpdating: updateUser.isPending,
    isDeleting: deleteUser.isPending,
  }
}

export const initials = (s: string) => {
  const w = s.trim().split(/\s+/)

  return (
    (w[0]?.[0] ?? "") + (w.length > 1 ? (w[w.length - 1]?.[0] ?? "") : "")
  ).toUpperCase()
}

export function useUsersSSE() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const sse = new EventSource(`${API_URL}/sse`)

    sse.addEventListener("connected", () => {
      console.log("SSE connected")
    })

    sse.addEventListener("users-updated", () => {
      console.log("users updated")
      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEY,
      })
    })

    sse.onerror = (err) => {
      console.error("SSE error", err)
    }

    return () => sse.close()
  }, [queryClient])
}

export const columnTitles = {
  name: "Name",
  email: "Email",
  isAdmin: "Role",
  createdAt: "Joined date",
} satisfies Partial<Record<keyof User, string>>

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.name} />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback>{initials(row.original.name)}</AvatarFallback>
          </Avatar>
          {row.original.name}
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.email} />
    ),
  },
  {
    accessorKey: "isAdmin",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.isAdmin} />
    ),
    cell: ({ row }) => {
      const user = row.original
      return (
        <span className="capitalize">
          {user.isAdmin ? (
            <Badge>Admin</Badge>
          ) : (
            <Badge variant="secondary">User</Badge>
          )}
        </span>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.createdAt} />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)

      const datePart = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date)

      const timePart = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(date)

      return `${datePart}, ${timePart}`
    },
  },
  {
    id: "action",
    cell: ({ row }) => {
      const user = row.original
      const userId = user.id.slice(0, 8)

      const [open, setOpen] = useState<boolean>(false)
      const [confirmText, setConfirmText] = useState<string>("")
      const [copied, setCopied] = useState<boolean>(false)

      const handleCopy = async (user: string) => {
        await navigator.clipboard.writeText(user)

        setCopied(true)

        setTimeout(() => {
          setCopied(false)
        }, 3000)
      }

      const { deleteUser, updateUser } = useUsers()

      return (
        <div className="flex justify-end">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <User /> Edit
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => {
                      updateUser({
                        id: user.id,
                        data: {
                          isAdmin: !user.isAdmin,
                        }
                      })
                      setOpen(false)
                    }}>Toggle Admin</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={(e) => {
                      e.preventDefault()
                    }}
                  >
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                      <Trash2 />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete user?</AlertDialogTitle>
                    <AlertDialogDescription className="flex flex-col gap-1.5">
                      <span className="flex flex-col gap-1.5">
                        <span>
                          <span>
                            Are you sure you want to remove the user? Once
                            removed the user will no longer be accessible.
                          </span>
                        </span>
                        <span className="text-destructive">
                          This can not be undone!
                        </span>
                      </span>
                      <span className="flex items-center text-sm font-semibold">
                        Type
                        <code
                          onClick={() => handleCopy(userId)}
                          className="relative mx-[0.3rem] flex cursor-pointer items-center rounded bg-muted px-[0.3rem] py-[0.2rem]"
                        >
                          {copied ? (
                            <Check className="h-3.5 text-green-400 dark:text-green-500" />
                          ) : (
                            <Copy className="h-3.5" />
                          )}
                          {userId}
                        </code>
                        to confirm.
                      </span>
                      <Input
                        placeholder="Enter confirmation..."
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                      />
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmText("")}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      disabled={
                        !(
                          confirmText.length >= userId.length &&
                          user.id.includes(confirmText)
                        )
                      }
                      onClick={() => {
                        setConfirmText("")
                        setOpen(false)
                        deleteUser(user.id)
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]