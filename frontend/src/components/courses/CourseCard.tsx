import { Link } from "react-router-dom"
import Badge from "components/ui/badge"
import { Card, CardContent } from "components/ui/card"
import type { Course } from "types"
import { BookMarked, BookOpen, Star } from "lucide-react"

interface Props {
  course: Course
}

export default function CourseCard({ course }: Props) {
  return (
    <Link to={`/courses/${course.slug}`} className="course-card-link">
      <Card className="course-card">
        <div className="course-card-thumb">
          {course.thumbnailurl ? (
            <img
              src={course.thumbnailurl}
              alt={course.title}
              className="course-card-thumb-image"
              loading="lazy"
            />
          ) : (
            <div className="course-card-thumb-fallback">
              <BookMarked className="size-16 stroke-muted-foreground" />
            </div>
          )}
        </div>

        <CardContent className="course-card-body">
          {course.category ? (
            <div className="course-card-category">
              <Badge variant="outline">{course.category}</Badge>
            </div>
          ) : null}

          <h3 className="course-card-title">{course.title}</h3>

          <p className="course-card-teacher">{course.teachername}</p>

          <div className="course-card-stats">
            <span className="course-card-stat">
              <BookOpen className="size-4 stroke-muted-foreground" />
              {course.totallessons} lessons
            </span>

            {course.avgrating ? (
              <span className="course-card-rating">
                <Star className="size-4 fill-yellow-400/80 stroke-0" />
                {course.avgrating}
                <span>{course.totalreviews}</span>
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}