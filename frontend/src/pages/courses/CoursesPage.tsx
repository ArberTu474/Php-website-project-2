import { useQuery } from "@tanstack/react-query"
import { coursesApi } from "@/lib/courses"
import CourseCard from "@/components/courses/CourseCard"

function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          aspectRatio: "16/9",
          background: "var(--color-surface-offset)",
        }}
        className="animate-pulse"
      />
      <div
        style={{
          padding: "var(--space-4)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        <div
          style={{
            height: 12,
            width: "40%",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-surface-offset)",
          }}
          className="animate-pulse"
        />
        <div
          style={{
            height: 16,
            width: "90%",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-surface-offset)",
          }}
          className="animate-pulse"
        />
        <div
          style={{
            height: 14,
            width: "60%",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-surface-offset)",
          }}
          className="animate-pulse"
        />
      </div>
    </div>
  )
}

export default function CoursesPage() {
  const {
    data: courses,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: coursesApi.list,
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
      <div style={{ marginBottom: "var(--space-10)" }}>
        <h1
          style={{
            fontSize: "var(--text-xl)",
            fontWeight: 700,
            marginBottom: "var(--space-2)",
            color: "var(--color-text)",
          }}
        >
          Explore Courses
        </h1>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "var(--text-base)",
          }}
        >
          Learn something new today
        </p>
      </div>

      {/* Error */}
      {isError && (
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-16)",
            color: "var(--color-text-muted)",
          }}
        >
          <p style={{ fontSize: "2rem", marginBottom: "var(--space-4)" }}>⚠️</p>
          <p>Failed to load courses. Make sure the backend is running.</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && courses?.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-16)",
            color: "var(--color-text-muted)",
          }}
        >
          <p style={{ fontSize: "2.5rem", marginBottom: "var(--space-4)" }}>
            📭
          </p>
          <h3
            style={{
              color: "var(--color-text)",
              marginBottom: "var(--space-2)",
            }}
          >
            No courses yet
          </h3>
          <p>Check back soon — teachers are creating content.</p>
        </div>
      )}

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(min(300px, 100%), 1fr))",
          gap: "var(--space-6)",
        }}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : courses?.map((course) => (
              <CourseCard key={course.course_id} course={course} />
            ))}
      </div>
    </div>
  )
}
