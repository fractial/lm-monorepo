"use client"

import Image from "next/image"
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { useCart } from "@/lib/cart-context"
import { Badge } from "@workspace/ui/components/badge"

export function CartSheet() {
  const { items, itemCount, total, removeFromCart, updateQuantity, clearCart } =
    useCart()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {itemCount > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]">
              {itemCount > 99 ? "99+" : itemCount}
            </Badge>
          )}
          <span className="sr-only">Warenkorb öffnen</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col sm:max-w-md" side="right">
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <SheetTitle className="font-serif text-xl">
            Warenkorb{" "}
            {itemCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({itemCount} {itemCount === 1 ? "Artikel" : "Artikel"})
              </span>
            )}
          </SheetTitle>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
              onClick={clearCart}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Alle entfernen
            </Button>
          )}
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-secondary p-6">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Ihr Warenkorb ist leer
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Fügen Sie Bücher hinzu, um sie hier zu sehen.
              </p>
            </div>
            <SheetClose asChild>
              <Button variant="outline" className="mt-2">
                Weiter einkaufen
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* Item List */}
            <div className="flex-1 overflow-y-auto">
              <ul className="space-y-4 pr-1">
                {items.map((item) => (
                  <li key={item.id}>
                    <div className="flex gap-4">
                      {/* Cover */}
                      <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-sm bg-muted">
                        <Image
                          src={item.coverImage}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
                              {item.title}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {item.author}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromCart(item.id)}
                            aria-label={`${item.title} entfernen`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* Quantity + Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-sm border border-border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-none"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              aria-label="Menge verringern"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-none"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              aria-label="Menge erhöhen"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {(item.price * item.quantity).toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </li>
                ))}
              </ul>
            </div>

            {/* Summary + CTA */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Zwischensumme</span>
                <span>{total.toFixed(2)} €</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Versand</span>
                <span className="text-green-600 dark:text-green-400">
                  Kostenlos
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <span>Gesamt</span>
                <span className="text-lg">{total.toFixed(2)} €</span>
              </div>
              <Button size="lg" className="w-full gap-2 text-base">
                Zur Kasse
              </Button>
              <SheetClose asChild>
                <Button variant="outline" size="lg" className="w-full text-base">
                  Weiter einkaufen
                </Button>
              </SheetClose>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
