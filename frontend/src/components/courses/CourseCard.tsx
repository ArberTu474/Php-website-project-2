import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Course } from "@/types"

interface Props {
  course: Course
}

export default function CourseCard({ course }: Props) {
  return (
    <Link to={`/courses/${course.slug}`} style={{ textDecoration: "none" }}>
      <Card
        style={{
          overflow: "hidden",
          transition: "box-shadow var(--transition-interactive)",
          cursor: "pointer",
          height: "100%",
        }}
        className="hover:shadow-md"
      >
        {/* Thumbnail */}
        <div
          style={{
            aspectRatio: "16/9",
            background: "var(--color-surface-offset)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
              }}
            >
              📚
            </div>
          )}
        </div>

        <CardContent style={{ padding: "var(--space-4)" }}>
          {/* Category */}
          {course.category && (
            <Badge
              variant="secondary"
              style={{
                marginBottom: "var(--space-2)",
                fontSize: "var(--text-xs)",
              }}
            >
              {course.category}
            </Badge>
          )}

          {/* Title */}
          <h3
            style={{
              fontSize: "var(--text-base)",
              fontWeight: 600,
              marginBottom: "var(--space-2)",
              color: "var(--color-text)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {course.title}
          </h3>

          {/* Teacher */}
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
              marginBottom: "var(--space-3)",
            }}
          >
            {course.teacher_name}
          </p>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
            }}
          >
            {course.avg_rating && (
              <span style={{ color: "#ca8a04", fontWeight: 600 }}>
                ★ {course.avg_rating}
                <span style={{ fontWeight: 400, marginLeft: 2 }}>
                  ({course.total_reviews})
                </span>
              </span>
            )}
            <span>{course.total_lessons} lessons</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
