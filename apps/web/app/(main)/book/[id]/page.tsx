"use client"

import Image from "next/image"
import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import { Star, ChevronLeft, Truck, RotateCcw, Shield } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { BookCard } from "@/components/book-card"
import { BookActions } from "@/components/book-actions"
import { useBooks } from "@/lib/book-data"

export default function BookPage() {
  const params = useParams<{ id: string | string[] }>()
  const { data: books, isLoading, error } = useBooks()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <p className="text-muted-foreground">Buch wird geladen...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <p className="text-destructive">Fehler beim Laden des Buches.</p>
        </main>
      </div>
    )
  }

  const book = books?.find((book) => book.id === id)

  if (!book) {
    notFound()
  }

  const relatedBooks =
    books
      ?.filter(
        (b) =>
          b.id !== book.id &&
          Array.isArray(b.categories) &&
          Array.isArray(book.categories) &&
          b.categories.some((category) => book.categories.includes(category))
      )
      .slice(0, 4) ?? []

  return (
    <div className="min-h-screen bg-background">
      <main>
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            Zurück zur Übersicht
          </Link>
        </div>

        <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative">
              <div className="sticky top-24">
                <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-muted">
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                {book.categories.map((category, index) => (
                  <Badge key={index}
                    variant="secondary"
                    className="text-xs tracking-wider uppercase"
                  >{category}</Badge>
                ))}
                {book.bestseller && (
                  <Badge className="bg-primary text-primary-foreground">
                    Bestseller
                  </Badge>
                )}
                {book.newRelease && (
                  <Badge className="bg-accent text-accent-foreground">
                    Neuerscheinung
                  </Badge>
                )}
              </div>

              <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {book.title}
              </h1>

              <p className="mt-2 text-lg text-muted-foreground">
                von {book.author}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(book.rating ?? 0)
                          ? "fill-primary text-primary"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  {book.rating ?? "-"}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({(book.reviews ?? 0).toLocaleString("de-DE")} Bewertungen)
                </span>
              </div>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-foreground">
                  {book.price.toFixed(2)} €
                </span>
                {book.originalPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {book.originalPrice.toFixed(2)} €
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Spare {(book.originalPrice - book.price).toFixed(2)} €
                    </Badge>
                  </>
                )}
              </div>

              <Separator className="my-6" />

              <div>
                <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                  Über dieses Buch
                </h2>
                <p className="mt-3 leading-relaxed text-foreground">
                  {book.description}
                </p>
              </div>

              <div className="mt-8">
                <BookActions book={book} />
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-2 rounded-sm bg-secondary/50 p-4 text-center">
                  <RotateCcw className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    14 Tage Rückgabe
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 rounded-sm bg-secondary/50 p-4 text-center">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Sichere Zahlung
                  </span>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                  Details
                </h2>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Verlag</dt>
                    <dd className="mt-1 font-medium text-foreground">
                      {book.publisher}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Erscheinungsjahr</dt>
                    <dd className="mt-1 font-medium text-foreground">
                      {book.publishedYear}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Seitenanzahl</dt>
                    <dd className="mt-1 font-medium text-foreground">
                      {book.pages}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Sprache</dt>
                    <dd className="mt-1 font-medium text-foreground">
                      {book.language}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">ISBN</dt>
                    <dd className="mt-1 font-medium text-foreground">
                      {book.isbn}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        {relatedBooks.length > 0 && (
          <section className="border-t border-border bg-secondary/30">
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
              <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Mehr aus {book.categories.join(" ")}
              </h2>
              <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:gap-8">
                {relatedBooks.map((relatedBook) => (
                  <BookCard key={relatedBook.id} book={relatedBook} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
