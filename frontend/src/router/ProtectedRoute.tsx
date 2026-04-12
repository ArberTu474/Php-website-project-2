import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import type { Role } from "@/types"

interface Props {
  requiredRole?: Role
}

export default function ProtectedRoute({ requiredRole }: Props) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
