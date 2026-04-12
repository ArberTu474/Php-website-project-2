import api from "@/lib/api"
import type { Lesson } from "@/types"

export const lessonsApi = {
  getById: (id: string) =>
    api.get<Lesson>(`/lessons/${id}`).then((r) => r.data),

  complete: (lessonId: string) =>
    api.post(`/lessons/${lessonId}/complete`).then((r) => r.data),
}
