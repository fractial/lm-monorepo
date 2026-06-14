"use client"

import { Milestone } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { ComponentProps } from "react"
import Link from "next/link"
import { API_URL, useAuth } from "@/components/auth"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as v from "valibot"
import { useSearchParams } from "next/navigation"

export const signupFormSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, "Please enter your name.")),
  email: v.pipe(v.string(), v.email("Please enter a valid email address.")),
  password: v.pipe(
    v.string(),
    v.minLength(8, "Password must be at least 8 characters long.")
  ),
})

export function SignupForm({
  className,
  ...props
}: ComponentProps<"div">) {
  const { login } = useAuth()
  const searchParams = useSearchParams()
  const redirectSearchParam = searchParams.get("redirect")

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signupFormSchema,
    },
    onSubmit: async ({ value }) => {
      const res = await fetch(`${API_URL}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(value),
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error.message)
        return
      }

      await login(value.email, value.password)
    },
  })

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form
        id="signup-form"
        onSubmit={async (e) => {
          e.preventDefault()
          await form.handleSubmit()
        }}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <Milestone className="size-6" />
              </div>
              <span className="sr-only">Literaturhaus München</span>
            </a>
            <h1 className="font-heading text-xl font-bold">
              Welcome to the Literaturhaus München
            </h1>
            <FieldDescription>
              Already have an account?{" "}
              <Link
                href={{
                  pathname: "/login",
                  query: {
                    redirect: redirectSearchParam,
                  },
                }}
              >
                Login
              </Link>
            </FieldDescription>
          </div>
          <form.Field
            name="name"
            children={(field) => {
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
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          ></form.Field>
          <form.Field
            name="email"
            children={(field) => {
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
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          ></form.Field>
          <form.Field
            name="password"
            children={(field) => {
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
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          ></form.Field>
          <Field>
            <Button type="submit" form="signup-form">
              Sign up
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
