export type Role = "teacher" | "student"

export interface User {
  user_id: string
  email: string
  first_name: string
  last_name: string
  role: Role
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface Category {
  category_id: string
  name: string
  slug: string
}

export interface Lesson {
  lesson_id: string
  module_id: string
  title: string
  content: string | null
  video_url: string | null
  order_index: number
  duration_mins: number | null
  created_at: string
}

export interface Module {
  module_id: string
  course_id: string
  title: string
  description: string | null
  order_index: number
  lessons: Lesson[]
}

export interface Course {
  course_id: string
  teacher_id?: string
  title: string
  slug: string
  description: string | null
  thumbnail_url: string | null
  is_published: boolean
  category: string | null
  teacher_name: string
  teacher_avatar: string | null
  total_lessons: number
  avg_rating: number | null
  total_reviews: number
  created_at: string
  modules?: Module[]
}

export interface EnrollmentProgress {
  total_lessons: number
  completed_lessons: number
  percent: number
  can_review: boolean
}

export interface Enrollment {
  enrollment_id: string
  enrolled_at: string
  completed_at: string | null
  completed_lesson_ids: string[]
  course: Pick<
    Course,
    "course_id" | "title" | "slug" | "thumbnail_url" | "description"
  > & {
    teacher_name: string
  }
  progress: EnrollmentProgress
}

export interface Review {
  review_id: string
  enrollment_id: string
  rating: number
  comment: string | null
  student_name: string
  created_at: string
  updated_at: string
}

// API response wrappers
export interface ApiSuccess<T> {
  data: T
}

export interface ApiError {
  error: string
}
