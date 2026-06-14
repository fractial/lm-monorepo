"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Check, Copy, MoreHorizontal, Trash2 } from "lucide-react"
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
import { Badge } from "@workspace/ui/components/badge"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { API_URL, useAuth } from "@/components/auth"
import { EditEventForm } from "@/components/forms/edit-event-form"

export type Event = {
  id: string
  title: string
  author: string
  date: string
  location: string
  price: number
  originalPrice?: number
  availableSeats: number
  totalSeats: number
  categories: string[]
  description: string
  language: string
}

export const EVENTS_QUERY_KEY = ["events"]

export function useEvents() {
  const queryClient = useQueryClient()
  const { accessToken } = useAuth()

  const query = useQuery({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/event`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken?.token}`,
        },
      })
      if (!res.ok) {
        throw new Error("Failed to fetch events")
      }
      return (await res.json()) as Event[]
    },
  })

  const updateEvent = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<Event>
    }) => {
      const res = await fetch(`${API_URL}/event/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        throw new Error("Failed to update event")
      }
      return (await res.json()) as Event
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: EVENTS_QUERY_KEY })

      const previous = queryClient.getQueryData<Event[]>(EVENTS_QUERY_KEY)

      queryClient.setQueryData<Event[]>(
        EVENTS_QUERY_KEY,
        (old = []) =>
          old.map((event) => (event.id === id ? { ...event, ...data } : event))
      )

      return { previous }
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(EVENTS_QUERY_KEY, context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY })
    },
  })

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/event/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken?.token}`,
        },
      })
      if (!res.ok) {
        throw new Error("Failed to delete event")
      }
      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: EVENTS_QUERY_KEY })

      const previous = queryClient.getQueryData<Event[]>(EVENTS_QUERY_KEY)

      queryClient.setQueryData<Event[]>(EVENTS_QUERY_KEY, (old = []) =>
        old.filter((event) => event.id !== id)
      )

      return { previous }
    },
    onError: (error, id, context) => {
      queryClient.setQueryData(EVENTS_QUERY_KEY, context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY })
    },
  })

  return {
    events: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    updateEvent: updateEvent.mutate,
    deleteEvent: deleteEvent.mutate,
    isUpdating: updateEvent.isPending,
    isDeleting: deleteEvent.isPending,
  }
}

export function useEventsSSE() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const sse = new EventSource(`${API_URL}/sse`)

    sse.addEventListener("connected", () => {
      console.log("SSE connected")
    })

    sse.addEventListener("events-updated", () => {
      console.log("events updated")
      queryClient.invalidateQueries({
        queryKey: EVENTS_QUERY_KEY,
      })
    })

    sse.onerror = (err) => {
      console.error("SSE error", err)
    }

    return () => sse.close()
  }, [queryClient])
}

export function dateFormat(date: Date) {
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
}

export const columnTitles = {
  title: "Title",
  author: "Speaker",
  date: "Date",
  price: "Price",
  seats: "Seats",
} satisfies Partial<Record<string, string>>

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.title} />
    ),
    cell: ({ row }) => {
      const event = row.original
      return (
        <div className="flex flex-col">
          <span className="font-bold">{event.title}</span>
          <span className="text-sm text-muted-foreground">{event.location}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "author",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.author} />
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.date} />
    ),
    cell: ({ row }) => dateFormat(new Date(row.original.date)),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.price} />
    ),
    cell: ({ row }) => {
      const event = row.original
      return (
        <div className="flex flex-col">
          <span>{event.price.toFixed(2)} €</span>
          {event.originalPrice !== undefined && (
            <span className="text-sm text-muted-foreground line-through">
              {event.originalPrice.toFixed(2)} €
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: "seats",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.seats} />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const event = row.original
      return (
        <div className="flex items-center gap-2">
          <span>
            {event.availableSeats} / {event.totalSeats}
          </span>
          {event.availableSeats === 0 ? (
            <Badge variant="destructive">Sold out</Badge>
          ) : (
            <Badge variant="secondary">Available</Badge>
          )}
        </div>
      )
    },
  },
  {
    id: "action",
    cell: ({ row }) => {
      const event = row.original
      const eventId = event.id.slice(0, 8)

      const [open, setOpen] = useState<boolean>(false)
      const [confirmText, setConfirmText] = useState<string>("")
      const [copied, setCopied] = useState<boolean>(false)

      const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text)

        setCopied(true)

        setTimeout(() => {
          setCopied(false)
        }, 3000)
      }

      const { deleteEvent } = useEvents()

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
              <EditEventForm event={event} />
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
                    <AlertDialogTitle>Delete event?</AlertDialogTitle>
                    <AlertDialogDescription className="flex flex-col gap-1.5">
                      <span className="flex flex-col gap-1.5">
                        <span>
                          <span>
                            Are you sure you want to remove the event? Once
                            removed the event will no longer be accessible.
                          </span>
                        </span>
                        <span className="text-destructive">
                          This can not be undone!
                        </span>
                      </span>
                      <span className="flex items-center text-sm font-semibold">
                        Type
                        <code
                          onClick={() => handleCopy(eventId)}
                          className="relative mx-[0.3rem] flex cursor-pointer items-center rounded bg-muted px-[0.3rem] py-[0.2rem]"
                        >
                          {copied ? (
                            <Check className="h-3.5 text-green-400 dark:text-green-500" />
                          ) : (
                            <Copy className="h-3.5" />
                          )}
                          {eventId}
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
                      disabled={confirmText !== eventId}
                      onClick={() => {
                        setConfirmText("")
                        setOpen(false)
                        deleteEvent(event.id)
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
