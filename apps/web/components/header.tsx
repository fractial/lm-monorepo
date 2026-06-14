"use client"

import { User } from "@/components/user"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { BookOpen, Calendar, ShoppingCart } from "lucide-react"

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
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="font-heading text-2xl font-bold whitespace-normal sm:whitespace-nowrap">
        Literaturhaus München
      </div>
      <ul className="absolute inset-0 -z-50 hidden items-center justify-center gap-2 lg:flex">
        {linkList.map((link) => (
          <Link href={link.href} key={link.title}>
            <Button variant="link" size="sm">
              {link.title}
            </Button>
          </Link>
        ))}
      </ul>
      <div className="ml-auto flex items-center gap-2 px-4">
        <ul className="flex items-center gap-2 lg:hidden">
          {linkList.map((link) => (
            <Link href={link.href} key={link.title}>
              <Button variant="outline" size="icon">
                <link.icon />
              </Button>
            </Link>
          ))}
        </ul>
        <Button variant="outline" size="icon">
          <ShoppingCart />
        </Button>
        <User />
      </div>
    </header>
  )
}