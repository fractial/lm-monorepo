"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import * as v from "valibot"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { API_URL, useAuth } from "@/components/auth"
import { useCart } from "@/components/cart"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Field, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Label } from "@workspace/ui/components/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@workspace/ui/components/dialog"
import { Separator } from "@workspace/ui/components/separator"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import type { User } from "@/app/dashboard/users/columns"

const checkoutSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("Name ist erforderlich"), v.maxLength(128)),
  street: v.pipe(v.string(), v.nonEmpty("Straße ist erforderlich")),
  city: v.pipe(v.string(), v.nonEmpty("Stadt ist erforderlich")),
  zip: v.pipe(v.string(), v.nonEmpty("PLZ ist erforderlich")),
  country: v.pipe(v.string(), v.nonEmpty("Land ist erforderlich")),
  paymentMethod: v.union([v.literal("card"), v.literal("invoice")]),
})

interface CheckoutDialogProps {
  trigger: React.ReactNode
}

export function CheckoutDialog({ trigger }: CheckoutDialogProps) {
  const { isAuthenticated, accessToken } = useAuth()
  const { items, total, setIsOpen: setCartOpen, clearCart } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [useExistingAddress, setUseExistingAddress] = useState(true)
  const queryClient = useQueryClient()

  const userId = accessToken?.data.sub

  const { data: user } = useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId && open,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/user/${userId}`, {
        headers: { Authorization: `Bearer ${accessToken?.token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch user")
      return res.json() as Promise<User>
    },
  })

  const placeOrder = useMutation({
    mutationFn: async (payload: {
      items: { id: string; quantity: number }[]
      paymentMethod: "card" | "invoice"
      shippingAddress: { name: string; street: string; city: string; zip: string; country: string }
    }) => {
      const res = await fetch(`${API_URL}/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken?.token}`,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { message?: string }).message ?? "Bestellung fehlgeschlagen")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Bestellung erfolgreich aufgegeben!")
      setOpen(false)
      setCartOpen(false)
      clearCart()
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const form = useForm({
    defaultValues: {
      name: "",
      street: "",
      city: "",
      zip: "",
      country: "",
      paymentMethod: "card" as "card" | "invoice",
    },
    validators: { onSubmit: checkoutSchema },
    onSubmit: async ({ value }) => {
      const address = useExistingAddress && user?.address
        ? { name: user.name, ...user.address }
        : {
            name: value.name,
            street: value.street,
            city: value.city,
            zip: value.zip,
            country: value.country,
          }

      await placeOrder.mutateAsync({
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        paymentMethod: value.paymentMethod,
        shippingAddress: address,
      })
    },
  })

  const handleOpenChange = (next: boolean) => {
    if (next && !isAuthenticated) {
      const queryString = searchParams.toString()
      const currentPath = queryString ? `${pathname}?${queryString}` : pathname
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }
    setOpen(next)
    if (!next) form.reset()
  }

  const hasExistingAddress = !!user?.address

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Kasse</DialogTitle>
          <DialogDescription>Überprüfen und bestätigen Sie Ihre Bestellung.</DialogDescription>
        </DialogHeader>

        {/* Order summary */}
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.title} ×{item.quantity}</span>
              <span className="font-medium">{(item.price * item.quantity).toFixed(2)} €</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Gesamt</span>
            <span>{total.toFixed(2)} €</span>
          </div>
        </div>

        <Separator />

        <form
          id="checkout-form"
          onSubmit={async (e) => {
            e.preventDefault()
            await form.handleSubmit()
          }}
          className="space-y-4"
        >
          {/* Address */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Lieferadresse</p>
            {hasExistingAddress && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="addr-existing"
                    name="addr-choice"
                    value="existing"
                    checked={useExistingAddress}
                    onChange={() => setUseExistingAddress(true)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="addr-existing" className="text-sm cursor-pointer">
                    Gespeicherte Adresse — {user!.address!.street}, {user!.address!.city}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="addr-custom"
                    name="addr-choice"
                    value="custom"
                    checked={!useExistingAddress}
                    onChange={() => setUseExistingAddress(false)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="addr-custom" className="text-sm cursor-pointer">Andere Adresse</Label>
                </div>
              </div>
            )}
          </div>

          {(!hasExistingAddress || !useExistingAddress) && (
            <FieldGroup className="space-y-3">
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
                        placeholder="Max Mustermann"
                        autoComplete="name"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>
              <form.Field name="street">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Straße</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Musterstraße 1"
                        autoComplete="street-address"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>
              <FieldGroup className="grid grid-cols-2 gap-3">
                <form.Field name="city">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Stadt</FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="München"
                          autoComplete="address-level2"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    )
                  }}
                </form.Field>
                <form.Field name="zip">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>PLZ</FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="80333"
                          autoComplete="postal-code"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    )
                  }}
                </form.Field>
              </FieldGroup>
              <form.Field name="country">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Land</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Deutschland"
                        autoComplete="country-name"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>
            </FieldGroup>
          )}

          {/* Payment method */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Zahlungsmethode</p>
            <form.Field name="paymentMethod">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="pay-card"
                      name="paymentMethod"
                      value="card"
                      checked={field.state.value === "card"}
                      onChange={() => field.handleChange("card")}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="pay-card" className="text-sm cursor-pointer">Kreditkarte / Debitkarte</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="pay-invoice"
                      name="paymentMethod"
                      value="invoice"
                      checked={field.state.value === "invoice"}
                      onChange={() => field.handleChange("invoice")}
                      disabled={!user?.canPayOnInvoice}
                      className="h-4 w-4"
                    />
                    <Label
                      htmlFor="pay-invoice"
                      className={`text-sm cursor-pointer ${!user?.canPayOnInvoice ? "text-muted-foreground" : ""}`}
                    >
                      Auf Rechnung {!user?.canPayOnInvoice && "(nicht verfügbar)"}
                    </Label>
                  </div>
                </div>
              )}
            </form.Field>
          </div>
        </form>

        <DialogFooter className="flex !justify-between">
          <DialogClose asChild>
            <Button variant="outline">Abbrechen</Button>
          </DialogClose>
          <Button
            type="submit"
            form="checkout-form"
            disabled={placeOrder.isPending || items.length === 0}
          >
            {placeOrder.isPending ? "Wird verarbeitet..." : `${total.toFixed(2)} € bezahlen`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
