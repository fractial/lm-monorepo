"use client"

import Link from "next/link"
import { useBooks } from "@/lib/book-data"
import { useQuery } from "@tanstack/react-query"
import { API_URL, useAuth } from "@/components/auth"
import { BookCard } from "@/components/book-card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Calendar, MapPin, ArrowRight, BookOpen } from "lucide-react"
import type { Event } from "@/app/dashboard/events/columns"

export default function HomePage() {
  const { data: books } = useBooks()
  const { accessToken } = useAuth()

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/event`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken.token}` } : {},
      })
      if (!res.ok) return []
      return res.json() as Promise<Event[]>
    },
  })

  const featuredBooks = books?.filter((b) => b.featured).slice(0, 4) ?? []
  const upcomingEvents = events?.slice(0, 3) ?? []

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-32 text-center">
        <h1 className="font-heading text-5xl font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
          Literaturhaus München
        </h1>
        <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
          Ihre Anlaufstelle für Bücher, Lesungen und literarische Events in München.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/search">Bücher entdecken</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/events">Alle Events</Link>
          </Button>
        </div>
      </section>

      {/* Featured Books */}
      {featuredBooks.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-3xl font-bold">Empfehlungen</h2>
              </div>
              <Button asChild variant="ghost">
                <Link href="/search" className="flex items-center gap-1">
                  Alle Bücher <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:gap-8">
              {featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-3xl font-bold">Kommende Events</h2>
              </div>
              <Button asChild variant="ghost">
                <Link href="/events" className="flex items-center gap-1">
                  Alle Events <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="group">
                  <div className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md flex flex-col gap-3">
                    <div className="flex flex-wrap gap-1">
                      {event.categories.slice(0, 2).map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                      ))}
                    </div>
                    <h3 className="font-heading text-lg font-bold group-hover:text-primary transition-colors">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">{event.author}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.date))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <span className="font-semibold">{event.price.toFixed(2)} €</span>
                      {event.availableSeats === 0
                        ? <Badge variant="destructive">Ausverkauft</Badge>
                        : <Badge variant="secondary">{event.availableSeats} Plätze frei</Badge>
                      }
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <p className="font-heading text-lg font-bold">Literaturhaus München</p>
              <p className="mt-2 text-sm text-muted-foreground">Ihr literarisches Zuhause in München seit 1982.</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Navigation</p>
              <ul className="mt-3 space-y-2">
                <li><Link href="/search" className="text-sm text-muted-foreground hover:text-foreground">Bücher</Link></li>
                <li><Link href="/events" className="text-sm text-muted-foreground hover:text-foreground">Events</Link></li>
                <li><Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground">Mein Profil</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold">Kontakt</p>
              <p className="mt-3 text-sm text-muted-foreground">Salvatorplatz 1<br />80333 München</p>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Literaturhaus München. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  )
}
