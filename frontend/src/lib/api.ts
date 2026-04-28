import axios, { AxiosError } from "axios"
import type { ApiSuccess } from "@/types"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
})

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = useAuthToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Unwrap { data: ... } envelope so callers get the payload directly
api.interceptors.response.use(
  (response) => {
    const body = response.data as ApiSuccess<unknown>
    if (body && typeof body === "object" && "data" in body) {
      response.data = body.data
    }
    return response
  },
  (error: AxiosError<{ error: string }>) => {
    // Attach a clean message to every error
    const message = error.response?.data?.error ?? "Something went wrong."
    return Promise.reject(new Error(message))
  }
)

// Read token from Zustand store outside of React tree
// (set in Step 7 when we build authStore)
let _tokenGetter: () => string | null = () => null
export const setTokenGetter = (fn: () => string | null) => {
  _tokenGetter = fn
}
const useAuthToken = () => _tokenGetter()

export default api
