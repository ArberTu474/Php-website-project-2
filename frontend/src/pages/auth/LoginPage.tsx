import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useAuthStore } from "@/store/authStore"
import { authApi } from "@/lib/auth"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// ── Validation schema ─────────────────────────────────────────────────────────
const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(values: FormValues) {
    try {
      const { user, token } = await authApi.login(values)
      login(user, token)
      toast.success(`Welcome back, ${user.first_name}!`)
      navigate("/dashboard")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed.")
    }
  }

  return (
    <div
      style={{
        minHeight: "calc(100dvh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6)",
      }}
    >
      <Card style={{ width: "100%", maxWidth: 420 }}>
        <CardHeader
          style={{ textAlign: "center", paddingBottom: "var(--space-2)" }}
        >
          <CardTitle style={{ fontSize: "var(--text-xl)" }}>
            Welcome back
          </CardTitle>
          <CardDescription>Log in to your Learnify account</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-4)",
              }}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                style={{ marginTop: "var(--space-2)" }}
              >
                {isSubmitting ? "Logging in…" : "Log in"}
              </Button>
            </form>
          </Form>

          <p
            style={{
              textAlign: "center",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
              marginTop: "var(--space-6)",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{ color: "var(--color-primary)", fontWeight: 500 }}
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
