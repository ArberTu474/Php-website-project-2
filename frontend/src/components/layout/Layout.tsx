import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

export default function Layout() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          logout()
          navigate("/login")
        }
        return Promise.reject(err)
      }
    )
    // Clean up on unmount
    return () => api.interceptors.response.eject(interceptor)
  }, [logout, navigate])

  return (
    <div
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}
    >
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  )
}
