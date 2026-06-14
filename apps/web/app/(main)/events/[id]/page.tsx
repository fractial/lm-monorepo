"use client"

import { useQuery } from "@tanstack/react-query"
import { API_URL, useAuth } from "@/components/auth"
import { useCart } from "@/components/cart"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { Calendar, MapPin, Users, Globe, ChevronLeft, ShoppingCart } from "lucide-react"
import type { Event } from "@/app/dashboard/events/columns"

export default function EventDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const { accessToken } = useAuth()
  const { addToCart } = useCart()

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
          <p className="text-muted-foreground">Event wird geladen...</p>
        </main>
      </div>
    )
  }

  const event = events?.find((e) => e.id === id)

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
          <p className="text-destructive">Event nicht gefunden.</p>
          <Link href="/events"><Button variant="outline" className="mt-4">Zurück zu Events</Button></Link>
        </main>
      </div>
    )
  }

  const soldOut = event.availableSeats === 0

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
        <Link href="/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ChevronLeft className="h-4 w-4" />
          Zurück zu Events
        </Link>

        <div className="flex flex-wrap gap-2 mb-4">
          {event.categories.map((cat) => (
            <Badge key={cat} variant="secondary" className="text-xs tracking-wider uppercase">{cat}</Badge>
          ))}
        </div>

        <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">{event.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">mit {event.author}</p>

        <div className="mt-8 grid gap-4 rounded-lg border border-border bg-card p-6 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Datum &amp; Uhrzeit</p>
              <p className="text-sm font-medium">{new Intl.DateTimeFormat("de-DE", { dateStyle: "full", timeStyle: "short" }).format(new Date(event.date))}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Veranstaltungsort</p>
              <p className="text-sm font-medium">{event.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Verfügbare Plätze</p>
              <p className="text-sm font-medium">{event.availableSeats} von {event.totalSeats}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Sprache</p>
              <p className="text-sm font-medium">{event.language}</p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div>
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Beschreibung</h2>
          <p className="mt-3 leading-relaxed">{event.description}</p>
        </div>

        <Separator className="my-8" />

        <div className="flex items-center justify-between gap-6 rounded-lg border border-border bg-card p-6">
          <div>
            <p className="text-3xl font-semibold">{event.price.toFixed(2)} €</p>
            {event.originalPrice !== undefined && (
              <p className="text-sm text-muted-foreground line-through">{event.originalPrice.toFixed(2)} €</p>
            )}
            {soldOut && <Badge variant="destructive" className="mt-2">Ausverkauft</Badge>}
          </div>
          <Button
            size="lg"
            disabled={soldOut}
            onClick={() => addToCart({ id: event.id, title: event.title, author: event.author, price: event.price })}
            className="gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            {soldOut ? "Ausverkauft" : "Ticket kaufen"}
          </Button>
        </div>
      </main>
    </div>
  )
}
