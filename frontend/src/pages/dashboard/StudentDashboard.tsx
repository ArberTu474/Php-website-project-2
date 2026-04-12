import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { enrollmentsApi } from "@/lib/enrollments"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function StudentDashboard() {
  const { user } = useAuthStore()

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["enrollments"],
    queryFn: enrollmentsApi.mine,
  })

  return (
    <div
      style={{
        maxWidth: "var(--content-wide, 1200px)",
        margin: "0 auto",
        padding: "var(--space-12) var(--space-6)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-10)",
          flexWrap: "wrap",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>
            Welcome back, {user?.first_name} 👋
          </h1>
          <p
            style={{
              color: "var(--color-text-muted)",
              marginTop: "var(--space-1)",
            }}
          >
            Continue where you left off
          </p>
        </div>
        <Button asChild>
          <Link to="/">Browse courses</Link>
        </Button>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 120,
                borderRadius: "var(--radius-lg)",
                background: "var(--color-surface-offset)",
              }}
              className="animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && enrollments?.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-16)",
            color: "var(--color-text-muted)",
          }}
        >
          <p style={{ fontSize: "2.5rem", marginBottom: "var(--space-4)" }}>
            🎓
          </p>
          <h3
            style={{
              color: "var(--color-text)",
              marginBottom: "var(--space-2)",
              fontSize: "var(--text-lg)",
            }}
          >
            No courses yet
          </h3>
          <p style={{ marginBottom: "var(--space-6)" }}>
            Enroll in a course to start learning.
          </p>
          <Button asChild>
            <Link to="/">Browse courses</Link>
          </Button>
        </div>
      )}

      {/* Enrollment cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        {enrollments?.map((enrollment) => {
          const { course, progress } = enrollment
          const isComplete = enrollment.completed_at !== null

          return (
            <Card key={enrollment.enrollment_id}>
              <CardContent
                style={{
                  padding: "var(--space-5)",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "var(--space-6)",
                  alignItems: "center",
                }}
              >
                {/* Left: course info + progress */}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      marginBottom: "var(--space-2)",
                      flexWrap: "wrap",
                    }}
                  >
                    <h3
                      style={{
                        fontWeight: 600,
                        fontSize: "var(--text-base)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {course.title}
                    </h3>
                    {isComplete && (
                      <Badge
                        style={{
                          background: "var(--color-success)",
                          color: "#fff",
                          fontSize: "var(--text-xs)",
                        }}
                      >
                        ✓ Completed
                      </Badge>
                    )}
                    {!isComplete && progress.can_review && (
                      <Badge
                        variant="secondary"
                        style={{ fontSize: "var(--text-xs)" }}
                      >
                        Review available
                      </Badge>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text-muted)",
                      marginBottom: "var(--space-3)",
                    }}
                  >
                    {course.teacher_name}
                  </p>

                  {/* Progress bar */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                    }}
                  >
                    <Progress
                      value={progress.percent}
                      style={{ flex: 1, height: 6 }}
                    />
                    <span
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-muted)",
                        whiteSpace: "nowrap",
                        minWidth: 80,
                      }}
                    >
                      {progress.completed_lessons}/{progress.total_lessons}{" "}
                      lessons ({progress.percent}%)
                    </span>
                  </div>
                </div>

                {/* Right: action buttons */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-2)",
                    alignItems: "flex-end",
                  }}
                >
                  <Button size="sm" asChild>
                    <Link
                      to={`/learn/${course.slug}/${
                        // navigate to first lesson of first module
                        enrollments?.find(
                          (e) => e.enrollment_id === enrollment.enrollment_id
                        ) && course.slug
                          ? course.slug
                          : ""
                      }`}
                    >
                      Continue
                    </Link>
                  </Button>
                  {isComplete ? (
                    <Button size="sm" asChild>
                      <Link to={`/courses/${course.slug}`}>
                        {isComplete ? "Review" : "Continue"}
                      </Link>
                    </Button>
                  ) : (
                    ""
                  )}
                  {progress.can_review && !isComplete && (
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/courses/${course.slug}`}>Leave review</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
