"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import * as v from "valibot"
import { toast } from "sonner"
import { Plus, X, Pencil } from "lucide-react"

import { useBooks, type Book } from "@/app/dashboard/books/columns"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Textarea } from "@workspace/ui/components/textarea"
import { Checkbox } from "@workspace/ui/components/checkbox"
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
import { DropdownMenuItem } from "@workspace/ui/components/dropdown-menu"

const editBookSchema = v.object({
  title: v.pipe(v.string(), v.nonEmpty(), v.maxLength(256)),
  author: v.pipe(v.string(), v.nonEmpty(), v.maxLength(128)),
  price: v.pipe(v.number(), v.minValue(0), v.maxValue(9999)),
  originalPrice: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(9999))),
  coverImage: v.pipe(v.string(), v.nonEmpty(), v.url()),
  description: v.pipe(v.string(), v.nonEmpty(), v.maxLength(1024)),
  rating: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(5))),
  reviews: v.optional(v.pipe(v.number(), v.minValue(0))),
  publishedYear: v.pipe(v.number(), v.minValue(0)),
  pages: v.pipe(v.number(), v.minValue(0)),
  isbn: v.string(),
  language: v.pipe(v.string(), v.nonEmpty()),
  publisher: v.pipe(v.string(), v.nonEmpty()),
  featured: v.boolean(),
  bestseller: v.boolean(),
  newRelease: v.boolean(),
})

interface EditBookFormProps {
  book: Book
}

export function EditBookForm({ book }: EditBookFormProps) {
  const { updateBook } = useBooks()
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<string[]>(book.categories)
  const [categoryInput, setCategoryInput] = useState("")

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
      title: book.title,
      author: book.author,
      price: book.price,
      originalPrice: book.originalPrice,
      coverImage: book.coverImage,
      description: book.description,
      rating: book.rating,
      reviews: book.reviews,
      publishedYear: book.publishedYear,
      pages: book.pages,
      isbn: book.isbn,
      language: book.language,
      publisher: book.publisher,
      featured: book.featured,
      bestseller: book.bestseller,
      newRelease: book.newRelease,
    },
    validators: { onSubmit: editBookSchema },
    onSubmit: async ({ value }) => {
      updateBook({
        id: book.id,
        data: { ...value, categories },
      })
      toast.success("Book updated")
      setOpen(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Pencil className="h-4 w-4" /> Edit Details
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Book</DialogTitle>
          <DialogDescription>Update the book details below.</DialogDescription>
        </DialogHeader>

        <form
          id={`edit-book-form-${book.id}`}
          onSubmit={async (e) => {
            e.preventDefault()
            await form.handleSubmit()
          }}
          className="flex flex-col gap-6"
        >
          <FieldGroup>
            <form.Field name="title">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="author">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Author</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <FieldGroup className="grid grid-cols-2 gap-4">
              <form.Field name="price">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Price (€)</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value === "" ? 0 : Number(e.target.value))}
                        type="number"
                        min={0}
                        max={9999}
                        step={0.01}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name="originalPrice">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Original Price (€) <Badge variant="outline" className="ml-auto">Optional</Badge>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        type="number"
                        min={0}
                        max={9999}
                        step={0.01}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>
            </FieldGroup>

            <form.Field name="coverImage">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Cover Image URL</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="description">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      rows={3}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <FieldGroup className="grid grid-cols-3 gap-4">
              <form.Field name="publishedYear">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Year</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value === "" ? 0 : Number(e.target.value))}
                        type="number"
                        min={0}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name="pages">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Pages</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value === "" ? 0 : Number(e.target.value))}
                        type="number"
                        min={0}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name="isbn">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>ISBN</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        autoComplete="off"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>
            </FieldGroup>

            <FieldGroup className="grid grid-cols-2 gap-4">
              <form.Field name="publisher">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Publisher</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        autoComplete="off"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name="language">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Language</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        autoComplete="off"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>
            </FieldGroup>

            <FieldGroup className="grid grid-cols-2 gap-4">
              <form.Field name="rating">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Rating <Badge variant="outline" className="ml-auto">Optional</Badge>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        type="number"
                        min={0}
                        max={5}
                        step={0.1}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name="reviews">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Reviews <Badge variant="outline" className="ml-auto">Optional</Badge>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        type="number"
                        min={0}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>
            </FieldGroup>

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

            <div className="flex gap-6">
              <form.Field name="featured">
                {(field) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id={`${book.id}-featured`}
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked === true)}
                    />
                    <FieldLabel htmlFor={`${book.id}-featured`}>Featured</FieldLabel>
                  </Field>
                )}
              </form.Field>

              <form.Field name="bestseller">
                {(field) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id={`${book.id}-bestseller`}
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked === true)}
                    />
                    <FieldLabel htmlFor={`${book.id}-bestseller`}>Bestseller</FieldLabel>
                  </Field>
                )}
              </form.Field>

              <form.Field name="newRelease">
                {(field) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id={`${book.id}-newRelease`}
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked === true)}
                    />
                    <FieldLabel htmlFor={`${book.id}-newRelease`}>New Release</FieldLabel>
                  </Field>
                )}
              </form.Field>
            </div>
          </FieldGroup>

          <DialogFooter className="flex !justify-between">
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="submit" form={`edit-book-form-${book.id}`}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
