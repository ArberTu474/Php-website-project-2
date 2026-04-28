import api from "@/lib/api"
import type { Enrollment } from "@/types"

export const enrollmentsApi = {
  enroll: (courseId: string) =>
    api.post(`/courses/${courseId}/enroll`).then((r) => r.data),

  mine: () => api.get<Enrollment[]>("/enrollments/me").then((r) => r.data),

  review: (enrollmentId: string, data: { rating: number; comment: string }) =>
    api.post(`/enrollments/${enrollmentId}/review`, data).then((r) => r.data),
}
