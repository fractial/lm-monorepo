"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { API_URL, useAuth } from "@/components/auth"
import { useCart } from "@/components/cart"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Search, Calendar, MapPin, ShoppingCart } from "lucide-react"
import Link from "next/link"
import type { Event } from "@/app/dashboard/events/columns"

type SortOption = "date-asc" | "date-desc" | "price-low" | "price-high"

export default function EventsPage() {
  const { accessToken } = useAuth()
  const { addToCart } = useCart()

  const [query, setQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("date-asc")

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/event`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken.token}` } : {},
      })
      if (!res.ok) throw new Error("Failed to fetch events")
      return res.json() as Promise<Event[]>
    },
  })

  const filtered = useMemo(() => {
    let result = events ?? []
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.author.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.categories.some((c) => c.toLowerCase().includes(q))
      )
    }
    switch (sortBy) {
      case "date-asc":
        result = [...result].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        break
      case "date-desc":
        result = [...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case "price-low":
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result = [...result].sort((a, b) => b.price - a.price)
        break
    }
    return result
  }, [events, query, sortBy])

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-4xl font-extrabold tracking-tight">Events</h1>
            <p className="mt-1 text-muted-foreground">{filtered.length} {filtered.length === 1 ? "Event" : "Events"} gefunden</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Titel, Referent, Ort..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 pl-11"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 border-b border-border pb-4">
          <span className="text-sm text-muted-foreground">Sortieren:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="date-asc">Datum: Aufsteigend</option>
            <option value="date-desc">Datum: Absteigend</option>
            <option value="price-low">Preis: Aufsteigend</option>
            <option value="price-high">Preis: Absteigend</option>
          </select>
        </div>

        {isLoading ? (
          <div className="mt-16 flex justify-center text-muted-foreground">Events werden geladen...</div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-secondary p-6">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium">Keine Events gefunden</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <div key={event.id} className="group relative rounded-lg border border-border bg-card flex flex-col overflow-hidden">
                <Link href={`/events/${event.id}`} className="flex flex-col gap-3 p-6 flex-1">
                  <div className="flex flex-wrap gap-1">
                    {event.categories.slice(0, 2).map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                    ))}
                  </div>
                  <h3 className="font-heading text-lg font-bold group-hover:text-primary transition-colors">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.author}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    {new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.date))}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {event.location}
                  </div>
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <div>
                      <span className="font-semibold">{event.price.toFixed(2)} €</span>
                      {event.originalPrice !== undefined && (
                        <span className="ml-2 text-sm text-muted-foreground line-through">{event.originalPrice.toFixed(2)} €</span>
                      )}
                    </div>
                    {event.availableSeats === 0
                      ? <Badge variant="destructive">Ausverkauft</Badge>
                      : <Badge variant="secondary">{event.availableSeats} frei</Badge>
                    }
                  </div>
                </Link>
                <div className="px-6 pb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    disabled={event.availableSeats === 0}
                    onClick={() => addToCart({ id: event.id, title: event.title, author: event.author, price: event.price })}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    In den Warenkorb
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
