"use client"

import { DataTable } from "@/app/dashboard/books/data-table"
import { columns, useBooks, useBooksSSE } from "@/app/dashboard/books/columns"

export default function BooksPage() {
  useBooksSSE()
  const { books } = useBooks()

  return <DataTable columns={columns} data={books} />
}