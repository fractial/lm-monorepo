"use client"

import { DataTable } from "@/app/dashboard/orders/data-table"
import {
  columns,
  useOrders,
  useOrdersSSE,
} from "@/app/dashboard/orders/columns"

export default function OrderPage() {
  useOrdersSSE()
  const { orders } = useOrders()

  return <DataTable columns={columns} data={orders} />
}
