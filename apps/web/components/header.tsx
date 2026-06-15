"use client"

import { User } from "@/components/user"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { BookOpen, Calendar, ShoppingCart } from "lucide-react"
import { useCart } from "@/components/cart"

const linkList = [
  {
    title: "Bücher",
    icon: BookOpen,
    href: "/search",
  },
  {
    title: "Events",
    icon: Calendar,
    href: "/events",
  },
]

export default function Header() {
  const { setIsOpen, itemCount } = useCart()

  return (
    <header className="relative flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <Link href="/" className="z-20">
          <span className="font-heading text-2xl font-bold whitespace-normal sm:whitespace-nowrap">
            Literaturhaus München
          </span>
      </Link>
      <ul className="absolute inset-0 z-10 hidden items-center justify-center gap-2 lg:flex">
        {linkList.map((link) => (
          <Link href={link.href} key={link.title} className="z-50">
            <Button variant="link" size="sm">
              {link.title}
            </Button>
          </Link>
        ))}
      </ul>
      <div className="z-20 ml-auto flex items-center gap-2 px-4">
        <ul className="flex items-center gap-2 lg:hidden">
          {linkList.map((link) => (
            <Link href={link.href} key={link.title} className="z-50">
              <Button variant="outline" size="icon">
                <link.icon />
              </Button>
            </Link>
          ))}
        </ul>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          onClick={() => setIsOpen(true)}
        >
          <ShoppingCart />
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </Button>
        <User />
      </div>
    </header>
  )
}