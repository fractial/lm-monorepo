"use client"

import { ShoppingBag, Check } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useState, useEffect } from "react"
import { Book } from "@/lib/book-data"
import { useCart } from "@/components/cart"

interface BookActionsProps {
  book: Book
}

export function BookActions({ book }: BookActionsProps) {
  const [mounted, setMounted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addToCart } = useCart()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAddToCart = () => {
    addToCart({ id: book.id, title: book.title, author: book.author, price: book.price, coverImage: book.coverImage })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  if (!mounted) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="h-14 flex-1 text-base">
          In den Warenkorb
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        size="lg"
        className="h-14 flex-1 gap-2 text-base"
        onClick={handleAddToCart}
      >
        {addedToCart ? (
          <>
            <Check className="h-5 w-5" />
            Hinzugefügt
          </>
        ) : (
          <>
            <ShoppingBag className="h-5 w-5" />
            In den Warenkorb
          </>
        )}
      </Button>
    </div>
  )
}
