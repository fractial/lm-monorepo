import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import * as v from "valibot"
import { toast } from "sonner"

import { signupFormSchema } from "@/components/forms/signup-form"
import { addressFormSchema } from "@/components/forms/address-form"
import { API_URL, useAuth } from "@/components/auth"

import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { X } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"

const addUserFormSchema = v.object({
  ...signupFormSchema.entries,
  address: v.optional(addressFormSchema),
  orderCount: v.pipe(v.number(), v.minValue(0)),
  canPayOnInvoice: v.boolean(),
  isAdmin: v.boolean(),
})

type AddressValue = {
  street: string
  city: string
  zip: string
  country: string
}

const emptyAddress: AddressValue = {
  street: "",
  city: "",
  zip: "",
  country: "",
}

type AddUserFormValues = {
  name: string
  email: string
  password: string
  orderCount: number
  canPayOnInvoice: boolean
  isAdmin: boolean
}

export function AddUserForm() {
  const { accessToken } = useAuth()
  const [hasAddress, setHasAddress] = useState(false)
  const [address, setAddress] = useState<AddressValue>(emptyAddress)
  const [open, setOpen] = useState<boolean>(false)

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      orderCount: 0,
      canPayOnInvoice: false,
      isAdmin: false,
    },
    validators: {
      onSubmit: addUserFormSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = {
        ...value,
        ...(hasAddress ? { address } : {}),
      }

      const res = await fetch(`${API_URL}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken?.token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error.message)
        return
      }

      toast.success("User added successfully")
      form.reset()
      setAddress(emptyAddress)
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form
        id="add-user-form"
        onSubmit={async (e) => {
          e.preventDefault()
          await form.handleSubmit()
        }}
        className="flex flex-col gap-6"
      >
        <DialogTrigger asChild>
          <Button>Add</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>
              Fill out all fields to add a new user.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="John Doe"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      type="email"
                      placeholder="m@example.com"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      type="password"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>
            <form.Field name="orderCount">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Order count</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                      aria-invalid={isInvalid}
                      type="number"
                      min={0}
                      placeholder="0"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="canPayOnInvoice">
              {(field) => (
                <Field orientation="horizontal">
                  <Checkbox
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={(checked) =>
                      field.handleChange(checked === true)
                    }
                  />
                  <FieldLabel htmlFor={field.name}>
                    Can pay on invoice
                  </FieldLabel>
                </Field>
              )}
            </form.Field>

            <form.Field name="isAdmin">
              {(field) => (
                <Field orientation="horizontal">
                  <Checkbox
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={(checked) =>
                      field.handleChange(checked === true)
                    }
                  />
                  <FieldLabel htmlFor={field.name}>Admin</FieldLabel>
                </Field>
              )}
            </form.Field>
          </FieldGroup>

          <FieldGroup>
            <Field orientation="horizontal">
              <Checkbox
                id="has-address"
                checked={hasAddress}
                onCheckedChange={(checked) => {
                  const enabled = checked === true
                  setHasAddress(enabled)

                  if (!enabled) {
                    setAddress(emptyAddress)
                  }
                }}
              />
              <FieldLabel htmlFor="has-address">
                Add address{" "}
                <Badge variant="outline" className="ml-auto">
                  Optional
                </Badge>
              </FieldLabel>
            </Field>

            {hasAddress && (
              <>
                <Field>
                  <FieldLabel htmlFor="address.street">
                    Street address
                  </FieldLabel>
                  <Input
                    id="address.street"
                    name="address.street"
                    value={address.street}
                    onChange={(e) =>
                      setAddress((prev) => ({
                        ...prev,
                        street: e.target.value,
                      }))
                    }
                    placeholder="123 Main Street"
                    autoComplete="off"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="address.city">City</FieldLabel>
                  <Input
                    id="address.city"
                    name="address.city"
                    value={address.city}
                    onChange={(e) =>
                      setAddress((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="München"
                    autoComplete="off"
                  />
                </Field>

                <FieldGroup className="grid grid-cols-2 @max-xs:grid-cols-1 @max-xs:gap-6!">
                  <Field>
                    <FieldLabel htmlFor="address.zip">ZIP Code</FieldLabel>
                    <Input
                      id="address.zip"
                      name="address.zip"
                      value={address.zip}
                      onChange={(e) =>
                        setAddress((prev) => ({ ...prev, zip: e.target.value }))
                      }
                      placeholder="35538"
                      autoComplete="off"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="address.country">Country</FieldLabel>
                    <Input
                      id="address.country"
                      name="address.country"
                      value={address.country}
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      placeholder="Deutschland"
                      autoComplete="off"
                    />
                  </Field>
                </FieldGroup>
              </>
            )}
          </FieldGroup>
          <DialogFooter className="flex !justify-between">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" form="add-user-form" onSubmit={() => setOpen(false)}>
              Add user
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
