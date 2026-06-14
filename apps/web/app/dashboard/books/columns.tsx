"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Check, Copy, MoreHorizontal, Trash2, BookOpen } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { useEffect, useState } from "react"
import { Badge } from "@workspace/ui/components/badge"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { API_URL, useAuth } from "@/components/auth"
import { EditBookForm } from "@/components/forms/edit-book-form"

import type { Book } from "@/lib/book-data"
export type { Book }

export const BOOKS_QUERY_KEY = ["books"]

export function useBooks() {
  const queryClient = useQueryClient()
  const { accessToken } = useAuth()

  const query = useQuery({
    queryKey: BOOKS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/book`, {
        method: "GET",
      })
      if (!res.ok) {
        throw new Error("Failed to fetch books")
      }
      return (await res.json()) as Book[]
    },
  })

  const updateBook = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<Book>
    }) => {
      const res = await fetch(`${API_URL}/book/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        throw new Error("Failed to update book")
      }
      return (await res.json()) as Book
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: BOOKS_QUERY_KEY })

      const previous = queryClient.getQueryData<Book[]>(BOOKS_QUERY_KEY)

      queryClient.setQueryData<Book[]>(
        BOOKS_QUERY_KEY,
        (old = []) => old.map((book) => (book.id === id ? { ...book, ...data } : book))
      )

      return { previous }
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(BOOKS_QUERY_KEY, context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY })
    },
  })

  const deleteBook = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/book/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken?.token}`,
        },
      })
      if (!res.ok) {
        throw new Error("Failed to delete book")
      }
      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: BOOKS_QUERY_KEY })

      const previous = queryClient.getQueryData<Book[]>(BOOKS_QUERY_KEY)

      queryClient.setQueryData<Book[]>(BOOKS_QUERY_KEY, (old = []) =>
        old.filter((book) => book.id !== id)
      )

      return { previous }
    },
    onError: (error, id, context) => {
      queryClient.setQueryData(BOOKS_QUERY_KEY, context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY })
    },
  })

  return {
    books: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    updateBook: updateBook.mutate,
    deleteBook: deleteBook.mutate,
    isUpdating: updateBook.isPending,
    isDeleting: deleteBook.isPending,
    data: query.data,
  }
}

export function useBooksSSE() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const sse = new EventSource(`${API_URL}/sse`)

    sse.addEventListener("connected", () => {
      console.log("SSE connected")
    })

    sse.addEventListener("books-updated", () => {
      console.log("books updated")
      queryClient.invalidateQueries({
        queryKey: BOOKS_QUERY_KEY,
      })
    })

    sse.onerror = (err) => {
      console.error("SSE error", err)
    }

    return () => sse.close()
  }, [queryClient])
}

export const columnTitles = {
  title: "Title",
  price: "Price",
  categories: "Categories",
  publishedYear: "Year",
} satisfies Partial<Record<string, string>>

export const columns: ColumnDef<Book>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.title} />
    ),
    cell: ({ row }) => {
      const book = row.original
      return (
        <div className="flex flex-col">
          <span className="font-bold">{book.title}</span>
          <span className="text-sm text-muted-foreground">{book.author}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.price} />
    ),
    cell: ({ row }) => {
      const book = row.original
      return (
        <div className="flex flex-col">
          <span>{book.price.toFixed(2)} €</span>
          {book.originalPrice !== undefined && (
            <span className="text-sm text-muted-foreground line-through">
              {book.originalPrice.toFixed(2)} €
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "categories",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.categories} />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const categories = row.original.categories
      const visible = categories.slice(0, 2)
      const rest = categories.length - 2

      return (
        <div className="flex flex-wrap gap-1">
          {visible.map((cat) => (
            <Badge key={cat} variant="secondary">
              {cat}
            </Badge>
          ))}
          {rest > 0 && <Badge variant="outline">+{rest}</Badge>}
        </div>
      )
    },
  },
  {
    id: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => {
      const book = row.original
      return (
        <div className="flex flex-wrap gap-1">
          {book.featured && (
            <Badge variant="secondary" className="text-xs">
              Featured
            </Badge>
          )}
          {book.bestseller && (
            <Badge variant="secondary" className="text-xs">
              Bestseller
            </Badge>
          )}
          {book.newRelease && (
            <Badge variant="secondary" className="text-xs">
              New Release
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "publishedYear",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.publishedYear} />
    ),
  },
  {
    id: "action",
    cell: ({ row }) => {
      const book = row.original
      const bookId = book.id.slice(0, 8)

      const [open, setOpen] = useState<boolean>(false)
      const [confirmText, setConfirmText] = useState<string>("")
      const [copied, setCopied] = useState<boolean>(false)

      const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text)

        setCopied(true)

        setTimeout(() => {
          setCopied(false)
        }, 3000)
      }

      const { deleteBook, updateBook } = useBooks()

      return (
        <div className="flex justify-end">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <EditBookForm book={book} />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <BookOpen /> Flags
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => {
                        updateBook({ id: book.id, data: { featured: !book.featured } })
                        setOpen(false)
                      }}
                    >
                      Toggle Featured
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        updateBook({ id: book.id, data: { bestseller: !book.bestseller } })
                        setOpen(false)
                      }}
                    >
                      Toggle Bestseller
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        updateBook({ id: book.id, data: { newRelease: !book.newRelease } })
                        setOpen(false)
                      }}
                    >
                      Toggle New Release
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={(e) => {
                      e.preventDefault()
                    }}
                  >
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                      <Trash2 />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete book?</AlertDialogTitle>
                    <AlertDialogDescription className="flex flex-col gap-1.5">
                      <span className="flex flex-col gap-1.5">
                        <span>
                          <span>
                            Are you sure you want to remove the book? Once
                            removed the book will no longer be accessible.
                          </span>
                        </span>
                        <span className="text-destructive">
                          This can not be undone!
                        </span>
                      </span>
                      <span className="flex items-center text-sm font-semibold">
                        Type
                        <code
                          onClick={() => handleCopy(bookId)}
                          className="relative mx-[0.3rem] flex cursor-pointer items-center rounded bg-muted px-[0.3rem] py-[0.2rem]"
                        >
                          {copied ? (
                            <Check className="h-3.5 text-green-400 dark:text-green-500" />
                          ) : (
                            <Copy className="h-3.5" />
                          )}
                          {bookId}
                        </code>
                        to confirm.
                      </span>
                      <Input
                        placeholder="Enter confirmation..."
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                      />
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmText("")}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      disabled={confirmText !== bookId}
                      onClick={() => {
                        setConfirmText("")
                        setOpen(false)
                        deleteBook(book.id)
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
