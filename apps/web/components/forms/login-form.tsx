"use client"

import { LogIn } from "lucide-react"

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
import * as v from "valibot"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import { useAuth } from "@/components/auth"
import { redirect, useSearchParams } from "next/navigation"

const loginFormSchema = v.object({
  email: v.pipe(
    v.string(),
    v.email("Please enter a valid email address."),
  ),
  password: v.pipe(
    v.string(),
    v.minLength(8, "Password must be at least 8 characters long."),
  )
})

export function LoginForm({
  className,
  ...props
}: ComponentProps<"div">) {
  const {login} = useAuth()
  const searchParams = useSearchParams()
  const redirectSearchParam = searchParams.get("redirect")

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginFormSchema,
    },
    onSubmit: async ({ value }) => {
      await login(value.email, value.password)
    },
  })

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form
        id="login-form"
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
                <LogIn className="size-6" />
              </div>
              <span className="sr-only">Literaturhaus München</span>
            </a>
            <h1 className="font-heading text-xl font-bold">Welcome back</h1>
            <FieldDescription>
              Don&apos;t have an account?{" "}
              <Link
                href={{
                  pathname: "/signup",
                  query: {
                    redirect: redirectSearchParam,
                  },
                }}
              >
                Sign up
              </Link>
            </FieldDescription>
          </div>
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
            <Button type="submit" form="login-form">
              Login
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
