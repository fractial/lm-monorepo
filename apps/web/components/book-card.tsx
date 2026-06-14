"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Heart, ShoppingBag } from "lucide-react"
import { Badge } from "@workspace/ui//components/badge"
import { Button } from "@workspace/ui//components/button"
import { useState, useEffect } from "react"
import { Book } from "@/lib/book-data"

interface BookCardProps {
  book: Book
  featured?: boolean
}

export function BookCard({ book, featured = false }: BookCardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // addToCart(book)
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    //if (inWishlist) {
    //  removeFromWishlist(book.id)
    //} else {
    //  addToWishlist(book)
    //}
  }

  return (
    <div className={`group relative ${featured ? "md:flex md:gap-8" : ""}`}>
      <Link
        href={`/book/${book.id}`}
        className={`block ${featured ? "md:w-64 md:flex-shrink-0" : ""}`}
      >
        <div className="relative overflow-hidden rounded-sm bg-muted">
          <div className="relative aspect-[2/3] w-full">
            <Image
              src={book.coverImage}
              alt={book.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          {book.bestseller && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
              Bestseller
            </Badge>
          )}
          {book.newRelease && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
              Neu
            </Badge>
          )}

          {/* Quick Actions Overlay */}
          {mounted && (
            <div className="absolute right-3 bottom-3 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-sm shadow-md"
                onClick={handleWishlistToggle}
              >
                {/*<Heart className={`h-4 w-4 ${inWishlist ? "fill-current text-primary" : ""}`} />*/}
              </Button>
              <Button
                size="icon"
                className="h-8 w-8 rounded-sm shadow-md"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </Link>

      <div
        className={`mt-4 ${featured ? "md:mt-0 md:flex md:flex-col md:justify-center" : ""}`}
      >
        <Link href={`/apps/web/app/(main)/book/${book.id}`}>
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {book.categories.join(" ")}
          </p>
          <h3
            className={`mt-1 font-serif leading-tight font-bold text-foreground ${
              featured ? "text-2xl md:text-3xl" : "text-lg"
            }`}
          >
            {book.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>
          {featured && (
            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
              {book.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm font-medium">{book.rating}</span>
            </div>
            {book.reviews && (
              <span className="text-sm text-muted-foreground">
                ({book.reviews.toLocaleString("de-DE")} Bewertungen)
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-semibold">
              {book.price.toFixed(2)} €
            </span>
            {book.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {book.originalPrice.toFixed(2)} €
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}
