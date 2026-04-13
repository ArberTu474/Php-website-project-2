import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { coursesApi } from "@/lib/courses"
import { enrollmentsApi } from "@/lib/enrollments"
import { useAuthStore } from "@/store/authStore"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Check,
  ChevronRight,
  Clock,
  FileText,
  PackageOpen,
  Star,
  TriangleAlert,
  User,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import ReviewForm from "@/components/reviews/ReviewForm"
import ReviewList from "@/components/reviews/ReviewList"

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuthStore()

  const {
    data: course,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => coursesApi.getBySlug(slug!),
    enabled: !!slug,
  })

  // Fetch student's enrollments to check if already enrolled
  // Only runs when the user is a logged-in student
  const { data: myEnrollments } = useQuery({
    queryKey: ["enrollments"],
    queryFn: enrollmentsApi.mine,
    enabled: isAuthenticated && user?.role === "student",
  })

  const isEnrolled =
    myEnrollments?.some((e) => e.course.course_id === course?.course_id) ??
    false

  // The enrollment object for this course
  const enrollment = myEnrollments?.find(
    (e) => e.course.course_id === course?.course_id
  )

  // Existing review if the student already submitted one
  const existingReview = course?.reviews?.find(
    (r) => r.student_id === user?.user_id
  )

  const canReview = isAuthenticated && user?.role === "student" && isEnrolled

  const enrollMutation = useMutation({
    mutationFn: () => enrollmentsApi.enroll(course!.course_id),
    onSuccess: () => {
      toast.success(
        "Enrolled successfully! Head to your dashboard to start learning."
      )
      queryClient.invalidateQueries({ queryKey: ["enrollments"] })
      navigate("/dashboard")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  function handleEnroll() {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    enrollMutation.mutate()
  }

  if (isLoading)
    return (
      <div className="container mx-auto my-0 px-6 py-3">
        <div className="mt-64 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-42" />
          ))}
        </div>
      </div>
    )

  if (isError || !course)
    return (
      <div className="mt-12 flex flex-col items-center gap-2">
        <TriangleAlert
          size="64"
          className="fill-destructive/15 stroke-destructive"
        />
        <h3 className="text-xl text-destructive">Course not found!</h3>
      </div>
    )

  const totalLessons =
    course.modules?.reduce((acc, m) => acc + m.lessons.length, 0) ?? 0
  const totalModules = course.modules?.length ?? 0

  function renderEnrollButton() {
    if (user?.role === "teacher") return null

    if (isEnrolled) {
      return (
        <Button
          size="lg"
          variant="secondary"
          disabled
          style={{ minWidth: 180, cursor: "default" }}
        >
          <Check />
          Already enrolled
        </Button>
      )
    }

    return (
      <Button
        size="lg"
        onClick={handleEnroll}
        disabled={enrollMutation.isPending}
        style={{ minWidth: 180 }}
      >
        {enrollMutation.isPending
          ? "Enrolling…"
          : isAuthenticated
            ? "Enroll for free"
            : "Sign up to enroll"}
      </Button>
    )
  }

  return (
    <div className="container mx-auto my-0 px-6 py-3">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        {course.category && (
          <Badge variant="secondary">{course.category}</Badge>
        )}

        <h1 className="my-2 text-3xl font-bold">{course.title}</h1>

        <p className="max-w-[90ch] text-muted-foreground">
          {course.description}
        </p>

        {/* Meta row */}
        <div className="mt-4 flex items-end justify-between sm:items-center">
          <div className="flex flex-col gap-2 text-sm leading-none text-muted-foreground sm:flex-row md:gap-4">
            <span className="flex items-center gap-1">
              <User size="18" />
              <p>{course.teacher_name}</p>
            </span>
            <span className="flex items-center gap-1">
              <FileText size="18" />
              <p>{totalModules} modules</p>
            </span>
            <span className="flex items-center gap-1">
              <FileText size="18" />
              <p>{totalLessons} lessons</p>
            </span>
            {course.avg_rating && (
              <span className="flex items-center gap-0.5 text-sm leading-none font-semibold text-yellow-400/80">
                <Star className="fill-yellow-40/80 size-4 stroke-0" />{" "}
                {course.avg_rating}
                <span>({course.total_reviews})</span>
              </span>
            )}
          </div>
          {renderEnrollButton()}
        </div>
      </div>

      {/* ── Curriculum ─────────────────────────────────────────────────── */}
      <div>
        <h2 className="my-4 text-xl font-semibold">Course curriculum</h2>

        {course.modules?.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-muted-foreground">
            <PackageOpen size="64" />
            <p className="text-center">No content yet.</p>
          </div>
        )}

        <div className="mb-10 space-y-4">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}

          {course.modules?.map((module) => (
            <div
              key={module.module_id}
              className="overflow-hidden rounded-lg border border-border"
            >
              {/* Module header */}
              <div className="space-y-2 border-t border-border bg-muted/50 px-4 py-3">
                <h3 className="text-base font-semibold">{module.title}</h3>
                {module.description && (
                  <p className="line-clamp-3 max-w-[90ch] text-sm text-muted-foreground">
                    {module.description}
                  </p>
                )}
              </div>

              {/* Lessons list */}
              {module.lessons.map((lesson, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 border-t border-border px-4 py-2"
                >
                  <span>
                    <ChevronRight size="16" />
                  </span>
                  <span className="flex-1">
                    <span className="font-semibold">{idx + 1}</span>
                    {". "}
                    {lesson.title}
                  </span>
                  {lesson.duration_mins && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock size="16" />
                      <p>{lesson.duration_mins} min</p>
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Reviews ────────────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xl font-semibold">Student reviews</h2>
          {course.avg_rating && (
            <span className="flex items-center gap-1 text-base font-semibold text-yellow-400/80">
              <Star className="size-6 fill-yellow-400/80 stroke-0" />
              {course.avg_rating}
              <span className="font-normal">
                <p>({course.total_reviews})</p>
              </span>
            </span>
          )}
        </div>

        {/* Write / edit review — enrolled students only */}
        {canReview && enrollment && (
          <div className="mb-8 rounded-lg border border-border p-5">
            <h3 className="mb-4 text-base font-semibold">
              {existingReview ? "Edit your review" : "Leave a review"}
            </h3>
            <ReviewForm
              enrollmentId={enrollment.enrollment_id}
              courseSlug={slug!}
              existingRating={existingReview?.rating}
              existingComment={existingReview?.comment ?? undefined}
            />
          </div>
        )}

        <ReviewList reviews={course.reviews ?? []} />
      </div>
    </div>
  )
}
