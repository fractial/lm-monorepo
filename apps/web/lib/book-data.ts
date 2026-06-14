"use client"

import { useQuery } from "@tanstack/react-query"

export interface Book {
  title: string
  author: string
  price: number
  originalPrice?: number | undefined
  coverImage: string
  categories: string[]
  description: string
  rating?: number | undefined
  reviews?: number | undefined
  publishedYear: number
  pages: number
  isbn: string
  language: string
  publisher: string
  featured: boolean
  bestseller: boolean
  newRelease: boolean
  id: string
}

export function useBooks() {
  return useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3001/book")
      if (!res.ok) throw new Error("Failed to fetch books")
      return (await res.json()) as Book[]
    },
  })
}

export function getCategories(books?: Book[]): string[] {
  return [...new Set((books ?? []).flatMap((book) => book.categories))]
}

export function searchBooks(books: Book[], query: string): Book[] {
  const lowercaseQuery = query.toLowerCase()
  return books.filter(
    (book) =>
      book.title.toLowerCase().includes(lowercaseQuery) ||
      book.author.toLowerCase().includes(lowercaseQuery) ||
      book.categories.some((category) =>
        category.toLowerCase().includes(lowercaseQuery)
      )
  )
}