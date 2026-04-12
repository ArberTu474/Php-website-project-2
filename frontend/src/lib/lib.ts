import api from "@/lib/api"
import type { Course, Module, Lesson } from "@/types"

export const teacherApi = {
  // Courses
  myCourses: () => api.get<Course[]>("/courses/mine").then((r) => r.data),

  createCourse: (data: Partial<Course>) =>
    api.post<Course>("/courses", data).then((r) => r.data),

  updateCourse: (id: string, data: Partial<Course>) =>
    api.put<Course>(`/courses/${id}`, data).then((r) => r.data),

  deleteCourse: (id: string) =>
    api.delete(`/courses/${id}`).then((r) => r.data),

  // Modules
  createModule: (courseId: string, data: Partial<Module>) =>
    api.post<Module>(`/courses/${courseId}/modules`, data).then((r) => r.data),

  updateModule: (moduleId: string, data: Partial<Module>) =>
    api.put<Module>(`/modules/${moduleId}`, data).then((r) => r.data),

  deleteModule: (moduleId: string) =>
    api.delete(`/modules/${moduleId}`).then((r) => r.data),

  // Lessons
  createLesson: (moduleId: string, data: Partial<Lesson>) =>
    api.post<Lesson>(`/modules/${moduleId}/lessons`, data).then((r) => r.data),

  updateLesson: (lessonId: string, data: Partial<Lesson>) =>
    api.put<Lesson>(`/lessons/${lessonId}`, data).then((r) => r.data),
}
