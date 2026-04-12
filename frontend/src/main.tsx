import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"

import { router } from "@/router"
import { useAuthStore } from "@/store/authStore"
import { setTokenGetter } from "@/lib/api" // ← add this import
import "./index.css"

const queryClient = new QueryClient()

// Rehydrate auth from localStorage on boot
useAuthStore.getState().initAuth()

// Wire up the token getter so Axios always reads the latest token
setTokenGetter(() => useAuthStore.getState().token) // ← add this line

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="bottom-right" />
    </QueryClientProvider>
  </React.StrictMode>
)
