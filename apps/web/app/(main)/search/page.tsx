"use client"

import { getCategories, searchBooks, useBooks } from "@/lib/book-data"
import { useSearchParams, useRouter } from "next/navigation"
import { Fragment, useEffect, useMemo, useState } from "react"
import { Input } from "@workspace/ui/components/input"
import { ChevronDown, Search, X } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { Button } from "@workspace/ui/components/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Slider } from "@workspace/ui/components/slider"
import { BookCard } from "@/components/book-card"

type SortOption = "relevance" | "price-low" | "price-high" | "rating" | "newest"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : []
  )
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30])
  const [minRating, setMinRating] = useState<number>(0)
  const [showBestSellers, setShowBestSellers] = useState(
    searchParams.get("filter") === "bestSeller"
  )
  const [showNewReleases, setShowNewReleases] = useState(
    searchParams.get("filter") === "newRelease"
  )
  const [sortBy, setSortBy] = useState<SortOption>("relevance")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    const category = searchParams.get("category")
    if (category) {
      setSelectedCategories([category])
    }
    const filter = searchParams.get("filter")
    if (filter === "bestSeller") {
      setShowBestSellers(true)
    } else if (filter === "newRelease") {
      setShowNewReleases(true)
    }
  }, [searchParams])

  const { data: books, isLoading, error } = useBooks()

  const filteredBooks = useMemo(() => {
    const baseBooks = books ?? []
    let result = query ? searchBooks(baseBooks, query) : baseBooks

    // Filter by category
    if (selectedCategories.length > 0) {
      result = result.filter((book) =>
        selectedCategories.some((sel) => book.categories.includes(sel))
      )
    }

    // Filter by price
    result = result.filter(
      (book) => book.price >= priceRange[0] && book.price <= priceRange[1]
    )

    // Filter by rating
    if (minRating > 0) {
      result = result.filter((book) => (book.rating ?? 0) >= minRating)
    }

    // Filter by badges
    if (showBestSellers) {
      result = result.filter((book) => book.bestseller)
    }
    if (showNewReleases) {
      result = result.filter((book) => book.newRelease)
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "rating":
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        break
      case "newest":
        result.sort((a, b) => b.publishedYear - a.publishedYear)
        break
      default:
        // Keep relevance order (search order or default)
        break
    }

    return result
  }, [
    books,
    query,
    selectedCategories,
    priceRange,
    minRating,
    showBestSellers,
    showNewReleases,
    sortBy,
  ])

  const clearFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 30])
    setMinRating(0)
    setShowBestSellers(false)
    setShowNewReleases(false)
    setQuery("")
    router.push("/search")
  }

  const activeFilterCount =
    selectedCategories.length +
    (priceRange[0] > 0 || priceRange[1] < 30 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (showBestSellers ? 1 : 0) +
    (showNewReleases ? 1 : 0)

  const FilterContent = () => (
    <div className="space-y-6">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <span className="text-sm font-semibold tracking-wider text-foreground uppercase">
            Kategorien
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="space-y-3">
            {getCategories(books!).slice(1).map((category) => (
              <label
                key={category}
                className="flex cursor-pointer items-center gap-3"
              >
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCategories([...selectedCategories, category])
                    } else {
                      setSelectedCategories(
                        selectedCategories.filter((c) => c !== category)
                      )
                    }
                  }}
                />
                <span className="text-sm text-foreground">{category}</span>
              </label>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <span className="text-sm font-semibold tracking-wider text-foreground uppercase">
            Preisbereich
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="px-1">
            <Slider
              value={priceRange}
              onValueChange={(value) =>
                setPriceRange(value as [number, number])
              }
              max={30}
              step={1}
              className="w-full"
            />
            <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>{priceRange[0]} €</span>
              <span>{priceRange[1]}+ €</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <span className="text-sm font-semibold tracking-wider text-foreground uppercase">
            Mindestbewertung
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="flex flex-wrap gap-2">
            {[0, 4, 4.5, 4.7].map((rating) => (
              <button
                key={rating}
                onClick={() => setMinRating(rating)}
                className={`rounded-sm px-4 py-2 text-sm transition-all ${
                  minRating === rating
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {rating === 0 ? "Alle" : `${rating}+`}
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <span className="text-sm font-semibold tracking-wider text-foreground uppercase">
            Kollektionen
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3">
              <Checkbox
                checked={showBestSellers}
                onCheckedChange={(checked) => setShowBestSellers(!!checked)}
              />
              <span className="text-sm text-foreground">Bestseller</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <Checkbox
                checked={showNewReleases}
                onCheckedChange={(checked) => setShowNewReleases(!!checked)}
              />
              <span className="text-sm text-foreground">Neuerscheinungen</span>
            </label>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {activeFilterCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Alle Filter löschen
        </Button>
      )}
    </div>
  )

  return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Bücher durchsuchen
              </h1>
              <p className="mt-2 text-muted-foreground">
                {filteredBooks.length}{" "}
                {filteredBooks.length === 1 ? "Buch" : "Bücher"} gefunden
              </p>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Titel, Autor oder Kategorie..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 pr-4 pl-11"
              />
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {selectedCategories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="cursor-pointer gap-1 pl-3"
                  onClick={() =>
                    setSelectedCategories(
                      selectedCategories.filter((c) => c !== category)
                    )
                  }
                >
                  {category}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
              {(priceRange[0] > 0 || priceRange[1] < 30) && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer gap-1 pl-3"
                  onClick={() => setPriceRange([0, 30])}
                >
                  {priceRange[0]} € - {priceRange[1]} €
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {minRating > 0 && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer gap-1 pl-3"
                  onClick={() => setMinRating(0)}
                >
                  {minRating}+ Sterne
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {showBestSellers && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer gap-1 pl-3"
                  onClick={() => setShowBestSellers(false)}
                >
                  Bestseller
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {showNewReleases && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer gap-1 pl-3"
                  onClick={() => setShowNewReleases(false)}
                >
                  Neuerscheinungen
                  <X className="h-3 w-3" />
                </Badge>
              )}
            </div>
          )}

          {/* Sort & Filter Controls */}
          <div className="mt-6 flex items-center justify-between border-b border-border pb-4">
            {/* Mobile Filter Button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" className="gap-2">
                  {/*<SlidersHorizontal className="h-4 w-4" />*/}
                  Filter
                  {activeFilterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 w-5 rounded-full p-0"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filter</SheetTitle>
                </SheetHeader>
                <div className="mt-6 px-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort Dropdown */}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sortieren:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="relevance">Relevanz</option>
                <option value="price-low">Preis: Aufsteigend</option>
                <option value="price-high">Preis: Absteigend</option>
                <option value="rating">Beste Bewertung</option>
                <option value="newest">Neueste</option>
              </select>
            </div>
          </div>

          {/* Content Grid */}
          <div className="mt-8 flex gap-12">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 flex-shrink-0 lg:block">
              <FilterContent />
            </aside>

            {/* Book Grid */}
            <div className="flex-1">
              {filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
                  {filteredBooks.map((book) => (
                      <BookCard key={book.id} book={book} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-secondary p-6">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-6 font-serif text-xl font-semibold text-foreground">
                    Keine Bücher gefunden
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Versuchen Sie andere Such- oder Filterkriterien
                  </p>
                  <Button onClick={clearFilters} className="mt-6">
                    Alle Filter löschen
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
  )
}
