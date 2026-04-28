import api from "@/lib/api"
import type { User } from "@/types"

interface AuthResponse {
  user: User
  token: string
}

interface RegisterPayload {
  email: string
  password: string
  first_name: string
  last_name: string
  role: "teacher" | "student"
}

interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>("/auth/register", payload).then((r) => r.data),

  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", payload).then((r) => r.data),

  me: () => api.get<User>("/auth/me").then((r) => r.data),
}
