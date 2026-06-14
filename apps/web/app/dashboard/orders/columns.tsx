"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Bike,
  Check,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  Info,
  MoreHorizontal,
  Package,
  RotateCcw,
  Trash2,
  Truck,
  User,
  XCircle,
} from "lucide-react"
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { API_URL, useAuth } from "@/components/auth"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"
import { useUsers } from "@/app/dashboard/users/columns"

export type Order = {
  total: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
  status: string
  items: {
    quantity: number
    title: string
    price: number
    id: string
  }[]
  paymentMethod: "card" | "invoice"
  shippingAddress: {
    street: string
    city: string
    zip: string
    country: string
    name: string
  }
  id: string
}

const ORDERS_QUERY_KEY = ["orders"]

export function useOrders() {
  const queryClient = useQueryClient()

  const {accessToken} = useAuth()

  const query = useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/order`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken?.token}`,
        },
      })
      if (!res.ok) {
        throw new Error("Failed to fetch orders")
      }
      return await res.json() as Order[]
    }
  })

  const updateOrder = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string,
      data: Partial<Order>
    }) => {
      const res = await fetch(`${API_URL}/order/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        throw new Error("Failed to update order")
      }
      return await res.json() as Order
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ORDERS_QUERY_KEY })

      const previous = queryClient.getQueryData<Order[]>(ORDERS_QUERY_KEY)

      queryClient.setQueryData<Order[]>(ORDERS_QUERY_KEY, (old = []) =>
        old.map((order) => (order.id === id ? { ...order, ...data } : order))
      )

      return { previous }
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(ORDERS_QUERY_KEY, context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
    }
  })

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/order/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken?.token}`,
        }
      })
      if (!res.ok) {
        throw new Error("Failed to update order")
      }
      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ORDERS_QUERY_KEY })

      const previous = queryClient.getQueryData<Order[]>(ORDERS_QUERY_KEY)

      queryClient.setQueryData<Order[]>(ORDERS_QUERY_KEY, (old = []) =>
        old.filter((order) => order.id !== id)
      )

      return { previous }
    },
    onError: (error, id, context) => {
      queryClient.setQueryData(ORDERS_QUERY_KEY, context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
    },
  })

  return {
    orders: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    updateOrder: updateOrder.mutate,
    deleteOrder: deleteOrder.mutate,
    isUpdating: updateOrder.isPending,
    isDeleting: deleteOrder.isPending,
  }
}

export function useOrdersSSE() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const sse = new EventSource(`${API_URL}/sse`)

    sse.addEventListener("connected", () => {
      console.log("SSE connected")
    })

    sse.addEventListener("orders-updated", () => {
      console.log("orders updated")
      queryClient.invalidateQueries({
        queryKey: ORDERS_QUERY_KEY,
      })
    })

    sse.onerror = (err) => {
      console.error("SSE error", err)
    }

    return () => sse.close()
  }, [queryClient])
}

export function dateFormat(date: Date) {
  const datePart = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)

  const timePart = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date)

  return `${datePart}, ${timePart}`
}

const orderStatus = {
  pending: Clock,
  processing: Package,
  payment_failed: CreditCard,
  shipped: Truck,
  out_for_delivery: Bike,
  delivered: CheckCircle,
  cancelled: XCircle,
  refunded: RotateCcw,
}

function CreatedByCell({ userId }: { userId: string }) {
  const { users } = useUsers()
  return <>{users.find((u) => u.id === userId)?.name ?? "Unknown"}</>
}

export const columnTitles = {
  id: "Order Id",
  items: "Items",
  total: "Total",
  paymentMethod: "Payment",
  status: "Status",
  createdBy: "Created by",
  createdAt: "Created at",
  updatedAt: "Updated at",
} satisfies Partial<Record<keyof Order, string>>

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: columnTitles.id,
    cell: ({ row }) => row.original.id.slice(0, 8),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.createdBy} />
    ),
    cell: ({ row }) => <CreatedByCell userId={row.original.createdBy} />,
  },
  {
    accessorKey: "items",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.items} />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          {row.original.items.reduce((quantity, item) => {
            return quantity + item.quantity
          }, 0)}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
              >
                <Info />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit max-w-none">
              <Table>
                <TableCaption>A list of your items.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Id</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {row.original.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        }).format((Number(item.price) * Number(item.quantity)))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </PopoverContent>
          </Popover>
        </div>
      )},
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.total} />
    ),
    cell: ({ row }) =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(Number(row.original.total.toFixed(2))),
  },
  {
    accessorKey: "paymentMethod",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.paymentMethod} />
    ),
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.paymentMethod === "card" ? "Card" : "Invoice"}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.status} />
    ),
    cell: ({ row }) => {
      const status = row.original.status
      const StatusIcon = orderStatus[status as keyof typeof orderStatus]

      return (
        <Badge variant="outline">
          {StatusIcon && <StatusIcon />} {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.createdAt} />
    ),
    cell: ({ row }) => dateFormat(new Date(row.original.createdAt)),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={columnTitles.updatedAt} />
    ),
    cell: ({ row }) => dateFormat(new Date(row.original.updatedAt)),
  },
  {
    id: "action",
    cell: ({ row }) => {
      const order = row.original
      const orderId = order.id.slice(0, 8)

      const [open, setOpen] = useState<boolean>(false)
      const [confirmText, setConfirmText] = useState<string>("")
      const [copied, setCopied] = useState<boolean>(false)

      const handleCopy = async (order: string) => {
        await navigator.clipboard.writeText(order)

        setCopied(true)

        setTimeout(() => {
          setCopied(false)
        }, 3000)
      }

      const { deleteOrder, updateOrder } = useOrders()

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
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={order.status}
                      onValueChange={(status) =>
                        updateOrder({
                          id: order.id,
                          data: { status },
                        })
                      }
                    >
                      {Object.entries(orderStatus).map(([status, Icon]) => (
                        <DropdownMenuRadioItem
                          key={status}
                          value={status}
                          className="flex items-center gap-2"
                        >
                          <Icon />

                          {status}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
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
                    <AlertDialogTitle>Delete order?</AlertDialogTitle>
                    <AlertDialogDescription className="flex flex-col gap-1.5">
                      <span className="flex flex-col gap-1.5">
                        <span>
                          <span>
                            Are you sure you want to remove the order? Once
                            removed the order will no longer be accessible.
                          </span>
                        </span>
                        <span className="text-destructive">
                          This can not be undone!
                        </span>
                      </span>
                      <span className="flex items-center text-sm font-semibold">
                        Type
                        <code
                          onClick={() => handleCopy(orderId)}
                          className="relative mx-[0.3rem] flex cursor-pointer items-center rounded bg-muted px-[0.3rem] py-[0.2rem]"
                        >
                          {copied ? (
                            <Check className="h-3.5 text-green-400 dark:text-green-500" />
                          ) : (
                            <Copy className="h-3.5" />
                          )}
                          {orderId}
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
                      disabled={
                        !(
                          confirmText.length >= orderId.length &&
                          order.id.includes(confirmText)
                        )
                      }
                      onClick={() => {
                        setConfirmText("")
                        setOpen(false)
                        deleteOrder(order.id)
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