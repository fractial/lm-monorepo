"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import * as v from "valibot"
import { toast } from "sonner"
import { Plus, X } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { API_URL, useAuth } from "@/components/auth"
import { EVENTS_QUERY_KEY } from "@/app/dashboard/events/columns"

import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Textarea } from "@workspace/ui/components/textarea"
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

const addEventFormSchema = v.object({
  title: v.pipe(v.string(), v.nonEmpty(), v.maxLength(256)),
  author: v.pipe(v.string(), v.nonEmpty(), v.maxLength(128)),
  date: v.pipe(v.string(), v.nonEmpty()),
  location: v.pipe(v.string(), v.nonEmpty(), v.maxLength(128)),
  price: v.pipe(v.number(), v.minValue(0), v.maxValue(9999)),
  originalPrice: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(9999))),
  availableSeats: v.pipe(v.number(), v.minValue(0)),
  totalSeats: v.pipe(v.number(), v.minValue(1)),
  description: v.pipe(v.string(), v.nonEmpty(), v.maxLength(1024)),
  language: v.pipe(v.string(), v.nonEmpty(), v.maxLength(128)),
})

export function AddEventForm() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState<boolean>(false)
  const [categories, setCategories] = useState<string[]>([])
  const [categoryInput, setCategoryInput] = useState<string>("")

  const addCategory = () => {
    const trimmed = categoryInput.trim()
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed])
    }
    setCategoryInput("")
  }

  const removeCategory = (cat: string) => {
    setCategories((prev) => prev.filter((c) => c !== cat))
  }

  const form = useForm({
    defaultValues: {
      title: "",
      author: "",
      date: "",
      location: "",
      price: 0,
      originalPrice: undefined as number | undefined,
      availableSeats: 0,
      totalSeats: 1,
      description: "",
      language: "",
    },
    validators: {
      onSubmit: addEventFormSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = {
        ...value,
        date: new Date(value.date).toISOString(),
        categories,
      }

      const res = await fetch(`${API_URL}/event`, {
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

      toast.success("Event added successfully")
      form.reset()
      setCategories([])
      setCategoryInput("")
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY })
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form
        id="add-event-form"
        onSubmit={async (e) => {
          e.preventDefault()
          await form.handleSubmit()
        }}
        className="flex flex-col gap-6"
      >
        <DialogTrigger asChild>
          <Button>Add event</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add event</DialogTitle>
            <DialogDescription>
              Fill out all fields to add a new event.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <form.Field name="title">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Tech Conference 2025"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            <FieldGroup className="grid grid-cols-2 gap-4">
              <form.Field name="author">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Speaker</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Jane Doe"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name="language">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Language</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="English"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>
            </FieldGroup>

            <form.Field name="date">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Date & Time</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      type="datetime-local"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="location">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Location</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Berlin Convention Center"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            <FieldGroup className="grid grid-cols-2 gap-4">
              <form.Field name="price">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Price (€)</FieldLabel>
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
                        max={9999}
                        step={0.01}
                        placeholder="49.99"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name="originalPrice">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Original Price (€){" "}
                        <Badge variant="outline" className="ml-auto">
                          Optional
                        </Badge>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                        aria-invalid={isInvalid}
                        type="number"
                        min={0}
                        max={9999}
                        step={0.01}
                        placeholder="79.99"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>
            </FieldGroup>

            <FieldGroup className="grid grid-cols-2 gap-4">
              <form.Field name="availableSeats">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Available Seats</FieldLabel>
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
                        placeholder="100"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name="totalSeats">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Total Seats</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value === "" ? 1 : Number(e.target.value)
                          )
                        }
                        aria-invalid={isInvalid}
                        type="number"
                        min={1}
                        placeholder="200"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>
            </FieldGroup>

            <form.Field name="description">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="A short description of the event..."
                      rows={3}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            <Field>
              <FieldLabel>Categories</FieldLabel>
              <div className="flex gap-2">
                <Input
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addCategory()
                    }
                  }}
                  placeholder="Add a category..."
                  autoComplete="off"
                />
                <Button type="button" variant="outline" onClick={addCategory}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {categories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="gap-1">
                      {cat}
                      <button
                        type="button"
                        onClick={() => removeCategory(cat)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="flex !justify-between">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" form="add-event-form">
              Add event
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
