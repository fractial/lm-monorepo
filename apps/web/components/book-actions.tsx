"use client"

import { ShoppingBag, Heart, Check } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useState, useEffect } from "react"
import { Book } from "@/lib/book-data"

interface BookActionsProps {
  book: Book
}

export function BookActions({ book }: BookActionsProps) {
  const [mounted, setMounted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  //const { addToCart, addToWishlist, removeFromWishlist } = useStore()
  //const inWishlist = useStore((state) =>
  //  state.wishlist.some((b) => b.id === book.id)
  //)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAddToCart = () => {
    setAddedToCart(true)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }


  if (!mounted) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="h-14 flex-1 text-base">
          In den Warenkorb
        </Button>
        <Button variant="outline" size="lg" className="h-14 flex-1 text-base">
          Merken
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
