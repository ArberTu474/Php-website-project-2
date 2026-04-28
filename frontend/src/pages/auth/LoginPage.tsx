import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link, useNavigate } from "react-router-dom"
import toast from "sonner"

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const schema = z.object({
  firstname: z.string().min(1, "First name is required."),
  lastname: z.string().min(1, "Last name is required."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["teacher", "student"], {
    message: "Please select a role.",
  }),
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      role: "student",
    },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: FormValues) {
    try {
      const { user, token } = await authApi.register(values)
      login(user, token)
      toast.success(`Welcome to Learnify, ${user.first_name}!`)
      navigate("/dashboard")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed.")
    }
  }

  return (
    <div className="mt-40 flex items-center justify-center p-6">
      <Card className="w-full max-w-96">
        <CardHeader className="pb-2 text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Join Learnify as a teacher or student
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Name"
                          autoComplete="given-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Surname"
                          autoComplete="family-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I am a</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">
                          Student — I want to learn
                        </SelectItem>
                        <SelectItem value="teacher">
                          Teacher — I want to teach
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>

          <p className="mt-2 text-center">
            Already have an account?{" "}
            <Link to="/login" className="font-medium">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}