"use client"

import { useRequireAuth } from "@/hooks/use-require-auth"
import { API_URL, useAuth } from "@/components/auth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"
import * as v from "valibot"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Field, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Separator } from "@workspace/ui/components/separator"
import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Bike, CheckCircle, Clock, CreditCard, Package, RotateCcw, Truck, XCircle } from "lucide-react"
import type { User } from "@/app/dashboard/users/columns"
import type { Order } from "@/app/dashboard/orders/columns"

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

const profileSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty(), v.maxLength(128)),
  email: v.pipe(v.string(), v.nonEmpty(), v.email()),
  password: v.optional(v.pipe(v.string(), v.minLength(8))),
  address: v.optional(v.object({
    street: v.pipe(v.string(), v.nonEmpty()),
    city: v.pipe(v.string(), v.nonEmpty()),
    zip: v.pipe(v.string(), v.nonEmpty()),
    country: v.pipe(v.string(), v.nonEmpty()),
  })),
})

export default function ProfilePage() {
  useRequireAuth()
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  const userId = accessToken?.data.sub

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/user/${userId}`, {
        headers: { Authorization: `Bearer ${accessToken?.token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch user")
      return res.json() as Promise<User>
    },
  })

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    enabled: !!accessToken,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/order`, {
        headers: { Authorization: `Bearer ${accessToken?.token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch orders")
      return res.json() as Promise<Order[]>
    },
  })

  const updateProfile = useMutation({
    mutationFn: async (data: Partial<User> & { password?: string }) => {
      const payload: Record<string, unknown> = {}
      if (data.name) payload.name = data.name
      if (data.email) payload.email = data.email
      if (data.password) payload.password = data.password
      if (data.address) payload.address = data.address
      const res = await fetch(`${API_URL}/user/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { message?: string }).message ?? "Failed to update profile")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] })
      toast.success("Profil aktualisiert")
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  if (userLoading) {
    return <div className="mx-auto max-w-3xl px-6 py-16 text-muted-foreground">Profil wird geladen...</div>
  }

  if (!user) {
    return <div className="mx-auto max-w-3xl px-6 py-16 text-muted-foreground">Kein Profil gefunden.</div>
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
      <h1 className="font-heading text-4xl font-extrabold tracking-tight">Mein Profil</h1>

      <Separator className="my-8" />

      <ProfileForm user={user} updateProfile={updateProfile} />

      <Separator className="my-10" />

      <h2 className="font-heading text-2xl font-bold">Meine Bestellungen</h2>

      {ordersLoading ? (
        <p className="mt-4 text-muted-foreground">Bestellungen werden geladen...</p>
      ) : !orders || orders.length === 0 ? (
        <p className="mt-4 text-muted-foreground">Noch keine Bestellungen vorhanden.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artikel</TableHead>
                <TableHead>Anzahl</TableHead>
                <TableHead>Gesamt</TableHead>
                <TableHead>Zahlung</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const StatusIcon = orderStatus[order.status as keyof typeof orderStatus]
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <ul className="text-sm space-y-0.5">
                        {order.items.map((item) => (
                          <li key={item.id}>{item.title} ×{item.quantity}</li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell>{order.items.reduce((s, i) => s + i.quantity, 0)}</TableCell>
                    <TableCell>{new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.paymentMethod === "card" ? "Karte" : "Rechnung"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        {StatusIcon && <StatusIcon className="h-3 w-3" />}
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function ProfileForm({
  user,
  updateProfile,
}: {
  user: User
  updateProfile: ReturnType<typeof useMutation<void, Error, Partial<User> & { password?: string }>>
}) {
  const form = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      password: "",
      street: user.address?.street ?? "",
      city: user.address?.city ?? "",
      zip: user.address?.zip ?? "",
      country: user.address?.country ?? "",
    },
    validators: { onSubmit: profileSchema },
    onSubmit: async ({ value }) => {
      const payload: Partial<User> & { password?: string } = {
        name: value.name,
        email: value.email,
      }
      if (value.password) payload.password = value.password
      if (value.street || value.city || value.zip || value.country) {
        payload.address = {
          street: value.street,
          city: value.city,
          zip: value.zip,
          country: value.country,
        }
      }
      updateProfile.mutate(payload)
    },
  })

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        await form.handleSubmit()
      }}
      className="space-y-6"
    >
      <h2 className="text-lg font-semibold">Persönliche Daten</h2>
      <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="name">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoComplete="name"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="email">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>E-Mail</FieldLabel>
                <Input
                  id={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoComplete="email"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="password">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid} className="sm:col-span-2">
                <FieldLabel htmlFor={field.name}>
                  Neues Passwort <span className="text-muted-foreground font-normal">(optional)</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Leer lassen um beizubehalten"
                  autoComplete="new-password"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </FieldGroup>

      <h2 className="text-lg font-semibold pt-4">Lieferadresse</h2>
      <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="street">
          {(field) => (
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor={field.name}>Straße</FieldLabel>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Musterstraße 1"
                autoComplete="street-address"
              />
            </Field>
          )}
        </form.Field>
        <form.Field name="city">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Stadt</FieldLabel>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="München"
                autoComplete="address-level2"
              />
            </Field>
          )}
        </form.Field>
        <form.Field name="zip">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>PLZ</FieldLabel>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="80333"
                autoComplete="postal-code"
              />
            </Field>
          )}
        </form.Field>
        <form.Field name="country">
          {(field) => (
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor={field.name}>Land</FieldLabel>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Deutschland"
                autoComplete="country-name"
              />
            </Field>
          )}
        </form.Field>
      </FieldGroup>

      <Button type="submit" disabled={updateProfile.isPending}>
        {updateProfile.isPending ? "Wird gespeichert..." : "Änderungen speichern"}
      </Button>
    </form>
  )
}
