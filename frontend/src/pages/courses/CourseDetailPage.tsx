import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { coursesApi } from "@/lib/courses"
import { enrollmentsApi } from "@/lib/enrollments"
import { useAuthStore } from "@/store/authStore"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

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
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "var(--space-12) var(--space-6)",
        }}
      >
        <div
          style={{
            height: 32,
            width: "60%",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-surface-offset)",
            marginBottom: "var(--space-4)",
          }}
          className="animate-pulse"
        />
        <div
          style={{
            height: 300,
            borderRadius: "var(--radius-lg)",
            background: "var(--color-surface-offset)",
          }}
          className="animate-pulse"
        />
      </div>
    )

  if (isError || !course)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "var(--space-16)",
          color: "var(--color-text-muted)",
        }}
      >
        <p style={{ fontSize: "2rem", marginBottom: "var(--space-4)" }}>😕</p>
        <p>Course not found.</p>
      </div>
    )

  const totalLessons =
    course.modules?.reduce((acc, m) => acc + m.lessons.length, 0) ?? 0
  const totalModules = course.modules?.length ?? 0

  // Determine button label + state
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
          ✓ Already enrolled
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
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "var(--space-12) var(--space-6)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "var(--space-8)" }}>
        {course.category && (
          <Badge variant="secondary" style={{ marginBottom: "var(--space-3)" }}>
            {course.category}
          </Badge>
        )}

        <h1
          style={{
            fontSize: "var(--text-xl)",
            fontWeight: 700,
            marginBottom: "var(--space-4)",
            lineHeight: 1.2,
          }}
        >
          {course.title}
        </h1>

        <p
          style={{
            color: "var(--color-text-muted)",
            marginBottom: "var(--space-4)",
          }}
        >
          {course.description}
        </p>

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-4)",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-muted)",
            marginBottom: "var(--space-6)",
          }}
        >
          <span>👩‍🏫 {course.teacher_name}</span>
          <span>📦 {totalModules} modules</span>
          <span>🎬 {totalLessons} lessons</span>
          {course.avg_rating && (
            <span style={{ color: "#ca8a04", fontWeight: 600 }}>
              ★ {course.avg_rating} ({course.total_reviews} reviews)
            </span>
          )}
        </div>

        {renderEnrollButton()}
      </div>

      <Separator style={{ marginBottom: "var(--space-8)" }} />

      {/* Curriculum */}
      <div>
        <h2
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 600,
            marginBottom: "var(--space-6)",
          }}
        >
          Course curriculum
        </h2>

        {course.modules?.length === 0 && (
          <p style={{ color: "var(--color-text-muted)" }}>No content yet.</p>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          {course.modules?.map((module) => (
            <div
              key={module.module_id}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
              }}
            >
              {/* Module header */}
              <div
                style={{
                  padding: "var(--space-4) var(--space-5)",
                  background: "var(--color-surface)",
                  borderBottom:
                    module.lessons.length > 0
                      ? "1px solid var(--color-border)"
                      : "none",
                }}
              >
                <h3 style={{ fontWeight: 600, fontSize: "var(--text-base)" }}>
                  {module.title}
                </h3>
                {module.description && (
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text-muted)",
                      marginTop: "var(--space-1)",
                    }}
                  >
                    {module.description}
                  </p>
                )}
              </div>

              {/* Lessons list */}
              {module.lessons.map((lesson, idx) => (
                <div
                  key={lesson.lesson_id}
                  style={{
                    padding: "var(--space-3) var(--space-5)",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    borderBottom:
                      idx < module.lessons.length - 1
                        ? "1px solid var(--color-border)"
                        : "none",
                    background: "var(--color-surface-2)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  <span style={{ color: "var(--color-text-faint)" }}>▶</span>
                  <span style={{ flex: 1 }}>{lesson.title}</span>
                  {lesson.duration_mins && (
                    <span style={{ color: "var(--color-text-muted)" }}>
                      {lesson.duration_mins} min
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
