import api from "@/lib/api"
import type { Course } from "@/types"

export const coursesApi = {
  list: () => api.get<Course[]>("/courses").then((r) => r.data),

  getBySlug: (slug: string) =>
    api.get<Course>(`/courses/${slug}`).then((r) => r.data),

  create: (data: Partial<Course>) =>
    api.post<Course>("/courses", data).then((r) => r.data),

  update: (id: string, data: Partial<Course>) =>
    api.put<Course>(`/courses/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/courses/${id}`).then((r) => r.data),
}
