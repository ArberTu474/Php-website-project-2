import { createBrowserRouter, Navigate } from "react-router-dom"
import ProtectedRoute from "./ProtectedRoute"
import Layout from "@/components/layout/Layout"

import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import CoursesPage from "@/pages/courses/CoursesPage"
import CourseDetailPage from "@/pages/courses/CourseDetailPage"
import DashboardPage from "@/pages/dashboard/DashboardPage"
import LearnView from "@/pages/learn/LearnView"
import CourseEditorPage from "@/pages/dashboard/CourseEditorPage"

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Public
      { path: "/", element: <CoursesPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/courses/:slug", element: <CourseDetailPage /> },

      // Any authenticated user
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/learn/:slug/:lessonId", element: <LearnView /> },
        ],
      },
      {
        element: <ProtectedRoute requiredRole="teacher" />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/courses/:slug/edit", element: <CourseEditorPage /> },
        ],
      },

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
])
