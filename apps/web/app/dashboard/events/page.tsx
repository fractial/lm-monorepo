"use client"

import { DataTable } from "@/app/dashboard/events/data-table"
import { columns, useEvents, useEventsSSE } from "@/app/dashboard/events/columns"

export default function EventsPage() {
  useEventsSSE()
  const { events } = useEvents()

  return <DataTable columns={columns} data={events} />
}